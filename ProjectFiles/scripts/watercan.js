var WaterCan = {
	x: 0,
	y: 0,
	
	ele: null,
	active: false,
	
	onLoad: function() {
		this.ele = document.getElementById('watering-can');
	},
	
	onPointerDown: function(x, y) {
		// Make sure the animation isn't already playing
		if (this.active) {return;}
		this.active = true;
		
		// Set point to center
		this.x = x - (Constants.WATER_CAN_LENGTH / 2);
		this.y = y - (Constants.WATER_CAN_LENGTH / 2);
		
		this.ele.style.left = this.x + 'px';
		this.ele.style.top = this.y + 'px';
		this.ele.className = 'water'
		if (x > (window.innerWidth / 2)) {
			this.ele.className += ' flip'
		}
		
		setTimeout(function() {
			WaterCan.ele.className = '';
			WaterCan.active = false;
		}, Constants.WATER_CAN_ANIMATION_LENGTH);
	}
}
