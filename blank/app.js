var app = function (_canvasId) {
  // Canvas, context, whether app is running
  var _canvas = document.getElementById(_canvasId);
  var _gl = _canvas.getContext("webgl");
  var _isRunning = false;

  // Controls : GUI stuff
  var _controls = {
    alpha : 0,
    color : [ 0, 0, 0, 1 ],
    gui : new dat.GUI()
  };
  _controls.gui.add(_controls, "alpha", 0, 20.);
  _controls.gui.addColor(_controls, "color");

  // Key handling
  var _pressedKeys = {};

  document.onkeyup = function (ev) {
    _pressedKeys[ev.keyCode] = false;
  }

  document.onkeydown = function (ev) {
    _pressedKeys[ev.keyCode] = true;
  }

  // Actual app object
  return {
    init : function () {
      setup();
      _gl.bindBuffer(_gl.ARRAY_BUFFER, null);
      _loop();
    },
    play : function () {
      _isRunning = true;
      loop();
    },
    stop : function () {
      _isRunning = false;
    },
    loop : function () {
      _isRunning = true;
      _loop();
    }
  };

  /**
   * Begin looping animation
   * @return {undefined} undefined
   */
  function _loop () {
    if (_isRunning) {
      requestAnimationFrame(_loop);
    }
    update();
    draw();
  }

  function setup() {
    _gl.clearColor(.25, .22, .2, 1);
    _gl.clearDepth(1.0);
  }

  function update() {
  }

  function draw() {
    _gl.viewport(0, 0, _canvas.width, _canvas.height);
    _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

    var t = getElapsedSeconds();

    // Perspective Matrix
    webgl.perspectiveMatrix({
      fieldOfView : 45,
      aspectRatio : 1,
      nearPlane : .1,
      farPlane : 100
    });

    // Model-view Matrix
    mat4.identity(webgl.mvMatrix);
  }
}
