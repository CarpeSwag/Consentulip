var Game = {
	// BabylonJS stuff
	canvas: null,
	engine: null,
	scene: null,
	
	// Lights
	light: null,
	light2: null,
	
	// Flags
	enableGestures: false,
	waterCan: false,
	tendSoil: false,
	
	onLoad: function() {
		this.canvas = document.getElementById('renderCanvas');
		this.engine = new BABYLON.Engine(this.canvas, true);
		this.scene = new BABYLON.Scene(this.engine);
		
		// Generate a random color for the flower
		Flower.randomizeColor();
		
		// Render loop
		this.engine.runRenderLoop(function() {
			Game.scene.render();
			Camera.onFrame();
			UI.onFrame();
			Tutorial.onFrame();
			Gestures.onFrame();
		});
		
		// Start camera
		Camera.onLoad();
		
		// Set up the light
		this.light = new BABYLON.HemisphericLight("light",
			new BABYLON.Vector3(0, 10, 0), this.scene);
		this.light.intensity = 0.5;
		
		this.light2 = new BABYLON.HemisphericLight("light2",
			new BABYLON.Vector3(0, 0, 0), this.scene);
		this.light2.intensity = 2.0;
		
		// Load in the ground
		this.scene.clearColor = new BABYLON.Color3(.2, .6, .75);
		
		// Add event listeners
		this.canvas.addEventListener("pointerdown", this.onPointerDown, false);
		this.canvas.addEventListener("pointerup", this.onPointerUp, false);
		this.canvas.addEventListener("pointermove", this.onPointerMove, false);
		
		// Skybox
		var skybox = BABYLON.Mesh.CreateBox("skyBox", 2000.0, this.scene);
		var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
		skyboxMaterial.backFaceCulling = false;
		skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("art/textures/TropicalSunnyDay", this.scene);
		skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		skyboxMaterial.disableLighting = true;
		skybox.material = skyboxMaterial;
		
		// Load models
		Flower.loadModels();
		
		// Ensure screen is sized correctly.
		this.engine.resize();
	},
	
	// Mouse events
	onPointerDown: function (evt) {
		if (evt.button !== 0) {
			return;
		}
		
		var x = Game.scene.pointerX;
		var y = Game.scene.pointerY;
		UI.circles.push({x: x, y: y, radius: 10,
			dr: 3, color: '255,255,0'});
		UI.circles.push({x: x, y: y, radius: 20,
			dr: 3, color: '255,255,0'});
		
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
		var pickInfo = Game.scene.pick(x, y, function (mesh) { return mesh !== Flower.pot; });
		if (pickInfo.hit && !Camera.cameraLockedToMesh) {
			var mesh = pickInfo.pickedMesh;
			if (mesh.flowerPart && mesh.flowerPart !== 'ignore') {
				if (Tutorial.tutorialPause(mesh)) {
				} else {
					Camera.panToMesh(mesh, 0.75);
					Camera.cameraLockedToMesh = true;
					setTimeout(function() {
						Game.enableGestures = true;
						UI.toggleRevokeConsent(true);
					}, 750);
				}
			}
		}
		
		if (Game.waterCan) {
			WaterCan.onPointerDown(x, y);
		}
		
		UI.closeMenu();
	},

	onPointerMove: function (evt) {
		var x = Game.scene.pointerX;
		var y = Game.scene.pointerY;
		if (UI.isPointerDown) {
			for (var i = Math.random() * 2 + 1; i >= 0; --i) {
				UI.addRandomParticle(x, y);
			}
			Gestures.onPointerMove(x, y);
		}
	},

	onPointerUp: function (evt) {
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
};
