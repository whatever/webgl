var app = function (_canvasId) {
  var _canvas = document.getElementById(_canvasId);
  var _gl = _canvas.getContext("webgl");

  var _spikes = Spikes();
  var _is = { running : true };
  var _isRunning = false;
  // ...
  var _pressedKeys = {};
  
  var _gui = new dat.GUI();
  var _controls = {
    z_translate : 4.,
    textureNumber : 0,
    lighting_x : 0.1,
    lighting_y : 0.1,
    lighting_z : 0.1,
    lightingDirection : [ -1, -.3, -1 ],
    ambientLightColor : [ .35 * 255, .30 * 255, .27 * 255 ],
    directionalLightColor : [ .6 * 255, .6 * 255, .6 * 255 ],
    alpha : 1.,
    transparency : true
  };
  _gui.add(_controls, "z_translate", 2., 15);
  _gui.add(_controls, "lighting_x", -1., 1.);
  _gui.add(_controls, "lighting_y", -1., 1.);
  _gui.add(_controls, "lighting_z", -1., 1.);

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

    _gl.enable(_gl.DEPTH_TEST);
  }

  function update() {
    updatePosition();
  }

  /**
   * Draw Frame
   * @return {undefined} undefined
   */
  function draw() {
    console.log("* DRAWING *");
    console.log("* DRAWING *");
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
    mat4.rotate(webgl.mvMatrix, Math.PI/2, [ 1, 0, 0 ]);

    // Apply shader
    gl.useProgram(_passShaderProg);

    // ...
    _spikes.draw(_passShaderProg);
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
