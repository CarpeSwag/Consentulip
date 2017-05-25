var FPS = 60;

var Constants = {
	// Gesture constants
	REFRESH_GESTURE_COUNTER: Math.ceil(0.75 * FPS),
	
	// Glow constants
	GLOW_START: 100,
	GLOW_LOW: 60,
	GLOW_HIGH: 120,
	GLOW_FACTOR: 10,
	GLOW_CHANGE: 1,
	
	// Shape constants
	CIRCLE_THRESHOLD: 40,
	
	// Water can constants
	WATER_CAN_ANIMATION_LENGTH: 1500,
	WATER_CAN_LENGTH: 155,
	
	// Camera constants
	CAMERA_DEFAULT_TARGET: new BABYLON.Vector3(0,5,0),
	CAMERA_ALPHA_UPPER: null,
	CAMERA_ALPHA_LOWER: null,
	CAMERA_BETA_DEFAULT: Math.PI / 3,
	CAMERA_BETA_UPPER: Math.PI / 2,
	CAMERA_BETA_LOWER: 0.1,
	CAMERA_RADIUS_LOWER: 7.5,
	CAMERA_RADIUS_UPPER: 300,
	
	// Flower colors
	FLOWER_COLORS: [
		{r: 1, g: 0, b: 0},
		{r: 0, g: 0, b: 1},
		{r: 1, g: 0.25, b: 0},
		{r: 1, g: 0, b: 1},
		{r: 0, g: 1, b: 1}
	]
};
