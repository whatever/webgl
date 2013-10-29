var app = function (_canvasId) {
  var _canvas = document.getElementById(_canvasId);
  var _gl = _canvas.getContext("webgl");

  var _spikes = Spikes();
  var _is = { running : true };
  var _isRunning = true;
  var _pressedKeys = {};
  var _gui = new dat.GUI();
  var _controls = { };
 
  document.onkeyup = function (ev) {
    _pressedKeys[ev.keyCode] = false;
  }

  document.onkeydown = function (ev) {
    _pressedKeys[ev.keyCode] = true;
  }

  var _passShaderProg = undefined;
  var _simpleShaderProg = undefined;
  var _drawer = undefined;

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
    _simpleShaderProg = webgl.createProgramFromIds(gl, "vert-simple", "frag-simple");

    // Clear values
    _gl.clearColor(.25, .22, .2, 1);
    _gl.clearDepth(1.0);

    _gl.enable(_gl.DEPTH_TEST);
    _gl.enable(_gl.BLEND);

    _drawer = new Drawer(_gl, _simpleShaderProg);
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

    var t = getElapsedSeconds() * 1.5;

    webgl.perspectiveMatrix({
      fieldOfView : 45,
      aspectRatio : 1,
      nearPlane : .1,
      farPlane : 100
    });

    mat4.identity(webgl.mvMatrix);
    mat4.translate(webgl.mvMatrix, [ 0, 0, -9 ]);

    // Apply shader
    gl.useProgram(_simpleShaderProg);

    //
    gl.enable(gl.BLEND);
    _drawer.camera(webgl.pMatrix, webgl.mvMatrix);
    _drawer.line([ 0, 0, 0 ], [ 1, Math.sin(t), -1 ], [ 1, 1, .8, 1. ], [ 0, 1, 1, 1 ]);
    _drawer.line([ 0, 1, 0 ], [ -1, -Math.sin(t), .5 ], [ 1, 1, .8, 1. ], [ 0, 1, 1, 1 ]);

    // ...
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
