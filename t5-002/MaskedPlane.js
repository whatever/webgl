/**
 *
 * @param {float[3]} _pos [ x, y, z ] coordinates of the center
 * @param {float[3]} _dim [ w, h, d ] size of the plane
 * @param {object} _opts miscelaneous options - color
 */
var MaskedPlane = (function (_pos, _dim, _opts) {
  _opts = _opts || {};
  _opts.color = _opts.color !== undefined ? _opts.color : [ 1, 1, 1, 1 ];
  _opts.mask = _opts.mask !== undefined ? _opts.mask : undefined;
  _opts.pattern = _opts.pattern !== undefined ? _opts.pattern : undefined;
  var _plane = {
    x : _pos[0] ? _pos[0] : 0,
    y : _pos[1] ? _pos[1] : 0,
    z : _pos[2] ? _pos[2] : 0,
    w : _dim[0] ? _dim[0] : 0,
    h : _dim[1] ? _dim[1] : 0,
    d : _dim[2] ? _dim[2] : 0
  };
  var _grid = {
    tiles : 0
  };
  var _vbo = {
    pbuffer : gl.createBuffer(),
    cbuffer : gl.createBuffer(),
    nbuffer : gl.createBuffer(),
    tbuffer : gl.createBuffer(),
    ibuffer : gl.createBuffer(),
    positions : [],
    colors : [],
    normals : [],
    textureCoords: [],
    indices : []
  };
  var _img = new Image();
  var _imgLoaded = false;
  var _texture = gl.createTexture();

  _img.onload = function () {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.bindTexture(gl.TEXTURE_2D, _texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    _imgLoaded = true;
  }

  if (_opts.mask !== undefined && typeof _opts.mask === "string") {
    _img.src = _opts.mask;
  }

  var _pattern = {
    img      : new Image(),
    texture  : gl.createTexture(),
    isLoaded : false,
  };

  _pattern.img.onload = function () {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.bindTexture(gl.TEXTURE_2D, _pattern.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _pattern.img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    _pattern.isLoaded = true;
  }

  if (_opts.pattern !== undefined && typeof _opts.pattern === "string") {
    _pattern.img.src = _opts.pattern;
  }

  _init();

  return {
    _about : "transparency plane for together fest 5 - va.0.c",
    set : _set,
    update : _update,
    draw : _draw
  };

  function _init() {
    var positions = [], normals = [], colors = [], indices = [], texCoords = [];
    // a        b
    //   * - -*
    //   |  / |
    //   | /  |
    //   * - -*
    // d        c
    _plane.z = 0;
    var w = _dim[0]/2.;
    var h = _dim[2]/2.;
    var a = [ _pos[0] - w, _pos[1], _pos[2] - h ];
    var b = [ _pos[0] + w, _pos[1], _pos[2] - h ];
    var c = [ _pos[0] + w, _pos[1], _pos[2] + h ];
    var d = [ _pos[0] - w, _pos[1], _pos[2] + h ];
    // @@@
    // @@@ assign positions
    // 1-3-4
    positions = [];
    positions.push(a[0]);
    positions.push(a[1]);
    positions.push(a[2]);
    positions.push(c[0]);
    positions.push(c[1]);
    positions.push(c[2]);
    positions.push(d[0]);
    positions.push(d[1]);
    positions.push(d[2]);
    // 1-3-2
    positions.push(a[0]);
    positions.push(a[1]);
    positions.push(a[2]);
    positions.push(c[0]);
    positions.push(c[1]);
    positions.push(c[2]);
    positions.push(b[0]);
    positions.push(b[1]);
    positions.push(b[2]);
    // @@@ assign colors
    for (var i = 0; i < 6; i++) {
      colors.push(_opts.color[0]);
      colors.push(_opts.color[1]);
      colors.push(_opts.color[2]);
      colors.push(_opts.color[3]);
    }

    // @@@ assign normals
    normals = [ 
      // 1-3-2
      1, 1, 1,
      1, 1, 1,
      1, 1, 1,
      // 1-3-4
      1, 1, 1,
      1, 1, 1,
      1, 1, 1
    ];

    texCoords = [
      // 1-3-4
      0., 0.,
      1., 1.,
      0., 1.,
      // 1-3-2
      0., 0.,
      1., 1.,
      1., 0.,
    ];

    _grid.tiles = 2;
    _vbo.positions = positions;
    _vbo.colors = positions;
    _vbo.normals = normals;

    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo.pbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo.cbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo.nbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo.tbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _vbo.ibuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  function _set(opts) {
  }

  function _update() {
  }

  function _draw(shader) {
    if (!_imgLoaded)
      return;

    gl.useProgram(shader);
    webgl.pushModelView();
    webgl.perspectiveMatrix({ fieldOfView : 45, aspectRatio : 1, nearPlane : .1, farPlane : 100 });

    var normalMatrix = mat3.create();
    mat4.toInverseMat3(webgl.mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);

    var aPosition = gl.getAttribLocation(shader, "aPosition");
    var aColor = gl.getAttribLocation(shader, "aColor");
    var aNormal = gl.getAttribLocation(shader, "aNormal");
    var aTexCoord = gl.getAttribLocation(shader, "aTexCoord");
    gl.enableVertexAttribArray(aPosition);
    gl.enableVertexAttribArray(aColor);
    gl.enableVertexAttribArray(aNormal);
    gl.enableVertexAttribArray(aTexCoord);

    var uMVMatrix = gl.getUniformLocation(shader, "uMVMatrix");
    var uPMatrix = gl.getUniformLocation(shader, "uPMatrix");
    var uNMatrix = gl.getUniformLocation(shader, "uNMatrix");

    var uLightDir = gl.getUniformLocation(shader, "uLightDir");
    var uAmbientCol = gl.getUniformLocation(shader, "uAmbientCol");;
    var uDirectionalCol = gl.getUniformLocation(shader, "uDirectionalCol");;
    var uMaskTexture = gl.getUniformLocation(shader, "uMaskTexture");;
    var uPatternTexture = gl.getUniformLocation(shader, "uPatternTexture");;

    // Set camera matrices
    gl.uniformMatrix4fv(uPMatrix, false, webgl.pMatrix);
    gl.uniformMatrix4fv(uMVMatrix, false, webgl.mvMatrix);
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

    // Specify texCoord attribute
    gl.bindBuffer(gl.ARRAY_BUFFER, _vbo.tbuffer);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);

    // Attach texture for mask
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, _texture);
    gl.uniform1i(uMaskTexture, 0);

    // Attach texture for pattern
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, _pattern.texture);
    gl.uniform1i(uPatternTexture, 1);

    // Draw as an array (unindexed)
    gl.drawArrays(gl.TRIANGLES, 0, 3*_grid.tiles);

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


