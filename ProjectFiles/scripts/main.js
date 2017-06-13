var renderLoop = function() {
	// Call all of the various render functions
	Game.scene.render();
	Game.onFrame();
	Camera.onFrame();
	Draw.onFrame();
	Gestures.onFrame();
	WaterCan.onFrame();
	Desire.onFrame();
};

window.addEventListener('DOMContentLoaded', function() {
	// Call each of the different on game load functions.
	Game.onLoad();
	Draw.onLoad();
	Talk.onLoad();
	Tutorial.onLoad();
	WaterCan.onLoad();
	
	// Open game menu
	UI.toggleMenu();
	
	window.addEventListener('resize', function() {
		Game.engine.resize();
		Draw.resizeCanvases();
	});
});
