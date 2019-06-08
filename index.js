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

    var REST_BG_COLOR = '#a9a9a9';
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

    function getTitleIndex (targetTitle) {
        titles.findIndex(function (title) {
            return title.textContent === 'Total Hours';
        }) + punchOffset;
    }

    // Find the 'Total Hours' column index
    var totalHoursColumnIndex = titles.findIndex(function (title) {
        return title.textContent === 'Total Hours';
    }) + punchOffset;

    // +1 because `nth-child` selector (comes later) is not zero based like elm.children

    // Find the 'Std Hours' column index
    var stdHoursColumnIndex = titles.findIndex(function (title) {
        return title.textContent === 'Std Hours';
    }) + 1; 

    // Find the 'Absence' column index
    var absenceColumnSelector = getCellSelectorByTitle('Absence', true);
  
    // Find the 'Remarks' column index
    var remarksColumnSelector = getCellSelectorByTitle('Remark', true);

    var TITLE_TEXT = 'Time Diff';

    var isLoaded = firstHeader.lastChild.textContent === TITLE_TEXT;

    if (!isLoaded) {
        var title = createNewTitle(TITLE_TEXT);
        
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

    
    dayObjs.forEach(function (day) {
        if (day.isRestDay) colorizeRow(day, REST_BG_COLOR, REST_FG_COLOR);
        else if (day.isFutureDate) colorizeRow(day, FUTURE_BG_COLOR, FUTURE_FG_COLOR);

    });
    







    // Iterate over data rows
    var totalMinutesDiff = Array.from(dataRows).map(function (dayRow, i) {
        var dailyTotalCell = dayRow.querySelector('td:nth-child('+ totalHoursColumnIndex +')');
        var dailyTotal = dailyTotalCell.textContent.trim();

        var absenceCell = dayRow.querySelector(absenceColumnSelector);
        var remarksCell = dayRow.querySelector(remarksColumnSelector);
        var absence = absenceCell.textContent.trim();
        var remark = remarksCell.textContent.trim();

        // var shouldCalculate = dailyTotal

        // debugger
        var isHalfWorkDay = absence.includes('חצי') || remark.includes('חצי');

        if (!isHalfWorkDay && (!dailyTotal || dailyTotal.startsWith(MISSING))) {
            if (!isLoaded) {
                var cell = createNewCell();
                
                dayRow.appendChild(cell);
            }

            // not a work day or a future date
            return null;
        } 

        // Actual working hours
        var totalMinutesToday = getTotalMinutes(dailyTotal);

        // Expected working hours
        var expectedHoursTodayCell = dayRow.querySelector('td:nth-child('+ stdHoursColumnIndex +')');
        var expectedHoursToday = expectedHoursTodayCell.textContent.trim() || DEFAULT_EXPECTED_HOURS_PER_DAY;
        var expectedMinutesToday = getTotalMinutes(expectedHoursToday);

        if (isHalfWorkDay) {
            expectedMinutesToday = expectedMinutesToday / 2;
        }

        
        
        // Diff
        var timeDiff = totalMinutesToday - expectedMinutesToday;

        // Add the time diff next to the daily total
        if (!isLoaded) {
            var cell = createNewCell(timeDiff);
        
            dayRow.appendChild(cell);
        }

        return timeDiff;
    })

    // remove nulls
    .filter(function (minutes) {
        return typeof minutes === 'number';       
    })

    // Sum up total minutes
    .reduce(function (minutesTotal, minutesToday) {
        return minutesTotal + minutesToday;
    }, 0);







    // --------------------------------------------------------------
    if (totalMinutesDiff === 0) {
        alert('No Time Diff! :)'/*  + credit */);
        return;
    }
    
    var titleText = totalMinutesDiff < 0 ? 'Missing Time' : 'Extra Time';
    var sign = totalMinutesDiff < 0 ? '-' : '+';
    var diffTime = totalMinutesDiff < 0 ? (totalMinutesDiff * -1) : totalMinutesDiff;
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

    function createNewCell (timeDiff) {
        // Reference: Original cell
        // <td bgcolor="#e0e0e0"><font size="2" face="Arial">&nbsp;9:08</font></td>
        var cell = document.createElement('td');
        
        cell.setAttribute('bgcolor', '#e0e0e0');

        if (timeDiff == null) return cell;

        /**
         * Casts the diff number into a string.
         * Adds '+' sign for positive numbers.
         * Minus sign is built in.
         */
        var timeDiffStr = timeDiff > 0 ? '+' + timeDiff: timeDiff;

        cell.innerHTML = ' &nbsp (' + timeDiffStr + ')';

        return cell;
    }

    function setStyle (elm, style) {
        for (var key in style) {
            elm.style[key] = style[key];
        }
    }

     function getTotalMinutes (timeString) {
        timeString = timeString || DEFAULT_EXPECTED_HOURS_PER_DAY;

        var split = timeString.split(':').map(function (str) {
            return parseInt(str, 10)
        });

        var hours = split[0];
        var minutes = split[1];

        var totalMinutes = (hours * 60) + minutes;

        return totalMinutes;
    }

    function getCellSelectorByTitle (targetTitle, addPunchInCells = false) {
        var columnIndex = titles.findIndex(function (title) {
            return title.textContent === targetTitle;
        }) + 1;

        return addPunchInCells
            ? 'td:nth-child('+ (columnIndex + punchOffset - 1) + ')'
            : 'td:nth-child('+ columnIndex +')';
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
        // debugger
        var date = new Date();

        date.setFullYear(dateObj.year);
        date.setMonth(dateObj.month - 1);
        date.setDate(dateObj.dayNumber - 1);

        console.log(date.getTime() > TODAY.getTime());
        return date.getTime() > TODAY.getTime()
        
        // if (TODAY.getFullYear() < dateObj.year) return true;
        // if (TODAY.getMonth() < dateObj.month) return true;
        // if (TODAY.getDate() < dateObj.dayNumber) return true;

        // return false;
    }

    function getExpectedMinutesToday (stdHours, isHalfWorkDay) {
        var expectedMinutesToday = getTotalMinutes(stdHours);

        if (isHalfWorkDay) {
            expectedMinutesToday = expectedMinutesToday / 2;
        }

        return expectedMinutesToday;
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
        day.expectedMinutes   = getExpectedMinutesToday(stdHours, hasHalfDay);
        day.actualWorkMinutes = getTotalMinutes(totalHours);

        return day;
    }
})();
