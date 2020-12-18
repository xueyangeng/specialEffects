let getVal = (x, y, z, s) => noise(x * s, y * s, seed + z * s) * 2 - 1;

class Slice {
  constructor(z, size, scale) {
    let g = createGraphics(size, size);
    g.colorMode(HSB, 1, 1, 1);
    g.stroke(z / size, 1, 1, 0.1);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let v = getVal(i, j, z, scale);
        if (abs(v) < 0.02) g.point(i, j);
      }
    }
    this.img = g;
  }
}

function setup() {
  pixelDensity(1);
  createCanvas();
  colorMode(HSB, 1, 1, 1);
  windowResized();
}

let newSlice = () => {
  slices.push(new Slice(slices.length, size, 0.04));
};

let slices;
let size = 200;
let s2 = Math.hypot(size, size);
let seed = 1e6;
let init = () => {
  noiseDetail(2);
  seed = random(1e6);
  slices = [];
};

let rotX = 0;

function draw() {
  background(0);
  if (slices.length < 100) newSlice();

  push();
  translate(width / 2, height / 2 - s2 / 2);
  scale(min(width / s2, height / size) * 0.8);
  imageMode(CENTER, CENTER);
  blendMode(ADD);

  rotX += 0.01;

  for (let i = 0; i < slices.length; i++) {
    push();
    translate(0, i);
    scale(1, 0.5);
    rotate(rotX);
    image(slices[i].img, 0, 0);
    pop();
  }
  pop();
}

let pressX = 0;

function mousePressed() {
  pressX = mouseX;
}

function mouseDragged() {
  rotX += (pmouseX - mouseX) / 100;
}

function mouseReleased() {
  if (pressX - mouseX == 0) init();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  init();
}
