//代码整理：懒人之家 www.lanrenzhijia.com
var loadingLayer;
var backgroundLayer, backLayer;
var wallLayer;
var bird, centerlayer;
var bitmap, slingshotJoin;
var imglist = {};
var url = 'file:///Users/taike/Desktop/特效/愤怒的小鸟';
var imgData = new Array(
  {
    type: 'js',
    path: url + '/js/Bird.js'
  },
  { type: 'js', path: url + '/js/Pig.js' },
  {
    type: 'js',
    path: url + '/js/Stage.js'
  },
  {
    type: 'js',
    path: url + '/js/RemoveObject.js'
  },
  { name: 'back', path: url + '/images/back.png' },
  { name: 'bird1', path: url + '/images/bird1.png' },
  { name: 'slingshot1', path: url + '/images/slingshot1.png' },
  { name: 'slingshot2', path: url + '/images/slingshot2.png' },
  { name: 'remove', path: url + '/images/remove.png' },
  { name: 'pig01', path: url + '/images/pig01.png' },
  { name: 'pig02', path: url + '/images/pig02.png' },
  { name: 'st01', path: url + '/images/st01.png' },
  { name: 'st02', path: url + '/images/st02.png' },
  { name: 'st11', path: url + '/images/st11.png' },
  { name: 'st12', path: url + '/images/st12.png' },
  { name: 'st21', path: url + '/images/st21.png' },
  { name: 'st22', path: url + '/images/st22.png' },
  { name: 'st31', path: url + '/images/st31.png' },
  { name: 'st32', path: url + '/images/st32.png' },
  { name: 'desk', path: url + '/images/desk.png' }
);
var startX, startY;
function main() {
  if (LGlobal.canTouch) {
    LGlobal.stageScale = LStageScaleMode.EXACT_FIT;
    LSystem.screen(LStage.FULL_SCREEN);
  }
  LMouseEventContainer.set(LMouseEvent.MOUSE_DOWN, true);
  LMouseEventContainer.set(LMouseEvent.MOUSE_UP, true);
  LMouseEventContainer.set(LMouseEvent.MOUSE_MOVE, true);
  LGlobal.setDebug(true);
  backgroundLayer = new LSprite();
  addChild(backgroundLayer);
  backLayer = new LSprite();
  addChild(backLayer);

  loadingLayer = new LoadingSample3();
  backLayer.addChild(loadingLayer);
  LLoadManage.load(
    imgData,
    function (progress) {
      loadingLayer.setProgress(progress);
    },
    function (result) {
      imglist = result;
      backLayer.removeChild(loadingLayer);
      loadingLayer = null;
      gameInit();
    }
  );
}
function gameInit(event) {
  LGlobal.box2d = new LBox2d();
  var back = new LBitmap(new LBitmapData(imglist['back']));
  back.scaleX = LGlobal.width / back.getWidth(); //can beyond 1
  back.scaleY = LGlobal.height / back.getHeight();
  //	alert("back.scaleX="+back.scaleX);
  backgroundLayer.addChild(back);

  backLayer.graphics.drawRect(0, '#ffffff', [0, 0, 1600, 480]);

  wallLayer = new LSprite();
  wallLayer.y = 480;
  backLayer.addChild(wallLayer);
  wallLayer.addBodyPolygon(1600, 10, 0); //地面是矩形刚体
  backLayer.graphics.drawRect(1, '#ffffff', [0, 475, 1600, 5], true, '#000000');

  bitmap = new LBitmap(new LBitmapData(imglist['slingshot1']));
  bitmap.x = 215;
  bitmap.y = 290;
  backLayer.addChild(bitmap);

  bird = new LSprite();
  bird.name = 'bird01';
  backLayer.addChild(bird);
  bitmap = new LBitmap(new LBitmapData(imglist['bird1']));
  bird.addChild(bitmap);

  bitmap = new LBitmap(new LBitmapData(imglist['slingshot2']));
  bitmap.x = 190;
  bitmap.y = 290;
  backLayer.addChild(bitmap);
  setStage(['desk'], 800, 430, 0, 10, false);
  setStage(['desk'], 970, 430, 0, 10, false);
  setStage(['st11', 'st12'], 935, 410, 0, 1, true);
  setStage(['st01', 'st02'], 905, 370, 90, 1, true);
  setStage(['st01', 'st02'], 965, 370, 90, 1, true);
  setStage(['st11', 'st12'], 935, 310, 0, 1, true);
  setStage(['st31', 'st32'], 817, 370, 90, 1, true);
  setStage(['st31', 'st32'], 970, 370, 90, 1, true);
  setStage(['st31', 'st32'], 895, 250, 0, 1, true);
  setStage(['st21', 'st22'], 955, 230, 0, 1, true);
  setStage(['st31', 'st32'], 858, 150, 90, 1, true);
  setStage(['st31', 'st32'], 925, 150, 90, 1, true);
  setStage(['st11', 'st12'], 935, 50, 0, 1, true);
  setStage(['st21', 'st22'], 950, 30, 90, 1, true);
  setStage(['st21', 'st22'], 800, 430, 90, 1, true);
  setStage(['st21', 'st22'], 1100, 430, 90, 1, true);
  var pig = new Pig();
  pig.x = 950;
  pig.y = 173;
  backLayer.addChild(pig);
  backLayer.x = LGlobal.width - 1200;
  LGlobal.box2d.synchronous();
  LTweenLite.to(backLayer, 1, {
    x: 0,
    delay: 0.1,
    onUpdate: function () {
      LGlobal.box2d.synchronous();
    },
    onComplete: run,
    ease: Sine.easeIn
  });
}
function run() {
  bird.rotate = 0;
  bird.x = 300;
  bird.y = 430;
  bird.yspeed = -5;
  LTweenLite.to(bird, 1, {
    x: 200,
    yspeed: 5,
    delay: 1,
    rotate: -360,
    onUpdate: function () {
      bird.y += bird.yspeed;
    },
    onComplete: function () {
      start();
    },
    ease: Sine.easeIn
  });
}

