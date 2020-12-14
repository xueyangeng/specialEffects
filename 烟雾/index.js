var camera, scene, renderer, geometry, material, mesh, renderW, renderH;
var img1 = images.img1;
init();
animate();

function init() {
  clock = new THREE.Clock();

  renderW = document.getElementById('scene').offsetWidth;
  renderH = document.getElementById('scene').offsetHeight;
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(renderW, renderH);
  renderer.setClearColor(0xffffff, 1);
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, renderW / renderH, 1, 10000);
  camera.position.z = 1300;
  scene.add(camera);

  geometry = new THREE.CubeGeometry(200, 200, 200);
  material = new THREE.MeshLambertMaterial({
    color: 0xaa6666,
    wireframe: false
  });
  mesh = new THREE.Mesh(geometry, material);
  cubeSineDriver = 0;

  THREE.ImageUtils.crossOrigin = '';

  light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(-1, 0, 1);
  scene.add(light);

  smokeTexture = THREE.ImageUtils.loadTexture(img1);
  smokeMaterial = new THREE.MeshLambertMaterial({
    color: 0x6ecbea,
    opacity: 1,
    map: smokeTexture,
    transparent: true
  });
  smokeGeo = new THREE.PlaneGeometry(300, 300);
  smokeParticles = [];

  for (p = 0; p < 20; p++) {
    var particle = new THREE.Mesh(smokeGeo, smokeMaterial);
    particle.position.set(
      Math.random() * 200 - 100,
      Math.random() * 200 - 100,
      Math.random() * 1000 - 100
    );
    particle.rotation.z = Math.random() * 360;
    scene.add(particle);
    smokeParticles.push(particle);
  }

  document.getElementById('scene').appendChild(renderer.domElement);
}

function animate() {
  delta = clock.getDelta();
  requestAnimationFrame(animate);
  evolveSmoke();
  render();
}

function evolveSmoke() {
  var sp = smokeParticles.length;
  while (sp--) {
    smokeParticles[sp].rotation.z += delta * 0.2;
  }
}

function render() {
  mesh.rotation.x += 0.005;
  mesh.rotation.y += 0.01;
  cubeSineDriver += 0.01;
  mesh.position.z = 100 + Math.sin(cubeSineDriver) * 500;
  renderer.render(scene, camera);
}

window.onresize = function () {
  renderW = document.getElementById('scene').offsetWidth;
  renderH = document.getElementById('scene').offsetHeight;
  renderer.setSize(renderW, renderH);
  camera.aspect = renderW / renderH;
  camera.updateProjectionMatrix();
};
