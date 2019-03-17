(function () {
    // Redirect from anywhere (the bookmarklet is also a regular bookmark)
    if (window.location.hostname !== 'checkin.timewatch.co.il') {
        window.location.href = 'https://checkin.timewatch.co.il';
        return;
    }
    
    var COLUMN_TITLE = 'Total Hours';
    var EXPECTED_HOURS_PER_DAY = 9;

    var dailyTotalExpectedMinutes = EXPECTED_HOURS_PER_DAY * 60;
    var table = document.querySelectorAll('table table')[4];
    var allRows = table.querySelectorAll('tr');
    // var rows = table.querySelectorAll('tr:nth-child(n+4)');
    // var firstRow = table.querySelector('tr');
    var firstTitleRow = allRows[0];
    var SecondTitleRow = allRows[1];
    var dataRows = allRows.slice(3);
    

    // Automatically find the right column
    var totalHoursColumnIndex = Array.from(firstTitleRow.children).findIndex(function (title) {
        return title.textContent === COLUMN_TITLE;
    });

    // Additional column offset
    // -1-     -2-     -3-
    // in|out  in|out  in|out
    totalHoursColumnIndex + SecondTitleRow.children.length * 2;
    
    var totalActualMinutes = Array.from(dataRows).map(function (day, i) {
        var dailyTotal = day.querySelector('td:nth-child('+ totalHoursColumnIndex +')').textContent.trim();

        if (!dailyTotal || dailyTotal.startsWith("Missing")) return null;
  
        var actualTime = dailyTotal.split(':').map(function (x) {
            return parseInt(x, 10)
        });
        var actualHours = actualTime[0];
        var actualMinutes = actualTime[1];
        var actualTotalMinutes = (actualHours * 60) + actualMinutes;

        var minLeft;
        var minExtra;

        if (actualHours < EXPECTED_HOURS_PER_DAY) { // missing
            var hoursLeft = EXPECTED_HOURS_PER_DAY - actualHours - 1;

            minLeft = (hoursLeft * 60) + (60 - actualMinutes);
        }
        else if (actualHours >= EXPECTED_HOURS_PER_DAY) { // extra
            var hoursExtra = actualHours - EXPECTED_HOURS_PER_DAY;

            minExtra = (hoursExtra * 60) + actualMinutes;
        }

        var totalMinutes = minLeft ? (minLeft * -1) : minExtra;

        return totalMinutes;
    })
    .filter(function (minutes) {
        return typeof minutes === 'number';       
    })
    .reduce(function (minutesTotal, minutesToday) {
        return minutesTotal + minutesToday;
    }, 0);

    var sign = totalActualMinutes < 0 ? '-' : '+';
    var diffTime = totalActualMinutes < 0 ? (totalActualMinutes * -1) : totalActualMinutes;
    var remain = diffTime % 60;

    if (!remain) {
        console.log(diffTime / 60 + ':00')
    }
    else {
        var hoursLeft = Math.floor(diffTime/60);
        var minsLeft = diffTime%60;

        alert(sign + hoursLeft + ':' + minsLeft);
    }
})();
