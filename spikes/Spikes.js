var Spikes = (function () {
  var _grid = {
    xmin : -1.,
    xmax : 1.,
    ymin : -1.,
    ymax : 1.,
    xsize : 40,
    ysize : 40
  };

  var _vbo = {
    pbuffer : gl.createBuffer(),
    cbuffer : gl.createBuffer(),
    ibuffer : gl.createBuffer()
  };

  _init();

  return {
    about : "fuck",
    set : _set,
    update : _update,
    draw : _draw
  };

  function _init() {
    var positions = [], colors = [], normals = [], indices = [];
    for (var i=0; i < _grid.xsize; i++) {
      for (var j=0; j < _grid.ysize; j++) {
        var xh = 1/_grid.xsize, yh = 1/_grid.ysize;
        var x = (_grid.xmax - _grid.xmin) * i /(_grid.xsize-1) + _grid.xmin;
        var y = (_grid.ymax - _grid.ymin) * i /(_grid.ysize-1) + _grid.ymin;
        var height = Math.cos(x) * Math.sin(y);
        positions.push(x);
        positions.push(y);
        positions.push(height);
        colors.push(1.);
        colors.push(1.);
        colors.push(1.);
        colors.push(1.);
        var a = [ x, y, Math.cos(x+xh)*Math.sin(y) - Math.cos(x-xh)*Math.sin(y) ];
        var b = [ x, y, Math.cos(x)*Math.sin(y+yh) - Math.cos(x)*Math.sin(y-yh) ];
        var n = [
          a[2] * b[3] - a[3] * b[2],
          a[3] * b[1] - a[1] * b[3],
          a[1] * b[2] - a[2] * b[1]
        ];
        normals.push(n[0]);
        normals.push(n[1]);
        normals.push(n[2]);
      }
    }

    indices = new Uint16Array([
      0, 5, 5 * _grid.xsize, 5 * _grid.xsize + 5
    ]);

    return;

    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo.pbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo.cbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo.nbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  function _set(opts) {
  }

  function _update() {
  }

  function _draw() {
    webgl.pushMatrix();
    webgl.perspectiveMatrix({ fieldOfView : 45, aspectRatio : 1, nearPlane : .1, farPlane : 100 });
    var aPosition = gl.getAttribLocation(shader, "aPosition");
    var aColor = gl.getAttribLocation(shader, "aColor");
    var aNormal = gl.getAttribLocation(shader, "aNormal");

    var uMVMatrix = gl.getUniformLocation(shader, "uMVMatrix");
    var uPMatrix = gl.getUniformLocation(shader, "uPMatrix");
    var uNMatrix = gl.getUniformLocation(shader, "uNMatrix");

    var uLightDir = gl.getUniformLocation(shader, "uLightDir");
    var uAmbientCol = gl.getUniformLocation(shader, "uAmbientCol");
    var uDirectionalCol = gl.getUniformLocation(shader, "uDirectionalCol");
    var uAlpha = gl.getUniformLocation(shader, "uAlpha");


    webgl.popMatrix();
  }
});
