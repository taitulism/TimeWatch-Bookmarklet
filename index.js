(function () {
    // Redirect from anywhere (the bookmarklet is also a regular bookmark)
    if (window.location.hostname !== 'checkin.timewatch.co.il') {
        window.location.href = 'https://checkin.timewatch.co.il';
        return;
    }
    
    var table = document.querySelectorAll('table table')[4];
    var rows = table.querySelectorAll('tr:nth-child(n+4)');
    
    var mapped = Array.from(rows).map(function (i, td) {
        const txt = td.textContent.substr(1);

        if (!txt || txt.substr(0, 4) === 'issi') return null;

        const time = txt.split(':').map(function (x){
            return parseInt(x, 10)
        });
        const hours = time[0];
        const minutes = time[1];

        var minLeft;
        var minExtra;

        if (hours < 9) { // missing
            const hoursLeft = 9 - hours - 1;

            minLeft = (hoursLeft * 60) + (60 - minutes);
        }
        else if (hours >= 9) { // extra
            const hoursExtra = hours - 9;

            minExtra = (hoursExtra * 60) + minutes;
        }

        const totalMinutes = minLeft ? (minLeft * -1) : minExtra;

        return totalMinutes;
    }).get();

    const reduced = mapped.reduce(function (x, v) {
        return x+v;
    }, 0)

    const sign = reduced < 0 ? '-' : '+';

    const diffTime = reduced < 0 ? (reduced * -1) : reduced;

    const remain = diffTime % 60;

    if (!remain) {
        console.log(diffTime / 60 + ':00')
    }
    else {
        const hoursLeft = Math.floor(diffTime/60);
        const minsLeft = diffTime%60;

        alert(sign + hoursLeft + ':' + minsLeft);
    }
})();
