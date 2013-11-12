var countpixels = (function () {

  var _prev = {
    scrollTop : NaN,
    time : NaN,
    dx : NaN,
    dt : NaN,
  };

  var _now = {
    scrollTop : NaN,
    time : NaN,
    dx : NaN,
    dt : NaN,
  };

  document.addEventListener("scroll", _onscroll);
  document.addEventListener("scroll", function () {
  });

  return {
  };

  function _onscroll () {
    var scrollTop = _scrolltop();
    var time = _time();
    var dx = scrollTop - _prev.scrollTop;
    var dt = time - _prev.time;

    _prev = _now;

    _now = {
      scrollTop : scrollTop,
      time : time,
      dx : dx,
      dt : dt,
    };
  }

  function _scrolltop () {
    if(typeof pageYOffset!= 'undefined') {
      //most browsers except IE before #9
      return pageYOffset;
    }
    var B = document.body; //IE 'quirks'
    var D = document.documentElement; //IE with doctype
    D = (D.clientHeight) ? D: B;
    return D.scrollTop;
  }

  var _t = +new Date();
  function _time () {
    var elapsed = (new Date() - _t)/1000.;
    _t = +new Date();
    return elapsed;
  }
})();
