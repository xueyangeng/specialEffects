window.onload = init;
function init() {
  window.addEventListener('scroll', function (event) {
    var topDistance = document.documentElement.scrollTop;
    var layers = document.querySelectorAll("[data-type='parallax']");
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      var depth = layer.getAttribute('data-depth');
      movement = -(topDistance * depth);
      translate3d = 'translate3d(0, ' + movement + 'px, 0)';
      layer.style['-webkit-transform'] = translate3d;
      layer.style['-moz-transform'] = translate3d;
      layer.style['-ms-transform'] = translate3d;
      layer.style['-o-transform'] = translate3d;
      layer.style.transform = translate3d;
    }
  });
}
