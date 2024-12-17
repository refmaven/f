/**
 * WebGL utility functions
 */
const glHelp = {

  /**
   * Retrieves a WebGL2 rendering context from the specified canvas element.
   * @param {string} canvasID - The ID of the HTML canvas element.
   * @returns {WebGL2RenderingContext} The WebGL2 rendering context.
   * @throws {Error} If WebGL2 is not supported by the browser.
   */
  getGLContext: function(canvasID) {
    const canvas = document.getElementById(canvasID);
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      throw new Error("WebGL2 is not supported by your browser.");
    }
    return gl;
  },

  /**
   * Creates and compiles a shader from GLSL source code.
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @param {string} source - The GLSL source code for the shader.
   * @param {number} type - The type of shader (VERTEX_SHADER or FRAGMENT_SHADER).
   * @returns {WebGLShader} The compiled shader.
   * @throws {Error} If shader compilation fails.
   */
  createShader: function(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(`Shader compilation error: ${gl.getShaderInfoLog(shader)}`);
    }
    return shader;
  },

  /**
   * Creates a shader program by compiling shaders and linking them.
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @param {string} vertexSource - The GLSL source code for the vertex shader.
   * @param {string} fragmentSource - The GLSL source code for the fragment shader.
   * @returns {WebGLProgram} The linked shader program.
   * @throws {Error} If program linking fails.
   */
  createProgram: function(gl, vertexSource, fragmentSource) {
    const vertexShader = this.createShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = this.createShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program linking error: ${gl.getProgramInfoLog(program)}`);
    }
    return program;
  },

  /**
   * Creates a buffer and fills it with data for vertex attributes.
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @param {TypedArray} data - The data to store in the buffer.
   * @param {number} [usage=gl.STATIC_DRAW] - The intended usage of the buffer.
   * @returns {WebGLBuffer} The created buffer.
   */
  createBuffer: function(gl, data, usage = gl.STATIC_DRAW) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    return buffer;
  },

  /**
   * Sets the value of a uniform variable in the shader program.
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @param {WebGLProgram} program - The shader program.
   * @param {string} uniformName - The name of the uniform variable in the shader.
   * @param {string} type - The type of the uniform (e.g., "1f", "2fv", "mat4").
   * @param {number|TypedArray} value - The value to set for the uniform.
   */
  setUniform: function(gl, program, uniformName, type, value) {
    const location = gl.getUniformLocation(program, uniformName);

    const uniformFunctions = {
      '1f': (location, value) => gl.uniform1f(location, value),
      '2fv': (location, value) => gl.uniform2fv(location, value),
      '3fv': (location, value) => gl.uniform3fv(location, value),
      '4fv': (location, value) => gl.uniform4fv(location, value),
      'mat4': (location, value) => gl.uniformMatrix4fv(location, false, value),
    };

    if (uniformFunctions[type]) {
      uniformFunctions[type](location, value);
    } else {
      throw new Error(`Unsupported uniform type: ${type}`);
    }
  },

  /**
   * Clears the color and depth buffers with the specified color.
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @param {number} [r=0] - The red component of the clear color.
   * @param {number} [g=0] - The green component of the clear color.
   * @param {number} [b=0] - The blue component of the clear color.
   * @param {number} [a=1] - The alpha component of the clear color.
   */
  clear: function(gl, r = 0, g = 0, b = 0, a = 1) {
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  },

  /**
   * Resizes the canvas to match the display size and updates the WebGL viewport.
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   */
  resizeCanvas: function(gl) {
    const canvas = gl.canvas;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
  },

  /**
   * Draws primitives from the current buffer.
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @param {number} mode - The drawing mode (e.g., gl.TRIANGLES, gl.LINES).
   * @param {number} count - The number of vertices or elements to draw.
   * @param {number} [type=gl.UNSIGNED_SHORT] - The type of indices (for gl.drawElements).
   */
  draw: function(gl, mode, count, type = gl.UNSIGNED_SHORT) {
    const drawFunction = gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING) ?
      gl.drawElements :
      gl.drawArrays;

    drawFunction(mode, count, type, 0);
  },

  /**
   * Creates and binds a new Vertex Array Object (VAO).
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @returns {WebGLVertexArrayObject} The created VAO.
   */
  createVAO: function(gl) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    return vao;
  },

  /**
   * Renders the scene, resizing the canvas, clearing the screen, and drawing objects.
   * @param {WebGL2RenderingContext} gl - The WebGL context.
   * @param {WebGLProgram} program - The shader program to use for drawing.
   * @param {Array} shapes - An array of objects containing vertex and index buffers, along with the count.
   */
  render: function(gl, program, shapes) {
    this.resizeCanvas(gl);
    this.clear(gl, 0.1, 0.1, 0.1, 1.0); // Set the clear color to a dark gray

    gl.useProgram(program);

    for (let { vertexBuffer, indexBuffer, indexCount } of shapes) {
      // Set the vertex buffer (attributes)
      this.setAttribute(gl, program, vertexBuffer, 'a_position', 2); // Assuming a 2D position attribute

      // Bind the index buffer
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

      // Draw the elements (or vertices)
      this.draw(gl, gl.TRIANGLES, indexCount);
    }

    requestAnimationFrame(() => this.render(gl, program, shapes));
  }
};

// Export all functions together
export default WebGLUtils;