# Neighborhood Map
## A single page web application that displays information about a Neighborhood.

### frontend :
HTML5 Boilerplate, html5, css3, font-awesome, jquery, knockout

### APIs :
google maps, Foursquare, Wikipedia

## Structure
* index.html - app page

* /css - css files
  * normalize.css - HTML5 Boilerplate normalize file for consistent look across browsers
  * font-awesome.min.css - font-awesome css file
  * main.css - custom app styles

* /js - javascript files
  * /vendor - vendor js files for jquery and knockout
  * main.js - app logic

* /fonts - custom fonts (font-awesome)

## Use
* Due to google maps api restriction, you need to run the app on localhost:8000
  * A simple way to do this is to run this command on the app folder:  
  ```
    $ python -m SimpleHTTPServer
  ```
  * Then open this link on a browser to use the application:
    * http://localhost:8000/
