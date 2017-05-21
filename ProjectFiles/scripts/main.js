window.addEventListener('DOMContentLoaded', function() {
	Game.onLoad();
	Gestures.onLoad();
	UI.onLoad();
	Camera.onLoad();
	Tutorial.onLoad();
	
	window.addEventListener('resize', function() {
		Game.engine.resize();
		UI.resizeCanvases();
	});
});
