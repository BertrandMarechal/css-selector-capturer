# css-selector-capturer

As I wanted to use more and more [Puppeteer](https://pptr.dev/), I need to find a quicker way to identify the
elements I am clicking on.
As this testing interest happens ater I have done my code, I need to be able to extract the css selectors of a website
as easily as I can.

This is how I started with this simple repo, that captures the css selectors of the elements I click on, stores it in an
array, and offers the possibility to extract the selectors, or restart.

## How to use it

Copy the content of [capturer.js](capturer.js), and paste it into che Chrome console.

Go through your session.

At the end of a session, call `BIM_extractSession()` that will extract the selectors that were used.

At any moment, you can clear the captured selectors by calling `BIM_restartSession()`.
 
 If the app is logging too much information, just execute `BIM_verbose = false`.
 
 Enjoy !
