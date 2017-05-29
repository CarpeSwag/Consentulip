window.addEventListener('DOMContentLoaded', function() {
	Game.onLoad();
	UI.onLoad();
	Draw.onLoad();
	Tutorial.onLoad();
	WaterCan.onLoad();
	
	window.addEventListener('resize', function() {
		Game.engine.resize();
		Draw.resizeCanvases();
	});
});
