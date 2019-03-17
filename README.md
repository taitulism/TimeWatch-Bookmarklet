TimeWatch Bookmarklet
=====================
A timewatch.co.il helper tool to calculate monthly working hours.

What is a "Bookmarklet"?
------------------------
It's like a regular browser bookmark (a favorite link) but instead of a website address in the URL field it has javascript code that runs on the current page when clicked.


"Installation"
--------------
1. Create a new Bookmark (`ctrl+D`).  
    *(You can bookmark this page for example and then edit it)*
2. Edit the new bookmark (right click) and in the URL field put the contents of [`bookmarklet.txt`](https://raw.githubusercontent.com/taitulism/TimeWatch-Bookmarklet/master/bookmarklet.txt).

>"Title" could be anything (e.g. "**TimeWatch**")


Usage
-----
Click the bookmarklet on the "update punch data" page and get an alert of your extra / missing hours (configured to 9 hours per day by default).

Clicking the bookmarklet on any other website will redirect you to: checkin.timewatch.co.il.

This script works only in the "Update punch data" page.

![TimeWatch.co.il's "update punch data" page](https://github.com/taitulism/TimeWatch-Bookmarklet/raw/master/time-watch.png "TimeWatch.co.il's 'update punch data' page")

>For ease of developing an extra column is added with the daily time diff.



Creating you own bookmarklets?
------------------------------
I recommend this tool: [https://chriszarate.github.io/bookmarkleter](https://chriszarate.github.io/bookmarkleter)
* It wraps your code with an [iife](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)
* It minifies your code
* It escapes stuff (bookmarklet code should be URL compatible).
* It doesn't like some of ES6 stuff. Use vars only, no arrow functions etc.