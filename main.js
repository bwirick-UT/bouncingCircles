import { Circle } from "./circle.js";
import {initShaderProgram} from "./shader.js";

const canvas = document.getElementById('glcanvas');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;
const gl = canvas.getContext('webgl');

main();
async function main() {
	console.log('This is working');
	//
	// iOS permissions for accelerometer
	//
	if (
		DeviceOrientationEvent &&
		typeof DeviceOrientationEvent.requestPermission === "function"
	) {
		console.log("Device orientation permission is supported");

		const button = document.createElement("button");
		button.innerText = "Enable Device Orientation";
		document.body.appendChild(button);

		button.addEventListener("click", function () {
			console.log("Button clicked, requesting permission");

			DeviceOrientationEvent.requestPermission()
			.then((permissionState) => {
				console.log("Permission state:", permissionState);
				if (permissionState === "granted") {
					window.addEventListener("deviceorientation", handleOrientation, true);
					button.style.display = "none";
				} else {
					alert("Device orientation permission is not granted");
				}
			})
			.catch(console.error)
		});
	} else {
		console.log("Device orientation permission is not required, listening directly.");
		window.addEventListener("deviceorientation", handleOrientation, true);
	}

	let gravity = [0, 0];
	// if (!(window.DeviceOrientationEvent == undefined)) {
	// 	window.addEventListener("deviceorientation", handleOrientation);
	// }
	function handleOrientation(event) {
        if (event.alpha === null || event.beta === null || event.gamma === null) {
            console.log("Orientation data is not available.");
            gravity[0] = 0;
            gravity[1] = -1;
        } else {
			// Because we don't want to have the device upside down
			// We constrain the x value to the range [-90,90]
            let x = event.beta; // In degree in the range [-180,180)
            let y = event.gamma; // In degree in the range [-90,90)
            if (x > 90) x = 90;
            if (x < -90) x = -90;
            gravity[0] = y / 90; // -1 to +1
            gravity[1] = -x / 90; // flip y upside down.
        }
        console.log("Gravity values:", gravity);
    }

	//
	// Init gl
	// 
	const canvas = document.getElementById('glcanvas');
	const gl = canvas.getContext('webgl');

	if (!gl) {
		alert('Your browser does not support WebGL');
	}

	gl.clearColor(0.75, 0.85, 0.8, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//
	// Create shaderProgram
	// 
	const vertexShaderText = await (await fetch("simple.vs")).text();
    const fragmentShaderText = await (await fetch("simple.fs")).text();
	let shaderProgram = initShaderProgram(gl, vertexShaderText, fragmentShaderText);
	gl.useProgram(shaderProgram);


	//
	// Set Uniform uProjectionMatrix
	//	
	const projectionMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
	const aspect = canvas.clientWidth / canvas.clientHeight;
	const projectionMatrix = mat4.create();
	const yhigh = 10;
	const ylow = -yhigh;
	const xlow = ylow * aspect;
	const xhigh = yhigh * aspect;
	mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
	gl.uniformMatrix4fv(
		projectionMatrixUniformLocation,
		false,
		projectionMatrix
	);

	//
	// Create the objects in the scene:
	//
	const NUM_CIRCLES = 7;
	const circleList = [];
	for (let i = 0; i < NUM_CIRCLES; i++) {
		const newCircle = createNonOverlappingCircle(xlow, xhigh, ylow, yhigh, circleList);
		if (newCircle) {
			circleList.push(newCircle);
		} else {
			console.warn("Couldn't place circle without overlap.");
		}
	}

	//
	// Function to ensure no overlapping circles spawn
	//
	function createNonOverlappingCircle(xlow, xhigh, ylow, yhigh, circleList) {
		const MAX_TRIES = 100;
		let newCircle;
		let validCircle = false;
		let attempts = 0;
	
		while (!validCircle && attempts < MAX_TRIES) {
			newCircle = new Circle(xlow, xhigh, ylow, yhigh);
			validCircle = true;
	
			for (const circle of circleList) {
				const dx = circle.x - newCircle.x;
				const dy = circle.y - newCircle.y;
				const distanceSquared = dx * dx + dy * dy;
				const minDistance = circle.radius + newCircle.radius;
	
				if (distanceSquared < minDistance * minDistance) {
					validCircle = false;
					break;
				}
			}
			attempts++;
		}
	
		if (validCircle) {
			return newCircle;
		} else {
			console.warn("Failed to place a non-overlapping circle after multiple attempts.");
			return null;
		}
	}
	

	//
	// Main render loop
	//
	let previousTime = 0;
	function redraw(currentTime) {
		currentTime*= .001; // milliseconds to seconds
		let DT = currentTime - previousTime;
		previousTime = currentTime;
		if(DT > .1){
			DT = .1;
		}

		for (let i = 0; i < circleList.length; i++) {
			const circle = circleList[i];
			if (isNaN(circle.x) || isNaN(circle.y) || isNaN(circle.dx) || isNaN(circle.dy)) {
				console.error("NaN detected in circle:", circle);
				return;  // Stop the redraw if NaN is found
			}
		}
	
		// Clear the canvas before we start drawing on it.
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		for (let i = 0; i < circleList.length; i++) {
			//console.log("There is gravity")
			circleList[i].updateForces(gravity);
		}

		for ( let i = 0; i < circleList.length; i++) {
			for (let j = 0; j < circleList.length; j++) {
				circleList[j].updateCollisions(DT, circleList, j)
			}
		}

		// Update the scene
		for (let i = 0; i < circleList.length; i++) {
			circleList[i].updatePos(DT);
		}

		// Draw the scene
		for (let i = 0; i < circleList.length; i++) {
			circleList[i].draw(gl, shaderProgram);
		}
	  
	
		requestAnimationFrame(redraw);
	  }	
	  requestAnimationFrame(redraw);
};

