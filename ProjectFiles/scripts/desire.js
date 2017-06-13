/**
	Desire
	Handles the flower's desire timers and which parts it wants to be
	played with.
 */
var Desire = {
	// Flower urge
	desired: [],
	notDesired: [],
	counter: Constants.DESIRE_TIMER_RESET,
	animateCounter: Constants.DANCE_TIME_RANGE
		+ Constants.DANCE_TIME_LOWER,
	flags: 0,
	
	createDesire: function(index) {
		// Creates a new desire
		// Uses the notDesired array index to pick the mesh
		
		// Generate a particle at the mesh location
		var id = Game.createParticleSystemAt(
			Desire.notDesired[index],
			Desire.notDesired[index].blinkOffset
		);
		
		// Pop the desire off the notDesired array
		var desiredMesh = Desire.notDesired[index];
		desiredMesh.partId = id;
		this.popDesire(index);
		
		// Reset the counter and flags
		this.counter = Constants.DESIRE_TIMER_RESET + 
			Math.ceil(Math.random() * Constants.DESIRE_TIMER_RAND);
		this.flags = 0;
		
		// Ask the player to touch the outlined mesh
		Game.addOutlineMesh(desiredMesh);
		Talk.textAsk(desiredMesh.flowerPart);
		
		// Set a call to destroy this desire eventually
		setTimeout(function() {
			Desire.destroyDesire(desiredMesh);
		}, Constants.DESIRE_TIMER_REMOVE + Math.ceil(Math.random()
			* Constants.DESIRE_TIMER_REMOVE_RAND));
	},

	createRandomDesire: function() {
		if (this.notDesired.length == 0) {
			// THE WHOLE FLOWER IS BEING IGNORED HOW'D YOU DO THIS
			this.counter = Constants.DESIRE_TIMER_RESET + 
				Math.ceil(Math.random() * Constants.DESIRE_TIMER_RAND);
			this.flags = 0;
			return;
		}
		
		// Create a desire at a random index of the notDesired meshes.
		var rand = Math.floor(Math.random() * Desire.notDesired.length);
		this.createDesire(rand);
	},

	findDesiredMesh: function(mesh) {
		// Find a mesh in the desired array (ret -1 if not in it)
		for (var i = 0; i < Desire.desired.length; ++i)
			if (Desire.desired[i] === mesh)
				return i;
		return -1;
	},
	
	destroyDesire: function(mesh) {
		// Destroys a desire of a specific mesh
		if (mesh.partId == null) return false;
		var succ = Game.destroyParticleSystem(mesh.partId);
		if (succ)
			this.pushDesire(this.findDesiredMesh(mesh));
		mesh.partId = null;
		Game.removeOutlineMesh(mesh);
		return true;
	},
	
	popDesire: function(index) {
		// Pop a mesh off notDesired onto desired
		Desire.desired.push(Desire.notDesired[index]);
		Desire.notDesired.splice(index, 1);
	},
	
	pushDesire: function(index) {
		// Pop a mesh off desired onto notDesired
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
		// Yay bit operations
	},
	
	resetAnimateCounter: function() {
		// Reset the animation counter for the flower to randomly animate
		this.animateCounter = Constants.DANCE_TIME_LOWER + 
			Math.round(Math.random() * Constants.DANCE_TIME_RANGE);
			
		// To be honest, this should be somewhere else, but like
		// I liked the idea of it 'desiring' to dance.
	},
	
	onFrame: function() {
		// Random desire counter
		this.counter--;
		if (this.counter <= 0) {
			this.createRandomDesire();
		}
		
		// Random animation counter
		this.animateCounter--;
		if (this.counter <= 0) {
			if (Game.gesturesEnabled) {
				Flower.wantToAnimate = true;
			} else {
				Flower.idleAnimation();
			}
			Desire.resetAnimateCounter();
		}
	}
};
