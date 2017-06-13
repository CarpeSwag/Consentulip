var renderLoop = function() {
	Game.scene.render();
	Game.onFrame();
	Camera.onFrame();
	Draw.onFrame();
	Gestures.onFrame();
	WaterCan.onFrame();
	Desire.onFrame();
};

window.addEventListener('DOMContentLoaded', function() {
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
