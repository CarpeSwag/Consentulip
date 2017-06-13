/**
	Gestures
	Connects the PDollar library to the gesture drawings on the flower
 */
var Gestures = {
	// Instance data
	points: new Array(),
	strokeID: 0,
	recognizer: new PDollarRecognizer(),
	gesture: null,
	gesturesEnabled: false,
	counter: -1,
	
	recognizeGesture: function() {
		// Attempts to recognize a gesture from drawn lines
		var respText = '';
		if (this.points.length >= 10) {
			if (Tutorial.active) {
				this.gesture = this.recognizer.Recognize(this.points, true, false, false);
			} else {
				this.gesture = this.recognizer.Recognize(this.points, false, true, true);
			}
		}
		
		// If it found a gesture
		if (this.gesture) {
			if (Tutorial.active) {
				// Tutorial is active (trying to draw a star).
				respText = Tutorial.gestureInput(this.gesture);
			} else {
				respText = '';
				var change = -2.5;
				if(Game.wasDesired) {
					if (this.gesture.Score > 0.33) {
						// Good if flower desired touching and gesture is decent
						change = 2.5;
						Talk.textTrusting();
						
						// Play a good sound
						var rand = Math.floor(Math.random() * Game.soundGood.length);
						Game.soundGood[rand].play();
					}
				} else {
					// Otherwise the flower does not like the gesture
					Talk.textRevoke(Game.lastPlayedWith);
					
					// Play a bad sound
					var rand = Math.floor(Math.random() * Game.soundBad.length);
					Game.soundBad[rand].play();
				}
				
				// Adjust the trust bar
				UI.adjustTrustBar(change);
			}
		}
		
		// Set text to response
		Talk.queueMessage(respText, 1000, 0, 2000);
		
		// Clear canvases and strokes
		Draw.clearCanvases();
	},
	
	logGesture: function() {
		// For debugging
		var out = 'new Array(\n\t';
		var comma = '';
		for (var i = 0; i < this.points.length; ++i) {
			var point = this.points[i];
			out += comma;
			out += 'new Point(' + point.X + ','	+ point.Y
				+ ',' + point.ID + ')';
			comma = ',';
		}
		out += '\n));';
		console.log(out);
	},
	
	convertGestureToDrawing: function() {
		// For generating new gestures (also debugging)
		var out = [];
		var temp = [];
		var last = 1;
		for (var i = 0; i < this.points.length; ++i) {
			var point = this.points[i];
			if (point.ID !== last) {
				last = point.ID;
				out.push(temp);
				console.log(temp);
				temp = [];
			}
			temp.push({
				x: point.X,
				y: point.Y
			})
		}
		out.push(temp);
		
		return out;
	},
	
	onPointerDown: function(x, y) {
		// Start a new line
		this.gesturesEnabled = true;
		this.counter = Constants.REFRESH_GESTURE_COUNTER;
		this.points.length = (this.strokeID == 0)? 0: this.points.length;
		this.points[this.points.length] = new Point(x, y, ++this.strokeID);
	},
	
	onPointerMove: function(x, y) {
		// Add points to last started line
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
		// End last line
		if (this.gesturesEnabled) {
			var point = new Point(x, y, this.strokeID);
			this.points[this.points.length] = point;
			Draw.drawLine(this.points[this.points.length-2], point);
		}
		this.gesturesEnabled = false;
		this.counter == Constants.REFRESH_GESTURE_COUNTER;
	},
	
	onFrame: function() {
		// Attempt to recognize gestures if counter is done
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
