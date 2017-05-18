/**
* Gesture control
**/
//
// Startup
//

// Global Variables
var isDown, points, strokeID, recog, iter, glow, gdx;
var circles, particles;
var circleCanv, gestureCanv, bufferCanv;
var zoomOut;

// Constants
var FLOWER_COLORS = [
	{r: 1, g: 0, b: 0},
	{r: 0, g: 0, b: 1},
	{r: 1, g: 1, b: 0},
	{r: 1, g: 0, b: 1},
	{r: 0, g: 1, b: 1}
]

function onLoadEvent() {
	points = new Array(); // point array for current stroke
	strokeID = 0;
	recog = new PDollarRecognizer();
	isDown = false;
	
	circleCanv = document.createElement('canvas');
	gestureCanv = document.createElement('canvas');
	bufferCanv = document.createElement('canvas');
	resizeCanvas();
	
	var sctx = circleCanv.getContext('2d');
	sctx.shadowColor = 'rgba(255,200,50,2)';
	
	iter = 0;
	circles = [];
	particles = [];
	glow = 100;
	gdx = 1;
	window.requestAnimationFrame(draw);
}

function drawLine(ctx, a, b) {
	ctx.lineTo(b.X, b.Y);
	var width = Math.sqrt(Math.pow(a.X - b.X, 2) + Math.pow(a.Y - b.Y, 2));
	ctx.lineWidth = 4 - (3 * (width/200));
	ctx.shadowBlur = 10 + (3 * (width/200));
}

function clearStrokes() {
	points.length = 0;
	strokeID = 0;
	var ctx = document.getElementById('gestures').getContext('2d');
	ctx.closePath();
	var sctx = circleCanv.getContext('2d');
	var gctx = gestureCanv.getContext('2d');
	var bctx = bufferCanv.getContext('2d');
	
	// Clear the canvas
	ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	sctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	gctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	bctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function createCircle(ctx, x, y, rad, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
}

function addRandomParticle(x, y) {
	var r = 155 + Math.round(Math.random() * 100);
	var g = 150 + Math.round(Math.random() * 155);
	var b = Math.round(Math.random() * 255);
	particles.push({
		x: x + Math.random() * 40 - 20,
		y: y + Math.random() * 40 - 20,
		size: Math.random() * 2.5 + 2.5,
		rad: Math.random() * Math.PI,
		color: r + ',' + g + ',' + b,
		alpha: 1,
		da: -.05,
		dr: (Math.random() * Math.PI / 12) - Math.PI / 24,
		dy: Math.random() * 0.25
	})
}

function createParticle(ctx, x, y, radius, innerRadius, col, radians) {
	var inner = radius * innerRadius;
	ctx.fillStyle = col;
	ctx.beginPath();
	moveToRotated(ctx, x, y, x - radius, y, radians);
    lineToRotated(ctx, x, y, x - inner, y - inner, radians);
	lineToRotated(ctx, x, y, x, y - radius, radians);
	lineToRotated(ctx, x, y, x + inner, y - inner, radians);
	lineToRotated(ctx, x, y, x + radius, y, radians);
	lineToRotated(ctx, x, y, x + inner, y + inner, radians);
	lineToRotated(ctx, x, y, x, y + radius, radians);
	lineToRotated(ctx, x, y, x - inner, y + inner, radians);
	lineToRotated(ctx, x, y, x - radius, y, radians);
    ctx.closePath();
	ctx.fill();
}

function createLine(ctx, a, b, width, blurWidth, col, blurCol) {
	ctx.strokeStyle = col;
	ctx.lineWidth = width;
	ctx.shadowBlur = blurWidth;
	ctx.shadowColor = blurCol;
	ctx.beginPath();
	ctx.moveTo(a.x, a.y);
	ctx.lineTo(b.x, b.y);
	ctx.closePath();
}

function moveToRotated(ctx, x1, y1, x2, y2, rad) {
	var point = rotateAroundPoint(x1, y1, x2, y2, rad);
	ctx.moveTo(point[0], point[1]);
}

function lineToRotated(ctx, x1, y1, x2, y2, rad) {
	var point = rotateAroundPoint(x1, y1, x2, y2, rad);
	ctx.lineTo(point[0], point[1]);
}

function rotateAroundPoint(x1, y1, x2, y2, rad) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	var sin = Math.sin(rad);
	var cos = Math.cos(rad);
	var newX = x1 + dx * cos - dy * sin;
	var newY = y1 + dx * sin + dy * cos;
	return [newX, newY];
}

