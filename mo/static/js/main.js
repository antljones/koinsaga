function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}


docReady(function() {
	const canvas = document.getElementById("renderCanvas");
	const engine = new BABYLON.Engine(canvas,true);
	const scene = new BABYLON.Scene(engine);

	var currentCamera = null;

	window.addEventListener("resize", function () {
		engine.resize();
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	});

	load_menu_environment();

	// load socket.io
	const socket = io();


socket.io.on("error", (error) => {
	console.log("Could not connect to server");
});

//-------------------------------------------------
//camera shots
/*
 * Universal Camera - the one to choose for first person shooter type games, and works with all the keyboard, mouse, touch and gamepads. With this camera you can check for collisions and apply gravity.

Arc Rotate Camera - which acts like a satellite in orbit around a target and always points towards the target position.

Follow Camera - this takes a mesh as a target and follows it as it moves. Both a free camera version followCamera and an arc rotate version arcFollowCamera are available.
*/
//-------------------------------------------------
function incremental_crane_shot(canvas,  name, speedAndAcceleration, transparentTextureURL) {
	// Parameters: name, position, scene
var camera = new BABYLON.FollowCamera(name, new BABYLON.Vector3(0, 10, -10), scene);

// The goal distance of camera from target
camera.radius = 30;

// The goal height of camera above local origin (centre) of target
camera.heightOffset = 10;

// The goal rotation of camera around local origin (centre) of target in x y plane
camera.rotationOffset = 0;

// Acceleration of camera in moving from current to goal position
camera.cameraAcceleration = speedAndAcceleration;

// The speed at which acceleration is halted
camera.maxCameraSpeed = speedAndAcceleration;

//create an invisible plane to act as the target mesh
const targetMesh = BABYLON.MeshBuilder.CreatePlane("plane", {size: 1, width: 5, height: 1, updatable: false}, scene);
var transparentMaterial = new BABYLON.StandardMaterial(transparentTextureURL, scene);
	transparentMaterial.diffuseTexture = new BABYLON.Texture(transparentTextureURL, scene);
	//transparentMaterial.alpha = 0.5;
	transparentMaterial.diffuseTexture.hasAlpha = true;
	//transparentMaterial.useAlphaFromDiffuseTexture = true;
	targetMesh.material = transparentMaterial;
// This attaches the camera to the canvas
//camera.attachControl(canvas, true);
	

	//reposition the plane

// targetMesh created here.
camera.lockedTarget = targetMesh; //version 2.5 onwards

scene.activeCamera = camera;
}

function point_shot() {
}

function top_view_shot(name, transparentTextureURL, cameraX, cameraY, cameraZ, positionX, positionY, positionZ, cameraMaxSpeed) {
        
	var camera = new BABYLON.FollowCamera(name, new BABYLON.Vector3(cameraX, cameraY, cameraZ), scene);

	//create an invisible plane to act as the target mesh
       	var cameraMesh = BABYLON.MeshBuilder.CreatePlane("plane", {size: 1, width: 1, height: 1, updatable: false}, scene);
	cameraMesh.position.x = positionX;
	cameraMesh.position.y = positionY;
	cameraMesh.position.z = positionZ;
	var transparentMaterial = new BABYLON.StandardMaterial(transparentTextureURL, scene);
        transparentMaterial.diffuseTexture = new BABYLON.Texture(transparentTextureURL, scene);
        //transparentMaterial.alpha = 0.5;
        transparentMaterial.diffuseTexture.hasAlpha = true;
        //transparentMaterial.useAlphaFromDiffuseTexture = true;
        cameraMesh.material = transparentMaterial;
	
	//set the camera at a stable distance from the target mesh
	// The goal distance of camera from target is the distance
	// between targetMesh vector and camera vector
	camera.radius = Math.sqrt( Math.pow(cameraMesh.position.x - cameraX,2) + Math.pow(cameraMesh.position.y - cameraY,2) + Math.pow(cameraMesh.position.y - cameraY,2)  );

	// The goal height of camera above local origin (centre) of target
	camera.heightOffset = cameraY-cameraMesh.position.y;

	// The goal rotation of camera around local origin (centre) of target in x y plane
	camera.rotationOffset = 0.0;

	// Acceleration of camera in moving from current to goal position
	camera.cameraAcceleration = 0.1;

	// The speed at which acceleration is halted
	camera.maxCameraSpeed = cameraMaxSpeed;

// This attaches the camera to the canvas
//camera.attachControl(canvas, true);


//reposition the plane

// targetMesh created here.
	camera.lockedTarget = cameraMesh; //version 2.5 onwards

	scene.activeCamera = camera;

	return cameraMesh;

}

//------------------------------------------------
// camera positions
// -----------------------------------------------


//------------------------------------------------
// global scene variables
//------------------------------------------------

//------------------------------------------------
// socket.io messages
//------------------------------------------------
socket.on("connect", () => {

	console.log("socket connected: " + socket.connected);
	// Handle front menu events

	document.getElementById('newgamebutton').addEventListener('click', (event) => {
		socket.emit("game_data", '{"event": "new_game"}');
		console.log("new game event fired");
//		start_game(currentCamera);
	});

	//handle the games events
	
	socket.on("game_event", (eventId) => {
		socket.emit("event_call", eventId);
	});
	
	socket.on("event_response", (eventRes) => {
		handleResponse(JSON.parse(eventRes));
	});
	
});

// Handle game events 
function handleResponse(jsonData) {

	switch(jsonData.event_type) {
		case "new_game":
			notify_save_id(jsonData.save_id);
			start_game();
			break;
	}
}

function notify_save_id(saveId) {
}

function start_game() {
	//hide the menu
	document.getElementById('menu').hidden = true;
	document.getElementById('menuitems').hidden = true;

	const mesh1 = BABYLON.MeshBuilder.CreateBox("box", {size:3}, scene);
	mesh1.position.x = 10.0;
	mesh1.position.y = 0.0;
	mesh1.position.z = 0.0;

	const mesh2 = BABYLON.MeshBuilder.CreateBox("box2", {size:3}, scene);
        mesh2.position.x = 0.0;
        mesh2.position.y = 10.0;
        mesh2.position.z = 0.0;

	const mesh3 = BABYLON.MeshBuilder.CreateBox("box3", {size: 3}, scene);
	mesh3.position.x = 0.0;
	mesh3.position.y = 0.0;
	mesh3.position.z = 10.0;

	const mesh4 = BABYLON.MeshBuilder.CreateBox("box4", {size: 3}, scene);
        mesh4.position.x = 0.0;
        mesh4.position.y = 0.0;
        mesh4.position.z = 0.0;

	top_view_shot( "topviewcamera", "textures/transparenttexture.png",0.0, 40.0, 0.0, 0,0,0,1); 
	
	var materialRed = new BABYLON.StandardMaterial(scene);
	materialRed.alpha = 1;
	materialRed.diffuseColor = new BABYLON.Color3(1, 0, 0);
	mesh1.material = materialRed;

	var materialGreen = new BABYLON.StandardMaterial(scene);
	materialGreen.alpha = 1;
	materialGreen.diffuseColor = new BABYLON.Color3(0, 1, 0);
	mesh2.material = materialGreen;

	var materialBlue = new BABYLON.StandardMaterial(scene);
	materialBlue.alpha = 1;
	materialBlue.diffuseColor = new BABYLON.Color3(0, 0, 1);
	mesh3.material = materialBlue;

	var materialBlack = new BABYLON.StandardMaterial(scene);
        materialBlack.alpha = 1;
        materialBlack.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        mesh4.material = materialBlack;

//	load_all_nodes_in_file(JSON.parse('{"modelLocation": "/models/", "fileName": "anime_character.glb"}'));

}

function load_scene() {

}

//JSONMData = JSON Model Data
function load_all_nodes_in_file(JSONMData) {
	const nodes = BABYLON.SceneLoader.ImportMesh(null,JSONMData.modelLocation,JSONMData.fileName, scene, (meshes) => {
		console.log('loaded meshes: ' + meshes);
	});

	return nodes;
}

async function load_all_meshes_in_file_async(JSONMData) {
	const result = await BABYLON.SceneLoader.ImportMeshAsync(null,JSONMData.modelLocation,JSONMData.fileName, scene);

	return result;
}


function load_menu_environment() {
	canvas.width= window.innerWidth;
	canvas.height=window.innerHeight;

	currentCamera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

	currentCamera.setTarget(BABYLON.Vector3.Zero());
	currentCamera.attachControl(canvas, true);

	scene.activeCamera = currentCamera;

	const light = new BABYLON.HemisphericLight("light",
		new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.7;

        /*const ground = BABYLON.MeshBuilder.CreateGround("ground",
        {width: window.innerWidth, height: window.innerHeight}, scene);*/

        engine.runRenderLoop(function () {
               scene.render();
        });
}

}); //end docReady


