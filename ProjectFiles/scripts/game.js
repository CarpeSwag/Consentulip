/**
	Game
	Handles most of the game initialization, mouse events, and outlines
 */
var Game = {
	// BabylonJS stuff
	canvas: null,
	engine: null,
	scene: null,
	
	// Environment
	skybox: [],
	clouds: [],
	rotateCounter: 0,
	rockHeight: Constants.ROCK_Y_MAX,
	rockVel: -Constants.ROCK_Y_VEL,
	
	// Lights
	light: null,
	light2: null,
	
	// Trust
	trust: 50,
	zoomedInMesh: null,
	wasDesired: false,
	lastPlayedWith: '',
	
	// Flags
	playingAnimation: false,
	enableGestures: false,
	waterCan: false,
	tendSoil: false,
	soilClick: false,
	
	// Particle system
	particleSystem: [],
	psCounter: 0,
	
	// Outline system
	outlineMeshes: [],
	outlineWidth: 0.025,
	outlineDelta: Constants.OUTLINE_DELTA,
	
	// Music
	musicHappy: null,
	musicNeutral: null,
	musicSad: null,
	volumeTargets: [0,1,0],
	
	// Sounds
	soundGood: [],
	soundBad: [],
	soundBtn: [],
	soundChord: null,
	
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
		
		// Load in the Skybox
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

				if (mesh[i].material.id === 'skybox.clouds') {
					Game.clouds.push(mesh[i]);
					mesh[i].position.y *= mesh[i].position.y;
					mesh[i].position.y *= 1/100;
					mesh[i].position.y += -1.0 * SCALE;
					var factor = Math.sqrt(mesh[i].position.y + 200) / 12.5;
					mesh[i].position.x /= factor;
					mesh[i].position.z /= factor;
					if (mesh[i].position.y > 600) {
						mesh[i].position.x /= factor;
						mesh[i].position.z /= factor;
						mesh[i].position.y -= 200;
					} else if (mesh[i].position.y > 500) {
						mesh[i].position.x /= -2;
						mesh[i].position.z /= -2;
						mesh[i].position.y -= 150;
					}
				}	
			}
		});
		
		// Fog
		this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
		this.scene.fogColor = new BABYLON.Color3(1, 1, 1);
		this.scene.fogDensity = 0.001;
		
		// Load models
		Flower.loadModels();
		
		// Create the "God Rays" effect (volumetric light scattering)
		/*var godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays',
		1.0, Camera.camera, null, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, this.engine, false);

		var SCALE = 50;
		godrays.mesh.position = new BABYLON.Vector3(-100, 100, -300);
		godrays.mesh.scaling = new BABYLON.Vector3(SCALE, SCALE, SCALE);*/
		
		
		// Set up music function
		var soundsReady = 0;
		var soundReady = function() {
			++soundsReady;
			if (soundsReady === 3) {
				Game.musicNeutral.play();
				Game.musicHappy.play();
				Game.musicSad.play();
			}
		}
		
		// Initialize music variables
		this.musicNeutral = new BABYLON.Sound("Neutral music", "audio/music/neutral.mp3",
			this.scene, soundReady, { loop: true });
		this.musicHappy = new BABYLON.Sound("Happy music", "audio/music/happy.mp3",
			this.scene, soundReady, { loop: true });
		this.musicSad = new BABYLON.Sound("Sad music", "audio/music/sad.mp3",
			this.scene, soundReady, { loop: true });
			
		this.musicHappy.setVolume(0);
		this.musicSad.setVolume(0);
		
		// Create sfx chord sound
		this.soundChord = new BABYLON.Sound('chord', 'audio/sfx/chord_1.mp3', this.scene);
		this.soundChord.setVolume(.1);
		
		// Generate sfx bad sounds
		for (var i = 0; i < 11; ++i) {
			var url = 'audio/sfx/bad_' + (i + 1) + '.mp3';
			var snd = new BABYLON.Sound('bad_' + i, url, this.scene);
			
			this.soundBad.push(snd);
		}
		
		// Generate sfx good and btn sounds
		for (var i = 0; i < 12; ++i) {
			var url = 'audio/sfx/good_' + (i + 1) + '.mp3';
			var snd = new BABYLON.Sound('good_' + i, url, this.scene);
			var btn = new BABYLON.Sound('btn_' + i, url, this.scene);
			btn.setPlaybackRate(3);
			btn.setVolume(.1);
			
			this.soundGood.push(snd);
			this.soundBtn.push(btn);
		}
		
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
		
		// Get the mouse pointer location
		var x = Game.scene.pointerX;
		var y = Game.scene.pointerY;
		
		// Create cute circles that expand out at mouse location
		Draw.circles.push({x: x, y: y, radius: 10,
			dr: 3, color: '255,255,0'});
		Draw.circles.push({x: x, y: y, radius: 20,
			dr: 3, color: '255,255,0'});
		
		document.onselectstart = function() { return false; } // disable drag-select
		document.onmousedown = function() { return false; } // disable drag-select
		
		if (evt.button <= 1) {
			UI.isPointerDown = true;
		}
		
		// Start a new line if we're in gesture mode
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
		
		// Check if we are under a mesh
		var pickInfo = Game.scene.pick(x, y);
		if (pickInfo.hit && !Camera.cameraLockedToMesh && !Game.playingAnimation) {
			var mesh = pickInfo.pickedMesh;
			// Check if we hit a part of the flower to touch
			if (mesh.flowerPart && mesh.flowerPart !== 'ignore') {
				// Touched the flower
				if (Tutorial.tutorialPause(mesh)) {
					// Tutorial is paused and waiting for a specific mesh
				} else {		
					if (Game.waterCan) {
						// Water the flower
						WaterCan.onPointerDown(x, y);
						UI.disableWater();
					} else if (Game.tendSoil) {
						// Tend to the flower's soil
					} else {
						// Zoom into a flower mesh and start the gestures
						Game.zoomedInMesh = mesh;
						Camera.panToMesh(mesh, 0.75);
						Camera.cameraLockedToMesh = true;
						Game.wasDesired = Desire.destroyDesire(mesh);
						Game.lastPlayedWith = mesh.flowerPart;
						setTimeout(function() {
							Game.enableGestures = true;
							UI.toggleRevokeConsent(true);
						}, 750);
					}
				}
			} else if (mesh.isSoil) {
				// Touched the soil
				if (Game.tendSoil) {
					// Tend the soil
					Desire.reduceDesireTimer(Constants.TEND_SOIL_FLAG);
					Game.soilClick = true;
					UI.disableTend();
					for (var i = Math.ceil(Math.random() * 5) + 3; i >= 0; --i) {
						Draw.addDirtParticle(x, y);
					}
				}
			}
		}
		
		if (!Game.soilClick) {
			// Draw cute particle effects if this isn't soil tending
			for (var i = Math.random() * 5 + 3; i >= 0; --i) {
				Draw.addRandomParticle(x, y);
			}
		}
		
		// Close the menu if it's open
		UI.closeMenu();
	},

	onPointerMove: function (evt) {
		// Draw more particles and track the points!
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
				// End a gesture line
				UI.isPointerDown = false;
				Gestures.onPointerUp(x, y);
				Draw.gctx.drawImage(Draw.bufferCanv, 0, 0);
			}
		}
		Game.soilClick = false;
	},
	
	addOutlineMesh: function(mesh) {
		// Outlines a specific mesh
		mesh.renderOutline = true;
		if (mesh.outlineCounter == 0)
			this.outlineMeshes.push(mesh);
		mesh.outlineCounter++;
	},
	
	findOutlineMesh: function(mesh) {
		for (var i = 0; i < this.outlineMeshes.length; ++i)
			if (this.outlineMeshes[i] === mesh)
				return i;
		return -1;
	},
	
	removeOutlineMesh: function(mesh) {
		// Removes the outline from a mesh
		var index = this.findOutlineMesh(mesh);
		if (index === -1) return;
		mesh.outlineCounter--;
		if (mesh.outlineCounter == 0) {
			mesh.renderOutline = false;
			this.outlineMeshes.splice(index, 1);
		}
	},
	
	onFrame: function() {
		// Rotate clouds and floating rocks and adjust volume
		++this.rotateCounter;
		if (this.rotateCounter == 2) {
			this.rotateCounter = 0;
			for (var i = 0; i < Game.clouds.length; ++i) {
				var x = Game.clouds[i].position.x;
				var z = Game.clouds[i].position.z;
				var newXZ = Draw.rotateAroundPoint(0, 0, x, z, 
					Constants.CLOUD_ANG_VEL);
				Game.clouds[i].position.x = newXZ[0];
				Game.clouds[i].position.z = newXZ[1];
			}
			
			for (var i = 0; i < Flower.rocks.length; ++i) {
				var x = Flower.rocks[i].position.x;
				var z = Flower.rocks[i].position.z;
				var newXZ = Draw.rotateAroundPoint(0, 0, x, z, 
					Constants.ROCK_ANG_VEL);
				Flower.rocks[i].position.x = newXZ[0];
				Flower.rocks[i].position.z = newXZ[1];
				Flower.rocks[i].position.y += this.rockVel
					* Flower.rocks[i].dir;
			}
			this.rockHeight += this.rockVel;
			if (this.rockHeight < Constants.ROCK_Y_MIN
				|| this.rockHeight > Constants.ROCK_Y_MAX)
				this.rockVel *= -1;
			
			// Volume
			if (this.musicSad._volume != this.volumeTargets[0]) {
				var dv = (this.musicSad._volume > this.volumeTargets[0])?
					-0.01: 0.01;
				this.musicSad.setVolume(this.musicSad._volume + dv);
				if (Math.abs(this.musicSad._volume - this.volumeTargets[0]) < 0.05)
					this.musicSad.setVolume(this.volumeTargets[0]);
			}
			if (this.musicNeutral._volume != this.volumeTargets[1]) {
				var dv = (this.musicNeutral._volume > this.volumeTargets[1])?
					-0.01: 0.01;
				this.musicNeutral.setVolume(this.musicNeutral._volume + dv);
				if (Math.abs(this.musicNeutral._volume - this.volumeTargets[1]) < 0.05)
					this.musicNeutral.setVolume(this.volumeTargets[1]);
			}
			if (this.musicHappy._volume != this.volumeTargets[2]) {
				var dv = (this.musicHappy._volume > this.volumeTargets[2])?
					-0.01: 0.01;
				this.musicHappy.setVolume(this.musicHappy._volume + dv);
				if (Math.abs(this.musicHappy._volume - this.volumeTargets[2]) < 0.05)
					this.musicHappy.setVolume(this.volumeTargets[2]);
			}
		}
		
		// Handle mesh outline changes
		if (this.outlineMeshes.length > 0) {
			this.outlineWidth += this.outlineDelta;
			if (this.outlineWidth < Constants.OUTLINE_LOWER
				|| this.outlineWidth > Constants.OUTLINE_UPPER) {
				this.outlineDelta *= -1;
			}
			for (var i = 0; i < this.outlineMeshes.length; ++i) {
				this.outlineMeshes[i].outlineWidth = this.outlineWidth;
			}
		}
	},
	
	restartGame: function() {
		// Restarts the game (not perfect)
		Game.trust = 50;
		document.getElementById('trust-bar-inner').style.width =
			Game.trust + '%';
		UI.adjustTrustBarColor();
		
		// Randomize the flower color
		Flower.randomizeColor();
		
		// Reset the music
		UI.adjustMusic();
		
		// Reset a few game variables
		Game.zoomedInMesh = null;
		Game.wasDesired = false;
		Game.lastPlayedWith = '';
		Game.playingAnimation = false;
		Game.enableGestures = false;
		Game.waterCan = false;
		Game.tendSoil = false;
		Game.soilClick = false;
		
		// Reset the desire counter
		Desire.counter = Constants.DESIRE_TIMER_RESET;
		Desire.animateCounter = Constants.DANCE_TIME_RANGE
			+ Constants.DANCE_TIME_LOWER;
		
		// Reset the camera
		Camera.setCameraToDefault();
		Camera.camera.radius = 40;
		Camera.camera.target = Constants.CAMERA_DEFAULT_TARGET;
		
		// Close the game menu and play a nice chord
		UI.closeMenu();
		Game.soundChord.play();
	}
};
