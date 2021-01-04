window.onload = demo;
function demo() {
  var demo1 = document.getElementById('demo1');
  demo1.src = imgs.img1;
  setTimeout(function () {
    var engine = new RainyDay(
      'canvas',
      'demo1',
      window.innerWidth,
      window.innerHeight
    );
    engine.gravity = engine.GRAVITY_NON_LINEAR;
    engine.trail = engine.TRAIL_DROPS;
    engine.rain([engine.preset(0, 2, 500)]);
    engine.rain(
      [
        engine.preset(3, 3, 0.88),
        engine.preset(5, 5, 0.9),
        engine.preset(6, 2, 1)
      ],
      100
    );
  }, 1000);
}
