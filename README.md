TimeWatch Bookmarklet
=====================
A timewatch.co.il helper tool to calculate monthly working hours.

Usage
-----
* Bookmark this page now (ctrl+D)
* Edit the new bookmark (right click) and replace with the following:
    * **Title:** Could be anything (e.g. "TimeWatch").
    * **URL:** Should be the contents of [`bookmarklet.txt`](bookmarklet.txt) (copy/paste).


<a href="javascript:void%20function(){(function(){function%20a(a){return%2010%3Ea%3F%220%22+a:a+%22%22}function%20b(a){var%20b=document.createElement(%22td%22);if(b.setAttribute(%22bgcolor%22,%22%23e0e0e0%22),null==a)return%20b;var%20c=0%3Ca%3F%22+%22+a:a;return%20b.innerHTML=%22%20%26nbsp%20(%22+c+%22)%22,b}if(%22checkin.timewatch.co.il%22!==window.location.hostname)return%20void(window.location.href=%22https://checkin.timewatch.co.il%22);var%20c=document.querySelectorAll(%22table%20table%22)[4],d=Array.from(c.querySelectorAll(%22tr%22)),e=d[0],f=d[2],g=d.slice(3),h=Array.from(e.children).findIndex(function(a){return%20a.textContent===%22Total%20Hours%22});h+=f.children.length;var%20i=function(){var%20a=document.createElement(%22td%22);return%20a.setAttribute(%22align%22,%22center%22),a.setAttribute(%22valign%22,%22middle%22),a.setAttribute(%22bgcolor%22,%22%237ba849%22),a.setAttribute(%22rowspan%22,%223%22),a.innerHTML=%22Time%20Diff%22,a}();e.appendChild(i);var%20j=Array.from(g).map(function(a){var%20c=a.querySelector(%22td:nth-child(%22+h+%22)%22),d=c.textContent.trim();if(!d||d.startsWith(%22Missing%22)){var%20e=b();return%20a.appendChild(e),null}var%20f=d.split(%22:%22).map(function(a){return%20parseInt(a,10)}),g=f[0],i=f[1],j=60*g+i-60*9,e=b(j);return%20a.appendChild(e),j}).filter(function(a){return%22number%22==typeof%20a}).reduce(function(a,b){return%20a+b},0);if(0===j)return%20void%20alert(%22No%20Time%20Diff!%20:)%22);var%20k=0%3Ej%3F%22Missing%20Time:\n%20-%22:%22Extra%20Time:\n%20+%22,l=0%3Ej%3F-1*j:j,m=a(Math.floor(l/60)),n=a(l%2560);alert(k+m+%22:%22+n)})()}();">Try Link1</a>

[try link2](javascript:void%20function(){(function(){function%20a(a){return%2010%3Ea%3F%220%22+a:a+%22%22}function%20b(a){var%20b=document.createElement(%22td%22);if(b.setAttribute(%22bgcolor%22,%22%23e0e0e0%22),null==a)return%20b;var%20c=0%3Ca%3F%22+%22+a:a;return%20b.innerHTML=%22%20%26nbsp%20(%22+c+%22)%22,b}if(%22checkin.timewatch.co.il%22!==window.location.hostname)return%20void(window.location.href=%22https://checkin.timewatch.co.il%22);var%20c=document.querySelectorAll(%22table%20table%22)[4],d=Array.from(c.querySelectorAll(%22tr%22)),e=d[0],f=d[2],g=d.slice(3),h=Array.from(e.children).findIndex(function(a){return%20a.textContent===%22Total%20Hours%22});h+=f.children.length;var%20i=function(){var%20a=document.createElement(%22td%22);return%20a.setAttribute(%22align%22,%22center%22),a.setAttribute(%22valign%22,%22middle%22),a.setAttribute(%22bgcolor%22,%22%237ba849%22),a.setAttribute(%22rowspan%22,%223%22),a.innerHTML=%22Time%20Diff%22,a}();e.appendChild(i);var%20j=Array.from(g).map(function(a){var%20c=a.querySelector(%22td:nth-child(%22+h+%22)%22),d=c.textContent.trim();if(!d||d.startsWith(%22Missing%22)){var%20e=b();return%20a.appendChild(e),null}var%20f=d.split(%22:%22).map(function(a){return%20parseInt(a,10)}),g=f[0],i=f[1],j=60*g+i-60*9,e=b(j);return%20a.appendChild(e),j}).filter(function(a){return%22number%22==typeof%20a}).reduce(function(a,b){return%20a+b},0);if(0===j)return%20void%20alert(%22No%20Time%20Diff!%20:)%22);var%20k=0%3Ej%3F%22Missing%20Time:\n%20-%22:%22Extra%20Time:\n%20+%22,l=0%3Ej%3F-1*j:j,m=a(Math.floor(l/60)),n=a(l%2560);alert(k+m+%22:%22+n)})()}();)


For Developers
--------------
Create a bookmarklet here: [https://chriszarate.github.io/bookmarkleter](https://chriszarate.github.io/bookmarkleter)  
(This tool doesn't like some of ES6 stuff. Use vars only, no arrow functions etc.)