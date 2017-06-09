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
			if (Tutorial.active) {
				this.gesture = this.recognizer.Recognize(this.points, true, false, false);
			} else {
				this.gesture = this.recognizer.Recognize(this.points, false, true, true);
			}
		}
		
		if (this.gesture) {
			if (Tutorial.active) {
				respText = Tutorial.gestureInput(this.gesture);
			} else {
				respText = '';
				var change = -2.5;
				if(Game.wasDesired) {
					if (this.gesture.Score > 0.33) {
						change = 2.5;
						Talk.textTrusting();
					}
				} else {
					Talk.textRevoke(Game.lastPlayedWith);
				}
				
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
