(function () {

    // Redirect from anywhere (the bookmarklet is also a regular bookmark)
    if (window.location.hostname !== 'checkin.timewatch.co.il') {
        window.location.href = 'https://checkin.timewatch.co.il';
        return;
    }

    var DEFAULT_EXPECTED_HOURS_PER_DAY = '9:00';
    var HALF = 'חצי';
    var WORK_DAY = 'עבודה';
    var REST_DAY = 'מנוחה';
    var DAY = 'day';
    var HEBREW_SUNDAY = 'יום א\'';
    var FRIDAY = 'Fri';
    var SATURDAY = 'Sat';
    var MISSING = 'Missing';
    var SICKNESS = 'מחלה';
    var DAY_OFF = 'חופש';

    var REST_BG_COLOR = '#cecece';
    var REST_FG_COLOR = '#544343';
    var FUTURE_BG_COLOR = '#bdbdbd';
    var FUTURE_FG_COLOR = '#796363';

    var TODAY = new Date();

    var tableElm = document.querySelectorAll('table table')[4];
    var allTableRows = Array.from(tableElm.querySelectorAll('tr')); // includes table headers

    // Headers (first three rows)
    var firstHeader = allTableRows[0];
    var thirdHeader = allTableRows[2];

    var titles = Array.from(firstHeader.children);
    
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

    var CUSTOM_TITLE_TEXT = 'Time Diff';

    var isLoaded = firstHeader.lastChild.textContent === CUSTOM_TITLE_TEXT;

    if (!isLoaded) {
        var title = createNewTitle(CUSTOM_TITLE_TEXT);
        
        firstHeader.appendChild(title);
    }

    function isWorkDay (day) {
        if (day.isRestDay || day.isXday) return false;
        if (day.name === FRIDAY || day.name === SATURDAY) return false;
            
        day.type === HEBREW_SUNDAY || day.type.includes(WORK_DAY) && day.rawStdHours;
        return 
    }

    var dayObjs = dataRows.map(collectRawData).map(parseRawData);
    var totalExpected = 0;
    var totalWork = 0;
    var totalDiff = 0;

    
    dayObjs.forEach(function (day) {
        var diffCell;

        if (!isLoaded) {
            // Add custom column
            diffCell = createNewCell();
            day.rowElm.appendChild(diffCell);
            day.rowCells.push(diffCell);
        }

        // Colorize rest & future days
        if (day.isRestDay) {
            colorizeRow(day, REST_BG_COLOR, REST_FG_COLOR);
            return;
        }
        else if (day.isFutureDate) {
            colorizeRow(day, FUTURE_BG_COLOR, FUTURE_FG_COLOR);
            return;
        }

        // sickness/vacation (whole day)
        if ((day.hasSickness || day.hasDayOff) && !day.hasHalfDay) return;

        // Calculate Diff in minutes
        // debugger
        var dailyTimeDiff = day.actualWorkMinutes ? day.actualWorkMinutes - day.expectedMinutes : 0;
        totalDiff += dailyTimeDiff;
        totalExpected += day.expectedMinutes;
        totalWork += day.actualWorkMinutes;

        setCellValue(day.rowCells[day.rowCells.length - 1], dailyTimeDiff);
    });
    
    // --------------------------------------------------------------
    if (totalDiff === 0) {
        alert('No Time Diff! :)'/*  + credit */);
        return;
    }

    var titleText = totalDiff < 0 ? 'Missing Time' : 'Extra Time';
    var sign = totalDiff < 0 ? '-' : '+';
    var diffTime = totalDiff < 0 ? (totalDiff * -1) : totalDiff;
    var hoursDiff = padWithZero(Math.floor(diffTime / 60));
    var minsDiff = padWithZero(diffTime % 60);
    var link = 'https://github.com/taitulism/TimeWatch-Bookmarklet';
    var creditLink = '<a href="'+link+'" style="color:white;">'+link+'</a>';

    // Create Popup
    var div = document.createElement('div');
    var header = document.createElement('div');
    var body = document.createElement('div');
    var footer = document.createElement('div');

    header.innerHTML = titleText;
    body.innerHTML = sign + hoursDiff + ':' + minsDiff;
    footer.innerHTML = creditLink;

    header.style.backgroundColor = '#5b921d';
    header.style.color = '#e4d9d9';
    
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

    setStyle(div, {
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

    div.appendChild(header);
    div.appendChild(body);
    div.appendChild(footer);
    document.body.appendChild(div);

    div.addEventListener('click', removeDiv);

    // --------------------------------------------------------------

    function removeDiv() {
        div.removeEventListener('click', removeDiv);
        div.parentNode.removeChild(div);
    }

    function padWithZero (num) {
        if (num < 10)
            return '0' + num;
        return String(num);        
    }

    function createNewTitle (titleText) {
        // Reference: Original title
        // <td align="center" valign="middle" bgcolor="#7ba849" rowspan="3"><font size="2" face="Arial" color="white">Edit</font></td>
        var title = document.createElement('td');
        
        title.setAttribute('align', 'center');
        title.setAttribute('valign', 'middle');
        title.setAttribute('bgcolor', '#7ba849');
        title.setAttribute('rowspan', '3');
        title.innerHTML = titleText;

        return title;
    }

    function createNewCell () {
        // For Reference: Original cell looks like:
        // <td bgcolor="#e0e0e0"><font size="2" face="Arial">&nbsp;9:08</font></td>
        var cell = document.createElement('td');
        
        cell.setAttribute('bgcolor', '#e0e0e0');
        cell.style.textAlign = 'right';

        return cell;
    }
    
    function setCellValue (cell, value) {
        /**
         * Casts the diff number into a string.
         * Adds '+' sign for positive numbers.
         * Minus sign is built in.
         */
        var valueStr = value > 0 ? '+' + value: value;
    
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

        return date.getTime() > TODAY.getTime();
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
})();
