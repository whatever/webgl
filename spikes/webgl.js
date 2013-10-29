var webgl = (function () {
  var _mvMatrixStack = [], _pMatrixStack = [];
  return {
    ___about : "webgl",
    mvMatrix : mat4.create(),
    pMatrix : mat4.create(),
    nMatrix : mat4.create(),
    /**
     * Create and Compile a shader from Source Code
     * @param {!WebGLRenderingContext} ... ...
     * @param {string} ... ...
     * @param {number} ... ...
     * @return {!WebGLShader} ...
     */
    compileShader : function (gl, shaderSource, shaderType) {
      var shader = gl.createShader(shaderType);
      gl.shaderSource(shader, shaderSource);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log("** SHADER ERROR **");
        console.log(gl.getShaderInfoLog(shader));
      }
      return shader;
    },
    /**
     * Create a Program from Two Shaders
     * @param {!WebGLRenderingContext}
     * @param {WebGLShader}
     * @param {WebGLShader}
     * @return {!WebGLProgram}
     */
    createProgram : function (gl, vertShader, fragShader) {
      var program = gl.createProgram();
      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        console.log("** PROGRAM ERROR **");
      return program;
    },
    /*
     */
    createProgramFromIds : function (gl, vertId, fragId) {
      var vertSource = this.getShaderSource(vertId);
      var fragSource = this.getShaderSource(fragId);
      var vertShader = this.compileShader(gl, vertSource, gl.VERTEX_SHADER);
      var fragShader = this.compileShader(gl, fragSource, gl.FRAGMENT_SHADER);
      return this.createProgram(gl, vertShader, fragShader);
    },
    /**
     * Get Text of Script Object
     * @param {string} id a character-string specifying the id of the script
     * element container shader information
     * @return {string} source code for a shader
     */
    getShaderSource : function (id) {
      var shader = document.getElementById(id);
      if (!shader)
        throw "Fuck";
      return shader.text;
    },
    /**
     * Perspective-Matrix
     * @param {object} m an object specifying the values used to compute the
     * perspective matrix via frustrum.
     * @return {array} a 16-element array representing a matrix
     */
    perspectiveMatrix : function (m) {
      m = m || {};
      m.fieldOfView = m.fieldOfView || 30.0;
      m.aspectRatio = m.aspectRatio || 1;
      m.nearPlane = m.nearPlane || .1;
      m.farPlane = m.farPlane || 100.0;

      mat4.perspective(m.fieldOfView, m.aspectRatio, m.nearPlane, m.farPlane, this.pMatrix);
      return this.pMatrix;
    },
    /**
     * Push Model View Matrix onto the Stack
     * @return {undefined} undefined
     */
    pushModelView : function () {
      var copy = mat4.create();
      mat4.set(this.mvMatrix, copy);
      _mvMatrixStack.push(copy);
    },
    /**
     * Pop Model View Matrix onto the Stack
     * @return {undefined} undefined
     */
    popModelView : function () {
      this.mvMatrix = _mvMatrixStack.pop();
    },
    /**
     * Push Both Model and Perspective Matrix
     * @return {undefined} undefined
     */
    pushMatrices : function () {
      pushModelView();
      _pMatrixStack.push(this.pMatrix);
    },
    /**
     * Pop Both Model and Perspective Matrix
     * @return {undefined} undefined
     */
    popMatrices : function () {
      popModelView();
      this.pMatrix = _pMatrixStack.pop();
    },
    /**
     * Set Matrices
     */
    setMatrices : function (camera) {
      if (camera.mvMatrix !== undefined) {
      }
      if (camera.pMatrix !== undefined) {
      }
    }
  };
})();

window.requestAnimFrame = (function() {
  return
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) { setInterval(callback, 1000/60); }
})();
