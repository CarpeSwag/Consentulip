var Talk = {
	// HTML and Canvas elements
	text: null,
	
	// Pointer related
	isPointerDown: false,
	
	// Message Queue
	queue: [],
	extraTime: 0,
	active: false,
	message: '',
	
	onLoad: function() {
		this.text = document.getElementById('flower-name');
	},
	
	setText: function(txt) {
		this.text.innerHTML = txt;
	},
	
	queueMessage: function(msg, timer, delay, keepMsg) {
		// Set optional value
		delay = delay || 0;
		keepMsg = keepMsg === true;
		
		if (this.active) {
			var len = this.queue.length;
			var tail = (len == 0)? this.message:
				this.queue[len - 1].message;
			
			// Check if this is this is sending the same message
			// as the tail request
			if (tail === message) {
				if (len == 0) {
					this.extraTime += timer;
				} else {
					this.queue[len - 1].time += timer;
				}
			} else {
				// Add to tail of the queue
				this.queue.push({
					message: msg,
					time: timer,
					keep: keepMsg
				});
			}
		} else {
			// No message is currently displayed so start
			this.active = true;
			setTimeout(function() {
				Talk.startMessageQueue(msg, timer);
			}, delay);
		}
	},
	
	startMessageQueue: function(msg, timer) {
		this.setText(msg);
		setTimeout(this.rotateMessage, timer);
	},
	
	rotateMessage: function() {
		if (this.extraTime != 0) {
			// This message gets another cycle
			setTimeout(this.rotateMessage, this.extraTime);
			this.extraTime = 0;
		} else if (this.queue.length > 0) {
			// Rotate the message
			this.displayNext();
		} else {
			// Clear the messages
			this.clearMessage();
			active = false;
		}
	},
	
	displayNext: function() {
		// Pop next item off queue and display that.
		var next = this.queue.shift();
		this.message = next.message;
		this.setText(next.message);
		setTimeout(this.rotateMessage, next.time);
	},
	
	clearMessage: function() {
		this.message = '';
		this.setText('');
	}
};
