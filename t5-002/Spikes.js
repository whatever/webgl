var Spikes = (function () {
  var _grid = {
    xmin : -1.,
    xmax : 1.,
    ymin : -1.,
    ymax : 1.,
    xsize : 10,
    ysize : 10,
    tiles : 0
  };

  // Adjust grid values
  if (_grid.xsize % 2)
    _grid.xsize = _grid.xsize - 1;
  if (_grid.ysize % 2)
    _grid.ysize = _grid.ysize - 1;
  _grid.xsize = Math.min(_grid.xsize, 10);
  _grid.xsize = Math.max(_grid.xsize, 2);
  _grid.ysize = Math.min(_grid.ysize, 10);
  _grid.ysize = Math.max(_grid.ysize, 2);

  var _vbo = {
    pbuffer : gl.createBuffer(),
    cbuffer : gl.createBuffer(),
    nbuffer : gl.createBuffer(),
    ibuffer : gl.createBuffer(),
    normals : [],
    positions : []
  };

  _init();

  var _simpleShader = webgl.createProgramFromIds(gl, "vert-simple", "frag-simple");
  var _drawer = new Drawer(gl, _simpleShader);

  return {
    _about : "fuck",
    set : _set,
    update : _update,
    draw : _draw
  };

  function _init() {
    var positions = [], normals = [], colors = [], indices = [];
    var waveFunc = function (u, v) {
      return Math.sin(1.5 * u) + v * v;
    }

    // Differences
    var dx = (_grid.xmax - _grid.xmin) / _grid.xsize;
    var dy = (_grid.ymax - _grid.ymin) / _grid.ysize;

    // Indices
    var mid_points_count = _grid.ysize/2;
    for (var i=0; i < mid_points_count; i++) {
      for (var j = 0; j <_grid.xsize; j++) {
        var row = 2 * i + 1;
        var col = j;
        var x = .5 * dx + col * dx;
        var y = col * dy;
        _get00Tile(positions, colors, normals, x, y, waveFunc);
        _get01Tile(positions, colors, normals, x, y, waveFunc);
        _get02Tile(positions, colors, normals, x, y, waveFunc);
        _get03Tile(positions, colors, normals, x, y, waveFunc);
        console.log(waveFunc);
        _grid.tiles += 1 + 1 + 1 + 1;
      }
    }

    // console.log("positions = " +  positions.length/3/3);
    // console.log("colors    = " + colors.length/4/3);
    // console.log("normals   = " + normals.length/3/3);

    _vbo.positions = positions;
    _vbo.colors = positions;
    _vbo.normals = normals;

    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo.pbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo.cbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo.nbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _vbo.ibuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  function _set(opts) {
  }

  function _update() {
  }

  function _draw(shader) {
    webgl.pushModelView();
    webgl.perspectiveMatrix({ fieldOfView : 45, aspectRatio : 1, nearPlane : .1, farPlane : 100 });

    var normalMatrix = mat3.create();
    mat4.toInverseMat3(webgl.mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);

    var aPosition = gl.getAttribLocation(shader, "aPosition");
    var aColor = gl.getAttribLocation(shader, "aColor");
    var aNormal = gl.getAttribLocation(shader, "aNormal");
    gl.enableVertexAttribArray(aPosition);
    gl.enableVertexAttribArray(aColor);
    gl.enableVertexAttribArray(aNormal);

    var uMVMatrix = gl.getUniformLocation(shader, "uMVMatrix");
    var uPMatrix = gl.getUniformLocation(shader, "uPMatrix");
    var uNMatrix = gl.getUniformLocation(shader, "uNMatrix");
    var uTime = gl.getUniformLocation(shader, "uTime");

    var uLightDir = gl.getUniformLocation(shader, "uLightDir");
    var uAmbientCol = gl.getUniformLocation(shader, "uAmbientCol");;
    var uDirectionalCol = gl.getUniformLocation(shader, "uDirectionalCol");;

    // Set camera matrices
    gl.uniformMatrix4fv(uPMatrix, false, webgl.pMatrix);
    gl.uniformMatrix4fv(uMVMatrix, false, webgl.mvMatrix);
    gl.uniformMatrix3fv(uNMatrix, false, normalMatrix);
    gl.uniformMatrix3fv(uNMatrix, false, normalMatrix);

    // Lighting Vectors
    var t = getElapsedSeconds();
    var lightDir = vec3.normalize([ 0, 0, 1 ]);
    gl.uniform3fv(uLightDir, lightDir);
    gl.uniform3f(uAmbientCol, .25, .25, .25);
    gl.uniform3f(uDirectionalCol, 1, 1, 1);

    // Specify position attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo.pbuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    // Specify color attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo.cbuffer);
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);

    // Specify normal attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo.nbuffer);
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

    // Specify element
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _vbo.ibuffer);
    // gl.drawElements(gl.TRIANGLES, 6 * (_grid.xsize-1) * (_grid.ysize-1), gl.UNSIGNED_SHORT, 0);

    console.log("num tiles = " + _grid.tiles);
    gl.drawArrays(gl.TRIANGLES, 0, 3*_grid.tiles);

    //
    _drawer.camera(webgl.pMatrix, webgl.mvMatrix);
    // _drawNormals();

    webgl.popModelView();
  }

  function _drawNormals() {
    for (var k=0; k < _vbo.normals.length/3; k++) {
      var i = 3 * k;
      var n = [
        _vbo.normals[i+0],
        _vbo.normals[i+1],
        _vbo.normals[i+2]
      ];
      var p = [
        _vbo.positions[i+0],
        _vbo.positions[i+1],
        _vbo.positions[i+2]
      ];
      var q = [
        p[0] + .7 * n[0],
        p[1] + .7 * n[1],
        p[2] + .7 * n[2]
      ];
      _drawer.line(p, q, [1,1,1,1], [.8,.4,.4,1]);
    }
  }

  function _addFace(positions) {
    positions.push([ 1 ]);
  }

  /**
   *    * - - - *
   *     \  00 / \
   *      \   /   \
   *       \ / 01  \
   *        *- - - -*
   *       / \ 02  /
   *      /   \   /
   *     / 03  \ /
   *    * - - - *

  */
  function _get00Tile (positions, colors, normals, x, y, func) {
    var f = func;
    var dx = (_grid.xmax - _grid.xmin) / _grid.xsize;
    var dy = (_grid.ymax - _grid.ymin) / _grid.ysize;

    // Central point
    positions.push(x);
    positions.push(y);
    positions.push(f(x, y));
    // Left point
    positions.push(x-dx/2);
    positions.push(y-dy);
    positions.push(f(x-dx/2, y-dy));
    // Right point
    positions.push(x+dx/2);
    positions.push(y-dy);
    positions.push(f(x+dx/2, y-dy));

    // Central point
    colors.push(1);
    colors.push(1);
    colors.push(1);
    colors.push(1);
    // Left point
    colors.push(1);
    colors.push(1);
    colors.push(1);
    colors.push(1);
    // Right point
    colors.push(1);
    colors.push(1);
    colors.push(1);
    colors.push(1);

    // Compute normal
    var a = [ -dx/2, -dy , f(x-dx/2, y-dy) - f(x, y) ];
    var b = [ dx/2, -dy , f(x+dx/2, y-dy) - f(x, y) ];
    var n = vec3.cross(a, b);
    vec3.normalize(n[0]);
    vec3.normalize(n[1]);
    vec3.normalize(n[2]);

    // Central
    normals.push(n[0]);
    normals.push(n[1]);
    normals.push(n[2]);
    // Left point
    normals.push(n[0]);
    normals.push(n[1]);
    normals.push(n[2]);
    // Right point
    normals.push(n[0]);
    normals.push(n[1]);
    normals.push(n[2]);
  }
  function _get01Tile (positions, colors, normals, x, y, f) {
    var dx = (_grid.xmax - _grid.xmin) / _grid.xsize;
    var dy = (_grid.ymax - _grid.ymin) / _grid.ysize;

    console.log(f);

    // Central point
    positions.push(x);
    positions.push(y);
    positions.push(f(x, y));
    // Right point
    positions.push(x+dx);
    positions.push(y);
    positions.push(f(x+dx, y));
    // Top point
    positions.push(x+dx/2);
    positions.push(y-dy);
    positions.push(f(x+dx/2, y-dy));

    // Central point
    colors.push(1);
    colors.push(1);
    colors.push(1);
    colors.push(1);
    // Left point
    colors.push(1);
    colors.push(1);
    colors.push(1);
    colors.push(1);
    // Right point
    colors.push(1);
    colors.push(1);
    colors.push(1);
    colors.push(1);

    // Compute normal
    var a = [ -dx/2, -dy , f(x-dx/2, y-dy) - f(x, y) ];
    var b = [ dx/2, -dy , f(x+dx/2, y-dy) - f(x, y) ];
    var n = vec3.cross(a, b);
    vec3.normalize(n[0]);
    vec3.normalize(n[1]);
    vec3.normalize(n[2]);

    // Central
    normals.push(n[0]);
    normals.push(n[1]);
    normals.push(n[2]);
    // Left point
    normals.push(n[0]);
    normals.push(n[1]);
    normals.push(n[2]);
    // Right point
    normals.push(n[0]);
    normals.push(n[1]);
    normals.push(n[2]);
  }
  function _get02Tile (positions, colors, normals, x, y, f) {
    var dx = (_grid.xmax - _grid.xmin) / _grid.xsize;
    var dy = (_grid.ymax - _grid.ymin) / _grid.ysize;

    console.log(f);

    // Central point
    positions.push(x);
    positions.push(y);
    positions.push(f(x, y));
    // Right point
    positions.push(x+dx);
    positions.push(y);
    positions.push(f(x+dx, y));
    // Bottom point
    positions.push(x+dx/2);
    positions.push(y+dy);
    positions.push(f(x+dx/2, y+dy));

    // Central point
    colors.push(1);
    colors.push(1);
    colors.push(1);
    colors.push(1);
    // Left point
    colors.push(1);
    colors.push(1);
    colors.push(1);
    colors.push(1);
    // Right point
    colors.push(1);
    colors.push(1);
    colors.push(1);
    colors.push(1);

    // Compute normal
    var a = [ -dx/2, -dy , f(x-dx/2, y-dy) - f(x, y) ];
    var b = [ dx/2, -dy , f(x+dx/2, y-dy) - f(x, y) ];
    var n = vec3.cross(a, b);
    vec3.normalize(n[0]);
    vec3.normalize(n[1]);
    vec3.normalize(n[2]);

    // Central
    normals.push(n[0]);
    normals.push(n[1]);
    normals.push(n[2]);
    // Left point
    normals.push(n[0]);
    normals.push(n[1]);
    normals.push(n[2]);
    // Right point
    normals.push(n[0]);
    normals.push(n[1]);
    normals.push(n[2]);
  }
  function _get03Tile (positions, colors, normals, x, y, f) {
    var dx = (_grid.xmax - _grid.xmin) / _grid.xsize;
    var dy = (_grid.ymax - _grid.ymin) / _grid.ysize;

    console.log(f);

    // Central point
    positions.push(x);
    positions.push(y);
    positions.push(f(x, y));
    // Left point
    positions.push(x-dx/2);
    positions.push(y+dy);
    positions.push(f(x-dx/2, y+dy));
    // Right point
    positions.push(x+dx/2);
    positions.push(y+dy);
    positions.push(f(x+dx/2, y+dy));

    // Central point
    colors.push(1);
    colors.push(1);
    colors.push(1);
    colors.push(1);
    // Left point
    colors.push(1);
    colors.push(1);
    colors.push(1);
    colors.push(1);
    // Right point
    colors.push(1);
    colors.push(1);
    colors.push(1);
    colors.push(1);

    // Compute normal
    var a = [ -dx/2, -dy , f(x-dx/2, y-dy) - f(x, y) ];
    var b = [ dx/2, -dy , f(x+dx/2, y-dy) - f(x, y) ];
    var n = vec3.cross(a, b);
    vec3.normalize(n[0]);
    vec3.normalize(n[1]);
    vec3.normalize(n[2]);

    // Central
    normals.push(n[0]);
    normals.push(n[1]);
    normals.push(n[2]);
    // Left point
    normals.push(n[0]);
    normals.push(n[1]);
    normals.push(n[2]);
    // Right point
    normals.push(n[0]);
    normals.push(n[1]);
    normals.push(n[2]);
  }
});


