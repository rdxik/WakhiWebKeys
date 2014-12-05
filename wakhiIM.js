/* wakhiIM.js
	Wakhi input method for web browsers.
	Copyright (C) 2014 Roger Dueck

	This program is free software; you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation; either version 2 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License along
	with this program; if not, write to the Free Software Foundation, Inc.,
	51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

// Pass the DOM document as an argument, to improve minification.
(function(document) {
	var	ctrlDiv = null,
		textDiv = null,

		// input-method state variables
		enabled = false,
		prevInput = null,
		prevChar = null,
		escaped = false,

		// Codes for special Wakhi characters.
		// For uppercase output, the second character in a doubled pair is
		// entered as lowercase. This simplifies the code that allows the
		// user to enter the second character as either uppercase or lowercase,
		// which should be especially helpful for mobile device users.
		// To reproduce the escaped codes from an unescaped version, use:
		//	JSON.stringify(codes).replace(/[\u007f-\uffff]/g, function(c) { 
		//		return '\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4);
		//	});
		dot = "\u0323",
		hacek = "\u030c",
		codes = {"cc":"\u010d"+dot,"Cc":"\u010c"+dot,"dd":"\u1e0d","Dd":"\u1e0c","gg":"\u0263\u030c","Gg":"\u0194\u030c","jj":"\u01f0"+dot,"Jj":"J"+dot+hacek,"ss":"\u1e63"+hacek,"Ss":"\u1e62"+hacek,"tt":"\u1e6d","Tt":"\u1e6c","uu":"\u0289","Uu":"\u0244","xx":"x"+hacek,"Xx":"X"+hacek,"zz":"\u1e93"+hacek,"Zz":"\u1e92"+hacek,";c":"\u010d",";C":"\u010c",";d":"\u03b4",";D":"\u0394",";g":"\u0263",";G":"\u0194",";j":"\u01f0",";J":"J"+hacek,";s":"\u0161",";S":"\u0160",";t":"\u03d1",";T":"\u03b8",";z":"\u017e",";Z":"\u017d","dz":"\u0292","Dz":"\u01b7"} 

		// A string of all characters that can start a special Wakhi character.
		// This must match the 'codes' object, and could be regenerated with:
		//	var codeStarts = '', codesKeys = codes.keys();
		//	for (var index in codesKeys) {
		//		codeStarts += codesKeys[index][0];
		//	}
		// NOTE: handleKeypress() must be modified if punctuation other
		// than ';' is used.
		codeStarts = 'cdgjstuxzCDGJSTUXZ;';

	// Standardize required event object properties.
	function getEvent(e){
		if (!e) e = window.event;

		var t = e.target || e.srcElement;
		if (t.nodeType == 3) t = t.parentNode; // defeat Safari bug
		e.target=t;

		e.which = e.which || e.charCode || e.keyCode;

		return e;
	}

	// The core of the input method
	function handleKeypress (e){
		e = getEvent(e);
		if (['INPUT','TEXTAREA'].indexOf(e.target.tagName)===-1) return;

		var c = String.fromCharCode(e.which);
		if (prevInput != e.target) {
			prevInput = e.target;
			prevChar = c;
			escaped = false;
			return;
		}

		if (escaped) {
			escaped = false;
			prevChar = null;
		}
		else if (c == '\\') {
			escaped = true;
			prevChar = null;

			e.preventDefault();
			return false;
		}
		else if (prevChar === null) {
			prevChar = c;
		}
		else if (codes[prevChar+c] !== undefined) {
			// Replace the text under the cursor with the new text.
			var obj = e.target;
			var val = obj.value;
			var pos = getCursorPosition(obj);
			if (prevChar != ';') c = c.toLowerCase();
			var code = codes[prevChar+c];
			obj.value=val.substring(0, pos-1) + code + val.substring(pos);
			if (code.length>1) pos += code.length - 1;
			setCaretPosition(obj,pos);
			prevChar = null;

			e.preventDefault();
			return false;
		}
		else if (codeStarts.indexOf(c) !== -1) {
			prevChar = c;
		}
		else {
			prevChar = null;
		}
	}

	// Get cursor position from a text input element. From:
	// http://stackoverflow.com/questions/2897155/get-caret-position-within-an-text-input-field
	function getCursorPosition(input) {
		if (!input) return; // No (input) element found
		if ('selectionStart' in input) {
			// Standards-compliant browsers
			return input.selectionStart;
		} else if (document.selection) {
			// IE
			input.focus();
			var sel = document.selection.createRange();
			var selLen = document.selection.createRange().text.length;
			sel.moveStart('character', -input.value.length);
			return sel.text.length - selLen;
		}
	}

	// Set cursor position from a text input element. Adapted from:
	// http://stackoverflow.com/questions/512528/set-cursor-position-in-html-textbox
	function setCaretPosition(elem,caretPos) {
		if(elem.createTextRange) {
			var range = elem.createTextRange();
			range.move('character', caretPos);
			range.select();
		}
		else {
			if(elem.selectionStart) {
				elem.focus();
				elem.setSelectionRange(caretPos, caretPos);
			}
			else
				elem.focus();
		}
	}

	// Handle non-printing keypresses
	function handleKeydown (e){
		e = getEvent(e);
		if (['INPUT','TEXTAREA'].indexOf(e.target.tagName)===-1) return;

		switch (e.which) {
			case 8:		// Backspace
			case 13:	// RETURN
			case 27:	// ESC
			case 37:	// Arrow
			case 38:	// Arrow
			case 39:	// Arrow
			case 40:	// Arrow
				prevChar = null;
				escaped = false;
		}
		//console.log("You pressed key code "+e.which);
	}

	// Clear input state when user leaves the input element
	function handleBlur (e){
		prevInput = null;
	}

	// Enable the input method.
	function enable() {
		// Check whether input elements exist, and add one if not.
		// This could be removed if the utility is never to be used
		// on a blank page without input elements.
		if (! (document.getElementsByTagName('input').length ||
			document.getElementsByTagName('textarea').length)
		) {
			textDiv = document.createElement('div');
			var e1 = document.createElement('textarea');
			e1.style.cssText = 'position:absolute;width:30%;height:30%;z-index:100;font-family:Lucida Grande;';
			textDiv.appendChild(e1);
			document.body.appendChild(textDiv);
		}

		// Attach events. Here we listen on the whole document, but it
		// may be better to listen on individual inputs, depending on the
		// number of them and the overall complexity of the page.
		document.addEventListener('keypress', handleKeypress);
		document.addEventListener('keydown', handleKeydown);
		document.addEventListener('blur', handleBlur);
		enabled = true;
		ctrlDiv.style.background = '#0c0';
	}

	// Disable Wakhi input method
	function disable() {
		document.removeEventListener('keypress', handleKeypress);
		document.removeEventListener('keydown', handleKeydown);
		document.removeEventListener('blur', handleBlur);
		if (textDiv) {
			textDiv.parentNode.removeChild(textDiv);
		}
		enabled = false;
		ctrlDiv.style.background = '#c00';
	}

	// Provide button for toggling input method on/off.
	ctrlDiv = document.createElement('div');
	ctrlDiv.style.cssText = 'position:fixed;z-index:999;bottom:0;left:0;border:1px solid #000;';
	ctrlDiv.innerHTML = 'X̌';
	document.body.appendChild(ctrlDiv);
	ctrlDiv.addEventListener('click', function(e){
		if (enabled) disable();
		else enable();
	});

	// Enable Wakhi Input Method
	enable();

})(document);
