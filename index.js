var COLUMN_TITLE = 'Total Hours';
var EXPECTED_HOURS_PER_DAY = 9;

// Redirect from anywhere (the bookmarklet is also a regular bookmark)
if (window.location.hostname !== 'checkin.timewatch.co.il') {
    window.location.href = 'https://checkin.timewatch.co.il';
}

var EXPECTED_MINUTES_PER_DAY = EXPECTED_HOURS_PER_DAY * 60;
var table = document.querySelectorAll('table table')[4];
var allRows = Array.from(table.querySelectorAll('tr'));
var firstTitleRow = allRows[0];
var thirdTitleRow = allRows[2];
var dataRows = allRows.slice(3);

// Find the target column index ('Total Hours')
var totalHoursColumnIndex = Array.from(firstTitleRow.children).findIndex(function (title) {
    return title.textContent === COLUMN_TITLE;
});

// Additional column offset
// -1-     -2-     -3-
// in|out  in|out  in|out  <<-------
totalHoursColumnIndex += thirdTitleRow.children.length;

var TITLE_TEXT = 'Time Diff';

var isLoaded = firstTitleRow.lastChild.textContent === TITLE_TEXT;

if (!isLoaded) {
    var title = createNewTitle(TITLE_TEXT);
    
    firstTitleRow.appendChild(title);
}


var totalMinutesDiff = Array.from(dataRows).map(function (dayRow, i) {
    var dailyTotalCell = dayRow.querySelector('td:nth-child('+ totalHoursColumnIndex +')');
    var dailyTotal = dailyTotalCell.textContent.trim();

    if (!dailyTotal || dailyTotal.startsWith("Missing")) {
        if (!isLoaded) {
            var cell = createNewCell();
            
            dayRow.appendChild(cell);
        }

        return null;
    } 

    var actualTime = dailyTotal.split(':').map(function (x) {
        return parseInt(x, 10)
    });
    var actualHours = actualTime[0];
    var actualMinutes = actualTime[1];
    var totalMinutesToday = (actualHours * 60) + actualMinutes;

    var timeDiff = totalMinutesToday - EXPECTED_MINUTES_PER_DAY;

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
}
else {
    var sign = totalMinutesDiff < 0 ? 'Missing Time:\n -' : 'Extra Time:\n +';
    var diffTime = totalMinutesDiff < 0 ? (totalMinutesDiff * -1) : totalMinutesDiff;
    var hoursDiff = padWithZero(Math.floor(diffTime / 60));
    var minsDiff = padWithZero(diffTime % 60);
    var credit = '\n\n\nhttps://github.com/taitulism/TimeWatch-Bookmarklet';
    
    alert(sign + hoursDiff + ':' + minsDiff + credit);
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
