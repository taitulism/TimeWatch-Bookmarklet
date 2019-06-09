(function (win, doc) {

    // Redirect from anywhere (the bookmarklet is also a regular bookmark)
    if (win.location.hostname !== 'checkin.timewatch.co.il') {
        win.location.href = 'https://checkin.timewatch.co.il';
        return;
    }

    var HALF = 'חצי';
    var REST_DAY = 'מנוחה';
    var DAY = 'day';
    var MISSING = 'Missing';
    var SICKNESS = 'מחלה';
    var DAY_OFF = 'חופש';
    var REST_BG_COLOR = '#cecece';
    var REST_FG_COLOR = '#544343';
    var FUTURE_BG_COLOR = '#bdbdbd';
    var FUTURE_FG_COLOR = '#796363';
	var today = new Date();
	var popup;

    var tableElm = doc.querySelectorAll('table table')[4];
    var allTableRows = Array.from(tableElm.querySelectorAll('tr')); // includes table headers

    // Headers (first three rows)
    var firstHeader = allTableRows[0];
    var thirdHeader = allTableRows[2];

    // Data Rows
    var dataRows = allTableRows.slice(3);

    /* Note the column offset:
        The 'Total Hours' column is 7th in the table's header but 12th on a day row (when 'Punch Data' has 3 in/out parts).
        The 'Punch Data' column size is dynamic as employers could change the number of ins and outs.

        ┌────────────────────┐
        │P u n c h   D a t a │ <<------- firstHeader 1 cell
        │ -1-  │ -2-  │ -3-  │
        │in|out│in|out│in|out│ <<------- thirdHeader 6 cells
    */
    var punchOffset = thirdHeader.children.length - 1;

    var isFirstRun = !win.isNice;

    if (isFirstRun) {
		appendColumnTitle();
        win.isNice = true;
	}

    var totalDiff = 0;

	dataRows
		.map(collectRawData)
		.map(parseRawData)
		.forEach(changeDOM)
	;

	showPopup();

	// --------------------------------------------------------------
	// 	Functions
	// --------------------------------------------------------------

    function createElm (tag) {
        tag = tag || 'div';

        return doc.createElement(tag);
	}

	function appendColumnTitle () {
		var title = createNewTitle('Time Diff');
        firstHeader.appendChild(title);
	}

	function appendDiffCell (day) {
		// For Reference: Original cell looks like:
        // <td bgcolor="#e0e0e0"><font size="2" face="Arial">&nbsp;9:08</font></td>
        var cell = createElm('td');

		setStyle(cell, {
			backgroundColor: '#e0e0e0',
			textAlign: 'right',
		});

		day.rowElm.appendChild(cell);
		day.rowCells.push(cell);
	}

	/*
		A day should be ignored when:
		1. Sickness/Vacation (only if whole day)
		2. Rest day (e.g. Fri, Sat)
		3. Future date
	*/
	function shouldBeIgnored (day) {
		if (
			(day.hasSickness || day.hasDayOff) && !day.hasHalfDay
			|| day.isRestDay
			|| day.isFutureDate
		) return;
	}

    function padWithZero (num) {
        if (num < 10)
            return '0' + num;
        return String(num);
    }

    function createNewTitle (titleText) {
        // Reference: Original title
        // <td align="center" valign="middle" bgcolor="#7ba849" rowspan="3"><font size="2" face="Arial" color="white">Edit</font></td>
        var title = createElm('td');

        title.setAttribute('align', 'center');
        title.setAttribute('valign', 'middle');
        title.setAttribute('bgcolor', '#7ba849');
        title.setAttribute('rowspan', '3');
        title.innerHTML = titleText;

        return title;
    }

	function setDiffCellValue (day, value) {
		// last cell
		var cell = day.rowCells[day.rowCells.length - 1];
		/*
			Casts the diff number into a string.
			Adds '+' sign for positive numbers.
			Negative numbers natively contain a minus sign.
		*/
		var valueStr = value > 0 ? '+'+value : value;

		cell.innerHTML = valueStr + ' &nbsp;';

		return cell;
	}

    function setStyle (elm, style) {
        for (var key in style) {
            elm.style[key] = style[key];
        }
    }

    function getTotalMinutes (timeString) {
        if (!timeString) return 0;

        var split = timeString.split(':').map(function (str) {
            return parseInt(str, 10)
        });

        var hours = split[0];
        var minutes = split[1];

        var totalMinutes = (hours * 60) + minutes;

        return totalMinutes;
    }

    function getContent (cellElm) {
        return cellElm.textContent.trim();
    }

    function parseDate (rawDate) {
        // e.g. '31-10-2018 Wed'
        var split = rawDate.split(' ');
        var date = split[0];    // 31-10-2018
        var dayName = split[1]; // Wed
        var dateSplit = date.split('-');
        var dateObj = {
            dayNumber: parseInt(dateSplit[0], 10),
            month: parseInt(dateSplit[1], 10),
            year: parseInt(dateSplit[2], 10),
        };

        return [dayName, dateObj];
    }

    function isFutureDate (dateObj) {
        var date = new Date();

        date.setFullYear(dateObj.year);
        date.setMonth(dateObj.month - 1);
        date.setDate(dateObj.dayNumber - 1);

        return date.getTime() > today.getTime();
    }

    function getExpectedMinutes (stdHours, isHalfDayOff) {
        var expectedMinutes = getTotalMinutes(stdHours);

        if (isHalfDayOff) return expectedMinutes / 2;

        return expectedMinutes;
    }

    function colorizeRow (day, bgColor, fgColor) {
        day.rowCells.forEach(function (cell) {
            cell.style.backgroundColor = bgColor;
            if (fgColor) cell.style.color = fgColor;
        });
    }

    function collectRawData (rowElm) {
        var rowCells = Array.from(rowElm.children);
        var cellsData = rowCells.map(function (cell) {return getContent(cell)})

        return {
            rowElm: rowElm,
            rowCells: rowCells,
            cellsData: cellsData,
            column: {
                'Date': cellsData[0],
                'DayType': cellsData[1],
                'DayName': cellsData[2],
                'StdHours': cellsData[3],
                'Absence': cellsData[5 + punchOffset],
                'Remark': cellsData[6 + punchOffset],
                'TotalHours': cellsData[7 + punchOffset],
            }
        };
    }

    function parseRawData (rawRowObj) {
        var day = rawRowObj;
        var rawColumn = day.column;

        var dayNameAndDate = parseDate(rawColumn.Date);
        day.name = dayNameAndDate[0];
        day.date = dayNameAndDate[1];
        day.isFutureDate = isFutureDate(day.date);

        /* Normalize columns:
            The column titles are misleading:
            Under 'Day Name' you'll see: 'יום עבודה', 'יום מנוחה', 'יום א' and more.
            Under 'Day Type' you'll see: Sun, Mon, Tue... but also 'Holiday', 'Holiday Eve' and more.

            It makes more sense to:
        */
        day.title = rawColumn.DayType;
        day.type  = rawColumn.DayName;

        var absence = rawColumn.Absence;
        var remark = rawColumn.Remark;

        var hasHalfDay  = absence.includes(HALF)     || remark.includes(HALF);
        var hasSickness = absence.includes(SICKNESS) || remark.includes(SICKNESS);
        var hasDayOff   = absence.includes(DAY_OFF)  || remark.includes(DAY_OFF);

        day.hasHalfDay = hasHalfDay;
        day.hasSickness = hasSickness;
        day.hasDayOff = hasDayOff;

        var stdHours = rawColumn.StdHours;
        var totalHours = rawColumn.TotalHours;

        day.isRestDay    = day.type.includes(REST_DAY) && !stdHours;
        day.isMissing    = totalHours.toLowerCase().includes(MISSING);
        day.isXday       = day.type.toLowerCase().includes(DAY) || day.title.toLowerCase().includes(DAY);
        day.isHalfSick   = hasHalfDay && hasSickness;
        day.isHalfDayOff = hasHalfDay && hasDayOff;
        day.expectedMinutes   = getExpectedMinutes(stdHours, hasHalfDay);
        day.actualWorkMinutes = getTotalMinutes(totalHours);

        return day;
	}

	function changeDOM (day) {
        if (isFirstRun) {
			appendDiffCell(day);

            if (day.isRestDay) {
                colorizeRow(day, REST_BG_COLOR, REST_FG_COLOR);
            }
            else if (day.isFutureDate) {
                colorizeRow(day, FUTURE_BG_COLOR, FUTURE_FG_COLOR);
            }
        }

		if (shouldBeIgnored(day)) return;

        // Calculate time diff in minutes
		var currentDiff = day.actualWorkMinutes ? day.actualWorkMinutes - day.expectedMinutes : 0;

		setDiffCellValue(day, currentDiff);

		// Sum up
        totalDiff += currentDiff;
	}

	function showPopup () {
		var titleText = totalDiff < 0 ? 'Missing Time' : totalDiff > 0 ? 'Extra Time': 'No Time Diff :)';
		var sign = totalDiff < 0 ? '-' : '+';
		var absDiff = Math.abs(totalDiff);
		var hoursDiff = padWithZero(Math.floor(absDiff / 60));
		var minsDiff = padWithZero(absDiff % 60);
		var link = 'https://github.com/taitulism/TimeWatch-Bookmarklet';
		var repoLink = '<a href="'+link+'" style="color:white;">'+link+'</a>';

		// Create elements
		popup = createElm();
		var header = createElm();
		var body = createElm();
		var footer = createElm();

		header.innerHTML = titleText;
		body.innerHTML = sign + hoursDiff + ':' + minsDiff;
		footer.innerHTML = repoLink;

		// Style
		setStyle(header, {
			backgroundColor: (sign === '+') ? '#5b921d' : 'red',
			color: 'white',
			textAlign: 'center',
			padding: '1em',
		});

		setStyle(body, {
			textAlign: 'center',
			fontSize: '140%',
		});

		setStyle(footer, {
			fontSize: '85%',
			color: 'white',
		});

		setStyle(popup, {
			width: '400px',
			height: '200px',
			position: 'fixed',
			top: '150px',
			left: '38%',
			backgroundColor: '#403434',
			color: '#e4d9d9',
			fontFamily: 'arial',
			padding: '1em 2em',
			borderRadius: '10px',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-around',
			cursor: 'pointer',
		});

		popup.appendChild(header);
		popup.appendChild(body);
		popup.appendChild(footer);
		doc.body.appendChild(popup);

		function dismissPopup() {
			popup.removeEventListener('click', dismissPopup);
			popup.parentNode.removeChild(popup);
		}

		popup.addEventListener('click', dismissPopup);
	}

})(window, document);
