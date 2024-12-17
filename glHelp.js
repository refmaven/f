const glHelp = {
  getGLContext: function(canvasID) {
    const canvas = document.getElementById(canvasID);
    const gl = canvas.getContext("webgl2");
    if (!gl) {
      throw new Error("WebGL2 is not supported by your browser.");
    }
    return gl;
  },

  createProgram: function(gl, vertexSource, fragmentSource) {
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

  compileShader: function(gl, type, source) {
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

  createBuffer: function(gl, data, usage = gl.STATIC_DRAW) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    return buffer;
  },

  setIndexBuffer: function(gl, data, usage = gl.STATIC_DRAW) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, usage);
    return buffer;
  },

  setAttribute: function(gl, program, buffer, attributeName, size, type = gl.FLOAT, stride = 0, offset = 0) {
    const location = gl.getAttribLocation(program, attributeName);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(location, size, type, false, stride, offset);
    gl.enableVertexAttribArray(location);
  },

  setUniform: function(gl, program, uniformName, type, value) {
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

  clear: function(gl, r = 0, g = 0, b = 0, a = 1) {
    gl.clearColor(r, g, b, a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  },

  draw: function(gl, mode, count, type = gl.UNSIGNED_SHORT) {
    if (gl.getParameter(gl.ELEMENT_ARRAY_BUFFER_BINDING)) {
      gl.drawElements(mode, count, type, 0);
    } else {
      gl.drawArrays(mode, 0, count);
    }
  },

  createVAO: function(gl) {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    return vao;
  },

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

  createShader: function(gl, type, source) {
    const version = "#version 300 es\n";

    const processedSource = source
      .split('\n')
      .map(line => {
        if (line.trim().startsWith("fnmain")) {
          return "void main() {\n" + line.trim().slice(6) + "\n}";
        } else if (line.trim() === "main") {
          return "void main() {}";
        }
        return line;
      })
      .join('\n');

    const fullSource = version + processedSource;

    const shader = gl.createShader(type);
    gl.shaderSource(shader, fullSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  },

  createProgramWithHelpers: function(gl, vertexSource, fragmentSource) {
    const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return null;
    }

    return program;
  },

  render: function(gl, program, vertexBuffer, indexBuffer, indexCount, mode = gl.TRIANGLES) {
    this.resizeCanvas(gl);
    this.clear(gl, 0.1, 0.1, 0.1, 1.0);

    gl.useProgram(program);
    this.setAttribute(gl, program, vertexBuffer, 'a_position', 2);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.draw(gl, mode, indexCount);

    requestAnimationFrame(() => this.render(gl, program, vertexBuffer, indexBuffer, indexCount, mode));
  },

  renderMultipleShapes: function(gl, program, shapes) {
    this.resizeCanvas(gl);
    this.clear(gl, 0.1, 0.1, 0.1, 1.0);

    gl.useProgram(program);

    for (let shape of shapes) {
      this.setAttribute(gl, program, shape.vertexBuffer, 'a_position', 2);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.indexBuffer);
      this.draw(gl, gl.TRIANGLES, shape.indexCount);
    }

    requestAnimationFrame(() => this.renderMultipleShapes(gl, program, shapes));
  }
};

// Export all functions together
export default glHelp;