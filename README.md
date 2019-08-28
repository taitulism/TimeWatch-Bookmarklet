[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

TimeWatch Bookmarklet
=====================
A timewatch.co.il helper tool to calculate working hours.




"Installation"
--------------
[see: What is a Bookmarklet?](#what-is-a-bookmarklet)

1. Create a new Bookmark ([see: How to create (and edit) bookmarks](#how-to-create-and-edit-bookmarks)).   
2. Edit it. Set the Name & URL fields to:  
**Name:** "TimeWatch" (or whatever)  
**URL:** copy the following code:
    ```
    javascript:void%20function(){var%20a=document.createElement(%22script%22);a.src=%22https://cdn.jsdelivr.net/gh/taitulism/TimeWatch-Bookmarklet/index.js%22,a.type=%22text/javascript%22,document.body.appendChild(a)}();
    ```

What this code does is basically loading and running
[`index.js`](https://raw.githubusercontent.com/taitulism/TimeWatch-Bookmarklet/master/index.js) file into the "TimeWatch" website. It is hosted on [jsDelivr CDN](https://www.jsdelivr.com/) which is where GithHub stores repository files at.




Usage
-----
* The first click on the bookmarklet on any other website will redirect you to the "TimeWatch" website.

Login and you'll get to the homepage.

* Clicking the bookmarklet when on the homepage will take you to the "Update punch data" page.  
You can click the link yourself, of course:
![TimeWatch.co.il's "update punch data" page](https://github.com/taitulism/TimeWatch-Bookmarklet/raw/master/update-punch-data.png "TimeWatch.co.il's 'update punch data' page")

* Now is where the magic happens. Clicking the bookmarklet while on "Update punch data" page will turn this:
    ### **Before**
    ![TimeWatch before the bookmarklet](https://github.com/taitulism/TimeWatch-Bookmarklet/raw/master/before.png "TimeWatch before the bookmarklet")

    into this:
    ### **After**
    ![TimeWatch after the bookmarklet](https://github.com/taitulism/TimeWatch-Bookmarklet/raw/master/after.png "TimeWatch after the bookmarklet")

&nbsp;

The popup will show you the current month's total extra/missing hours.
Additionally, a new column is added ("Time Diff") to show daily expected/actual diff in minutes.

### **Std Hours Configuration**  
By default, the script takes the expected worknig hours per day from the "Std Hours" column. You can set a constant number to override it by setting a `localStorage` item.

You can add the `localStorage` item via your browser's devTools interface ("Application" tab in Chrome or "Storage" tab on FireFox) or programmatically by running in your console:
```js
localStorage.setItem('customStdHours', '9:00');
```

The key is `customStdHours` and the value should be formatted similar to the "Std Hours" column e.g. "9:00".

> ATTENTION: `localStorage` is persistant until you clear your browser's data.


&nbsp;

&nbsp;

What is a Bookmarklet?
----------------------
A bookmarklet is like a regular browser bookmark (a favorite link) that instead of redirecting you to a website address (when clicked), it runs javascript code on the current page you're in. 

Bookmarklets can be designed to work on any web page (for example, a bookmarklet for changing any website's background into a dark color) or they can be tailor made to specific websites, like "TimeWatch-bookmarklet".

The code is stored in the bookmark's URL field, instead of an address. It should be URL compatible so it's limited by size (differs between browsers),some characters, spaces for example, should be escaped (`%20`), a `javascript:void` URL prefix should be added before the script and some other quirks.


How to create (and edit) bookmarks?
-----------------------------------
Handling bookmarks varies in different browsers.

_Creating_ bookmarks is usually done by pressing `"ctrl + D"` or clicking the star icon in your browser's address bar. Then a little window pops up, but you can only edit the name there.  
On **Chrome** you can click the `"More"` button in the popup and edit the URL as well.

_Editing_ bookmarks is usually done by right-clicking the created bookmark in the bookmarks toolbar and then `"Edit..."` for Chrome or `"Properties"` for FireFox.

If you don't see your browser's bookmarks toolbar you can toggle it by pressing:  
[**Chrome**] `ctrl + shift + B`  
[**Firefox**] `ctrl + B` (for sidebar. The toolbar has no keyboard shortcut AFAIK).

&nbsp;

&nbsp;

Creating your own bookmarklets?
------------------------------
I recommend this tool: [https://chriszarate.github.io/bookmarkleter](https://chriszarate.github.io/bookmarkleter)
* It wraps your code with an [iife](https://developer.mozilla.org/en-US/docs/Glossary/IIFE)
* It minifies your code
* It escapes stuff (bookmarklet code should be URL compatible).
* It doesn't like some of ES6 stuff. Use vars only, no arrow functions etc.
