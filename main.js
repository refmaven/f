import * as WebGLUtils from './webgl2-utils.js'; // Adjust the path as needed

// Define GLSL source code for vertex and fragment shaders

const vertexShaderSource = `#version 300 es
  in vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `#version 300 es
  precision highp float;
  out vec4 fragColor;
  void main() {
    if (mod(floor(gl_FragCoord.x / 10.0) + floor(gl_FragCoord.y / 10.0), 2.0) == 0.0) {
      fragColor = vec4(1.0, 1.0, 1.0, 1.0);  // White
    } else {
      fragColor = vec4(0.0, 0.0, 0.0, 1.0);  // Black
    }
  }
`;

function create2DGrid(gl) {
  // Create a buffer for a simple 2D grid
  const gridVertices = new Float32Array([
    -1.0, -1.0, // Bottom left
    1.0, -1.0, // Bottom right
    -1.0, 1.0, // Top left
    1.0, 1.0 // Top right
  ]);

  const vertexBuffer = WebGLUtils.createBuffer(gl, gridVertices);

  // Create an index buffer for two triangles (forming a rectangle)
  const indices = new Uint16Array([0, 1, 2, 1, 3, 2]);
  const indexBuffer = WebGLUtils.setIndexBuffer(gl, indices);

  return { vertexBuffer, indexBuffer, indexCount: indices.length };
}

function main() {
  // Get WebGL2 context
  const canvas = document.getElementById('canvas');
  const gl = WebGLUtils.getGLContext('canvas');

  // Create shader program
  const program = WebGLUtils.createProgram(gl, vertexShaderSource, fragmentShaderSource);

  // Create grid (it represents the background for the 10PRINT pattern)
  const { vertexBuffer, indexBuffer, indexCount } = create2DGrid(gl);

  // Rendering loop
  function render() {
    // Clear the canvas and set up the viewport
    WebGLUtils.clear(gl, 0.1, 0.1, 0.1, 1.0); // Dark background color

    // Use the shader program
    gl.useProgram(program);

    // Set up vertex and index buffers
    WebGLUtils.setAttribute(gl, program, vertexBuffer, 'a_position', 2);

    // Bind index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Draw the grid (which will render the 10PRINT pattern)
    WebGLUtils.draw(gl, gl.TRIANGLES, indexCount);

    // Keep rendering
    requestAnimationFrame(render);
  }

  // Start the rendering loop
  render();
}

main();