var Wave = (function (id) {
  var _canvas = document.getElementById(id);
  var _c = _canvas.getContext("2d");
  var _isRunning = true;

  var ___ = {
    a : 0.001,
    b : 0.001,
    c : 0.002,
    t : 1.
  };

  var __f = {
    a : function (x) {
      return Math.cos(x + ___.t * getElapsedSeconds());
    },
    b : function (x) {
      return Math.sin(2*x + ___.t * getElapsedSeconds());
    },
    c : function (x) {
      return Math.cos(4*x + ___.t * getElapsedSeconds());
    }
  };

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

  var _mesh = [

  ];

  var _xmin = -1, _xmax = 1, _xsize = 100;
  var dx = (_xmax - _xmin)/(_xsize-1);
  for (var i = 0; i < _xsize; i++) {
    var x = dx * i + _xmin;
    var y = 0;
    _mesh.push([ x, y ]);
  }


  return {
    alpha : _alpha,
    beta : _beta,
    loop : _loop,
    update : _update,
    draw : _draw
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
