var Constants = {
	// Frame Counter
	FPS: 60,
	
	// Gesture constants
	REFRESH_GESTURE_COUNTER: 1.0 * this.FPS,
	
	// Glow constants
	GLOW_START: 100,
	GLOW_LOW: 60,
	GLOW_HIGH: 120,
	GLOW_FACTOR: 10,
	GLOW_CHANGE: 1,
	
	// Shape constants
	CIRCLE_THRESHOLD: 40,
	
	// Camera constants
	CAMERA_DEFAULT_TARGET: new BABYLON.Vector3(0,5,0),
	CAMERA_ALPHA_UPPER: null,
	CAMERA_ALPHA_LOWER: null,
	CAMERA_BETA_DEFAULT: Math.PI / 3,
	CAMERA_BETA_UPPER: Math.PI / 2,
	CAMERA_BETA_LOWER: 0.1,
	CAMERA_RADIUS_LOWER: 7.5,
	CAMERA_RADIUS_UPPER: 300
};
