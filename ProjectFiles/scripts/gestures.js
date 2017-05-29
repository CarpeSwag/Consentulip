var Gestures = {
	// Instance data
	points: new Array(),
	strokeID: 0,
	recognizer: new PDollarRecognizer(),
	gesture: null,
	gesturesEnabled: false,
	counter: -1,
	
	recognizeGesture: function() {
		var respText = '';
		if (this.points.length >= 10) {
			this.gesture = this.recognizer.Recognize(this.points);
			console.log("Result: " + this.gesture.Name + " (" +
				(Math.round(this.gesture.Score * 100) / 100) + ").");
			console.log(this.gesture);
		}
		
		if (this.gesture) {
			if (Tutorial.active) {
				respText = Tutorial.gestureInput(this.gesture);
			} else {
				//respText = Game.processGesture(this.gesture);
			}
		}
		
		// Set text to response
		UI.setText(respText);
		
		// Clear canvases and strokes
		Draw.clearCanvases();
	},
	
	onPointerDown: function(x, y) {
		this.gesturesEnabled = true;
		this.counter = Constants.REFRESH_GESTURE_COUNTER;
		this.points.length = (this.strokeID == 0)? 0: this.points.length;
		this.points[this.points.length] = new Point(x, y, ++this.strokeID);
	},
	
	onPointerMove: function(x, y) {
		if (this.gesturesEnabled) {
			// Track the point
			var point = new Point(x, y, this.strokeID);
			this.points[this.points.length] = point;
			Draw.drawLine(this.points[this.points.length-2], point);
			
			// Reset counter
			this.counter = Constants.REFRESH_GESTURE_COUNTER;
		}
	},
	
	onPointerUp: function(x, y) {
		if (this.gesturesEnabled) {
			var point = new Point(x, y, this.strokeID);
			this.points[this.points.length] = point;
			Draw.drawLine(this.points[this.points.length-2], point);
		}
		this.gesturesEnabled = false;
		this.counter == Constants.REFRESH_GESTURE_COUNTER;
	},
	
	onFrame: function() {
		if (Game.enableGestures && !Tutorial.gesture) {
			if (this.counter >= 0) {
				if (this.counter == 0) {
					Gestures.recognizeGesture();
				}
				--this.counter;
			}
		}
	},
	
	clearStrokes: function() {
		this.points.length = 0;
		this.strokeID = 0;
	}
};
