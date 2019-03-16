function go () {
    const rows2 = document.querySelectorAll('table table:nth-child(1) tr:nth-child(n+4)')

    const times = Array.from(rows2).map(function (row) {
        const timeSpan = row.querySelector('td:nth-of-type(13)').textContent;
        return timeSpan;
    }).filter(function (timeSpan) {
        return timeSpan && timeSpan.trim() && !timeSpan.startsWith("Missing");
    })

    const minutes = times.map(function (ts) {
        return getMinutes(ts);
    });

    const expectedMinutes = times.length * 9 * 60;
    const actualMinutes = minutes.reduce(function (sum, num) { return sum + num }, 0);
    const diff = actualMinutes - expectedMinutes;
    const hoursDifference = Math.abs(Math.floor(diff / 60));
    const minutesDifference = Math.abs(diff % 60);
    const hoursDifferenceString = hoursDifference < 10 ? ('0' + hoursDifference) : hoursDifference;
    const minutesDifferenceString = minutesDifference < 10 ? ('0' + minutesDifference) : minutesDifference;
    
    if (diff > 0) {
        console.log('%cYou are ahead by ' + hoursDifferenceString + ':' + minutesDifferenceString, 'background: green');
    }
    else {
        console.log('%cYou are behind by ' + hoursDifferenceString + ':' + minutesDifferenceString, 'background: red');
    }
}

function getMinutes(timeSpan) {
    const parts = timeSpan.split(":");
    return Number(parts[1]) + (Number(parts[0]) * 60);
}

function getDate(time) {
    const hour = time.substr(0, time.indexOf(':'));
    const minutes = time.substr(time.indexOf(':') + 1);
    return new Date(2019, 0, 1, hour, minutes);
}

go();