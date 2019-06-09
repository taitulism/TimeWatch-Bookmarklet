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
	var today = new Date();
	var popup;

    var tableElm = doc.querySelectorAll('table table')[4];
    var allTableRows = tableElm.querySelectorAll('tr'); // includes table headers

    // Headers (first three rows)
    var firstHeader = allTableRows[0];
	var thirdHeader = allTableRows[2];

	// Data Rows
    var dataRows = Array.from(allTableRows).slice(3);

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

		setStyle(title, {
			color: 'white',
			fontSize: '13px',
		});

		firstHeader.appendChild(title);
	}

	function appendDiffCell (day) {
		// Data Cell Reference:
		// <td bgcolor="#e6e6e6"><font size="2" face="Arial">&nbsp;9:28</font></td>
		var cell = createElm('td');

		// "Inherit" background color (copy from first sibling)
		cell.setAttribute('bgcolor', day.rowCells[0].getAttribute('bgColor'));

		setStyle(cell, {
			textAlign: 'right',
			fontSize: '15px',
			width: '70px',
			fontWeight: 'bold',
		});

		day.rowElm.appendChild(cell);
		day.rowCells.push(cell);
	}

	/*
		A day should be ignored when:
		1. Sickness/Vacation (only if a whole day)
		2. Rest day (e.g. Fri, Sat)
		3. Future date
		4. No actual working hours
	*/
	function shouldBeIgnored (day) {
		return (
			(day.hasSickness || day.hasDayOff) && !day.hasHalfDay
			|| day.isRestDay
			|| day.isFutureDate
			|| !day.actualWorkMinutes
		);
	}

    function padWithZero (num) {
        if (num < 10)
            return '0' + num;
        return String(num);
    }

    function createNewTitle (titleText) {
		// Title Cell Reference:
		// <td align="center" valign="middle" bgcolor="#7ba849" rowspan="3"><font size="2" face="Arial" color="white">Total Hours</font></td>
        var title = createElm('td');

        title.setAttribute('align', 'center');
        title.setAttribute('valign', 'middle');
        title.setAttribute('bgcolor', '#7ba849');
        title.setAttribute('rowspan', '3');
        title.innerHTML = titleText;

        return title;
    }

	function setDiffCellValue (rowCells, value) {
		// last cell
		var cell = rowCells[rowCells.length - 1];

		cell.style.color = value > 0 ? '#00bd00' : value < 0 ? '#ff4545' : 'black';
		cell.innerHTML = value + ' &nbsp;';
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
			doc.body.style.fontFamily = 'arial';
			tableElm.style.borderSpacing = '0';

			// Align titles
			Array.from(firstHeader.children).concat(Array.from(thirdHeader.children)).forEach(function (title){
				title.setAttribute('align', 'left');
			});

			appendDiffCell(day);

            if (day.isRestDay) {
                colorizeRow(day, '#cecece', '#544343');
            }
            else if (day.isFutureDate) {
                colorizeRow(day, '#bdbdbd', '#796363');
            }
        }

		if (shouldBeIgnored(day)) return;

		// Calculate time diff
		var currentDiff = day.actualWorkMinutes - day.expectedMinutes;
		setDiffCellValue(day.rowCells, currentDiff);

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
			letterSpacing: '0.5px',
		});

		setStyle(popup, {
			width: '400px',
			height: '200px',
			position: 'fixed',
			top: '150px',
			left: '38%',
			backgroundColor: '#403434',
			color: '#e4d9d9',
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
