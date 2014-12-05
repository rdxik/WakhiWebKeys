WakhiWebKeys
============

Wakhi keyboard layout for web browsers

Use this tool to type Wakhi characters on any webpage.

### Usage

Visit http://rdxik.github.io/WakhiWebKeys to install as a bookmarklet, and for usage instructions.

### Build

To create the bookmarklet:

* compress wakhiIM.js with your choice of Javascript compressor, such as the Google Closure Compiler at http://closure-compiler.appspot.com/home
* embed the compressed code in a link on an HTML page:

```
<a href='javascript:__COMPRESSED_HTML_HERE__'>WakhiWebKeys</a>
```

### Plans & Possibilities

Here are a few ideas for features or other improvements. Some might not be suitable for the bookmarklet version.
* popup keyboard reference (may be simpler to link to a separate page)
* popup dictionary reference (may be simpler to link to a separate page)
* better keyboard layout for mobile devices (they don't have ';' on the main keyboard).
* timeouts, so that long delay between 2 characters can be used to avoid creating a special character
* it may be more efficient to bind the event handler to individual input & textarea elements, rather than the whole document, depending on the page, but it seems to work fine as is
