window.addEventListener('DOMContentLoaded', function() {
	Game.onLoad();
	UI.onLoad();
	Tutorial.onLoad();
	
	window.addEventListener('resize', function() {
		Game.engine.resize();
		UI.resizeCanvases();
	});
});
