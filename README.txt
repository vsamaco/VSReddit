Name: Vincent Samaco
Date: 1/22/2011
Project: vs.reddit

Purpose:
Frontend challenge
http://www.reddit.com/r/blog/comments/fjgit/reddit_is_doubling_the_size_of_its_programming/

Description:
vs.reddit is a reddit clone where all links and votes are maintained client-side. The site 
utilizes HTML5 localstorage for storing state data, which is then represented in 
JavaScript as JSON. jQuery library was used to processed data to HTML and to define 
event actions.  Colorbox plugin provided lightbox functionality for login and submit 
link lightboxes.  The site design is a 960px two column layout with a fixed position header.

Files:
- home.html (main html file)
- data.js (copy of reddit json data)
- scripts/jquery.colorbox-min.js (Colorbox JS)
- scripts/jquery.min.js (Jquery 1.5)
- scripts/JSON.js (JSON JS- http://www.json.org/js.html)
- scripts/vsreddit.js (site main script file)
- styles/colorbox.css (colorbox styles)
- styles/images (colorbox images)
- styles/reset.css (reset styles)
- styles/style.css (site main styles)

Features:
- User Login (validation prompts)
- Prepopulate links and category from JSON data
- Submit links (validation prompts)
- Vote links
- Filter links by Category
- Sort links by Top or Latest
- Submit Links to Category
- Tracks Recent Views

Requirements:
The site must be previewed in Chrome, as I did no cross browser testing, in order for all 
functions to work and styles display properly.

How To:
1. Copy all zip files to webserver
2. Open Chrome and go to home.html (e.g. http://localhost:8888/home.html)
3. If JSON has been properly loaded, a message prompt "Reload links and votes success" will be 
displayed.  A list of links should be displayed in main area and category dropdown in header
should be populated (reload page to resolve quirks)
4. Click login button in top right, a Login lightbox should display
5. Enter any username, password is not utilized (not real account, username for author)
6. Click login button
7. Login button is swapped with account dropdown for logging out.  Once logged in, voting and
submitting links are enabled
8. Vote up and down any links (click vote to deselect), score will be updated and vote recorded
in sidebar
9. Clicking link title opens the link in new window, and is added to recent views list 
in sidebar
10. Select Category from header to filter main list
11. Click Sort (Default/Top/Latest) the main list
12. Click Submit Link button in sidebar, opens Submit Link lightbox
13. Enter Title, URL (e.g. http://www.google.com/), and set Category
14. Click Submit, successful link submission will be add to main list
15. In top right, select Logout from account menu will reset the main list, votes, and views

Note: To reload links and votes, utilize the Reload Data button in header



Bugs:
- Reload Data breaks click events like Category (reload page)
- Comments links are not defined
- Vote count not correct for new submitted links (reload page)
....



