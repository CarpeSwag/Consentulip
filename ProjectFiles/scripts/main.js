/**
* Gesture control
**/
//
// Startup
//
var isDown, points, strokeID, recog, iter, circles; // global variables
var circleCanv, gestureCanv;

function onLoadEvent() {
	points = new Array(); // point array for current stroke
	strokeID = 0;
	recog = new PDollarRecognizer();
	isDown = false;
	
	var gestures = document.getElementById('gestures');
	var ctx = gestures.getContext('2d');
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	circleCanv = document.createElement('canvas');
	var sctx = circleCanv.getContext('2d');
	sctx.canvas.width = window.innerWidth;
	sctx.canvas.height = window.innerHeight;
	gestureCanv = document.createElement('canvas');
	var gctx = gestureCanv.getContext('2d');
	gctx.canvas.width = window.innerWidth;
	gctx.canvas.height = window.innerHeight;
	
	iter = 0;
	circles = [];
	window.requestAnimationFrame(draw);
}

//
// Mouse Events
//
function mouseDownEvent(x, y, button) {
	document.onselectstart = function() { return false; } // disable drag-select
	document.onmousedown = function() { return false; } // disable drag-select
	if (button <= 1)
	{
		isDown = true;
		if (strokeID == 0)	{
			points.length = 0;
		}
		points[points.length] = new Point(x, y, ++strokeID);
		var gctx = gestureCanv.getContext('2d');
		gctx.lineWidth = 3;
		gctx.moveTo(x, y);
		gctx.strokeStyle = '#ffffff';
		console.log("Recording stroke #" + strokeID + "...");
		gctx.beginPath();
		
		circles.unshift({
			x: x,
			y: y,
			radius: 10,
			color: '255,255,0'
		});
	}
	else if (button == 2) {
		console.log("Recognizing gesture...");
	}
}

function mouseMoveEvent(x, y, button) {
	if (isDown) {
		var point = new Point(x, y, strokeID);
		points[points.length] = point; // append
		drawLine(gestureCanv.getContext('2d'), points[points.length-2], point);
	}
}

function mouseUpEvent(x, y, button) {
	document.onselectstart = function() { return true; } // enable drag-select
	document.onmousedown = function() { return true; } // enable drag-select
	if (button <= 1) {
		if (isDown) {
			isDown = false;
			console.log("Stroke #" + strokeID + " recorded.");
			var context = document.getElementById('gestures').getContext('2d');
			context.closePath();
		}
	} else if (button == 2) {
		if (points.length >= 10){
			var result = recog.Recognize(points);
			console.log("Result: " + result.Name + " (" + (Math.round(result.Score * 100) / 100) + ").");
		} else {
			console.log("Too little input made. Please try again.");
		}
		clearStrokes();
	}
}

function drawLine(ctx, a, b) {
	ctx.lineTo(b.X, b.Y);
	var width = Math.sqrt(Math.pow(a.X - b.X, 2) + Math.pow(a.Y - b.Y, 2));
	ctx.lineWidth = 3 - (3 * (width/100));
	
	ctx.stroke();
}

function clearStrokes() {
	points.length = 0;
	strokeID = 0;
	var ctx = document.getElementById('gestures').getContext('2d');
	ctx.closePath();
	var sctx = circleCanv.getContext('2d');
	var gctx = gestureCanv.getContext('2d');
	
	// Clear the canvas
	ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	sctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	gctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	console.log("Canvas cleared.");
}

function createCircle(ctx, x, y, rad, col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();
}

function draw() {
	var THRESHOLD = 40;
	var canvas = document.getElementById('gestures');
	var ctx = canvas.getContext('2d');
	var sctx = circleCanv.getContext('2d');
	var gctx = gestureCanv.getContext('2d');
	
	// Clear the canvas
	ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	sctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	
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
	
	if (points.length > 0) {
		gctx.shadowBlur = 7 - Math.random() * 3;
		var red   = 255;
		var green = Math.round(Math.random() * 120 + 135);
		var blue  = Math.round(Math.random() * 200);
		var rgb = red + ',' + green + ',' + blue;
		gctx.shadowColor = 'rgba(' + rgb + ',1)';
		gctx.stroke();
	}
	
	ctx.drawImage(gestureCanv, 0, 0);
	ctx.drawImage(circleCanv, 0, 0);
	window.requestAnimationFrame(draw);
}


/**
* Babylon Things
**/

window.addEventListener('DOMContentLoaded', function() {
	var canvas = document.getElementById('renderCanvas');
	var engine = new BABYLON.Engine(canvas, true);
	var scene = new BABYLON.Scene(engine);
	
	// Engine functions
	window.addEventListener('resize', function() {
		engine.resize();
		var width = window.innerWidth;
		var height = window.innerHeight;
		var canvases = [document.getElementById('gestures'), circleCanv, gestureCanv];
		
		for (var i = 0; i < canvases.length; ++i) {
			var ctx = canvases[i].getContext('2d');
			ctx.canvas.width = width;
			ctx.canvas.height = height;
		}
	});
	
	engine.runRenderLoop(function() {
		scene.render();
	});
	
	// Populate the scene
	var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 4,
		Math.PI / 3, 10, new BABYLON.Vector3(0,1,0), scene);
	camera.upperBetaLimit = Math.PI / 2;
	camera.lowerRadiusLimit = 7.5;
	camera.upperRadiusLimit = 500;
	camera.attachControl(canvas, true, true);

	var light = new BABYLON.HemisphericLight("light",
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

	var ground = BABYLON.Mesh.CreateGround("ground", 3, 3, 2, scene);	
	scene.clearColor = new BABYLON.Color3(.1, .1, .1);
	
	// Ensure screen is sized correctly.
	engine.resize();
	
	onLoadEvent();
});
