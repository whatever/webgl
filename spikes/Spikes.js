var Spikes = (function () {
  var _grid = {
    xmin : -.6,
    xmax : .6,
    ymin : -.6,
    ymax : .6,
    xsize : 23,
    ysize : 3
  };

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
    var f = function (u, v) {
      return Math.sin(2 * u);
    }
    for (var i = 0; i < _grid.xsize * _grid.ysize; i++) {
      var tx = (i % _grid.xsize)/(_grid.xsize - 1);
      var ty = (Math.floor(i / _grid.xsize))/(_grid.ysize - 1);
      var x = _grid.xmin + tx * (_grid.xmax - _grid.xmin);
      var y = _grid.ymin + ty * (_grid.ymax - _grid.ymin);
      var height = f(x, y);
      positions.push(x);
      positions.push(y);
      positions.push(height);
      colors.push(1);
      colors.push(1);
      colors.push(1);
      colors.push(1);
    }

    for (var i=0; i < _grid.xsize-1; i++) {
      for (var j=0; j < _grid.ysize-1; j++) {
        indices.push(j*_grid.xsize + i);
        indices.push(j*_grid.xsize + i + 1);
        indices.push((j+1)*_grid.xsize + i);
        indices.push(j*_grid.xsize + i + 1);
        indices.push((j+1)*_grid.xsize + i + 1);
        indices.push((j+1)*_grid.xsize + i);
      }
    }

    var dx = (_grid.xmax - _grid.xmin) / _grid.xsize / 2;
    var dy = (_grid.ymax - _grid.ymin) / _grid.ysize / 2;

    for (var k=0; k < positions.length/3; k++) {
      var i = 3 * k;

      var x = positions[i+0];
      var y = positions[i+1];
      var z = positions[i+2];

      var n = {
        x : (f(x + dx, y) - f(x, y))/dx,
        y : (f(x, y + dy) - f(x, y))/dy,
        z : -1
      };
      var d = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z);
      normals.push(n.x/d);
      normals.push(n.y/d);
      normals.push(n.z/d);
    }

    _vbo.positions = positions;
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

    var uLightDir = gl.getUniformLocation(shader, "uLightDir");
    var uAmbientCol = gl.getUniformLocation(shader, "uAmbientCoc");;
    var uDirectionalCol = gl.getUniformLocation(shader, "uDirectionalCol");;

    // Set camera matrices
    gl.uniformMatrix4fv(uPMatrix, false, webgl.pMatrix);
    gl.uniformMatrix4fv(uMVMatrix, false, webgl.mvMatrix);
    gl.uniformMatrix3fv(uNMatrix, false, normalMatrix);

    // Lighting Vectors
    var t = getElapsedSeconds();
    var lightDir = vec3.normalize([ 0, 0, 1 ]);
    gl.uniform3fv(uLightDir, lightDir);
    gl.uniform3f(uAmbientCol, 0, 1, 1);
    gl.uniform3f(uDirectionalCol, 0, 1, 1);

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
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _vbo.ibuffer);
    gl.drawElements(gl.TRIANGLES, 6 * (_grid.xsize-1) * (_grid.ysize-1), gl.UNSIGNED_SHORT, 0);

    //
    _drawer.camera(webgl.pMatrix, webgl.mvMatrix);
    _drawNormals();

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
});


/**
 * Object that is used to draw
 */
var Drawer = (function (gl, shader) {
  return {
    shader : _shader,
    camera : _camera,
    line : _line
  };

  var _pMatrix = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]);

  var _mvMatrix = new Float32Array([
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  ]);

  /**
   * Sets a new shader to use for setting attribute and uniform values
   * @param {!WebGLShader} newShader The new shader to use or NULL or undefined
   * @return {!WebGLShader} the current shader being used
   */
  function _shader (newShader) {
    if (shader !== undefined)
      shader = newShader;
    return shader;
  }

  /**
   * Sets a new Camera
   */
  function _camera (pMatrix, mvMatrix) {
    _pMatrix = pMatrix;
    _mvMatrix = mvMatrix;
  }

  /**
   * Draw a Line
   * @param {!vector3f} u three float values specifying where to draw the line from
   * @param {!vector3f} v three float values specifying where to draw the line to
   * @return {undefined} undefined
   */
  function _line (u, v, col1, col2) {
    if (u.length !== 3 || v.length !== 3) {
      return undefined;
    }

    if (!(col1 && col2 && col1.length == 4 && col2.length == 4)) {
      col1 = [ 1, 1, 1, 1 ];
      col2 = [ 1, 1, 1, 1 ];
    }

    gl.useProgram(shader);

    var aPosition = gl.getAttribLocation(shader, "aPosition");
    var aColor = gl.getAttribLocation(shader, "aColor");
    gl.enableVertexAttribArray(aPosition);
    gl.enableVertexAttribArray(aColor);

    var pbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(u.concat(v)), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    var cbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col1.concat(col2)), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);

    var uPMatrix = gl.getUniformLocation(shader, "uPMatrix");
    var uMVMatrix = gl.getUniformLocation(shader, "uMVMatrix");
    gl.uniformMatrix4fv(uPMatrix, false, _pMatrix);
    gl.uniformMatrix4fv(uMVMatrix, false, _mvMatrix);

    gl.drawArrays(gl.LINE_STRIP, 0, 2);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
});
