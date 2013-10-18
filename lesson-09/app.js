var app = function (_canvasId) {
  var _canvas = document.getElementById(_canvasId);
  var _gl = _canvas.getContext("webgl");

  var _texture = _gl.createTexture();
  var _textures = [ _gl.createTexture(), _gl.createTexture(), _gl.createTexture() ];
  var _img = new Image();
  var _imgLoaded = false;

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
  _gui.add(_controls, "alpha", 0, 1).onFinishChange(function(value) {
  });

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

  var _cubeVbo = {
    colors : [],
    positions : [],
    texCoords : [],
    indices : [],
    cbuffer : _gl.createBuffer(),
    vbuffer : _gl.createBuffer(),
    nbuffer : _gl.createBuffer(),
    tbuffer : _gl.createBuffer(),
    ibuffer : _gl.createBuffer()
  };

  var _passShaderProg = undefined;

  ////
  //    Return actual object
  return {
    init : function () {
      // Setup
      setup();

      // vertex buffer
      _cubeVbo.positions = new Float32Array([
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
      ]);
      _gl.bindBuffer(_gl.ARRAY_BUFFER, _cubeVbo.vbuffer);
      _gl.bufferData(_gl.ARRAY_BUFFER, _cubeVbo.positions, _gl.STATIC_DRAW);

      // color buffer
      _cubeVbo.colors = new Float32Array([
        0, 0, 0, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
        0, 0, 0, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1,
        1, 1, 1, 1
      ]);
      _gl.bindBuffer(_gl.ARRAY_BUFFER, _cubeVbo.cbuffer);
      _gl.bufferData(_gl.ARRAY_BUFFER, _cubeVbo.colors, _gl.STATIC_DRAW);

      // index buffer
      _cubeVbo.indices = new Uint16Array([
        0, 1, 2,      0, 2, 3,    // Front face
        4, 5, 6,      4, 6, 7,    // Back face
        8, 9, 10,     8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15, // Bottom face
        16, 17, 18,   16, 18, 19, // Right face
        20, 21, 22,   20, 22, 23  // Left face
      ]);
      _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _cubeVbo.ibuffer);
      _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, _cubeVbo.indices, _gl.STATIC_DRAW);

      _cubeVbo.texCoords = new Float32Array([
        0.0, 0.0, // Front Face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        1.0, 0.0, // Back face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        0.0, 1.0, // Top face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        1.0, 1.0, // Bottom face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 0.0, // Right face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        0.0, 0.0, // Left face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
      ]);
      _gl.bindBuffer(_gl.ARRAY_BUFFER, _cubeVbo.tbuffer);
      _gl.bufferData(_gl.ARRAY_BUFFER, _cubeVbo.texCoords, _gl.STATIC_DRAW);

      _cubeVbo.normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, // Front
        0.0, 0.0,-1.0, 0.0, 0.0,-1.0, 0.0, 0.0,-1.0, 0.0, 0.0,-1.0, // Back
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, // Top
        0.0,-1.0, 0.0, 0.0,-1.0, 0.0, 0.0,-1.0, 0.0, 0.0,-1.0, 0.0, // Bottom
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, // Right
       -1.0, 0.0, 0.0,-1.0, 0.0, 0.0,-1.0, 0.0, 0.0,-1.0, 0.0, 0.0  // Left
      ]);
      _gl.bindBuffer(_gl.ARRAY_BUFFER, _cubeVbo.nbuffer);
      _gl.bufferData(_gl.ARRAY_BUFFER, _cubeVbo.normals, _gl.STATIC_DRAW);

      // Cleanup
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
  }

  /**
   * Draw Frame
   * @return {undefined} undefined
   */
  function draw() {
    var alpha;

    if (!_imgLoaded) {
      return;
    }

    if (_controls.transparency) {
      _gl.enable(_gl.BLEND);
      _gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE);
      _gl.disable(_gl.DEPTH_TEST);
      alpha = _controls.alpha;
    }
    else {
      alpha = 1.;
      _gl.disable(_gl.BLEND);
      _gl.enable(_gl.DEPTH_TEST);
    }

    _gl.viewport(0, 0, _canvas.width, _canvas.height);
    _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

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
    _gl.useProgram(_passShaderProg);

    // Vertex index
    var vertexPos = _gl.getAttribLocation(_passShaderProg, "vertexPosition");
    _gl.enableVertexAttribArray(vertexPos);

    // Normal index
    var vertexNormal = _gl.getAttribLocation(_passShaderProg, "vertexNormal");
    _gl.enableVertexAttribArray(vertexNormal);

    // Color index
    var vertexCol = _gl.getAttribLocation(_passShaderProg, "vertexColor");
    _gl.enableVertexAttribArray(vertexCol);

    // Texture coordinates index
    var texCoord = _gl.getAttribLocation(_passShaderProg, "textureCoord");
    _gl.enableVertexAttribArray(texCoord);

    // Bind buffers for drawElements
    _gl.bindBuffer(_gl.ARRAY_BUFFER, _cubeVbo.vbuffer);
    _gl.vertexAttribPointer(vertexPos, 3.0, _gl.FLOAT, false, 0, 0);

    _gl.bindBuffer(_gl.ARRAY_BUFFER, _cubeVbo.nbuffer);
    _gl.vertexAttribPointer(vertexNormal, 3.0, _gl.FLOAT, false, 0, 0);

    _gl.bindBuffer(_gl.ARRAY_BUFFER, _cubeVbo.cbuffer);
    _gl.vertexAttribPointer(vertexCol, 4.0, _gl.FLOAT, false, 0, 0);

    _gl.bindBuffer(_gl.ARRAY_BUFFER, _cubeVbo.tbuffer);
    _gl.vertexAttribPointer(texCoord, 2.0, _gl.FLOAT, false, 0, 0);

    var uModelViewMatrix = _gl.getUniformLocation(_passShaderProg, "modelViewMatrix");
    var uPerspectiveMatrix = _gl.getUniformLocation(_passShaderProg, "perspectiveMatrix");
    var uSamplerTexture = _gl.getUniformLocation(_passShaderProg, "texture");
    var uNormalMatrix = _gl.getUniformLocation(_passShaderProg, "normalMatrix");
    var uLightingDirection = _gl.getUniformLocation(_passShaderProg, "lightingDirection");
    var uAmbientLight = _gl.getUniformLocation(_passShaderProg, "ambientLightColor");
    var uDirectionalLight = _gl.getUniformLocation(_passShaderProg, "directionalLightColor");
    var uAlpha = _gl.getUniformLocation(_passShaderProg, "alpha");

    if(!(uModelViewMatrix && uPerspectiveMatrix && uSamplerTexture)) {
      console.log("Uniform variable is messed up");
      return;
    }

    if (!(uLightingDirection && uNormalMatrix)) {
      console.log("Lighting direction and normal matrix");
      return;
    }

    if (!(uAmbientLight && uDirectionalLight)) {
      console.log("Lighting color");
      return;
    }

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
