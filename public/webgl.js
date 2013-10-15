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
    m = m || {};
    m.fieldOfView = m.fieldOfView || 30.0;
    m.aspectRatio = m.aspectRatio || 1;
    m.nearPlane = m.nearPlane || 1.0;
    m.farPlane = m.farPlane || 10000.0;
    m.top = m.top || (m.nearPlane * Math.tan(m.fieldOfView * Math.PI / 360.0));
    m.bottom = -m.top;
    m.right = m.top * m.aspectRatio;
    m.left = -m.right;

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

window.requestAnimFrame = (function() {
  return
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame;
})();