function draw() {
	var THRESHOLD = 40;
	var canvas = document.getElementById('gestures');
	var ctx = canvas.getContext('2d');
	var sctx = circleCanv.getContext('2d');
	var gctx = gestureCanv.getContext('2d');
	var bctx = bufferCanv.getContext('2d');
	
	// Clear the canvas
	ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	sctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	bctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	
	// Update the glow amount
	glow += gdx;
	if(glow == 60 || glow == 120)
		gdx *= -1;
	var glowLoop = Math.floor(glow / 10)
	
	// Create the circles
	for (var i = circles.length - 1; i >= 0; --i) {
		circles[i].radius += 3;
		var rgb = circles[i].color;
		var a = 0.25 * (1 - (circles[i].radius / THRESHOLD));
		var rgba = 'rgba(' + rgb + ',' + a + ')';
		createCircle(sctx, circles[i].x, circles[i].y, circles[i].radius, rgba);
		if (circles[i].radius > THRESHOLD) {
			circles.splice(i,1);
		}
	}
	
	// Create the particles
	for (var i = particles.length - 1; i >= 0; --i) {
		sctx.shadowBlur = particles[i].size;
		var rgb = particles[i].color;
		var a = particles[i].alpha / 3;
		var rgba = 'rgba(' + rgb + ',' + a + ')';
		
		// Draw the particle
		for (var j = 0; j < 3; ++j) {
			createParticle(sctx, particles[i].x, particles[i].y, particles[i].size,
				.45, rgba, particles[i].rad);
		}
		
		// Adjust it
		particles[i].rad += particles[i].dr;
		particles[i].y += particles[i].dy;
		particles[i].alpha += particles[i].da;
		
		if (a <= 0) {
			particles.splice(i, 1);
		}
	}
	sctx.shadowBlur = 0;
	
	// Draw gestures
	if (points.length > 0) {
		bctx.stroke();
		for (var i = 0; i < glowLoop; ++i) {
			ctx.drawImage(gestureCanv, 0, 0);
			ctx.drawImage(bufferCanv, 0, 0);
		}
	}
	
	ctx.drawImage(circleCanv, 0, 0);
	window.requestAnimationFrame(draw);
}

function resizeCanvas() {
	var width = window.innerWidth;
	var height = window.innerHeight;
	var canvases = [document.getElementById('gestures'), circleCanv, gestureCanv, bufferCanv];
	
	for (var i = 0; i < canvases.length; ++i) {
		var ctx = canvases[i].getContext('2d');
		ctx.canvas.width = width;
		ctx.canvas.height = height;
	}
}

/**
* Babylon Things
**/

function isInFront(cameraAlpha) {
	return (cameraAlpha >= 0)? (cameraAlpha % (Math.PI * 2)) < Math.PI:
		(Math.abs(cameraAlpha) % (Math.PI * 2)) >= Math.PI;
}

var randomizeFlower;

