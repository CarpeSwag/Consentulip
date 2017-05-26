var WaterCan = {
	x: 0,
	y: 0,
	
	ele: null,
	active: false,
	dir: 1,
	
	counter: 0,
	
	onLoad: function() {
		this.ele = document.getElementById('watering-can');
	},
	
	onPointerDown: function(x, y) {
		// Make sure the animation isn't already playing
		if (this.active) {return;}
		this.active = true;
		
		// Set point to center
		this.x = x;
		this.y = y - (Constants.WATER_CAN_LENGTH / 8 * 7);
		this.dir = 1;
		
		this.ele.className = 'water'
		if (x > (window.innerWidth / 2)) {
			this.ele.className += ' flip';
			this.x += 10;
			this.dir = -1;
		} else {
			this.x -= Constants.WATER_CAN_LENGTH + 10;
		}
		
		this.ele.style.left = this.x + 'px';
		this.ele.style.top = this.y + 'px';
		this.counter = -10;
		setTimeout(function() {
			WaterCan.ele.className = '';
			WaterCan.active = false;
		}, Constants.WATER_CAN_ANIMATION_LENGTH);
	},
	
	onFrame: function() {
		if (this.active) {
			++this.counter;
			if (this.counter > 0 && this.counter < 60) {
				if ((this.counter % 3) === 0) {
					var dx = 0;
					var dy = (Constants.WATER_CAN_LENGTH / 2);
					if (this.counter < 30) {
						dy += this.counter / 2;
					} else {
						dy += 30 - ((this.counter / 2));
					}
					if (this.dir === 1) {
						dx = Constants.WATER_CAN_LENGTH * this.dir;
					}
					var x = this.x + dx;
					var y = this.y + dy;
					UI.addWaterParticle(x, y, this.dir);
				}
			}
		}
	}
}
