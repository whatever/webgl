var webgl = {
  ___about : "Barebones webgl",
  getShader : function (id) {
    var shader = document.getElementById(id);
    if (!shader)
      throw "Fuck";
    return shader.text;
  },
  createProgram : function (text, type) {
    return undefined;
  },

  /**
   * Perspective-Matrix
   * @param {object} m an object specifying the values used to compute the
   * perspective matrix via frustrum.
   * @return {array} a 16-element array representing a matrix
   */
  perspectiveMatrix : function (m) {
    m.fieldOfView = 30.0;
    m.aspectRatio = canvas.width / canvas.height;
    m.nearPlane = 1.0;
    m.farPlane = 10000.0;
    m.top = nearPlane * Math.tan(fieldOfView * Math.PI / 360.0);
    m.bottom = -top;
    m.right = top * aspectRatio;
    m.left = -right;

    var a = (m.right + m.left) / (m.right - m.left);
    var b = (m.top + m.bottom) / (m.top - m.bottom);
    var c = (m.farPlane + m.nearPlane) / (m.farPlane - m.nearPlane);
    var d = (2 * m.farPlane * m.nearPlane) / (m.farPlane - m.nearPlane);
    var x = (2 * m.nearPlane) / (m.right - m.left);
    var y = (2 * m.nearPlane) / (m.top - m.bottom);

    return [
          x, 0, a, 0,
          0, y, b, 0,
          0, 0, c, d,
          0, 0, -1, 0
    ];
  }


};
