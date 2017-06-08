var Camera = {
	camera: null,
	lockedToMesh: false,
	animationDelta: {
		alpha: 0,
		beta: 0,
		radius: 0,
		x: 0,
		y: 0,
		z: 0,
		lockCamera: false
	},
	animationTarget: {
		alpha: 0,
		beta: 0,
		radius: 0,
		x: 0,
		y: 0,
		z: 0
	},
	counterStart: 0,
	counter: 0,
	animate: false,
	
	onLoad: function() {
		// Initialize the camera
		this.camera = new BABYLON.ArcRotateCamera("Camera", 
			Math.random() * (Math.PI * 2), Constants.CAMERA_BETA_DEFAULT,
			40, Constants.CAMERA_DEFAULT_TARGET, Game.scene);
		this.setCameraToDefault();
		this.camera.attachControl(Game.canvas, true, true);
		
		// Disable panning the camera
		Game.scene.activeCamera.panningSensibility = 0;
	},
	
	setCameraToDefault: function() {
		// Fix camera limits to default
		this.camera.lowerAlphaLimit = Constants.CAMERA_ALPHA_LOWER;
		this.camera.upperAlphaLimit = Constants.CAMERA_ALPHA_UPPER;
		this.camera.lowerBetaLimit = Constants.CAMERA_BETA_LOWER;
		this.camera.upperBetaLimit = Constants.CAMERA_BETA_UPPER;
		this.camera.lowerRadiusLimit = Constants.CAMERA_RADIUS_LOWER;
		this.camera.upperRadiusLimit = Constants.CAMERA_RADIUS_UPPER;
	},
	
	isInFront: function(alpha) {
		return (alpha >= 0)? (alpha % (Math.PI * 2)) < Math.PI:
			(Math.abs(alpha) % (Math.PI * 2)) >= Math.PI;
	},
	
	modCameraAlpha: function() {
		// Clean the alpha value to be between 0 and 2 pi
		if (this.camera.alpha < 0)
			this.camera.alpha = (2 * Math.PI) -
				(Math.abs(this.camera.alpha) % (Math.PI * 2));
		this.camera.alpha = this.camera.alpha % (Math.PI * 2);
	},
	
	rotateCameraTo: function(target, alpha, beta, radius, seconds, lockCamera) {
		// Determine the frames (60 fps)
		var frameCount = Math.floor(seconds * 60);
		this.counter = frameCount;
		this.counterStart = frameCount;
		
		this.modCameraAlpha();
		
		// Set the info for the camera animation target
		this.animationTarget.alpha = alpha;
		this.animationTarget.beta = beta;
		this.animationTarget.radius = radius;
		this.animationTarget.x = target.x;
		this.animationTarget.y = target.y;
		this.animationTarget.z = target.z;
		
		// Set the info for the camera animation deltas
		this.animationDelta.alpha =
			(alpha - this.camera.alpha) / frameCount;
		this.animationDelta.beta =
			(beta - this.camera.beta) / frameCount;
		this.animationDelta.radius =
			(radius - this.camera.radius) / frameCount;
		this.animationDelta.x =
			(target.x - this.camera.target.x) / frameCount;
		this.animationDelta.y =
			(target.y - this.camera.target.y) / frameCount;
		this.animationDelta.z =
			(target.z - this.camera.target.z) / frameCount;
		
		// Lock camera at the end
		this.animationDelta.lockCamera = lockCamera;
		
		// Start the animation
		this.animate = true;
	},
	
	adjustCamera: function() {
		// Alpha
		this.camera.alpha += this.animationDelta.alpha;
		this.camera.lowerAlphaLimit = this.camera.alpha;
		this.camera.upperAlphaLimit = this.camera.alpha;
		
		// Beta
		this.camera.beta += this.animationDelta.beta;
		this.camera.lowerBetaLimit = this.camera.beta;
		this.camera.upperBetaLimit = this.camera.beta;
		
		// Radius
		this.camera.radius += this.animationDelta.radius;
		this.camera.lowerRadiusLimit = this.camera.radius;
		this.camera.upperRadiusLimit = this.camera.radius;
		
		// Target
		this.camera.target = new BABYLON.Vector3(
			this.camera.target.x + this.animationDelta.x,
			this.camera.target.y + this.animationDelta.y,
			this.camera.target.z + this.animationDelta.z
		);
		
		// Decrement frame counter or end
		if (--this.counter < 0) {
			this.setCameraToTargetFromPan();
			this.modCameraAlpha();
			if (!this.animationDelta.lockCamera) {
				this.setCameraToDefault();
			}
			this.animate = false;
		}
	},
	
	setCameraToTargetFromPan: function() {
		// Alpha
		this.camera.alpha = this.animationTarget.alpha;
		this.camera.lowerAlphaLimit = this.camera.alpha;
		this.camera.upperAlphaLimit = this.camera.alpha;
		
		// Beta
		this.camera.beta = this.animationTarget.beta;
		this.camera.lowerBetaLimit = this.camera.beta;
		this.camera.upperBetaLimit = this.camera.beta;
		
		// Radius
		this.camera.radius = this.animationTarget.radius;
		this.camera.lowerRadiusLimit = this.camera.radius;
		this.camera.upperRadiusLimit = this.camera.radius;
		
		// Target
		this.camera.target = new BABYLON.Vector3(
			this.animationTarget.x,
			this.animationTarget.y,
			this.animationTarget.z
		);
	},
	
	panToMesh: function(mesh, seconds, rotateClockwise) {
		rotateClockwise = rotateClockwise || false;
		var info = mesh.cameraInfo;
		var target = new BABYLON.Vector3(
			mesh.position.x + info.xOffset,
			mesh.position.y + info.yOffset,
			mesh.position.z + info.zOffset
		);
		
		// Grab camera info for mesh
		var alpha = info.alpha;
		if (info.alpha == 0)
			alpha = (this.isInFront(this.camera.alpha))? Math.PI / 2: 3 * Math.PI / 2;
		var beta = Math.PI / 2;
		var radius = info.radius;
		
		if (rotateClockwise && this.camera.alpha > alpha) {
			alpha += Math.PI * 2;
		}
		
		this.rotateCameraTo(target, alpha, beta, radius, seconds, true);
		
		Draw.clearCanvases();
	},
	
	panToLastMesh: function() {
		this.counter = this.counterStart;
		Draw.clearCanvases();
		
		// Start the animation
		this.animate = true;
	},
	
	zoomOut: function() {
		// Clear canvas
		Draw.clearCanvases();
		Game.enableGestures = false;
		
		// Rotate camera
		this.modCameraAlpha();
		this.rotateCameraTo(Constants.CAMERA_DEFAULT_TARGET, this.camera.alpha,
			Constants.CAMERA_BETA_DEFAULT, 40, 0.75, false);
		this.cameraLockedToMesh = false;
		UI.toggleRevokeConsent(false);
	},
	
	onFrame: function() {
		if (this.animate) {
			this.adjustCamera();
		}
	}
};
