var Wave = (function (id) { var _canvas = document.getElementById(id);
  var _c = _canvas.getContext("2d");
  var _isRunning = true;

  var ___ = {
    a : 0.99,
    b : 0.99,
    c : 0.99,
    t : 1.
  };

  var __f = {};

  (function () {
    // Coefficients for 
    var a = [
      +1.1427000, +0.4529600, +0.177530, -0.0259350, -0.1029100, -0.072436,
      -0.0010508, +0.0460710, +0.042815, -0.0068287, -0.0252450, -0.029249,
      -0.0084966, +0.0149650, +0.021478, -0.0088747, -0.0090245, -0.016406,
      -0.0087387, +0.0052491, +0.012800, -0.0083665, -0.0026990, -0.010082,
    ];
    var offset = .75;
    var scale  = 1/1.6;

    __f.a = function (x) {
      var t = getElapsedSeconds();
      return a[0] * Math.cos(0 * x) + a[1] * Math.cos(1 * x) + a[3] * Math.cos(3 * x) + a[8] * Math.cos(8 * x) + a[9] * Math.cos(9 * x);
    };
    __f.b = function (x) {
      var t = getElapsedSeconds();
      return a[2] * Math.cos(2 * x) + a[5] * Math.cos(5 * x) + a[10] * Math.cos(10 * x) + a[11] * Math.cos(11 * x) + a[14] * Math.cos(14 * x);
    };
    __f.c = function (x) {
      var t = ___.t * getElapsedSeconds();
      return a[4] * Math.cos(4 * x) + a[6] * Math.cos(6 * x) + a[7] * Math.cos(7 * x) + a[12] * Math.cos(12 * x) + a[13] * Math.cos(13 * x);
    };
  })();

  var _gui = new dat.GUI();
  (function () {
    var f1 = _gui.addFolder('Oscillator Controller');
    f1.add(___, "a", -1, +1, 0.3);
    f1.add(___, "b", -1, +1, 0.3);
    f1.add(___, "c", -1, +1, 0.3);
    f1.add(___, "t", +0, +4, 0.3);
    f1.open();
  })();

  function map (x, y) {
    var w = _canvas.width;
    var h = _canvas.height;
    return [
      w/2 + w/2*x,
      h/2 + h/2*y
    ];
  }

  var _mesh = [ ];

  var _xmin = -1, _xmax = 1, _xsize = 300;
  var dx = (_xmax - _xmin)/(_xsize-1);
  for (var i = 0; i < _xsize; i++) {
    var x = dx * i + _xmin;
    var y = 0;
    _mesh.push([ x, y ]);
  }


  return {
    alpha   : _alpha,
    beta    : _beta,
    loop    : _loop,
    update  : _update,
    draw    : _draw
  };

  function _loop () {
    if (_isRunning)
      requestAnimationFrame(_loop);
    _update();
    _draw();
  }
  // ...
  function _alpha (val) {
    if (val !== undefined)
      _alpha = val;
    return _alpha;
  }
  // ...
  function _beta (val) {
    if (val !== undefined)
      _beta = val;
    return _beta;
  }
  /**
   *
   */
  function _update () {
    for (var i = 0; i < _mesh.length; i++) {
      var x = _mesh[i][0];
      var t = getElapsedSeconds();
      var y = 0; // .9 * Math.cos(3*x + t) + .5 * Math.cos(6 * x + t); 
      y += ___.a * __f.a(x);
      y += ___.b * __f.b(x);
      y += ___.c * __f.c(x);
      _mesh[i] = [ x, y ];
    }
  }
  // ...
  function _draw () {
    _canvas.width = _canvas.width;
    _c.beginPath();
    _c.lineWidth="5";
    _c.strokeStyle="black";
    var p = map(_mesh[0][0], _mesh[0][1]);
    _c.moveTo(p[0], p[1]);

    for (var i = 1; i < _mesh.length; i++) {
      p = map(_mesh[i][0], _mesh[i][1]);
      _c.lineTo(p[0], p[1]);
    }

    _c.stroke();
  }
});

function circleWave (x) {
  var a = [];
  var b = [];
  var y = 0;
  var L = 1.;
  a.push(.5 * Math.PI * L);
  for (var i = 1; i < 3; i++) {
    var _a;
    _a = Math.pow(-1, i);
    _a *= L;
    _a *= 1;
    _a /= i;
    a.push(_a);
  }

  y = 0;
  for (var n = 0; n < a.length; n++) {
    y += a[n] *  Math.cos(n * Math.PI * x / L);
  }

  return y;
}
