window.addEventListener('DOMContentLoaded', function() {
	var canvas = document.getElementById('renderCanvas');
	var engine = new BABYLON.Engine(canvas, true);
	var scene = new BABYLON.Scene(engine);
	
	// Engine functions
	window.addEventListener('resize', function() {
		engine.resize();
	});
	
	engine.runRenderLoop(function() {
		scene.render();
	});
	
	// Populate the scene
	var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 4,
		Math.PI / 3, 100, new BABYLON.Vector3(0,1,0), scene);
	camera.upperBetaLimit = Math.PI / 2;
	camera.lowerRadiusLimit = 7.5;
	camera.upperRadiusLimit = 500;
	camera.attachControl(canvas, true, true);

	var light = new BABYLON.HemisphericLight("light1",
		new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.7;
	
	var flowerBase;
	BABYLON.SceneLoader.ImportMesh('', 'art/models/',
		'flower_base.babylon', scene, function (newMeshes) {
		var SCALE = 0.33;
		flowerBase = newMeshes[0];
		for (var i = 0; i < newMeshes.length; ++i) {
			newMeshes[i].scaling.x = SCALE;
			newMeshes[i].scaling.y = SCALE;
			newMeshes[i].scaling.z = SCALE;
		}
    });
	
	var petal;
	BABYLON.SceneLoader.ImportMesh('', 'art/models/',
		'petal.babylon', scene, function (newMeshes) {
		var SCALE = 0.33;
		petal = newMeshes[0];
		for (var i = 0; i < newMeshes.length; ++i) {
			newMeshes[i].scaling.x = SCALE;
			newMeshes[i].scaling.y = SCALE;
			newMeshes[i].scaling.z = SCALE;
			newMeshes[i].position.x = 0 * SCALE;
			newMeshes[i].position.y = 12.25 * SCALE;
			newMeshes[i].position.z = -0.75 * SCALE;
		}
	});
	
	//var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
	//sphere.position.y = 1;

	var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
	
	// Ensure screen is sized correctly.
	engine.resize();
});
	