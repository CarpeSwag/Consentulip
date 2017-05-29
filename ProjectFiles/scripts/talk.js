var Talk = {
	// HTML and Canvas elements
	text: null,
	
	// Pointer related
	isPointerDown: false,
	
	// Text variable
	textCounter: 0,
	
	// Visual elements
	menuOpen: false,
	sandwichOpen: false,
	
	onLoad: function() {
		this.text = document.getElementById('flower-name');
	},
	
	filterButtonHue: function(degrees) {
		var filter = 'hue-rotate(' + degrees + 'deg)';
		document.getElementById('sandwich-btn').style.filter
			= filter;
		document.getElementById('settings-btn').style.filter
			= filter;
		document.getElementById('revoke-btn').style.filter
			= filter;
	},
	
	setText: function(txt) {
		this.text.innerHTML = txt;
	},
	
	setDelayedText: function(txt, ms) {
		var textBox = this.text;
		setTimeout(function() {textBox.innerHTML = txt;}, ms);
	}
};
