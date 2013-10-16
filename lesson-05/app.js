var app = function (_canvasId) {
  var _canvas = document.getElementById(_canvasId);
  var _gl = _canvas.getContext("webgl");

  var _pMatrix;
  var _mvMatrix;

  var _texture = _gl.createTexture();
  var _img = new Image();
  _img.onload = function () {
    _gl.bindTexture(_gl.TEXTURE_2D, _texture);
    _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);
    _gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, _img);
    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST);
    _gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST);
    _gl.bindTexture(_gl.TEXTURE_2D, null);
  }
  _img.src = "texture.png";

  var _cubeVbo = {
    colors : [],
    positions : [],
    indices : [],
    texCoords : [],
    cbuffer : _gl.createBuffer(),
    vbuffer : _gl.createBuffer(),
    ibuffer : _gl.createBuffer(),
    tbuffer : _gl.createBuffer()
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
    _gl.enable(_gl.DEPTH_TEST);
    _gl.enable(_gl.BLEND);
  }

  /**
   * Update Before Drawing
   * @return {undefined} undefined
   */
  function update() {
  }

  /**
   * Draw Frame
   * @return {undefined} undefined
   */
  function draw() {
    _gl.viewport(0, 0, _canvas.width, _canvas.height);
    _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

    var t = getElapsedSeconds() * 1.5;


    _pMatrix = webgl.perspectiveMatrix();

    _mvMatrix = new Float32Array([
      Math.cos(t), 0, -Math.sin(t), 0,
      0, 1, 0, 0,
      Math.sin(t), 0, Math.cos(t), 0,
      0, 0, 5, 1
    ]);

    // Apply shader
    _gl.useProgram(_passShaderProg);

    // Vertex index
    var vertexPos = _gl.getAttribLocation(_passShaderProg, "vertexPosition");
    _gl.enableVertexAttribArray(vertexPos);

    // Color index
    var vertexCol = _gl.getAttribLocation(_passShaderProg, "vertexColor");
    _gl.enableVertexAttribArray(vertexCol);

    // Texture coordinates index
    var texCoord = _gl.getAttribLocation(_passShaderProg, "textureCoord");
    _gl.enableVertexAttribArray(texCoord);


    _gl.bindBuffer(_gl.ARRAY_BUFFER, _cubeVbo.vbuffer);
    _gl.vertexAttribPointer(vertexPos, 3.0, _gl.FLOAT, false, 0, 0);

    _gl.bindBuffer(_gl.ARRAY_BUFFER, _cubeVbo.cbuffer);
    _gl.vertexAttribPointer(vertexCol, 4.0, _gl.FLOAT, false, 0, 0);

    _gl.bindBuffer(_gl.ARRAY_BUFFER, _cubeVbo.tbuffer);
    _gl.vertexAttribPointer(texCoord, 2.0, _gl.FLOAT, false, 0, 0);

    var uModelViewMatrix = _gl.getUniformLocation(_passShaderProg, "modelViewMatrix");
    var uPerspectiveMatrix = _gl.getUniformLocation(_passShaderProg, "perspectiveMatrix");
    var uSamplerTexture = _gl.getUniformLocation(_passShaderProg, "texture");

    if(!(uModelViewMatrix && uPerspectiveMatrix && uSamplerTexture))
      console.log("okay");

    _gl.activeTexture(_gl.TEXTURE0);
    _gl.bindTexture(_gl.TEXTURE_2D, _texture);
    _gl.uniform1i(uSamplerTexture, 0);

    _gl.uniformMatrix4fv(uPerspectiveMatrix, false, new Float32Array(_pMatrix));
    _gl.uniformMatrix4fv(uModelViewMatrix, false, new Float32Array(_mvMatrix));

    _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, _cubeVbo.ibuffer);
    _gl.drawElements(_gl.TRIANGLES, 36, _gl.UNSIGNED_SHORT, 0);
  }
}
