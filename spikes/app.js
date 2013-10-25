var app = function (_canvasId) {
  var _canvas = document.getElementById(_canvasId);
  var _gl = _canvas.getContext("webgl");

  var _spikes = Spikes();
  var _is = { running : true };
  var _isRunning = true;
  // ...
  var _pressedKeys = {};
  // var _gui = new dat.GUI();
  var _controls = {
    z_translate : 12.,
    textureNumber : 0,
    lightingDirection : [ -1, -.3, -1 ],
    ambientLightColor : [ .35 * 255, .30 * 255, .27 * 255 ],
    directionalLightColor : [ .6 * 255, .6 * 255, .6 * 255 ],
    alpha : 1.,
    transparency : true
  };

  /*
  _gui.add(_controls, "z_translate", 0, 20.);
  _gui.addColor(_controls, "ambientLightColor");
  _gui.addColor(_controls, "directionalLightColor");
  _gui.add(_controls, "transparency");
  _gui.add(_controls, "alpha", 0, 1);
  */

  document.onkeyup = function (ev) {
    _pressedKeys[ev.keyCode] = false;
  }

  document.onkeydown = function (ev) {
    _pressedKeys[ev.keyCode] = true;
  }

  var _passShaderProg = undefined;

  //    Return actual object
  return {
    init : function () {
      setup();
      _gl.bindBuffer(_gl.ARRAY_BUFFER, null);
    },
    loop : loop,
    print : function () {
      console.log(_canvas);
      console.log(_gl);
    }
  };

  /**
   * Begin looping animation
   * @return {undefined} undefined
   */
  function loop () {
    if (_isRunning)
      requestAnimationFrame(loop);
    update();
    draw();
  }

  function setup() {
    // Viewport
    _gl.viewport(0, 0, _canvas.width, _canvas.height);
    // Shader program
    _passShaderProg = webgl.createProgramFromIds(gl, "pass-vert", "pass-frag");
    // Clear values
    _gl.clearColor(.25, .22, .2, 1);
    _gl.clearDepth(1.0);
  }

  function update() {
    updatePosition();
  }

  /**
   * Draw Frame
   * @return {undefined} undefined
   */
  function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var t = getElapsedSeconds() / 1.5;

    webgl.perspectiveMatrix({
      fieldOfView : 45,
      aspectRatio : 1,
      nearPlane : .1,
      farPlane : 100
    });

    mat4.identity(webgl.mvMatrix);
    mat4.translate(webgl.mvMatrix, [ 0, 0, -_controls.z_translate ]);
    mat4.rotate(webgl.mvMatrix, 3.5*t, [ -.5, -2.5, 3.0 ]);

    // Apply shader
    gl.useProgram(_passShaderProg);

    // ...
    _spikes.draw(_passShaderProg);


    return;

    // Draw
    _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _cubeVbo.ibuffer);
    _gl.drawElements(_gl.TRIANGLES, 36, _gl.UNSIGNED_SHORT, 0);
  }

  function updatePosition() {
    if (_pressedKeys[72]) {
      // console.log("<");
    }
    if (_pressedKeys[74]) {
      // console.log("^");
    }
    if (_pressedKeys[75]) {
      // console.log("v");
    }
    if (_pressedKeys[76]) {
      // console.log(">");
    }
    if (_pressedKeys[87]) {
      _controls.z_translate += .09;
    }
    if (_pressedKeys[83]) {
      _controls.z_translate -= .09;
    }
  }
}

function Star (_pos, _gl) {
  _pos = _pos || {};
  _pos.x = _pos.x || 0;
  _pos.y = _pos.y || 0;
  _pos.z = _pos.z || 0;
  this.gl = _gl;
  this.triangle = {
    vertices : [],
    colors : [],
    vbuffer : this.gl.createBuffer(),
    cbuffer : this.gl.createBuffer()
  };

  this.triangle.vertices = new Float32Array([
     _pos.x, _pos.y + 1, 0,
     _pos.x, _pos.y, 0,
     _pos.x + 1, _pos.y, 0,
  ]);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangle.vbuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, this.triangle.vertices, this.gl.STATIC_DRAW);

  this.triangle.colors = new Float32Array([
     1, 1, 1, 1,
     0, 1, 1, 1,
     1, 1, 0, 1
  ]);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangle.cbuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER, this.triangle.colors, this.gl.STATIC_DRAW);

  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
}

Star.prototype.update = function () {
}

Star.prototype.draw = function (shader) {
  this.gl.useProgram(shader);
  webgl.pushModelView();

  // Attributes : vertexPosition, vertexColor
  var aPosition = this.gl.getAttribLocation(shader, "vertexPosition");
  this.gl.enableVertexAttribArray(aPosition);

  var aColor = this.gl.getAttribLocation(shader, "vertexColor");
  this.gl.enableVertexAttribArray(aColor);

  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangle.vbuffer);
  this.gl.vertexAttribPointer(aPosition, 3, this.gl.FLOAT, false, 0, 0);

  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangle.cbuffer);
  this.gl.vertexAttribPointer(aColor, 4, this.gl.FLOAT, false, 0, 0);

  // Uniforms : mvMatrix, pMatrix
  var uModelViewMatrix = this.gl.getUniformLocation(shader, "modelViewMatrix");
  var uPerspectiveMatrix = this.gl.getUniformLocation(shader, "perspectiveMatrix");
  var uLightingDirection = this.gl.getUniformLocation(shader, "lightingDirection");
  var uAmbientLight = this.gl.getUniformLocation(shader, "ambientLightColor");
  var uDirectionalLight = this.gl.getUniformLocation(shader, "directionalLightColor");
  var uAlpha = this.gl.getUniformLocation(shader, "alpha");
  var uNormalMatrix = this.gl.getUniformLocation(shader, "normalMatrix");

  mat4.identity(webgl.mvMatrix);
  mat4.translate(webgl.mvMatrix, [ -2, 0, -9 ]);

  var uNormal = mat3.create();
  mat4.identity(uNormal);

  this.gl.uniformMatrix4fv(uPerspectiveMatrix, false, webgl.pMatrix);
  this.gl.uniformMatrix4fv(uModelViewMatrix, false, webgl.mvMatrix);
  this.gl.uniform1f(uAlpha, 1.);
  this.gl.uniform3fv(uAmbientLight, new Float32Array([ .5, .5, .5 ]));
  this.gl.uniform3fv(uDirectionalLight, new Float32Array([ .5, .5, .5 ]));
  this.gl.uniformMatrix3fv(uNormalMatrix, false, uNormal);

  // Draw
  this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);

  webgl.popModelView();
}
