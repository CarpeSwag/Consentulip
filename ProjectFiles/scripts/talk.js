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
	keep: false,
	
	onLoad: function() {
		this.text = document.getElementById('flower-message');
	},
	
	setText: function(txt) {
		this.text.innerHTML = txt;
		this.text.className = (txt === '')?
			'': 'active';
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
			if (tail === msg) {
				if (len == 0) {
					this.extraTime += timer;
				} else {
					this.queue[len - 1].time += timer;
				}
			} else {
				// Add to tail of the queue
				if (delay !== 0) {
					this.queue.push({
						message: '',
						time: delay,
						keep: false,
					});
				}
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
				Talk.startMessageQueue(msg, timer, keepMsg);
			}, delay);
		}
	},
	
	startMessageQueue: function(msg, timer, keep) {
		Talk.setText(msg);
		Talk.keep = keep;
		setTimeout(Talk.rotateMessage, timer);
	},
	
	rotateMessage: function() {
		if (Talk.extraTime != 0) {
			// This message gets another cycle
			setTimeout(Talk.rotateMessage, Talk.extraTime);
			Talk.extraTime = 0;
		} else if (Talk.queue.length > 0) {
			// Rotate the message
			Talk.displayNext();
		} else {
			// Clear the messages
			if (!Talk.keep)
				Talk.clearMessage();
			Talk.active = false;
		}
	},
	
	displayNext: function() {
		// Pop next item off queue and display that.
		var next = Talk.queue.shift();
		Talk.message = next.message;
		Talk.keep = next.keep;
		Talk.setText(next.message);
		setTimeout(Talk.rotateMessage, next.time);
	},
	
	clearMessage: function() {
		Talk.message = '';
		Talk.setText('');
	}
};
