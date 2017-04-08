window.addEventListener('DOMContentLoaded', function() {
	var canvas = document.getElementById('renderCanvas');
	var engine = new BABYLON.Engine(canvas, true);
	var scene = new BABYLON.Scene(engine);

	// Engine functions
	engine.resize();
	
	window.addEventListener('resize', function() {
		engine.resize();
	});
	
	engine.runRenderLoop(function() {
		scene.render();
	});
	
	// Populate the scene
	var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 4,
		Math.PI / 3, 10, new BABYLON.Vector3(0,1,0), scene);
	camera.upperBetaLimit = Math.PI / 2;
	camera.lowerRadiusLimit = 7.5;
	camera.upperRadiusLimit = 500;
	camera.attachControl(canvas, true, false);

	var light = new BABYLON.HemisphericLight("light1",
		new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.7;
	
	var flowerBase;
	BABYLON.SceneLoader.ImportMesh('', 'art/models/',
		'flower_base.babylon', scene, function (newMeshes) {
		var SCALE = 0.33;
		flowerBase = newMeshes[0];
		for (var i = 0; i < newMeshes.length; ++i) {
			var mesh = newMeshes[i];
			mesh.scaling.x = SCALE;
			mesh.scaling.y = SCALE;
			mesh.scaling.z = SCALE;
		}
    });
	
	//var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
	//sphere.position.y = 1;

	var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
});
	