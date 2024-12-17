const GLHelp = {
  /**
   * Retrieves a WebGL2 rendering context from the specified canvas element.
   * @param {string} canvasID - The ID of the HTML canvas element.
   * @returns {WebGL2RenderingContext} The WebGL2 rendering context.
   * @throws {Error} If WebGL2 is not supported by the browser.
   */
  getGLContext(canvasID) {
    const canvas = document.getElementById(canvasID);
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      throw new Error("WebGL2 is not supported by your browser.");
    }
    return gl;
  },

  /**
   * Compiles vertex and fragment shaders and links them into a shader program.
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @param {string} vertexSource - GLSL source code for the vertex shader.
   * @param {string} fragmentSource - GLSL source code for the fragment shader.
   * @returns {WebGLProgram} The created shader program.
   * @throws {Error} If there’s an issue compiling shaders or linking the program.
   */
  createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(program);
      throw new Error(`Program linking error: ${error}`);
    }

    return program;
  },

  /**
   * Compiles a shader of the specified type (vertex or fragment) from GLSL source code.
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @param {number} type - The type of shader to compile (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
   * @param {string} source - GLSL source code for the shader.
   * @returns {WebGLShader|null} The compiled shader, or null if there was an error.
   * @throws {Error} If there’s a problem compiling the shader.
   */
  compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      const shaderType = type === gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT";
      console.error(`${shaderType} SHADER ERROR: ${error}`);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  },

  /**
   * Creates and fills a buffer with data for vertex attributes (position, color, etc.).
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @param {TypedArray} data - The data to store in the buffer.
   * @param {number} [usage=gl.STATIC_DRAW] - The intended usage of the buffer.
   * @returns {WebGLBuffer} The created buffer.
   */
  createBuffer(gl, data, usage = gl.STATIC_DRAW) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    return buffer;
  },

  /**
   * Creates and fills an index buffer with data for element indices in drawing.
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @param {TypedArray} data - The index data.
   * @param {number} [usage=gl.STATIC_DRAW] - The intended usage of the buffer.
   * @returns {WebGLBuffer} The created index buffer.
   */
  setIndexBuffer(gl, data, usage = gl.STATIC_DRAW) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, usage);
    return buffer;
  },

  /**
   * Binds a buffer to a shader attribute and sets up its pointer.
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @param {WebGLProgram} program - The shader program to use.
   * @param {WebGLBuffer} buffer - The buffer holding attribute data.
   * @param {string} attributeName - The name of the attribute in the shader program.
   * @param {number} size - The number of components per attribute (e.g., 2 for a vec2).
   * @param {number} [type=gl.FLOAT] - The data type of the attribute.
   * @param {number} [stride=0] - The stride between consecutive attributes in the buffer.
   * @param {number} [offset=0] - The offset to the first component of the first attribute.
   */
  setAttribute(gl, program, buffer, attributeName, size, type = gl.FLOAT, stride = 0, offset = 0) {
    const location = gl.getAttribLocation(program, attributeName);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(location, size, type, false, stride, offset);
    gl.enableVertexAttribArray(location);
  },

  /**
   * Sets the value of a uniform variable in the shader program.
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @param {WebGLProgram} program - The shader program.
   * @param {string} uniformName - The name of the uniform variable in the shader.
   * @param {string} type - The type of the uniform (e.g., "1f", "2fv", "mat4").
   * @param {number|TypedArray} value - The value to set for the uniform.
   * @throws {Error} If the uniform type is unsupported.
   */
  setUniform(gl, program, uniformName, type, value) {
    const location = gl.getUniformLocation(program, uniformName);

    switch (type) {
      case "1f":
        gl.uniform1f(location, value);
        break;
      case "2fv":
        gl.uniform2fv(location, value);
        break;
      case "3fv":
        gl.uniform3fv(location, value);
        break;
      case "4fv":
        gl.uniform4fv(location, value);
        break;
      case "mat4":
        gl.uniformMatrix4fv(location, false, value);
        break;
      default:
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
  clear(gl, r = 0, g = 0, b = 0, a = 1) {
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  },

  /**
   * Draws primitives (either using gl.drawArrays or gl.drawElements) from the current buffer.
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @param {number} mode - The drawing mode (e.g., gl.TRIANGLES, gl.LINES).
   * @param {number} count - The number of vertices or elements to draw.
   * @param {number} [type=gl.UNSIGNED_SHORT] - The type of indices (for gl.drawElements).
   */
  draw(gl, mode, count, type = gl.UNSIGNED_SHORT) {
    if (gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING)) {
      gl.drawElements(mode, count, type, 0);
    } else {
      gl.drawArrays(mode, 0, count);
    }
  },

  /**
   * Creates and binds a new Vertex Array Object (VAO).
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   * @returns {WebGLVertexArrayObject} The created VAO.
   */
  createVAO(gl) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    return vao;
  },

  /**
   * Resizes the canvas to match the display size and updates the WebGL viewport.
   * @param {WebGL2RenderingContext} gl - The WebGL2 rendering context.
   */
  resizeCanvas(gl) {
    const canvas = gl.canvas;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
  }
};
export default GLHelp;