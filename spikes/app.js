var app = function (_canvasId) {
  var _canvas = document.getElementById(_canvasId);
  var _gl = _canvas.getContext("webgl");

  var _spikes = Spikes();

  var _texture = _gl.createTexture();
  var _textures = [ _gl.createTexture(), _gl.createTexture(), _gl.createTexture() ];
  var _img = new Image();
  var _imgLoaded = false;
  var _starList = [
    new Star({ x : 1, y : 1, z : 0 }, _gl),
    new Star({ x : 2, y : 1, z : 0 }, _gl),
    new Star({ x : 1, y : 2, z : 0 }, _gl),
  ];

  var _pressedKeys = {};
  var _gui = new dat.GUI();
  var _controls = {
    z_translate : 12.,
    textureNumber : 0,
    lightingDirection : [ -1, -.3, -1 ],
    ambientLightColor : [ .35 * 255, .30 * 255, .27 * 255 ],
    directionalLightColor : [ .6 * 255, .6 * 255, .6 * 255 ],
    alpha : 1.,
    transparency : true
  };

  _gui.remember(_controls);

  _gui.add(_controls, "z_translate", 0, 20.);
  _gui.addColor(_controls, "ambientLightColor");
  _gui.addColor(_controls, "directionalLightColor");
  _gui.add(_controls, "transparency");
  _gui.add(_controls, "alpha", 0, 1);

  document.onkeyup = function (ev) {
    _pressedKeys[ev.keyCode] = false;
  }

  document.onkeydown = function (ev) {
    _pressedKeys[ev.keyCode] = true;

    if (ev.keyCode == 70) {
      _controls.textureNumber = (_controls.textureNumber + 1) % 3;
      console.log(_controls.textureNumber);
    }
  }

  _img.onload = function () {
    _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);

    _gl.bindTexture(_gl.TEXTURE_2D, _textures[0]);
    _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, _img);
    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST);
    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST);

    _gl.bindTexture(_gl.TEXTURE_2D, _textures[1]);
    _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, _img);
    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);

    _gl.bindTexture(_gl.TEXTURE_2D, _textures[2]);
    _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, _img);
    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_NEAREST);
    _gl.generateMipmap(_gl.TEXTURE_2D);

    _gl.bindTexture(_gl.TEXTURE_2D, null);
    _imgLoaded = true;
  }
  _img.src = "texture.jpg";

  var _passShaderProg = undefined;

  ////
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
    requestAnimationFrame(loop);
    update();
    draw();
  }

  /**
   * Setup Necessary Stuff
   * @return {undefined} undefined
   */
  function setup() {
    // Setup viewport
    _gl.viewport(0, 0, _canvas.width, _canvas.height);
    // Shader
    var shader = {
      _code : { vert : webgl.getShader("pass-vert"), frag : webgl.getShader("pass-frag") },
      vert : _gl.createShader(_gl.VERTEX_SHADER),
      frag : _gl.createShader(_gl.FRAGMENT_SHADER)
    };
    // Compile vert shader
    _gl.shaderSource(shader.vert, shader._code.vert);
    _gl.compileShader(shader.vert);
    // Compile frag shader
    _gl.shaderSource(shader.frag, shader._code.frag);
    _gl.compileShader(shader.frag);
    // Attach shader
    _passShaderProg = _gl.createProgram();
    _gl.attachShader(_passShaderProg, shader.vert);
    _gl.attachShader(_passShaderProg, shader.frag);
    _gl.linkProgram(_passShaderProg);
    // Clear settings
    _gl.clearColor(.25, .22, .2, 1);
    _gl.clearDepth(1.0);
    // Depth and blending
  }

  /**
   * Update Before Drawing
   * @return {undefined} undefined
   */
  function update() {
    updatePosition();
    for (var k = 0; k < _starList.length; k++) {
      _starList[k].update();
    }
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


    return;

    _gl.activeTexture(_gl.TEXTURE0);
    _gl.bindTexture(_gl.TEXTURE_2D, _textures[_controls.textureNumber]);
    _gl.uniform1i(uSamplerTexture, 0);
    _gl.uniform1f(uAlpha, _controls.alpha);

    _gl.uniformMatrix4fv(uPerspectiveMatrix, false, webgl.pMatrix);
    _gl.uniformMatrix4fv(uModelViewMatrix, false, webgl.mvMatrix);

    // Lighting direction
    var ld = vec3.create();
    vec3.normalize(_controls.lightingDirection, ld);
    vec3.scale(ld, -1);
    _gl.uniform3fv(uLightingDirection, ld);
    // Lighting normals
    var normalMatrix = mat3.create();
    mat4.toInverseMat3(webgl.mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    _gl.uniformMatrix3fv(uNormalMatrix, false, normalMatrix);
    // Lighting colors
    var ambientColor = _controls.ambientLightColor
    var directionalColor = _controls.directionalLightColor;
    _gl.uniform3f(uAmbientLight, ambientColor[0]/255, ambientColor[1]/255, ambientColor[2]/255);
    _gl.uniform3f(uDirectionalLight, directionalColor[0]/255, directionalColor[1]/255, directionalColor[2]/255);

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
