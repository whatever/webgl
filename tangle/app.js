var app = function (_canvasId) {
  var _canvas = document.getElementById(_canvasId);
  var _gl = _canvas.getContext("webgl");

  var _triangleVbo = {
    vbuffer : undefined,
    vertices : undefined,
    cbuffer : undefined,
    colors : undefined
  };

  var _passShaderProg = undefined;

  ////
  //    Return actual object
  return {
    init : function () {
      // Setup
      setup();

      // Initialize VBO
      _triangleVbo.vbuffer = _gl.createBuffer();
      _triangleVbo.vertices = [];
      var v = [];
      var pos = { x : 0, y : 0, z : 0 };
      for (var i = 0; i < 400; i++) {
        var x = -.5 + (i % 20)/19;
        var y = -.5 + (Math.floor(i / 20))/19;
        pos = {
          x : x + Math.cos(4 * pos.x) + Math.random()/3,
          y : y + Math.sin(2.5 * pos.y),
          z : 1 + 4 * Math.random()
        };
        v.push(pos.x);
        v.push(pos.y);
        v.push(pos.z);
      }
      _triangleVbo.vertices = new Float32Array(v);
      _gl.bindBuffer(_gl.ARRAY_BUFFER, _triangleVbo.vbuffer);
      _gl.bufferData(_gl.ARRAY_BUFFER, _triangleVbo.vertices, _gl.STATIC_DRAW);
      _triangleVbo.cbuffer = _gl.createBuffer();
      _triangleVbo.colors = [];
      var c = [];
      for (var i = 0; i < 900; i++) {
        c.push(i/999);
        c.push(i/999);
        c.push(i/199);
        c.push(1);
      }
      _triangleVbo.colors = new Float32Array(c);
      _gl.bindBuffer(_gl.ARRAY_BUFFER, _triangleVbo.cbuffer);
      _gl.bufferData(_gl.ARRAY_BUFFER, _triangleVbo.colors, _gl.STATIC_DRAW);
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
    _gl.depthFunc(_gl.LEQUAL);
    _gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE);
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
    _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

    var perspectiveMatrix = webgl.perspectiveMatrix({
      fieldOfView : 60.0,
      aspectRatio : _canvas.width / _canvas.height,
      nearPlane : 0,
      farPlane : 100.0
    });

    // Construct model-view matrix
    var t = getElapsedSeconds() / 1.5;
    var modelViewMatrix = [
      Math.cos(t), 0, -Math.sin(t), 0,
      0, 1, 0, 0,
      Math.sin(t), 0, Math.cos(t), 0,
      0, 0, 0, 1
    ];
    /*
    modelViewMatrix = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
   //*/

    // Apply shader
    _gl.useProgram(_passShaderProg);

    // Vertex index
    var vertexPos = _gl.getAttribLocation(_passShaderProg, "vertexPosition");
    _gl.enableVertexAttribArray(vertexPos);

    // Color index
    var vertexCol = _gl.getAttribLocation(_passShaderProg, "vertexColor");
    _gl.enableVertexAttribArray(vertexCol);

    _gl.bindBuffer(_gl.ARRAY_BUFFER, _triangleVbo.vbuffer);
    _gl.vertexAttribPointer(vertexPos, 3.0, _gl.FLOAT, false, 0, 0);

    _gl.bindBuffer(_gl.ARRAY_BUFFER, _triangleVbo.cbuffer);
    _gl.vertexAttribPointer(vertexCol, 4.0, _gl.FLOAT, false, 0, 0);

    var uModelViewMatrix = _gl.getUniformLocation(_passShaderProg, "modelViewMatrix");
    var uPerspectiveMatrix = _gl.getUniformLocation(_passShaderProg, "perspectiveMatrix");

    _gl.uniformMatrix4fv(uModelViewMatrix, false, new Float32Array(perspectiveMatrix));
    _gl.uniformMatrix4fv(uPerspectiveMatrix, false, new Float32Array(modelViewMatrix));
 
    // Draw
    _gl.lineWidth(1.);
    _gl.drawArrays(_gl.LINE_STRIP, 0, 400);
  }
}
