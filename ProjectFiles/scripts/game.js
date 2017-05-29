var Game = {
	// BabylonJS stuff
	canvas: null,
	engine: null,
	scene: null,
	
	// Environment
	skybox: [],
	
	// Lights
	light: null,
	light2: null,
	
	// Flags
	enableGestures: false,
	waterCan: false,
	tendSoil: false,
	soilClick: false,
	
	// Particle system
	particleSystem: [],
	psCounter: 0,
	
	onLoad: function() {
		this.canvas = document.getElementById('renderCanvas');
		this.engine = new BABYLON.Engine(this.canvas, true);
		this.scene = new BABYLON.Scene(this.engine);
		
		// Generate a random color for the flower
		Flower.randomizeColor();
		
		// Render loop
		this.engine.runRenderLoop(renderLoop);
		
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
		BABYLON.SceneLoader.ImportMesh('', 'art/models/',
			'skybox.babylon', Game.scene, function (mesh) {
			var SCALE = 75.0;
			Game.skybox = mesh;
			for (var i = 0; i < mesh.length; ++i) {
				mesh[i].scaling.x *= SCALE;
				mesh[i].scaling.y *= SCALE;
				mesh[i].scaling.z *= SCALE;
				mesh[i].position.x *= SCALE;
				mesh[i].position.y *= SCALE;
				mesh[i].position.z *= SCALE;
				mesh[i].position.y += -5.0 * SCALE;
			}
		});
		
		// Fog
		this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
		this.scene.fogColor = new BABYLON.Color3(1, 1, 1);
		this.scene.fogDensity = 0;
		
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
		var part = [];
		for (var i = 0; i < offset.length; ++i) {
			// Create a particle system
			var ps = new BABYLON.ParticleSystem("particles", 2000, this.scene);

			// Apply offset
			ps.emitter = mesh;
			ps.minEmitBox = offset[i];
			ps.maxEmitBox = offset[i];

			// Texture and colors of all particles
			ps.particleTexture = new BABYLON.Texture(
				"art/textures/particle.png", this.scene);
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
						particle.colorStep.scaleToRef(
							this._scaledUpdateSpeed, this._scaledColorStep);
						particle.color.addInPlace(this._scaledColorStep);

						if (particle.color.a < 0)
							particle.color.a = 0;
					}
				}
			};

			// Start the particle system
			ps.start();
			
			part.push(ps);
		}
		
		// Push it to the array
		var id = this.psCounter++;
		this.psCounter = this.psCounter % 100;
		this.particleSystem.push({
			id: id,
			part: part
		});
		return id;
	},
	
	getParticleSystemById: function(id) {
		for (var i = 0; i < this.particleSystem.length; ++i)
			if (this.particleSystem[i].id === id)
				return i;
		return -1;
	},
	
	destroyParticleSystem: function(id) {
		var index = this.getParticleSystemById(id);
		if (index === -1) return false;
		var ps = this.particleSystem[index];
		
		// Destroy particle
		for (var i = 0; i < ps.part.length; ++i) {
			ps.part[i].disposeOnStop = true;
			ps.part[i].stop();
		}
		
		// Destroy and remove the particles
		ps.part = null;
		ps.id = null;
		this.particleSystem.splice(index, 1);
		return true;
	},
	
	// Mouse events
	onPointerDown: function (evt) {
		if (evt.button !== 0) {
			return;
		}
		
		var x = Game.scene.pointerX;
		var y = Game.scene.pointerY;
		Draw.circles.push({x: x, y: y, radius: 10,
			dr: 3, color: '255,255,0'});
		Draw.circles.push({x: x, y: y, radius: 20,
			dr: 3, color: '255,255,0'});
		
		document.onselectstart = function() { return false; } // disable drag-select
		document.onmousedown = function() { return false; } // disable drag-select
		
		if (evt.button <= 1) {
			UI.isPointerDown = true;
		}
		
		if (Game.enableGestures && !Tutorial.gesture) {
			if (evt.button <= 1) {
				Gestures.onPointerDown(x, y);
				Draw.bctx.lineWidth = 3;
				Draw.bctx.moveTo(x, y);
				Draw.bctx.strokeStyle = '#ffffff';
				Draw.bctx.shadowBlur = 10;
				Draw.bctx.shadowColor = 'rgba(255,200,50,.25)';
				Draw.bctx.beginPath();
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
						Desire.destroyDesire(mesh);
						setTimeout(function() {
							Game.enableGestures = true;
							UI.toggleRevokeConsent(true);
						}, 750);
					}
				}
			} else if (mesh === Flower.pot) {
				if (Game.tendSoil) {
					Desire.reduceDesireTimer(Constants.TEND_SOIL_FLAG);
					Game.soilClick = true;
					for (var i = Math.ceil(Math.random() * 5) + 3; i >= 0; --i) {
						Draw.addDirtParticle(x, y);
					}
				}
			}
		}
		
		if (!Game.soilClick) {
			for (var i = Math.random() * 5 + 3; i >= 0; --i) {
				Draw.addRandomParticle(x, y);
			}
		}
		
		UI.closeMenu();
	},

	onPointerMove: function (evt) {
		var x = Game.scene.pointerX;
		var y = Game.scene.pointerY;
		if (UI.isPointerDown && !Game.soilClick) {
			for (var i = Math.random() * 2 + 1; i >= 0; --i) {
				Draw.addRandomParticle(x, y);
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
				Draw.gctx.drawImage(Draw.bufferCanv, 0, 0);
			}
		}
		Game.soilClick = false;
	}
};
