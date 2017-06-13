/**
	Talk
	Allows the flower to talk and send messages.
 */
var Talk = {
	// HTML and Canvas elements
	text: null,
	textBox: null,
	
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
		this.textBox = document.getElementById('text-box');
	},
	
	setText: function(txt) {
		// Actually sets the text box to something
		this.text.innerHTML = txt;
		this.textBox.className = (txt === '')?
			'': 'active';
	},
	
	queueMessage: function(msg, timer, delay, keepMsg) {
		// Set optional value
		delay = delay || 0;
		keepMsg = keepMsg || 0;
		
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
						keep: 0,
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
		// Starts the message queue
		Talk.setText(msg);
		Talk.keep = keep;
		setTimeout(Talk.rotateMessage, timer);
	},
	
	rotateMessage: function() {
		// Rotate out a message
		if (Talk.extraTime != 0) {
			// This message gets another cycle
			setTimeout(Talk.rotateMessage, Talk.extraTime);
			Talk.extraTime = 0;
		} else if (Talk.queue.length > 0) {
			// Rotate the message
			Talk.displayNext();
		} else if (Talk.keep > 0) {
			// Keep the message up optionally for longer
			// But treat it as if the queue is empty
			setTimeout(Talk.clearMessageSafe, Talk.keep);
			Talk.keep = 0;
			Talk.active = false;
		} else {
			// Clear the messages
			if (Talk.keep == 0)
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
		// Clears the text box
		Talk.message = '';
		Talk.textBox.className = '';
	},
	
	clearMessageSafe: function() {
		// Clears the text box only if it's not active
		if (!Talk.active)
			Talk.clearMessage();
	},
	
	// Specific message randomization
	sayRandom: function(arr, timer, delay, keepMsg) {
		// Set optional value
		delay = delay || 0;
		keepMsg = keepMsg || 0;
		
		// Grad random array
		var msg = arr[Math.floor(Math.random() * arr.length)];
		
		// Queue the random message
		this.queueMessage(msg, timer, delay, keepMsg);
	},
	
	textAsk: function(flowerPart) {
		// Text for when the flower desires to be touched
		var messages = [
			'Could you rub my ' + flowerPart + ' please?',
			'I\'d like it if you touched me.',
			'I feel like being touched on my ' + flowerPart + '.',
			'I enjoy it when you touch my ' + flowerPart + '.',
			'I want you to touch my ' + flowerPart + '. Is that okay with you?',
			'Do you feel comfortable touching my ' + flowerPart + '?',
			'How do you feel about touching my ' + flowerPart + '?'
		];
		
		this.sayRandom(messages, 1000, 0, 6000);
	},
	
	textRevoke: function(flowerPart) {
		// Text revoking consent
		var messages = [
			//'I\'m tired. Would you mind watering me instead?',
			'My ' + flowerPart + ' is sore.',
			'Stop, please.',
			'That feels weird. Could you stop?',
			'That\'s making me uncomfortable.',
			'I don\'t want that right now.',
			'No thank you, I don\'t want to be touched there right now.',
			'I don\'t like that, please stop.'
		];
		
		this.sayRandom(messages, 2000, 0, 3000);
	},
	
	textTrusting: function() {
		// Text for good feedback
		var messages = [
			'I feel comfortable.',
			'I feel safe.',
			'I like the way you touch me.',
			'I like doing this with you.',
			'Your touch feels nice.',
			'Wow!',
			'I’m having a great time',
			'I enjoy it when you touch me.',
			'That feels fantastic!',
			'I love that you listen to what I need.'
		];
		
		this.sayRandom(messages, 1000, 0, 6000);
	},
	
	textLessTrusting: function() {
		// I don't think we actually use these anywhere... yet?
		var messages = [
			'I feel hurt because you didn’t listen to me.',
			'Why did you touch me like that?',
			'I don’t know if I can trust you now.',
			'Did you hear me ask you to stop?',
			'Why won\'t you listen to me?',
			'When you don\'t listen to me, I feel like you don\'t respect me.'

		];
		
		this.sayRandom(messages, 1000, 0, 6000);
	},
	
	textRandom: function() {
		// We Mountain now.
		var messages = [
			'Why am I floating in space?',
			'What do you get when you plant kisses?',
			'Why couldn\'t the gardner plant any flowers?',
			'If April showers bring May flowers, what do May flowers bring?',
			'Why was the mushroom invited to the party?'
		];
		
		this.sayRandom(messages, 1000, 0, 6000);
	}
};
