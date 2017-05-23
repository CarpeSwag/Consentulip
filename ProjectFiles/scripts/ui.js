var UI = {
	// HTML and Canvas elements
	text: null,
	mainCanv: null,
	shapeCanv: null,
	gestureCanv: null,
	bufferCanv: null,
	ctx: null,
	sctx: null,
	gctx: null,
	bctx: null,
	
	// Pointer related
	isPointerDown: false,
	
	// Text variable
	textCounter: 0,
	
	// Glow variables
	glow: Constants.GLOW_START,
	dGlow: Constants.GLOW_CHANGE,
	
	// Shape arrays
	circles: [],
	particles: [],
	lines: [],
	
	// Visual elements
	menuOpen: false,
	sandwichOpen: false,
	
	onLoad: function() {
		this.text = document.getElementById('flower-name');
		
		// Set canvases
		this.mainCanv = document.getElementById('gestures');
		this.shapeCanv = document.createElement('canvas');
		this.gestureCanv = document.createElement('canvas');
		this.bufferCanv = document.createElement('canvas');
		
		// Set contexts
		this.ctx = this.mainCanv.getContext('2d');
		this.sctx = this.shapeCanv.getContext('2d');
		this.gctx = this.gestureCanv.getContext('2d');
		this.bctx = this.bufferCanv.getContext('2d');
		
		this.sctx.shadowColor = 'rgba(255,200,50,2)';
		
		this.resizeCanvases();
	},
	
	resizeCanvases: function() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		var contexts = [this.ctx, this.sctx, this.gctx, this.bctx];

		for (var i = 0; i < contexts.length; ++i) {
			contexts[i].canvas.width = width;
			contexts[i].canvas.height = height;
		}
	},
	
	setText: function(txt) {
		this.text.innerHTML = txt;
	},
	
	setDelayedText: function(txt, ms) {
		var textBox = this.text;
		setTimeout(function() {textBox.innerHTML = txt;}, ms);
	},
	
	toggleRevokeConsent: function(toggle) {
		document.getElementById('revoke-btn').className = 
			'button' + ((toggle)? ' active': '');
	},
	
	toggleSandwich: function() {
		// Toggle the flag
		this.sandwichOpen = !this.sandwichOpen;
		
		// Toggle the elements
		document.getElementById('sandwich-btn').className = 'button' +
			((this.sandwichOpen)? ' down': '');
		document.getElementById('sandwich-container').className = 
			((this.sandwichOpen)? 'active': '');
	},
	
	toggleMenu: function() {
		// Toggle the flag
		this.menuOpen = !this.menuOpen;
		
		// Toggle the elements
		document.getElementById('ingame-menu-container').className =
			((this.menuOpen)? 'active': '');
		document.getElementById('overlay').className =
			((this.menuOpen)? 'menuActive': '');
	},
	
	closeMenu: function() {
		this.menuOpen = false;
		
		// Toggle the elements
		document.getElementById('ingame-menu-container').className =
			((this.menuOpen)? 'active': '');
		document.getElementById('overlay').className =
			((this.menuOpen)? 'menuActive': '');
	},
	
	switchMenu: function(id) {
		document.getElementById('ingame-menu').className = 'menu-ctnr';
		document.getElementById('about-menu').className = 'menu-ctnr';
		document.getElementById(id).className = 'menu-ctnr curr-menu';
	},
	
	returnToMenu: function() {
		this.switchMenu('ingame-menu');
	},
	
	aboutMenu: function() {
		this.switchMenu('about-menu');
	},
	
	clearCanvases: function() {
		// Clear gesture strokes
		Gestures.clearStrokes();
		
		// Close the gesture line.
		this.ctx.closePath();
		
		// Clear the canvases
		var width = window.innerWidth;
		var height = window.innerHeight;
		this.ctx.clearRect(0, 0, width, height);
		this.sctx.clearRect(0, 0, width, height);
		this.gctx.clearRect(0, 0, width, height);
		this.bctx.clearRect(0, 0, width, height);
	},
	
	// Shape drawing methods
	addRandomParticle: function(x, y) {
		var r = 155 + Math.round(Math.random() * 100);
		var g = 150 + Math.round(Math.random() * 155);
		var b = Math.round(Math.random() * 255);
		this.particles.push({
			x: x + Math.random() * 40 - 20,
			y: y + Math.random() * 40 - 20,
			size: Math.random() * 2.5 + 2.5,
			rad: Math.random() * Math.PI,
			color: r + ',' + g + ',' + b,
			alpha: 1,
			da: -.05,
			dr: (Math.random() * Math.PI / 12) - Math.PI / 24,
			dy: Math.random() * 0.25
		});
	},
	
	drawLineTimed: function(a, b, seconds, delay, lifetime) {
		// Figure out the timings
		var moveCounter = Math.ceil(seconds * 60);
		var delayCounter = Math.ceil(delay * 60);
		var frameCounter = Math.ceil((lifetime - seconds - delay) * 60);
		
		// Add the increments
		var dx = (b.x - a.x) / moveCounter;
		var dy = (b.y - a.y) / moveCounter;
		
		// Push the line
		this.lines.push({
			a: { x: a.x, y: a.y, dx: 0, dy: 0 },
			b: { x: a.x, y: a.y, dx: dx, dy: dy },
			width: 4,
			color: '255,255,255',
			blurWidth: 10,
			blurCol: 'rgba(255,200,50,0.5)',
			alpha: 1,
			da: 0,
			glowing: true,
			moveCounter: moveCounter,
			frameCounter: frameCounter,
			delayCounter: delayCounter
		});
	},
	
	drawLine: function(a, b) {
		this.bctx.lineTo(b.X, b.Y);
		var width = Math.sqrt(Math.pow(a.X - b.X, 2) + Math.pow(a.Y - b.Y, 2));
		this.bctx.lineWidth = 4 - (3 * (width/200));
		this.bctx.shadowBlur = 10 + (3 * (width/200));
	},
	
	createCircle: function(x, y, rad, col) {
		this.sctx.fillStyle = col;
		this.sctx.beginPath();
		this.sctx.arc(x, y, rad, 0, 2 * Math.PI, false);
		this.sctx.closePath();
		this.sctx.fill();
	},
	
	createParticle: function(x, y, radius, innerRadius, col, radians) {
		var inner = radius * innerRadius;
		this.sctx.fillStyle = col;
		this.sctx.beginPath();
		this.moveToRotated(this.sctx, x, y, x - radius, y, radians);
		this.lineToRotated(this.sctx, x, y, x - inner, y - inner, radians);
		this.lineToRotated(this.sctx, x, y, x, y - radius, radians);
		this.lineToRotated(this.sctx, x, y, x + inner, y - inner, radians);
		this.lineToRotated(this.sctx, x, y, x + radius, y, radians);
		this.lineToRotated(this.sctx, x, y, x + inner, y + inner, radians);
		this.lineToRotated(this.sctx, x, y, x, y + radius, radians);
		this.lineToRotated(this.sctx, x, y, x - inner, y + inner, radians);
		this.lineToRotated(this.sctx, x, y, x - radius, y, radians);
		this.sctx.closePath();
		this.sctx.fill();
	},
	
	createLine: function(a, b, width, blurWidth, col, blurCol) {
		this.sctx.strokeStyle = col;
		this.sctx.lineWidth = width;
		this.sctx.shadowBlur = blurWidth;
		this.sctx.shadowColor = blurCol;
		this.sctx.beginPath();
		this.sctx.moveTo(a.x, a.y);
		this.sctx.lineTo(b.x, b.y);
		this.sctx.closePath();
		this.sctx.stroke();
	},
	
	// Shape helper methods
	moveToRotated: function(ctx, x1, y1, x2, y2, rad) {
		var point = this.rotateAroundPoint(x1, y1, x2, y2, rad);
		ctx.moveTo(point[0], point[1]);
	},

	lineToRotated: function(ctx, x1, y1, x2, y2, rad) {
		var point = this.rotateAroundPoint(x1, y1, x2, y2, rad);
		ctx.lineTo(point[0], point[1]);
	},

	rotateAroundPoint: function(x1, y1, x2, y2, rad) {
		var dx = x2 - x1;
		var dy = y2 - y1;
		var sin = Math.sin(rad);
		var cos = Math.cos(rad);
		var newX = x1 + dx * cos - dy * sin;
		var newY = y1 + dx * sin + dy * cos;
		return [newX, newY];
	},
	
	// On Frame
	onFrame: function() {
		// Clear the canvas
		this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		this.sctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		this.bctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		
		// Update the glow amount
		this.glow += this.dGlow;
		if(this.glow == Constants.GLOW_LOW || this.glow == Constants.GLOW_HIGH)
			this.dGlow *= -1;
		var glowLoop = Math.floor(this.glow / Constants.GLOW_FACTOR)
		
		// Create the circles
		for (var i = this.circles.length - 1; i >= 0; --i) {
			this.circles[i].radius += this.circles[i].dr;
			var rgb = this.circles[i].color;
			var a = 0.25 * (1 - (this.circles[i].radius / Constants.CIRCLE_THRESHOLD));
			var rgba = 'rgba(' + rgb + ',' + a + ')';
			this.createCircle(this.circles[i].x, this.circles[i].y, 
				this.circles[i].radius, rgba);
			if (this.circles[i].radius > Constants.CIRCLE_THRESHOLD) {
				this.circles.splice(i,1);
			}
		}
		
		// Create the particles
		for (var i = this.particles.length - 1; i >= 0; --i) {
			this.sctx.shadowBlur = this.particles[i].size;
			var rgb = this.particles[i].color;
			var a = this.particles[i].alpha / 3;
			var rgba = 'rgba(' + rgb + ',' + a + ')';
			
			// Draw the particle
			for (var j = 0; j < 3; ++j) {
				this.createParticle(this.particles[i].x, this.particles[i].y,
					this.particles[i].size, .45, rgba, this.particles[i].rad);
			}
			
			// Adjust it
			this.particles[i].rad += this.particles[i].dr;
			this.particles[i].y += this.particles[i].dy;
			this.particles[i].alpha += this.particles[i].da;
			
			if (a <= 0) {
				this.particles.splice(i, 1);
			}
		}
		this.sctx.shadowBlur = 0;
		
		// Draw lines
		for (var i = this.lines.length - 1; i >= 0; --i) {
			if (this.lines[i].delayCounter <= 0) {
				var rgb = this.lines[i].color;
				var a = this.lines[i].alpha;
				var rgba = 'rgba(' + rgb + ',' + a + ')'; 
				
				var drawCount = (this.lines[i].glowing)? glowLoop: 1;
				for (var j = 0; j < 3; ++j) {
					this.createLine(this.lines[i].a, this.lines[i].b,
						this.lines[i].width, this.lines[i].blurWidth,
						rgba, this.lines[i].blurCol);
				}
				
				if (this.lines[i].moveCounter <= 0) {
					if (--(this.lines[i].frameCounter) <= 0) {
						this.lines.splice(i, 1);
					}
				} else {
					this.lines[i].a.x += this.lines[i].a.dx;
					this.lines[i].a.y += this.lines[i].a.dy;
					this.lines[i].b.x += this.lines[i].b.dx;
					this.lines[i].b.y += this.lines[i].b.dy;
					this.lines[i].alpha += this.lines[i].da;
					
					--(this.lines[i].moveCounter);
				}
			} else {
				--(this.lines[i].delayCounter);
			}
		}
		
		this.sctx.shadowBlur = 0;
		
		// Draw gestures
		if (Gestures.points.length > 0) {
			this.bctx.stroke();
			for (var i = 0; i < glowLoop; ++i) {
				this.ctx.drawImage(this.gestureCanv, 0, 0);
				this.ctx.drawImage(this.bufferCanv, 0, 0);
			}
		}
		
		this.ctx.drawImage(this.shapeCanv, 0, 0);
	}
};
