//樱花 Quaint 修改版

var stop, staticx;
var img = new Image();
img.src = 'images/petal.png';

// 樱花数量
var sakuraNum = 40;
// 樱花越界限制次数, -1不做限制,无限循环
var limitTimes = 2;

// 定义限制数组
var limitArray = new Array(sakuraNum);
for (var index = 0; index < sakuraNum; index++) {
  limitArray[index] = limitTimes;
}

function Sakura(x, y, s, r, fn, idx) {
  this.x = x;
  this.y = y;
  this.s = s;
  this.r = r;
  this.fn = fn;
  this.idx = idx;
}

Sakura.prototype.draw = function (cxt) {
  cxt.save();
  cxt.translate(this.x, this.y);
  cxt.rotate(this.r);
  cxt.drawImage(img, 0, 0, 40 * this.s, 40 * this.s);
  cxt.restore();
};

// 无飘落代码
Sakura.prototype.update = function () {
  this.x = this.fn.x(this.x, this.y);
  this.y = this.fn.y(this.y, this.y);
  this.r = this.fn.r(this.r);

  // 如果樱花越界, 重新调整位置
  if (
    this.x > window.innerWidth ||
    this.x < 0 ||
    this.y > window.innerHeight ||
    this.y < 0
  ) {
    // 如果樱花不做限制
    if (limitArray[this.idx] == -1) {
      this.r = getRandom('fnr');
      if (Math.random() > 0.4) {
        this.x = getRandom('x');
        this.y = 0;
        this.s = getRandom('s');
        this.r = getRandom('r');
      } else {
        this.x = window.innerWidth;
        this.y = getRandom('y');
        this.s = getRandom('s');
        this.r = getRandom('r');
      }
    }
    // 否则樱花有限制
    else {
      if (limitArray[this.idx] > 0) {
        this.r = getRandom('fnr');
        if (Math.random() > 0.4) {
          this.x = getRandom('x');
          this.y = 0;
          this.s = getRandom('s');
          this.r = getRandom('r');
        } else {
          this.x = window.innerWidth;
          this.y = getRandom('y');
          this.s = getRandom('s');
          this.r = getRandom('r');
        }
        limitArray[this.idx]--;
      }
    }
  }
};

SakuraList = function () {
  this.list = [];
};
SakuraList.prototype.push = function (sakura) {
  this.list.push(sakura);
};

// list update 方法
SakuraList.prototype.update = function () {
  for (var i = 0, len = this.list.length; i < len; i++) {
    this.list[i].update();
  }
};

SakuraList.prototype.draw = function (cxt) {
  for (var i = 0, len = this.list.length; i < len; i++) {
    this.list[i].draw(cxt);
  }
};
SakuraList.prototype.get = function (i) {
  return this.list[i];
};
SakuraList.prototype.size = function () {
  return this.list.length;
};

function getRandom(option) {
  var ret, random;
  switch (option) {
    case 'x':
      ret = Math.random() * window.innerWidth;
      break;
    case 'y':
      ret = Math.random() * window.innerHeight;
      break;
    case 's':
      ret = Math.random();
      break;
    case 'r':
      ret = Math.random() * 6;
      break;
    case 'fnx':
      random = -0.5 + Math.random() * 1;
      ret = function (x, y) {
        return x + 0.5 * random - 1.7;
      };
      break;
    case 'fny':
      random = 1.5 + Math.random() * 0.7;
      ret = function (x, y) {
        return y + random;
      };
      break;
    case 'fnr':
      random = Math.random() * 0.03;
      ret = function (r) {
        return r + random;
      };
      break;
  }
  return ret;
}

function startSakura() {
  requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame;
  var canvas = document.createElement('canvas'),
    cxt;
  staticx = true;
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
  canvas.setAttribute(
    'style',
    'position: fixed;left: 0;top: 0;pointer-events: none;'
  );
  canvas.setAttribute('id', 'canvas_sakura');
  document.getElementsByTagName('body')[0].appendChild(canvas);
  cxt = canvas.getContext('2d');
  var sakuraList = new SakuraList();
  // 设置樱花个数 , 设置21 ,每一朵樱花都是爱你的形状 dwj~
  for (var i = 0; i < sakuraNum; i++) {
    var sakura, randomX, randomY, randomS, randomR, randomFnx, randomFny;
    randomX = getRandom('x');
    randomY = getRandom('y');
    randomR = getRandom('r');
    randomS = getRandom('s');
    randomFnx = getRandom('fnx');
    randomFny = getRandom('fny');
    randomFnR = getRandom('fnr');
    sakura = new Sakura(
      randomX,
      randomY,
      randomS,
      randomR,
      {
        x: randomFnx,
        y: randomFny,
        r: randomFnR
      },
      i
    );
    sakura.draw(cxt);
    sakuraList.push(sakura);
  }

  stop = requestAnimationFrame(function () {
    cxt.clearRect(0, 0, canvas.width, canvas.height);
    // 修改樱花位置逻辑
    sakuraList.update();
    // 画出修改后的樱花
    sakuraList.draw(cxt);
    // 递归 修改位置, 画出修改后的樱花
    stop = requestAnimationFrame(arguments.callee);
  });
}

window.onresize = function () {
  var canvasSnow = document.getElementById('canvas_snow');
  // canvasSnow 在改变浏览器大小的时候会为null
  if (canvasSnow) {
    canvasSnow.width = window.innerWidth;
    canvasSnow.height = window.innerHeight;
  }
};

img.onload = function () {
  startSakura();
};

function stopp() {
  if (staticx) {
    var child = document.getElementById('canvas_sakura');
    child.parentNode.removeChild(child);
    window.cancelAnimationFrame(stop);
    staticx = false;
  } else {
    startSakura();
  }
}
