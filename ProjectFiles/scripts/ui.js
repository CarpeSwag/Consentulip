var UI = {
	text: null,
	
	onLoad: function() {
		this.text = document.getElementById('flower-name');
	},
	
	setText: function(txt) {
		this.text = txt;
	},
	
	clearCanvases: function() {
		// Clear gesture strokes
		Gestures.clearStrokes();
	}
};
