var Tutorial = {
	waitingForInput: false,
	active: false,
	gesture: false,
	counter: 25,
	particleId: 0,
	
	onLoad: function() {
		
	},
	
	tutorialPause: function(mesh) {
		if (this.waitingForInput) {
			if (mesh == Flower.petals[0]) {
				this.waitingForInput = false;
				
				// Pan camera to the petal
				Camera.modCameraAlpha();
				Camera.panToMesh(Flower.petals[0], 1.5);
				setTimeout(function() {
					// Start the rest of the tutorial
					Game.enableGestures = true;
					Tutorial.gesture = true;
					Tutorial.startGestureSection();
					Camera.cameraLockedToMesh = true;
				}, 1000);
				return true;
			}
		}
		return this.active;
	},
	
	start: function() {
		// Messages played during the introduction
		UI.setText("Hey Bud! I'm Tulip.");
		UI.setDelayedText("You can take care of me by watering me"
			+ " or tending to my soil.", 2000);
		UI.setDelayedText("You can also control the camera by"
			+ " clicking me.", 6000);
		
		Camera.modCameraAlpha();
		this.active = true;
		
		// Rotate around flower, and zoom into it.
		Camera.rotateCameraTo(Constants.CAMERA_DEFAULT_TARGET,
			Math.PI * 3.75, Math.PI / 3, 40, 7.000, true);
		
		// Wait for response
		setTimeout(function() {
			this.particleId = Game.createParticleSystemAt( 
				Flower.outerPetals[0], 
				Flower.outerPetals[0].blinkOffset);
			
			Tutorial.waitingForInput = true;
		}, 6000);
	},
	
	startGestureSection: function() {
		// Dispose of the particle system
		Game.destroyParticleSystem(this.particleId);
		
		// Begin second part of the tutorial.
		UI.setText("Sometimes we can play some pattern games.");
		
		// Teach gestures
		var centerX = window.innerWidth / 2;
		var centerY = window.innerHeight / 2;
		var radius = (window.innerWidth < window.innerHeight)?
			window.innerWidth * 0.25: window.innerHeight * 0.5;
		var starPoints = [
			{x: centerX + radius * -0.75, y: centerY + radius * -0.33},
			{x: centerX + radius *  0.75, y: centerY + radius * -0.33},
			{x: centerX + radius * -0.50, y: centerY + radius *  0.50},
			{x: centerX                 , y: centerY + radius * -0.75},
			{x: centerX + radius *  0.50, y: centerY + radius *  0.50}
		];
		Draw.drawLineTimed(starPoints[0], starPoints[1], 0.5, 1.0, 4.00);
		Draw.drawLineTimed(starPoints[1], starPoints[2], 0.5, 1.5, 4.00);
		Draw.drawLineTimed(starPoints[2], starPoints[3], 0.5, 2.0, 4.00);
		Draw.drawLineTimed(starPoints[3], starPoints[4], 0.5, 2.5, 4.00);
		Draw.drawLineTimed(starPoints[4], starPoints[0], 0.5, 3.0, 4.00);
		
		// Change the message after star is drawn.
		setTimeout(function() {
			UI.setText("Here, try it yourself!");
			Tutorial.gesture = false;
		}, 4000);
	},
	
	gestureInput: function(gesture) {
		if (this.active) {
			if (gesture.Name === 'five-point star') {
				this.active = false;
				UI.toggleRevokeConsent(true);
				return 'Good job!';
			}
			return 'Oops! Try again.';
		}
	},
	
	replayTutorial: function() {
		// Close the menu
		UI.closeMenu();
		
		// Reset the camera angle (menu should be hiding it).
		Camera.rotateCameraTo(Constants.CAMERA_DEFAULT_TARGET,
			0.0, Math.PI / 3, 40, 0.000, true);
		
		// Start the tutorial.
		this.start();
	}
};
