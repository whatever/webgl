/**
 * Object that is used to draw
 */
var Drawer = (function (gl, shader) {
  return {
    shader : _shader,
    camera : _camera,
    line : _line,
    lines : _lines
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

  /**
   * Draw a Set of Lines
   * @param {!vector3f} u a set of three float values specifying where to draw the lines from
   * @param {!vector3f} v a set of three float values specifying where to draw the lines to
   * @return {undefined} undefined
   */
  function _lines (u, v, col1, col2) {
    var U = [];
    var V = [];

    if (u.length != v.length) {
      throw "`u` and `v` size mismatch";
    }

    for (var k = 0; k < u.length; k++) {
      if (u[k].length == 3) {
        U.append(u[k][0]);
        U.append(u[k][1]);
        U.append(u[k][2]);
      }
      if (v[k].length == 3) {
        V.append(v[k][0]);
        V.append(v[k][1]);
        V.append(v[k][2]);
      }
    }
  }
});
