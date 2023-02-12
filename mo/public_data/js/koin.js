// Get the canvas DOM element
$(document).ready(function() {
	var canvas = document.getElementById('renderCanvas');
	// Load the 3D engine
	var engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
	// CreateScene function that creates and return the scene
	var createScene = function () {
		// This creates a basic Babylon Scene object (non-mesh)
		var scene = new BABYLON.Scene(engine);

		// This creates and positions a free camera (non-mesh)
		var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

		// This targets the camera to scene origin
		camera.setTarget(BABYLON.Vector3.Zero());

		// This attaches the camera to the canvas
		camera.attachControl(canvas, true);

		// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
		var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

		// Default intensity is 1. Let's dim the light a small amount
		light.intensity = 0.7;

		// Our built-in 'sphere' shape.
		var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);

		// Move the sphere upward 1/2 its height
		sphere.position.y = 1;

		// Our built-in 'ground' shape.
		var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);

		return scene;
	};
	// call the createScene function
	var scene = createScene();
	// run the render loop
	engine.runRenderLoop(function(){
		scene.render();
	});
	// the canvas/window resize event handler
	window.addEventListener('resize', function(){
		engine.resize();
	});

});

