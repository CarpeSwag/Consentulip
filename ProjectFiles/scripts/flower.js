var Flower = {
	petalColor: {r:0, g:0, b:0, btn: 0},
	leaves: [],
	petals: [],
	outerPetals: [],
	stem: null,
	pot: null,
	
	loadModels: function() {
		// Load in the model
		BABYLON.SceneLoader.ImportMesh('', 'art/models/',
			'tulip.babylon', Game.scene, function (mesh) {
			var SCALE = 5.0;
			var FLOWER_HEAD_SIZE = 1.5;
			var COMBINED_SCALE = 7.5;
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
					Flower.stem = mesh[i];
					type = 'stem';
					info = {
						alpha: 0,
						radius: 10,
						yOffset: 0
					}
				} else if (name.substring(0,4) === 'leaf') {
					Flower.leaves.push(mesh[i]);
					type = 'leaf';
					info = {
						alpha: 0,
						radius: 12,
						yOffset: 0
					}
					mesh[i].position.y += 0.4 * SCALE;
					if (Flower.leaves.length == 1) {
						mesh[i].position.y += 0.4 * SCALE;
					}
				} else if (name.substring(0,5) === 'petal') {
					Flower.petals.push(mesh[i]);
					type = 'petal';
					var alpha = 0;
					var offset = null;
					if (+(name.substring(8)) > 3)
						Flower.outerPetals.push(mesh[i]);
					switch(+(name.substring(8))) {
						case 4:
							alpha = Math.PI / 4;
							offset = new BABYLON.Vector3(
								1.00 * COMBINED_SCALE,
								0.1 * COMBINED_SCALE,
								0
							);
							break;
						case 5:
							alpha = 5 * Math.PI / 4;
							offset = new BABYLON.Vector3(
								-1.00 * COMBINED_SCALE,
								0.1 * COMBINED_SCALE,
								0
							);
							break;
						case 6:
							alpha = 7 * Math.PI / 4;
							offset = new BABYLON.Vector3(
								0,
								0.1 * COMBINED_SCALE,
								-1.00 * COMBINED_SCALE
							);
							break;
						case 7:
							alpha = 3 * Math.PI / 4;
							offset = new BABYLON.Vector3(
								0,
								0.1 * COMBINED_SCALE,
								1.00 * COMBINED_SCALE
							);
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
					mesh[i].scaling.x *= FLOWER_HEAD_SIZE;
					mesh[i].scaling.y *= FLOWER_HEAD_SIZE;
					mesh[i].scaling.z *= FLOWER_HEAD_SIZE;
					mesh[i].position.x *= FLOWER_HEAD_SIZE;
					mesh[i].position.z *= FLOWER_HEAD_SIZE;
					
					// Adjust color
					mesh[i].renderOverlay = true;
					mesh[i].overlayAlpha = 0.25;
					mesh[i].overlayColor = Flower.petalColor;
					
					mesh[i].blinkOffset = offset;
				}
				mesh[i].flowerPart = type;
				mesh[i].cameraInfo = info;
			}
		});
		
		// Load in the pot
		BABYLON.SceneLoader.ImportMesh('', 'art/models/',
			'pot.babylon', Game.scene, function (mesh) {
			var SCALE = 4.5;
			for (var i = 0; i < mesh.length; ++i) {
				Flower.pot = mesh[i];
				mesh[i].scaling.x *= SCALE;
				mesh[i].scaling.y *= SCALE;
				mesh[i].scaling.z *= SCALE;
				mesh[i].position.x *= SCALE;
				mesh[i].position.y *= SCALE;
				mesh[i].position.z *= SCALE;
				mesh[i].position.y += -0.80 * SCALE;
			}
		});
	},
	
	randomizeColor: function() {
		var random = Constants.FLOWER_COLORS[Math.floor(
			Math.random() * Constants.FLOWER_COLORS.length)];
		this.petalColor.r = random.r;
		this.petalColor.g = random.g;
		this.petalColor.b = random.b;
		this.petalColor.btn = random.btn;
		
		UI.filterButtonHue(random.btn);
	}
};
