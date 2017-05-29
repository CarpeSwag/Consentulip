window.addEventListener('DOMContentLoaded', function() {
	Game.onLoad();
	Draw.onLoad();
	Talk.onLoad();
	Tutorial.onLoad();
	WaterCan.onLoad();
	
	window.addEventListener('resize', function() {
		Game.engine.resize();
		Draw.resizeCanvases();
	});
});
