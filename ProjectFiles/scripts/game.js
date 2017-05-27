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
	soilClick: false,
	
	// Particle system
	particleSystem: null,
	
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
			WaterCan.onFrame();
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
		
		// Create the "God Rays" effect (volumetric light scattering)
		/*var godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays',
		1.0, Camera.camera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, this.engine, false);

		var SCALE = 50;
		godrays.mesh.position = new BABYLON.Vector3(-100, 100, -300);
		godrays.mesh.scaling = new BABYLON.Vector3(SCALE, SCALE, SCALE);*/
		
		// Ensure screen is sized correctly.
		this.engine.resize();
	},
	
	createParticleSystemAt: function(mesh, offset) {
		// Clean particle
		this.destroyParticleSystem();
		
		// Create a particle system
		this.particleSystem = new BABYLON.ParticleSystem("particles", 2000, this.scene);
		var ps = this.particleSystem;

		// Apply offset
		ps.emitter = mesh;
		ps.minEmitBox = offset;
		ps.maxEmitBox = offset;

		// Texture and colors of all particles
		ps.particleTexture = new BABYLON.Texture("art/textures/particle.png", this.scene);
		ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
		ps.color1 = new BABYLON.Color4(0.75, 0.75, 0, 0.25);
		ps.color2 = new BABYLON.Color4(0.75, 0.75, 0, 0.25);
		ps.colorDead = new BABYLON.Color4(0, 0, 0, 0.1);

		// Size of each particle
		ps.minSize = 0;
		ps.maxSize = 0;

		// Life time of each particle
		ps.minLifeTime = 0.5;
		ps.maxLifeTime = 0.5;

		// Emission rate

		// Update Speed
		ps.emitRate = 1;
		ps.minEmitPower = 1;
		ps.maxEmitPower = 1;
		ps.updateSpeed = 0.01;

		// Update Function
		ps.updateFunction = function(particles) {
			for (var index = 0; index < particles.length; index++) {
			   var particle = particles[index];
			   particle.age += this._scaledUpdateSpeed;
			   particle.size += 0.05;
			   if (particle.age >= particle.lifeTime) { // Recycle
					particles.splice(index, 1);
					this._stockParticles.push(particle);
					index--;
					continue;
			   } else {
					particle.colorStep.scaleToRef(this._scaledUpdateSpeed, this._scaledColorStep);
					particle.color.addInPlace(this._scaledColorStep);

					if (particle.color.a < 0)
						particle.color.a = 0;
				}
			}
		};

		// Start the particle system
		ps.start();
	},
	
	destroyParticleSystem: function() {
		if (this.particleSystem == null) return;
		
		// Destroy particle
		this.particleSystem.disposeOnStop = true;
		this.particleSystem.stop();
		this.particleSystem = null;
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
		var pickInfo = Game.scene.pick(x, y, function (mesh) { return true; });
		if (pickInfo.hit && !Camera.cameraLockedToMesh) {
			var mesh = pickInfo.pickedMesh;
			if (mesh.flowerPart && mesh.flowerPart !== 'ignore') {
				if (Tutorial.tutorialPause(mesh)) {
				} else {		
					if (Game.waterCan) {
						WaterCan.onPointerDown(x, y);
					} else if (Game.tendSoil) {
					} else {
						Camera.panToMesh(mesh, 0.75);
						Camera.cameraLockedToMesh = true;
						setTimeout(function() {
							Game.enableGestures = true;
							UI.toggleRevokeConsent(true);
						}, 750);
					}
				}
			} else if (mesh === Flower.pot) {
				if (Game.tendSoil) {
					Game.soilClick = true;
					for (var i = Math.ceil(Math.random() * 5) + 3; i >= 0; --i) {
						UI.addDirtParticle(x, y);
					}
				}
			}
		}
		
		if (!Game.soilClick) {			
			for (var i = Math.random() * 5 + 3; i >= 0; --i) {
				UI.addRandomParticle(x, y);
			}
		}
		
		UI.closeMenu();
	},

	onPointerMove: function (evt) {
		var x = Game.scene.pointerX;
		var y = Game.scene.pointerY;
		if (UI.isPointerDown && !Game.soilClick) {
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
		Game.soilClick = false;
	}
};
