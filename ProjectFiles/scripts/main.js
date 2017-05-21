/**
* Gesture control
**/
//
// Startup
//

// Constants
var FLOWER_COLORS = [
	{r: 1, g: 0, b: 0},
	{r: 0, g: 0, b: 1},
	{r: 1, g: 0.25, b: 0},
	{r: 1, g: 0, b: 1},
	{r: 0, g: 1, b: 1}
]

function onLoadEvent() {
	Gestures.onLoad();
	UI.onLoad();
	Camera.onLoad();
}

/**
* Babylon Things
**/

var startTutorial;
var randomizeFlower;

window.addEventListener('DOMContentLoaded', function() {
	Game.canvas = document.getElementById('renderCanvas');
	Game.engine = new BABYLON.Engine(Game.canvas, true);
	Game.scene = new BABYLON.Scene(Game.engine);
	
	Game.enableGestures = false;
	
	// Generate a random color for the flower
	var randomColor = {r:0, g:0, b:0};
	randomizeFlower = function() {
		var random = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
		randomColor.r = random.r;
		randomColor.g = random.g;
		randomColor.b = random.b;
		
	}
	randomizeFlower();
	
	// Engine functions
	window.addEventListener('resize', function() {
		Game.engine.resize();
		resizeCanvas();
	});
	
	// Recognize gestures
	var recognizeGesture = function() {
		
		if (Tutorial.active && gestureRecognized) {
			if (gestureRecognized.Name === 'five-point star') {
				respText = 'Good job!';
				Tutorial.active = false;
			} else {
				respText = 'Oops! Try again.';
			}
		}
	}
	
	Game.engine.runRenderLoop(function() {
		Game.scene.render();
		Camera.onFrame();
		UI.onFrame();
		Tutorial.onFrame();
		Gestures.onFrame();
	});
	
	// Set up the light
	var light = new BABYLON.HemisphericLight("light",
		new BABYLON.Vector3(0, 10, 0), Game.scene);
	light.intensity = 0.5;
	
	var light2 = new BABYLON.HemisphericLight("light2",
		new BABYLON.Vector3(0, 0, 0), Game.scene);
	light2.intensity = 2.0;
	
	// Load in the model
	BABYLON.SceneLoader.ImportMesh('', 'art/models/',
		'tulip.babylon', Game.scene, function (mesh) {
		var SCALE = 5.0;
		Game.leaves = [];
		Game.petals = [];
		Game.outerPetals = [];
		for (var i = 0; i < mesh.length; ++i) {
			mesh[i].scaling.x *= SCALE;
			mesh[i].scaling.y *= SCALE;
			mesh[i].scaling.z *= SCALE;
			mesh[i].position.x *= SCALE;
			mesh[i].position.y *= SCALE;
			mesh[i].position.z *= SCALE;
			var name = mesh[i].name;
			var type = 'ignore';
			var info = {};
			if (name === 'stem') {
				stem = mesh[i];
				type = 'stem';
				info = {
					alpha: 0,
					radius: 10,
					yOffset: 0
				}
			} else if (name.substring(0,4) === 'leaf') {
				Game.leaves.push(mesh[i]);
				type = 'leaf';
				info = {
					alpha: 0,
					radius: 12,
					yOffset: 0
				}
				mesh[i].position.y += 0.4 * SCALE;
				if (Game.leaves.length == 1) {
					mesh[i].position.y += 0.4 * SCALE;
				}
			} else if (name.substring(0,5) === 'petal') {
				Game.petals.push(mesh[i]);
				type = 'petal';
				var alpha = 0;
				if (+(name.substring(8)) > 3)
					Game.outerPetals.push(mesh[i]);
				switch(+(name.substring(8))) {
					case 4:
						alpha = Math.PI / 4;
						break;
					case 5:
						alpha = 5 * Math.PI / 4; 
						break;
					case 6:
						alpha = 7 * Math.PI / 4;
						break;
					case 7:
						alpha = 3 * Math.PI / 4;
						break;
					default:
						type = 'ignore';
						break;
				}
				info = {
					alpha: alpha,
					radius: 7.5,
					yOffset: 1.33
				}
				
				// Change flower scaling
				var FLOWER_HEAD_SIZE = 1.5;
				mesh[i].scaling.x *= FLOWER_HEAD_SIZE;
				mesh[i].scaling.y *= FLOWER_HEAD_SIZE;
				mesh[i].scaling.z *= FLOWER_HEAD_SIZE;
				mesh[i].position.x *= FLOWER_HEAD_SIZE;
				mesh[i].position.z *= FLOWER_HEAD_SIZE;
				
				// Adjust color
				mesh[i].renderOverlay = true;
				mesh[i].overlayAlpha = 0.25;
				mesh[i].overlayColor = randomColor;
			}
			mesh[i].flowerPart = type;
			mesh[i].cameraInfo = info;
		}
    });
	
	// Load in the pot
	var pot;
	BABYLON.SceneLoader.ImportMesh('', 'art/models/',
		'pot.babylon', Game.scene, function (mesh) {
		var SCALE = 4.5;
		for (var i = 0; i < mesh.length; ++i) {
			pot = mesh[i];
			mesh[i].scaling.x *= SCALE;
			mesh[i].scaling.y *= SCALE;
			mesh[i].scaling.z *= SCALE;
			mesh[i].position.x *= SCALE;
			mesh[i].position.y *= SCALE;
			mesh[i].position.z *= SCALE;
			mesh[i].position.y += -0.80 * SCALE;
		}
    });
	
	// Load in the ground
	Game.scene.clearColor = new BABYLON.Color3(.2, .6, .75);
	
	// Mouse events
	var onPointerDown = function (evt) {
		if (evt.button !== 0) {
            return;
        }
		
		var x = Game.scene.pointerX;
		var y = Game.scene.pointerY;
		UI.circles.push({x: x, y: y, radius: 10, dr: 3, color: '255,255,0'});
		UI.circles.push({x: x, y: y, radius: 20, dr: 3, color: '255,255,0'});
		
		for (var i = Math.random() * 5 + 3; i >= 0; --i) {
			UI.addRandomParticle(x, y);
		}
		
		document.onselectstart = function() { return false; } // disable drag-select
		document.onmousedown = function() { return false; } // disable drag-select
		
		if (evt.button <= 1) {
			UI.isPointerDown = true;
		}
		
		if (Game.enableGestures && !Tutorial.gesture) {
			if (evt.button <= 1) {
				Gestures.onPointerDown(x, y);
				UI.bctx.lineWidth = 3;
				UI.bctx.moveTo(x, y);
				UI.bctx.strokeStyle = '#ffffff';
				UI.bctx.shadowBlur = 10;
				UI.bctx.shadowColor = 'rgba(255,200,50,.25)';
				UI.bctx.beginPath();
			}
		}
		
		// check if we are under a mesh
        var pickInfo = Game.scene.pick(x, y, function (mesh) { return mesh !== pot; });
		if (pickInfo.hit && !Camera.cameraLockedToMesh) {
			var mesh = pickInfo.pickedMesh;
			if (mesh.flowerPart && mesh.flowerPart !== 'ignore') {
				if (Tutorial.tutorialPause(mesh)) {
				} else {					
					Camera.panToMesh(mesh, 0.75);
					Camera.cameraLockedToMesh = true;
					setTimeout(function() {Game.enableGestures = true;}, 750);
				}
			}
        }
    }

    var onPointerMove = function (evt) {
		var x = Game.scene.pointerX;
		var y = Game.scene.pointerY;
        if (UI.isPointerDown) {
			for (var i = Math.random() * 2 + 1; i >= 0; --i) {
				UI.addRandomParticle(x, y);
			}
			Gestures.onPointerMove(x, y);
		}
    }

    var onPointerUp = function (evt) {
        document.onselectstart = function() { return true; } // enable drag-select
		document.onmousedown = function() { return true; } // enable drag-select
		var x = Game.scene.pointerX;
		var y = Game.scene.pointerY;
		if (evt.button <= 1) {
			if (UI.isPointerDown) {
				UI.isPointerDown = false;
				Gestures.onPointerUp(x, y);
				UI.gctx.drawImage(UI.bufferCanv, 0, 0);
			}
		}
    }
	
	Game.canvas.addEventListener("pointerdown", onPointerDown, false);
	Game.canvas.addEventListener("pointerup", onPointerUp, false);
	Game.canvas.addEventListener("pointermove", onPointerMove, false);
	
	// Ensure screen is sized correctly.
	Game.engine.resize();
	
	onLoadEvent();
	
	// Skybox
    var skybox = BABYLON.Mesh.CreateBox("skyBox", 2000.0, Game.scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", Game.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("art/textures/TropicalSunnyDay", Game.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
});
