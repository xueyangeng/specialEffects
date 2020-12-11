window.onload = init;
function randNum(max) {
  var min = 0;
  return Math.floor(Math.random() * (max - min + 1) + min);
}
function init() {
  var balls = document.getElementsByClassName('g-ball');
  for (var i = 0; i < balls.length; i++) {
    var ball = balls[i];
    var width = randNum(50) + 'px';
    ball.style.width = width;
    ball.style.height = width;
    ball.style.left = randNum(70) - 55 + 'px';
    ball.style['animation'] =
      'movetop 1s linear ' + -randNum(3000) / 1000 + 's infinite';
  }
}
