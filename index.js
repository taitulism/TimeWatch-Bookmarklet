(function () {
    var COLUMN_TITLE = 'Total Hours';
    var EXPECTED_HOURS_PER_DAY = 9;

    // Redirect from anywhere (the bookmarklet is also a regular bookmark)
    if (window.location.hostname !== 'checkin.timewatch.co.il') {
        window.location.href = 'https://checkin.timewatch.co.il';
        return;
    }

    var EXPECTED_MINUTES_PER_DAY = EXPECTED_HOURS_PER_DAY * 60;
    var table = document.querySelectorAll('table table')[4];
    var allRows = Array.from(table.querySelectorAll('tr'));
    var firstTitleRow = allRows[0];
    var SecondTitleRow = allRows[1];
    var dataRows = allRows.slice(3);
    
    // Find the target column index ('Total Hours')
    var totalHoursColumnIndex = Array.from(firstTitleRow.children).findIndex(function (title) {
        return title.textContent === COLUMN_TITLE;
    });

    // Additional column offset
    // -1-     -2-     -3-
    // in|out  in|out  in|out
    totalHoursColumnIndex += SecondTitleRow.children.length * 2;
    
    var totalMinutesDiff = Array.from(dataRows).map(function (day, i) {
        var dailyTotal = day.querySelector('td:nth-child('+ totalHoursColumnIndex +')').textContent.trim();

        if (!dailyTotal || dailyTotal.startsWith("Missing")) return null;
  
        var actualTime = dailyTotal.split(':').map(function (x) {
            return parseInt(x, 10)
        });
        var actualHours = actualTime[0];
        var actualMinutes = actualTime[1];
        var totalMinutesToday = (actualHours * 60) + actualMinutes;

        return totalMinutesToday - EXPECTED_MINUTES_PER_DAY;
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
    
    var sign = totalMinutesDiff < 0 ? '-' : '+';
    var diffTime = totalMinutesDiff < 0 ? (totalMinutesDiff * -1) : totalMinutesDiff;
    var remain = diffTime % 60;

    if (!remain) {
        console.log(diffTime / 60 + ':00')
    }
    else {
        var hoursLeft = padWithZero(Math.floor(diffTime/60));
        var minsLeft = padWithZero(diffTime % 60);

        alert(sign + ' ' + hoursLeft + ':' + minsLeft);
    }

    function padWithZero (num) {
        if (num < 10)
            return '0' + num;
        return String(num);        
    }
})();