window.addEventListener('DOMContentLoaded', function() {
	var canvas = document.getElementById('renderCanvas');
	var engine = new BABYLON.Engine(canvas, true);
	var scene = new BABYLON.Scene(engine);
	
	var enableGestures = false;
	var gesturesEnabled = false;
	
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
		engine.resize();
		resizeCanvas();
	});
	
	engine.runRenderLoop(function() {
		scene.render();
	});
	
	// Camera settings
	var DEFAULT_CAMERA_TARGET = new BABYLON.Vector3(0,5,0);
	var camera = new BABYLON.ArcRotateCamera("Camera", Math.random() * (Math.PI * 2),
		Math.PI / 3, 40, DEFAULT_CAMERA_TARGET, scene);
	camera.upperBetaLimit = Math.PI / 2;
	camera.lowerRadiusLimit = 7.5;
	camera.upperRadiusLimit = 500;
	camera.attachControl(canvas, true, true);
	scene.activeCamera.panningSensibility = 0; // disables camera panning
	
	// Set up the light
	var light = new BABYLON.HemisphericLight("light",
		new BABYLON.Vector3(0, 1000, 0), scene);
	light.intensity = 0.7;
	
	var light2 = new BABYLON.HemisphericLight("light",
		new BABYLON.Vector3(0, 0, 0), scene);
	light2.intensity = 2.0;
	
	// Load in the model
	var stem, leaves, petals;
	BABYLON.SceneLoader.ImportMesh('', 'art/models/',
		'tulip.babylon', scene, function (mesh) {
		var SCALE = 5.0;
		leaves = [];
		petals = [];
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
				leaves.push(mesh[i]);
				type = 'leaf';
				info = {
					alpha: 0,
					radius: 12,
					yOffset: 0
				}
				mesh[i].position.y += 0.4 * SCALE;
			} else if (name.substring(0,5) === 'petal') {
				petals.push(mesh[i]);
				type = 'petal';
				var alpha = 0;
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
					yOffset: 1.5
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
		'pot.babylon', scene, function (mesh) {
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
	scene.clearColor = new BABYLON.Color3(.2, .6, .75);
	
	// Pan
	var animationDelta = {
		alpha: 0,
		beta: 0,
		radius: 0,
		x: 0,
		y: 0,
		z: 0,
		lockCamera: false
	}
	var frameCounter = 0;
	var rotateCameraTo = function(target, alpha, beta, radius, seconds, lockCamera) {
		// Determine the frames (60 fps)
		var frameCount = Math.floor(seconds * 60);
		frameCounter = frameCount;
		
		// Clean the alpha value
		if (camera.alpha < 0)
			camera.alpha = (2 * Math.PI) - (Math.abs(camera.alpha) % (Math.PI * 2));
		camera.alpha = camera.alpha % (Math.PI * 2);
		
		// Set the info for the camera animation
		animationDelta.alpha = (alpha - camera.alpha) / frameCount;
		animationDelta.beta = (beta - camera.beta) / frameCount;
		animationDelta.radius = (radius - camera.radius) / frameCount;
		animationDelta.x = (target.x - camera.target.x) / frameCount;
		animationDelta.y = (target.y - camera.target.y) / frameCount;
		animationDelta.z = (target.z - camera.target.z) / frameCount;
		
		// Lock camera at the end
		animationDelta.lockCamera = lockCamera;
		
		// Start the animation
		window.requestAnimationFrame(adjustCamera);
	}
	
	var adjustCamera = function() {
		// Alpha
		camera.alpha += animationDelta.alpha;
		camera.lowerAlphaLimit = camera.alpha;
		camera.upperAlphaLimit = camera.alpha;
		
		// Beta
		camera.beta += animationDelta.beta;
		camera.lowerBetaLimit = camera.beta;
		camera.upperBetaLimit = camera.beta;
		
		// Radius
		camera.radius += animationDelta.radius;
		camera.lowerRadiusLimit = camera.radius;
		camera.upperRadiusLimit = camera.radius;
		
		// Target
		camera.target = new BABYLON.Vector3(
			camera.target.x + animationDelta.x,
			camera.target.y + animationDelta.y,
			camera.target.z + animationDelta.z
		)
		
		// Decrement frame counter or end
		if (--frameCounter >= 0) {
			window.requestAnimationFrame(adjustCamera);
		} else if (!animationDelta.lockCamera) {
			// Fix camera limits to default
			camera.lowerAlphaLimit = null;
			camera.upperAlphaLimit = null;
			camera.lowerBetaLimit = 0.1;
			camera.upperBetaLimit = Math.PI / 2;
			camera.lowerRadiusLimit = 7.5;
			camera.upperRadiusLimit = 500;
		}
	}
	
	// Mouse events
	var onPointerDown = function (evt) {
        if (evt.button !== 0) {
            return;
        }
		
		var x = scene.pointerX;
		var y = scene.pointerY;
		circles.push({
			x: x,
			y: y,
			radius: 10,
			color: '255,255,0'
		});
		circles.push({
			x: x,
			y: y,
			radius: 20,
			color: '255,255,0'
		});
		for (var i = Math.random() * 5 + 3; i >= 0; --i) {
			addRandomParticle(x, y);
		}
		
		document.onselectstart = function() { return false; } // disable drag-select
		document.onmousedown = function() { return false; } // disable drag-select
		
		if (evt.button <= 1) {
			isDown = true;
		}
		
		if (enableGestures) {
			if (evt.button <= 1) {
				gesturesEnabled = true;
				if (strokeID == 0)	{
					points.length = 0;
				}
				points[points.length] = new Point(x, y, ++strokeID);
				var bctx = bufferCanv.getContext('2d');
				bctx.lineWidth = 3;
				bctx.moveTo(x, y);
				bctx.strokeStyle = '#ffffff';
				bctx.shadowBlur = 10;
				bctx.shadowColor = 'rgba(255,200,50,.25)';
				bctx.beginPath();
			} else if (evt.button == 2) {
			}
		}
		
		// check if we are under a mesh
        var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh !== pot; });
		if (pickInfo.hit && !enableGestures) {
			var mesh = pickInfo.pickedMesh;
			if (mesh.flowerPart && mesh.flowerPart !== 'ignore') {
				var info = mesh.cameraInfo;
				var target = new BABYLON.Vector3(
					mesh.position.x,
					mesh.position.y + info.yOffset,
					mesh.position.z
				);
				
				// Grab camera info for mesh
				var alpha = info.alpha;
				if (info.alpha == 0)
					alpha = (isInFront(camera.alpha))? Math.PI / 2: 3 * Math.PI / 2;
				var beta = Math.PI / 2;
				var radius = info.radius;
				
				rotateCameraTo(target, alpha, beta, radius, 0.75, true);
				
				var canvas = document.getElementById('gestures').className = 'active';
				clearStrokes();
				enableGestures = true;
			}
        }
    }

    var onPointerMove = function () {
		var x = scene.pointerX;
		var y = scene.pointerY;
        if (isDown) {
			for (var i = Math.random() * 2 + 1; i >= 0; --i) {
				addRandomParticle(x, y);
			}
			if (gesturesEnabled) {
				var point = new Point(x, y, strokeID);
				points[points.length] = point; // append
				drawLine(bufferCanv.getContext('2d'), points[points.length-2], point);
			}
		}
    }

    var onPointerUp = function (evt) {
        document.onselectstart = function() { return true; } // enable drag-select
		document.onmousedown = function() { return true; } // enable drag-select
		var x = scene.pointerX;
		var y = scene.pointerY;
		if (evt.button <= 1) {
			if (isDown) {
				isDown = false;
				gesturesEnabled = false;
				gestureCanv.getContext('2d').drawImage(bufferCanv, 0, 0);
			}
		} else if (evt.button == 2) {
			if (points.length >= 10){
				var result = recog.Recognize(points);
				console.log("Result: " + result.Name + " (" + (Math.round(result.Score * 100) / 100) + ").");
			} else {
				console.log("Too little input made. Please try again.");
			}
			clearStrokes();
		}
    }
	
	zoomOut = function() {
		// Hide gesture canvas
		var canvas = document.getElementById('gestures').className = '';
		clearStrokes();
		
		rotateCameraTo(DEFAULT_CAMERA_TARGET, camera.alpha,
			Math.PI / 3, 40, 0.75, false);
		enableGestures = false;
	}

    canvas.addEventListener("pointerdown", onPointerDown, false);
    canvas.addEventListener("pointerup", onPointerUp, false);
    canvas.addEventListener("pointermove", onPointerMove, false);
	
	// Ensure screen is sized correctly.
	engine.resize();
	
	onLoadEvent();
});
