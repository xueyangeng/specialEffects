const root = document.documentElement;
const b = document.body;
const h = document.querySelectorAll('.h');
const ch = document.querySelector('#ch');
const off = document.querySelectorAll('.off');

let base = (e) => {
  var x = e.pageX / window.innerWidth - 0.5;
  var y = e.pageY / window.innerHeight - 0.5;

  h.forEach((item, i) => {
    h[i].style.transform = `
            perspective(10000px)
            rotateX(${y * 4 + 60}deg)
            rotateZ(${-x * 4 + 45}deg)
            translateZ(-9.5vw)
        `;
  });
};
let toggle = (e) => {
  if (ch.checked) {
    root.style.setProperty('--window', '208, 226, 226');
    root.style.setProperty('--lamp', '184, 210, 210');
    off.forEach((item, i) => (off[i].style.display = 'none'));
  } else {
    /* Colores base */
    root.style.setProperty('--window', '185, 250, 250');
    root.style.setProperty('--lamp', '214, 249, 249');
    off.forEach((item, i) => (off[i].style.display = 'inherit'));
  }
};

ch.addEventListener('click', toggle);
b.addEventListener('pointermove', base);
