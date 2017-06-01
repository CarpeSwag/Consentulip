var Desire = {
	// Flower urge
	desired: [],
	notDesired: [],
	counter: Constants.DESIRE_TIMER_RESET,
	flags: 0,
	
	createDesire: function(index) {
		var id = Game.createParticleSystemAt(
			Desire.notDesired[index],
			Desire.notDesired[index].blinkOffset
		);
		
		var desiredMesh = Desire.notDesired[index];
		desiredMesh.partId = id;
		this.popDesire(index);
		this.counter = Constants.DESIRE_TIMER_RESET + 
			Math.ceil(Math.random() * Constants.DESIRE_TIMER_RAND);
		Game.addOutlineMesh(desiredMesh);
			
		Talk.queueMessage('I feel like being touched on my ' + 
			desiredMesh.flowerPart + '...', 1000, 0, 6000);
		this.flags = 0;
		
		setTimeout(function() {
			Desire.destroyDesire(desiredMesh);
		}, Constants.DESIRE_TIMER_REMOVE + Math.ceil(Math.random()
			* Constants.DESIRE_TIMER_REMOVE_RAND));
0	},

	createRandomDesire: function() {
		if (this.notDesired.length == 0) {
			// THE WHOLE FLOWER IS BEING IGNORED HOW'D YOU DO THIS
			this.counter = Constants.DESIRE_TIMER_RESET + 
				Math.ceil(Math.random() * Constants.DESIRE_TIMER_RAND);
			this.flags = 0;
			return;
		}
		var rand = Math.floor(Math.random() * Desire.notDesired.length);
		this.createDesire(rand);
	},

	findDesiredMesh: function(mesh) {
		for (var i = 0; i < Desire.desired.length; ++i)
			if (Desire.desired[i] === mesh)
				return i;
		return -1;
	},
	
	destroyDesire: function(mesh) {
		if (mesh.partId == null) return false;
		var succ = Game.destroyParticleSystem(mesh.partId);
		if (succ)
			this.pushDesire(this.findDesiredMesh(mesh));
		mesh.partId = null;
		Game.removeOutlineMesh(mesh);
		return true;
	},
	
	popDesire: function(index) {
		Desire.desired.push(Desire.notDesired[index]);
		Desire.notDesired.splice(index, 1);
	},
	
	pushDesire: function(index) {
		Desire.notDesired.push(Desire.desired[index]);
		Desire.desired.splice(index, 1);
	},
	
	reduceDesireTimer: function(flag) {
		// Check if flag's been set
		if ((this.flags & flag) !== flag) {
			var factor = (this.flags === 0)? 2: 4;
			this.counter = Math.ceil(this.counter / factor);
			this.flags = this.flags | flag;
		}
	},
	
	onFrame: function() {
		this.counter--;
		if (this.counter <= 0) {
			this.createRandomDesire();
		}
	}
};
