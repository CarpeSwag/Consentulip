/**
	Flower
	Creates the flower model scaling and randomizes its color.
	Also handles all of its animations.
 */
var Flower = {
	petalColor: {r:0, g:0, b:0, btn: 0},
	
	// Flower parts
	flower: [],
	interactable: [],
	leaves: [],
	petals: [],
	outerPetals: [],
	stem: null,
	pot: [],
	rocks: [],
	
	// Pose
	lastAnimation: [0,0],
	animating: false,
	animationPause: 0.0,
	wantToAnimate: false,
	reverseAnim: false,
	
	loadModels: function() {
		// Load in the model
		BABYLON.SceneLoader.ImportMesh('', 'art/models/',
			'tulip.babylon', Game.scene, function (mesh) {
			var SCALE = Constants.FLOWER_SCALE;
			Flower.flower = mesh;
			
			// Scale the flower mesh and add info for the camera
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
				var offset = [];
				var interactable = false;
				
				if (name === 'stem') {
					// Stem
					Flower.stem = mesh[i];
					Desire.notDesired.push(mesh[i]);
					type = 'stem';
					info = {
						alpha: 0,
						radius: 10,
						xOffset: 0,
						yOffset: 1 * SCALE,
						zOffset: 0
					};
					offset.push(new BABYLON.Vector3(
						0,
						0.45 * SCALE,
						0
					));
					offset.push(new BABYLON.Vector3(
						0,
						0.3 * SCALE,
						0
					));
					offset.push(new BABYLON.Vector3(
						0,
						0.15 * SCALE,
						0
					));
					interactable = true;
				} else if (name.substring(0,4) === 'leaf') {
					// Leaves
					var dir = -1;
					if (Flower.leaves.length == 1) {
						mesh[i].position.y += 0.4 * SCALE;
						dir = 1;
					} else {
						mesh[i].position.x += 0.01 * SCALE;
					}
					Flower.leaves.push(mesh[i]);
					Desire.notDesired.push(mesh[i]);
					type = 'leaf';
					info = {
						alpha: 0,
						radius: 12,
						xOffset: 0.5 * SCALE * dir,
						yOffset: 0.75 * SCALE,
						zOffset: 0,
					};
					offset.push(new BABYLON.Vector3(
						0.085 * SCALE * dir,
						0.165 * SCALE,
						-0.02 * SCALE
					));
					offset.push(new BABYLON.Vector3(
						0.085 * SCALE * dir,
						0.165 * SCALE,
						 0.02 * SCALE
					));
					
					mesh[i].position.y += 0.4 * Constants.FLOWER_SCALE;;
					interactable = true;
				} else if (name.substring(0,5) === 'petal') {
					// Petals
					Flower.petals.push(mesh[i]);
					type = 'petal';
					var alpha = 0;
					var xDir = 1;
					var zDir = 1;
					switch(+(name.substring(8))) {
						case 4:
							alpha = Math.PI / 4;
							break;
						case 5:
							alpha = 5 * Math.PI / 4;
							xDir = -1;
							zDir = -1;
							break;
						case 6:
							alpha = 7 * Math.PI / 4;
							zDir = -1;
							break;
						case 7:
							alpha = 3 * Math.PI / 4;
							xDir = -1;
							break;
						default:
							type = 'ignore';
							break;
					}
					if (+(name.substring(8)) > 3) {
						Flower.outerPetals.push(mesh[i]);
						Desire.notDesired.push(mesh[i]);
						offset.push(new BABYLON.Vector3(
							0.0625 * SCALE * xDir,
							0.60 * SCALE,
							0.0625 * SCALE * zDir
						));
						interactable = true;
					}
					info = {
						alpha: alpha,
						radius: 8,
						xOffset: 0,
						yOffset: 3.05 * SCALE,
						zOffset: 0
					};
					
					// Adjust color
					mesh[i].renderOverlay = true;
					mesh[i].overlayAlpha = 0.25;
					mesh[i].overlayColor = Flower.petalColor;
				}
				// Add info into the mesh
				mesh[i].flowerPart = type;
				mesh[i].cameraInfo = info;
				mesh[i].blinkOffset = offset;
				
				mesh[i].outlineCounter = 0;
				mesh[i].outlineColor = {
					r: 255,
					g: 255,
					b: 0
				};
				
				if (interactable)
					Flower.interactable.push(mesh[i]);
			}
		
			// Add the reversed animation keys
			Flower.addReversedAnimationKeys(mesh[0].skeleton);
		});
		
		// Load in the pot/soil base
		BABYLON.SceneLoader.ImportMesh('', 'art/models/',
			'pot.babylon', Game.scene, function (mesh) {
			for (var i = 0; i < mesh.length; ++i) {
				mesh[i].isSoil = true;
				Flower.pot.push(mesh[i]);
				// Scale the pot meshes
				mesh[i].scaling.x *= Constants.FLOWER_SCALE;
				mesh[i].scaling.y *= Constants.FLOWER_SCALE;
				mesh[i].scaling.z *= Constants.FLOWER_SCALE;
				mesh[i].position.x *= Constants.FLOWER_SCALE;
				mesh[i].position.y *= Constants.FLOWER_SCALE;
				mesh[i].position.z *= Constants.FLOWER_SCALE;
				mesh[i].position.y += -0.80 * Constants.FLOWER_SCALE;
				
				if (mesh[i].name === 'TopSoil') {
					// Cover the fact that there's a small gap at the top
					mesh[i].scaling.x += 0.015 * Constants.FLOWER_SCALE;
					mesh[i].scaling.z += 0.015 * Constants.FLOWER_SCALE;
					mesh[i].position.y -= 0.015 * Constants.FLOWER_SCALE;
				} else if (mesh[i].name.substring(0,4) === 'Cube'){
					// Floating rocks at the bottom of the pot
					Flower.rocks.push(mesh[i]);
					mesh[i].dir = 1;
					if (i % 2 == 0) {
						mesh[i].dir = -1;
						mesh[i].position.y -= (Constants.ROCK_Y_MAX
							- Constants.ROCK_Y_MIN);
					}
				}
				
				mesh[i].outlineCounter = 0;
				mesh[i].outlineColor = {
					r: 255,
					g: 255,
					b: 0
				};
			}
		});
	},
	
	randomizeColor: function() {
		// Randomizes the flower color and changes the UI hues
		var random = Constants.FLOWER_COLORS[Math.floor(
			Math.random() * Constants.FLOWER_COLORS.length)];
		this.petalColor.r = random.r;
		this.petalColor.g = random.g;
		this.petalColor.b = random.b;
		this.petalColor.btn = random.btn;
		
		UI.filterButtonHue(random.btn);
	},
	
	// Animation and Poses
	animateFlower: function(start, end, loop, onEnd) {
		// Animate the flower
		loop = loop === true;
		onEnd = onEnd || function(){};
		for (var i = 0; i < Flower.flower.length; ++i) {
			Game.scene.beginAnimation(
				Flower.flower[i], start, end, loop, 1.0, onEnd);
		}
	},
	
	idleAnimation: function() {
		// Should play an animation randomly
		var anim = this.lastAnimation;
		var reverse = (this.reverseAnim)? this.reverseAnimation:
			this.noReverseAnimation;
		this.animateFlower(anim[0], anim[1], false, reverse);
	},
	
	adjustAnimation: function() {
		// Check trust level and animate accordingly
		var ANIMATIONS = Constants.ANIMATION;
		var trust = Game.trust;
		var anim = [0,0];
		var reverse = Flower.noReverseAnimation;
		var pause = 0.0;
		
		// Check the animation values (in constants).
		for (var i = 0; i < ANIMATIONS.length; ++i) {
			if (ANIMATIONS[i].TRUST >= trust) {
				anim[0] = ANIMATIONS[i].ANIM[0];
				anim[1] = ANIMATIONS[i].ANIM[1];
				pause = ANIMATIONS[i].PAUSE;
				if (ANIMATIONS[i].REVERSE)
					reverse = this.reverseAnimation;
				this.reverseAnim = ANIMATIONS[i].REVERSE;
				break;
			}
		}
		
		// Adjust pose
		if ((this.lastAnimation[0] !== anim[0]
			|| this.lastAnimation[1] !== anim[1]) ||
			Flower.wantToAnimate) {
			Game.playingAnimation = true;
			Flower.wantToAnimate = false;
			Desire.resetAnimateCounter();
			Flower.lastAnimation = anim;
			Flower.animationPause = pause * 1000;
			Camera.zoomOut();
			setTimeout(function() {
				Flower.animateFlower(anim[0], anim[1], false, reverse);
			}, 750);
		}
	},
	
	reverseAnimation: function() {
		// Reverses the last played animation
		if (Flower.animating) return;
		Flower.animating = true;
		setTimeout(function() {
			var start = 151 + (150 - Flower.lastAnimation[1]);
			var end = 151 + (150 - Flower.lastAnimation[0]);
			Flower.animateFlower(start, end, false, function() {
				Flower.animating = false;
				Game.playingAnimation = false;
				Desire.resetAnimateCounter();
				Camera.panToLastMesh(0.75);
			});
		}, Flower.animationPause);
	},
	
	noReverseAnimation: function() {
		// For animations without a reversed section
		Game.playingAnimation = false;
	},
	
	addReversedAnimationKeys: function(skeleton) {
		// Takes all of the animations keys of the skeleton's animations
		// and reverses all of them with voodoo magic. Appends these
		// new reversed animation keys to the end of the animation keys.
		for (var i = 0; i < skeleton.bones.length; ++i) {
			var bone = skeleton.bones[i];
			var animation = bone.animations[0];
			var keyCount = animation._keys.length;
			
			for (var j = keyCount - 1; j >= 0; --j) {
				var newFrame = 150 + (150 - animation._keys[j].frame);
				animation._keys.push({
					'frame': newFrame, 
					'value': animation._keys[j].value 
				});
			}
		}
	}
};
