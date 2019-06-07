(function () {

    // Redirect from anywhere (the bookmarklet is also a regular bookmark)
    if (window.location.hostname !== 'checkin.timewatch.co.il') {
        window.location.href = 'https://checkin.timewatch.co.il';
        return;
    }

    var DEFAULT_EXPECTED_HOURS_PER_DAY = '9:00';

    var table = document.querySelectorAll('table table')[4];
    var allTableRows = Array.from(table.querySelectorAll('tr')); // includes table headers

    // Headers (first three rows)
    var firstHeader = allTableRows[0];
    var thirdHeader = allTableRows[2];
    
    // Data Rows
    var dataRows = allTableRows.slice(3);

    /*
        Note the column offset:
        The 'Total Hours' column is 7th in the table's header but 12th on a day row (when 'Punch Data' has 3 in/out parts).
        The 'Punch Data' column size is dynamic as employers could change the number of ins and outs.
    
        ┌────────────────────┐
        │P u n c h   D a t a │ <<------- firstHeader 1 cell
        │ -1-  │ -2-  │ -3-  │
        │in|out│in|out│in|out│ <<------- thirdHeader 6 cells
    */
    var cellsOffset = thirdHeader.children.length;

    // Find the 'Total Hours' column index
    var totalHoursColumnIndex = Array.from(firstHeader.children).findIndex(function (title) {
        return title.textContent === 'Total Hours';
    }) + cellsOffset;

    // +1 because `nth-child` selector (comes later) is not zero based like elm.children

    // Find the 'Std Hours' column index
    var stdHoursColumnIndex = Array.from(firstHeader.children).findIndex(function (title) {
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

    var rowObjects = dataRows

    // Iterate over data rows
    var totalMinutesDiff = Array.from(dataRows).map(function (dayRow, i) {
        var dailyTotalCell = dayRow.querySelector('td:nth-child('+ totalHoursColumnIndex +')');
        var dailyTotal = dailyTotalCell.textContent.trim();

        var absenceCell = dayRow.querySelector(absenceColumnSelector);
        var remarksCell = dayRow.querySelector(remarksColumnSelector);
        var absence = absenceCell.textContent.trim();
        var remarks = remarksCell.textContent.trim();

        var shouldCalculate = dailyTotal

        debugger
        var isHalfWorkDay = absence.includes('חצי') || remarks.includes('חצי');

        if (!isHalfWorkDay && (!dailyTotal || dailyTotal.startsWith("Missing"))) {
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
        var columnIndex = Array.from(firstHeader.children).findIndex(function (title) {
            return title.textContent === targetTitle;
        }) + 1;

        return addPunchInCells
            ? 'td:nth-child('+ (columnIndex + cellsOffset - 1) + ')'
            : 'td:nth-child('+ columnIndex +')';
    }
})();
