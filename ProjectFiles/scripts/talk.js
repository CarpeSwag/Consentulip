var Talk = {
	// HTML and Canvas elements
	text: null,
	
	// Pointer related
	isPointerDown: false,
	
	// Text variable
	contents: '',
	
	onLoad: function() {
		this.text = document.getElementById('flower-name');
	},
	
	setText: function(txt) {
		this.text.innerHTML = txt;
	},
	
	setDelayedText: function(txt, ms) {
		setTimeout(function() {Talk.setText(txt);}, ms);
	}
};
