[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

TimeWatch Bookmarklet
=====================
A timewatch.co.il helper tool to calculate monthly working hours.

What is a Bookmarklet?
------------------------
A bookmarklet is like a regular browser bookmark (a favorite link). It has a title you click on and a URL. The difference is that instead of a website address it holds javascript code. When clicked it runs the code on the current page.


"Installation"
--------------
1. Create a new Bookmark and set the Name & URL fields to:  
* **Name**: TimeWatch  
* **URL**: Copy the contents of [`bookmarklet.txt`](https://raw.githubusercontent.com/taitulism/TimeWatch-Bookmarklet/master/bookmarklet.txt).

>*You can bookmark this page (`ctrl+D`) and then edit it with a right-click*


Usage
-----
1. Login to "TimeWatch" and click the "Update punch data" link.

2. When on the "Update punch data" page, a click on the bookmarklet will generate an extra column ("Time Diff") and a popup.

"Time Diff" column holds your daily expected/actual diff in minutes.
The popup will show you the current month's total extra/missing hours.

Clicking the bookmarklet on any other website will redirect you to the "TimeWatch" website.

This script works only in the "Update punch data" page.

![TimeWatch.co.il's "update punch data" page](https://github.com/taitulism/TimeWatch-Bookmarklet/raw/master/update-punch-data.png "TimeWatch.co.il's 'update punch data' page")

Before:
![TimeWatch before the bookmarklet](https://github.com/taitulism/TimeWatch-Bookmarklet/raw/master/before.png "TimeWatch before the bookmarklet")

After:
![TimeWatch after the bookmarklet](https://github.com/taitulism/TimeWatch-Bookmarklet/raw/master/after.png "TimeWatch after the bookmarklet")



Creating your own bookmarklets?
------------------------------
I recommend this tool: [https://chriszarate.github.io/bookmarkleter](https://chriszarate.github.io/bookmarkleter)
* It wraps your code with an [iife](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)
* It minifies your code
* It escapes stuff (bookmarklet code should be URL compatible).
* It doesn't like some of ES6 stuff. Use vars only, no arrow functions etc.
