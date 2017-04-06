window.addEventListener('DOMContentLoaded', function() {
	var canvas = document.getElementById('renderCanvas');
	var engine = new BABYLON.Engine(canvas, true);
	
	var createScene = function () {
		// This creates a basic Babylon Scene object (non-mesh)
		var scene = new BABYLON.Scene(engine);

		// This creates and positions a free camera (non-mesh)
		var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 4,
			Math.PI / 3, 10, new BABYLON.Vector3(0,1,0), scene);
		
		// Set camera view limits
			camera.upperBetaLimit = Math.PI / 2;
			camera.lowerRadiusLimit = 7.5;
			camera.upperRadiusLimit = 500;

		// This attaches the camera to the canvas
		camera.attachControl(canvas, true, false);

		// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
		var light = new BABYLON.HemisphericLight("light1",
			new BABYLON.Vector3(0, 1, 0), scene);

		// Default intensity is 1. Let's dim the light a small amount
		light.intensity = 0.7;

		// Our built-in 'sphere' shape. Params: name, subdivs, size, scene
		var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

		// Move the sphere upward 1/2 its height
		sphere.position.y = 1;

		// Our built-in 'ground' shape. 
		// Params: name, width, depth, subdivs, scene
		var ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);

		return scene;
	};
	
	var scene = createScene();
	engine.resize();
	
	window.addEventListener('resize', function() {
		engine.resize();
	});
	
	engine.runRenderLoop(function() {
		scene.render();
	});
});
	