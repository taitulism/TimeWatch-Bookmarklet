(function () {

    // Redirect from anywhere (the bookmarklet is also a regular bookmark)
    if (window.location.hostname !== 'checkin.timewatch.co.il') {
        window.location.href = 'https://checkin.timewatch.co.il';
        return;
    }

    var DEFAULT_EXPECTED_HOURS_PER_DAY = '9:00';
    var HALF = 'חצי';
    var WORK = 'עבודה';
    var REST = 'מנוחה';
    var SPECIAL_DAY = 'day';
    var SUNDAY = 'יום א\'';
    var FRIDAY = 'Fri';
    var SATURDAY = 'Sat';
    var MISSING = 'Missing';
    var SICKNESS = 'מחלה';
    var DAY_OFF = 'חופש';

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
    var cellsOffset = thirdHeader.children.length - 1;

    function getTitleIndex (targetTitle) {
        titles.findIndex(function (title) {
            return title.textContent === 'Total Hours';
        }) + cellsOffset;
    }

    // Find the 'Total Hours' column index
    var totalHoursColumnIndex = titles.findIndex(function (title) {
        return title.textContent === 'Total Hours';
    }) + cellsOffset;

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

    var dayObjs = dataRows.map(function (row, i) {
        var cells = Array.from(row.children);
        var dayNameAndDate = parseDate(getContent(cells[0])); // Column: 'Date'
        var dayName = dayNameAndDate[0];
        var dateObj = dayNameAndDate[1];
        
        /* Normalize columns:
            The column titles are misleading:
            Under 'Day Name' you'll see: 'יום עבודה', 'יום מנוחה', 'יום א' and more.
            Under 'Day Type' you'll see: Sun, Mon, Tue... but also 'Holiday', 'Holiday Eve' and more.
         */

        // originally:
        var dayType = getContent(cells[1]); // Column: 'Day Type'
        var dayName = getContent(cells[2]); // Column: 'Day Name'
        // but it makes more sense to:
        var title = dayType;
        var type = dayName;

        var rawStdHours = getContent(cells[3]); // Column: 'Std Hours'
        var stdHours = rawStdHours || DEFAULT_EXPECTED_HOURS_PER_DAY;
        var absence = getContent(cells[5 + cellsOffset]); // Column: 'Absence'
        var remark = getContent(cells[6 + cellsOffset]); // Column: 'Remark'
        var isHalfWorkDay = absence.includes(HALF) || remarks.includes(HALF);
        var totalHours = getContent(cells[7 + cellsOffset]); // Column: 'Total Hours'
        var isRestDay = type.includes(REST) && !rawStdHours;
        var isHoliday = type.toLowerCase().includes(SPECIAL_DAY) || title.toLowerCase().includes(SPECIAL_DAY);
        var hasSickness = absence.includes(SICKNESS) || remarks.includes(SICKNESS);
        var hasDayOff = absence.includes(DAY_OFF) || remarks.includes(DAY_OFF);
        var isHalfSick = hasSickness && isHalfWorkDay;
        var isHalfDayOff = hasDayOff && isHalfWorkDay;
        var isMissing = totalHours.toLowerCase().includes(MISSING);

        function isWorkDay (day) {
            if (isRestDay || isHoliday) return false;
            if (day.name === FRIDAY || day.name === SATURDAY) return false;
                
            day.type === SUNDAY || day.type.includes(WORK) && day.rawStdHours;
            return 
        }


        return {
            rowElm: row,
            cells: Array.from(row.children),
            name: dayName,
            date: dateObj,
            title: title,
            type: type,
            rawStdHours: rawStdHours,
            stdHours: stdHours,
            actualStdHours: stdHours || DEFAULT_EXPECTED_HOURS_PER_DAY,
            absence: absence,
            remark: remark,
            expectedWorkingMinutes: getExpectedMinutesToday(stdHours, isHalfWorkDay),
            actualWorkinMinutes: getTotalMinutes(totalHours),
            isWorkDay: isWorkDay,
            isRestDay: isRestDay,
            isHalfWorkDay: isHalfWorkDay,
        };
    });

    

    dayObjs.forEach(function (day, i) {
        // var isWorkDay = day.date.dayName === 'FRIDAY'  day.name.includes(WORK) || day.stdHours;
        // var isHalfWorkDay = day.absence.includes(HALF) || day.remarks.includes(HALF);
        
        if (isFutureDate(day.date)) { /* blacken cells */ }


    });

    // Iterate over data rows
    var totalMinutesDiff = Array.from(dataRows).map(function (dayRow, i) {
        var dailyTotalCell = dayRow.querySelector('td:nth-child('+ totalHoursColumnIndex +')');
        var dailyTotal = dailyTotalCell.textContent.trim();

        var absenceCell = dayRow.querySelector(absenceColumnSelector);
        var remarksCell = dayRow.querySelector(remarksColumnSelector);
        var absence = absenceCell.textContent.trim();
        var remarks = remarksCell.textContent.trim();

        // var shouldCalculate = dailyTotal

        // debugger
        var isHalfWorkDay = absence.includes('חצי') || remarks.includes('חצי');

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
        alert('No Time Diff! :)' + credit);
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

     // timeString example: '9:00'
     function getTotalMinutes (timeString) {
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
            ? 'td:nth-child('+ (columnIndex + cellsOffset - 1) + ')'
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
        var today = new Date();
        
        if (today.getFullYear() < dateObj.year) return true;
        if (today.getMonth() < dateObj.month) return true;
        if (today.getDate() < dateObj.dayNumber) return true;

        return false;
    }

    function getExpectedMinutesToday (stdHours, isHalfWorkDay) {
        var expectedMinutesToday = getTotalMinutes(stdHours);

        if (isHalfWorkDay) {
            expectedMinutesToday = expectedMinutesToday / 2;
        }

        return expectedMinutesToday;
    }
})();
