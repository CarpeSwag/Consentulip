var Desire = {
	// Flower urge
	desired: [],
	notDesired: [],
	desireCounter: Constants.DESIRE_TIMER_RESET,
	desireFlags: 0,
	
	createDesire: function(index) {
		var id = this.createParticleSystemAt(
			Desire.notDesired[index],
			Desire.notDesired[index].blinkOffset
		);
		
		var desiredMesh = Desire.notDesired[index];
		desiredMesh.partId = id;
		this.popDesire(index);
		this.desireCounter = Constants.DESIRE_TIMER_RESET + 
			Math.ceil(Math.random() * Constants.DESIRE_TIMER_RAND);
			
		Talk.queueMessage('I feel like being touched on my ' + 
			desiredMesh.flowerPart + '...', 1000, 0, 6000);
		
		setTimeout(function() {
			Desire.destroyDesire(desiredMesh);
		}, Constants.DESIRE_TIMER_REMOVE + Math.ceil(Math.random()
			* Constants.DESIRE_TIMER_REMOVE_RAND));
0	},

	createRandomDesire: function() {
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
		return true;
	},
	
	popDesire: function(index) {
		Desire.desired.push(Desire.notDesired[index]);
		Desire.notDesired.splice(index, 1);
	},
	
	pushDesire: function(index) {
		Desire.notDesired.push(Game.desired[index]);
		Desire.desired.splice(index, 1);
	},
	
	onFrame: function() {
		this.desireCounter--;
		if (this.desireCounter <= 0) {
			this.createRandomDesire();
		}
	}
};
