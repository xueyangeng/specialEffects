(function () {
  var scr,
    pointer,
    robots = [],
    transform,
    transformOrigin;
  var Robot = function (span) {
    this.span = span;
    this.armSegments = [];
    this.numSegments = 1;
    this.y = 0;
    this.armSegments.push(new ArmSegment(this, false));
    var s = span.getElementsByTagName('img');
    for (var img, i = 0; (img = s[i++]); ) {
      this.numSegments++;
      this.armSegments.push(new ArmSegment(this, img));
    }
  };
  Robot.prototype.anim = function () {
    var seg1 = this.armSegments[this.numSegments - 1];
    seg1.x += (pointer.X - seg1.x - this.span.offsetLeft) * 0.075;
    seg1.y += (pointer.Y - seg1.y - this.span.offsetTop) * 0.075;
    var i = this.numSegments - 1;
    while (--i) {
      var seg0 = this.armSegments[i];
      var seg1 = this.armSegments[i + 1];
      var a = Math.atan2(seg0.y - seg1.y, seg0.x - seg1.x);
      seg0.x = seg1.x + Math.cos(a) * seg1.length;
      seg0.y = seg1.y + Math.sin(a) * seg1.length;
    }
    var i = 0,
      seg0,
      seg1;
    while ((seg0 = this.armSegments[i++])) {
      if (i > 1) {
        var seg1 = this.armSegments[i - 2];
        var a = (seg0.a = Math.atan2(seg0.y - seg1.y, seg0.x - seg1.x));
        seg0.x = seg1.x + Math.cos(a) * seg0.length;
        seg0.y = seg1.y + Math.sin(a) * seg0.length;
      }
      if (seg0.img) {
        seg0.css[transform] =
          'translate(' +
          ((0.5 + seg0.x - seg0.sx) | 0) +
          'px,' +
          ((0.5 + seg0.y - seg0.sy) | 0) +
          'px) rotate(' +
          seg0.a +
          'rad)';
        seg0.css[transformOrigin] =
          ((0.5 + seg0.sx) | 0) + 'px ' + ((0.5 + seg0.sy) | 0) + 'px';
      }
    }
  };
  var ArmSegment = function (parent, img) {
    this.img = img;
    this.width = 0;
    this.length = 0;
    this.sx = 0;
    this.a = 0;
    this.x = 0;
    if (img) {
      this.css = img.style;
      this.sy = Math.round(img.height * 0.5);
      this.length = img.width - this.sy;
      this.sx = img.width;
    }
    this.y = parent.y;
    parent.y += this.length;
  };
  var run = function () {
    for (var r, i = 0; (r = robots[i++]); ) {
      r.anim();
    }
    requestAnimFrame(run);
  };
  var init = function () {
    scr = new ge1doot.Screen({
      container: 'screen'
    });
    pointer = new ge1doot.Pointer({});
    var t = [
      'transform',
      'msTransform',
      'MozTransform',
      'WebkitTransform',
      'OTransform'
    ];
    for (var test, i = 0; (test = t[i++]); ) {
      if (typeof document.body.style[test] != 'undefined') {
        transform = test;
        transformOrigin = test + 'Origin';
        break;
      }
    }
    var s = document.getElementById('screen').getElementsByTagName('span');
    for (var r, i = 0; (r = s[i++]); ) {
      robots.push(new Robot(r));
    }
    pointer.X = scr.width / 2;
    pointer.Y = scr.height / 2;
    if (transform) run();
  };
  return {
    load: function (params) {
      window.addEventListener(
        'load',
        function () {
          init();
        },
        false
      );
    }
  };
})().load();
