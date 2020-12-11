var scene, camera, renderer, controls, guiControls;
var Earth = images.Earth;
var EarthNormal = images.EarthNormal;
var EarthSpec = images.EarthSpec;
/* 场景 */
function initScene() {
  scene = new THREE.Scene();
}

/* 相机 */
function initCamera() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.set(0, 10, 120);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
}

/* 渲染器 */
function initRender() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearAlpha(0.8);
  document.body.appendChild(renderer.domElement);
}

/* 灯光 */
function initLight() {
  scene.add(new THREE.AmbientLight(0x0c0c0c));
  var spotLight1 = new THREE.SpotLight(0xffffff);
  spotLight1.position.set(-400, -400, -400);
  var spotLight2 = new THREE.SpotLight(0xffffff);
  spotLight2.position.set(400, 400, 400);
  scene.add(spotLight2);
}

/* 控制器 */
function initControls() {
  /* 地图控件 */
  controls = new THREE.OrbitControls(camera, renderer.domElement);
}

/* 场景中的内容 */
var sphere;
function initContent() {
  var material = new THREE.MeshPhongMaterial();
  material.map = new THREE.TextureLoader().load(Earth);
  material.normalMap = new THREE.TextureLoader().load(EarthNormal);
  material.specularMap = new THREE.TextureLoader().load(EarthSpec);
  material.specular = new THREE.Color(0x3366ff);
  material.shininess = 2;
  var sphereGeometry = new THREE.SphereGeometry(40, 50, 50);
  sphere = new THREE.Mesh(sphereGeometry, material);
  scene.add(sphere);
}

/* 窗口变动触发 */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* 数据更新 */
function update() {
  controls.update();
  if (sphere) {
    sphere.rotateY(0.001);
  }
}

/* 初始化 */
function init() {
  if (!Detector.webgl) Detector.addGetWebGLMessage();
  initScene();
  initCamera();
  initRender();
  initLight();
  initControls();
  initContent();
  /* 监听事件 */
  window.addEventListener('resize', onWindowResize, false);
}

/* 循环渲染 */
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  update();
}

/* 初始加载 */
(function () {
  init();
  animate();
})();
