import { collideParticles } from "./collisions.js";

class Circle {
    constructor(xlow, xhigh, ylow, yhigh) { // make the circles inside these World Coordinates
        this.xlow = xlow;
        this.xhigh = xhigh;
        this.ylow = ylow;
        this.yhigh = yhigh;
        this.color = [Math.random(), Math.random(), Math.random(), 1];
        this.radius = 1.0 + Math.random(); // Radius between 1.0 and 2.0
        const minx = xlow + this.radius;
        const maxx = xhigh - this.radius;
        this.x = minx + Math.random() * (maxx - minx);
        const miny = ylow + this.radius;
        const maxy = yhigh - this.radius;
        this.y = miny + Math.random() * (maxy - miny);
        this.dx = Math.random() * 2 + 2; // Speed in x-direction (2 to 4)
        if (Math.random() > 0.5) this.dx = -this.dx;
        this.dy = Math.random() * 2 + 2; // Speed in y-direction (2 to 4)
        if (Math.random() > 0.5) this.dy = -this.dy;
    }

    updateCollisions(DT, circleList, me) {
        if (this.x + this.dx * DT + this.radius > this.xhigh) {
            this.dx = -Math.abs(this.dx); // *.999 to increase wall friction
        }
        if (this.x + this.dx * DT - this.radius < this.xlow) {
            this.dx = Math.abs(this.dx);
        }
        if (this.y + this.dy * DT + this.radius > this.yhigh) {
            this.dy = -Math.abs(this.dy);
        }
        if (this.y + this.dy * DT - this.radius < this.ylow) {
            this.dy = Math.abs(this.dy);
        }

        for (let j = me +1; j < circleList.length; j++) {
            const myR = this.radius;
            const myX = this.x;
            const myY = this.y;
            const myDX = this.dx;
            const myDY = this.dy;
            const myNextX = myX + myDX*DT;
            const myNextY = myY + myDY*DT;

            const otherR = circleList[j].radius;
            const otherX = circleList[j].x;
            const otherY = circleList[j].y;
            const otherDX = circleList[j].dx;
            const otherDY = circleList[j].dy;
            const otherNextX = otherX + otherDX*DT;
            const otherNextY = otherY + otherDY*DT;
            const dsquared = (otherNextX-myNextX)**2 + (otherNextY - myNextY)**2;
            if (dsquared < (otherR+myR)**2) {
                const COLLISION_FRICTION = .99;
                collideParticles(this, circleList[j], DT, COLLISION_FRICTION);
            }
        }
    }

    updateForces(gravity) {
        // Air Friction
        this.dy *= .99;
        this.dx *= .99;

        // Gravity
        // const G = -0.1;
        // this.dy += G;
        const G = 0.1;
        this.dx += gravity[0] * G;
        this.dy += gravity[1] * G;
    }

    // updateForces(gravity) {
    //     // Air Friction
    //     this.dx *= 0.99;
    //     this.dy *= 0.99;

    //     for (let i = 0.0; i < gravity.length; i++) {
    //         console.log("inside updateForces: ", gravity[i])
    //     }
    //     // Gravity
    //     const G = 0.1;
    //     console.log("gravity[0]: ", gravity[0])
    //     this.dx += gravity[0] * G;
    //     this.dy += gravity[1] * G;
    
    //     // Cap maximum speed to avoid runaway velocities
    //     const MAX_SPEED = 5.0;
    //     this.dx = Math.max(-MAX_SPEED, Math.min(this.dx, MAX_SPEED));
    //     this.dy = Math.max(-MAX_SPEED, Math.min(this.dy, MAX_SPEED));
    // }
    
    
    updatePos(DT)  {
        this.x += this.dx * DT;
        this.y += this.dy * DT;
    }

    draw(gl, shaderProgram) {
        drawCircle(gl, shaderProgram, this.color, 0, this.x, this.y, this.radius);
    }
}

function drawCircle(gl, shaderProgram, color, degrees, x, y, radius) {
    // Generate circle vertices
    const NUM_SEGMENTS = 100;
    const vertices = [0, 0]; // Center of the circle
    for (let i = 0; i <= NUM_SEGMENTS; i++) {
        const angle = (i / NUM_SEGMENTS) * 2 * Math.PI;
        vertices.push(Math.cos(angle), Math.sin(angle));
    }

    //
    // Create the vertexBufferObject
    //
    const vertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    //
    // Set Vertex Attributes
    //
    const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'vertPosition');
    gl.vertexAttribPointer(
        positionAttribLocation, // Attribute location
        2, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT, // radius of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    //
    // Set Uniform uColor
    //
    const colorUniformLocation = gl.getUniformLocation(shaderProgram, "uColor");
    gl.uniform4fv(colorUniformLocation, color);

    //
    // Set Uniform uModelViewMatrix
    //
    const modelViewMatrixUniformLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [x, y, 0]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [radius, radius, 1]);
    gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);

    //
    // Starts the Shader Program, which draws the current object to the screen.
    //
    gl.drawArrays(gl.TRIANGLE_FAN, 0, NUM_SEGMENTS + 2);
}


export { Circle, drawCircle };