function downStart(event) {
  if (
    event.offsetX > bird.x &&
    event.offsetX < bird.x + bird.getWidth() &&
    event.offsetY > bird.y &&
    event.offsetY < bird.y + bird.getHeight()
  ) {
    backLayer.removeEventListener(LMouseEvent.MOUSE_DOWN, downStart);
    backLayer.addEventListener(LMouseEvent.MOUSE_MOVE, downMove);
    backLayer.addEventListener(LMouseEvent.MOUSE_UP, downOver);
  }
}
function downOver(event) {
  backLayer.removeEventListener(LMouseEvent.MOUSE_UP, downOver);
  backLayer.removeEventListener(LMouseEvent.MOUSE_MOVE, downMove);
  //拖动后的中心位置
  var startX2 = bird.x + bird.getWidth() * 0.5;
  var startY2 = bird.y + bird.getHeight() * 0.5;
  var r = Math.sqrt(
    Math.pow(startX - startX2, 2) + Math.pow(startY - startY2, 2)
  );
  var angle = Math.atan2(startY2 - startY, startX2 - startX);

  bird.addBodyCircle(
    bird.getWidth() * 0.5,
    bird.getHeight() * 0.5,
    bird.getWidth() * 0.5,
    1,
    5,
    0.4,
    0.3
  );
  bird.setBodyMouseJoint(true); //meaning?
  var force = 70;
  var vec = new LGlobal.box2d.b2Vec2(
    -force * r * Math.cos(angle),
    -force * r * Math.sin(angle)
  );
  bird.box2dBody.ApplyForce(vec, bird.box2dBody.GetWorldCenter());
  backLayer.addEventListener(LEvent.ENTER_FRAME, onframe);
}
function downMove(event) {
  //event.selfX=event.offsetX;event.selfY=offsetY  for now
  //	alert("event.selfX="+event.selfX+";event.selfY="+event.selfY+";event.offsetX="+event.offsetX+";event.offsetY="+event.offsetY);
  var r = Math.sqrt(
    Math.pow(startX - event.selfX, 2) + Math.pow(startY - event.selfY, 2)
  );
  if (r > 100) r = 100;
  var angle = Math.atan2(event.selfY - startY, event.selfX - startX);
  bird.x = Math.cos(angle) * r + startX - bird.getWidth() * 0.5;
  bird.y = Math.sin(angle) * r + startY - bird.getHeight() * 0.5;
}
function postSolve(contact, impulse) {
  if (contact.GetFixtureA().GetBody().GetUserData().hit)
    contact
      .GetFixtureA()
      .GetBody()
      .GetUserData()
      .hit(impulse.normalImpulses[0]);
  if (contact.GetFixtureB().GetBody().GetUserData().hit)
    contact
      .GetFixtureB()
      .GetBody()
      .GetUserData()
      .hit(impulse.normalImpulses[0]);
}
function start() {
  LGlobal.box2d.setEvent(LEvent.POST_SOLVE, postSolve);
  (bird.x = 200), (bird.y = 320);
  backLayer.addEventListener(LMouseEvent.MOUSE_DOWN, downStart);
  startX = bird.x + bird.getWidth() * 0.5;
  startY = bird.y + bird.getHeight() * 0.5;
  //bird中心的位置
}
function onframe() {
  //	alert("backLayer.x="+backLayer.x+";bird="+bird.x);
  if (bird) {
    backLayer.x = LGlobal.width * 0.5 - (bird.x + bird.getWidth() * 0.5);
    if (backLayer.x > 0) {
      //bird只有超过大约中心位置才视图跟着走
      backLayer.x = 0;
    } else if (backLayer.x < LGlobal.width - 1600) {
      //屏幕移到“最右边”就不往前走了
      backLayer.x = LGlobal.width - 1600;
    }
    LGlobal.box2d.synchronous();
  }
  var child;
  for (var key in backLayer.childList) {
    child = backLayer.childList[key];
    if (child.name == null || child.name.indexOf('instance') >= 0) continue;
    if (child.x < -child.getWidth() || child.x > backLayer.getWidth()) {
      child.name = null;
      backLayer.removeChild(child);
      //以下代码从不执行
      /*			if(child.name == "bird01"){
				bird = null;
				backLayer.addEventListener(LMouseEvent.MOUSE_DOWN,moveStart);
				backLayer.addEventListener(LMouseEvent.MOUSE_MOVE,moveRun);
				backLayer.addEventListener(LMouseEvent.MOUSE_UP,moveEnd);
			}*/
    } else if (
      (child.name == 'stage' || child.name == 'pig') &&
      child.hp <= 0
    ) {
      if (child.name == 'pig') {
        var removeObj = new RemoveObject();
        removeObj.x = child.x;
        removeObj.y = child.y;
        backLayer.addChild(removeObj);
      }
      backLayer.removeChild(child);
    } else if (child.name == 'remove') {
      child.run();
    }
  }
}
function setStage(list, x, y, rotate, m, ctrl) {
  var stageLayer = new Stage(list, rotate, m, ctrl);
  stageLayer.x = x;
  stageLayer.y = y;
  backLayer.addChild(stageLayer);
  return stageLayer;
}
/*var mouseDownX = -1,saveX;
function moveStart(event){
	mouseDownX = event.offsetX;
	saveX = backLayer.x;
}
function moveRun(event){
	alert("backLayer.x="+backLayer.x+";mouseDownX="+mouseDownX+";event.offsetX="+event.offsetX);
	if(mouseDownX<0)return;
	backLayer.x = saveX + (event.offsetX - mouseDownX);
	LGlobal.box2d.synchronous();
}
function moveEnd(event){
	mouseDownX = -1;
}*/
