import * as THREE from "three";

function convertX(x) {
  return (x / window.innerWidth) * 2 - 1;
}

function convertY(y) {
  return -(y / window.innerHeight) * 2 + 1;
}

let mouseX = 0;
let mouseY = 0;
document.addEventListener("mousemove", function (event) {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

let hoverLinkedIn = false;
let hoverGitHub = false;
document.addEventListener("click", function (event) {
  if (hoverLinkedIn) {
    window.open("https://www.linkedin.com/in/adam-schueller/", "_blank");
  } else {
    window.open("https://www.github.com/theshoe1029", "_blank");
  }
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const raycaster = new THREE.Raycaster();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const root = new THREE.Object3D();
let links = [];
let lLink = null;
let rLink = null;
const loader = new THREE.TextureLoader();
loader.load("/card.png", (texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  const cardWidth = texture.width / texture.height;
  const cardGeometry = new THREE.BoxGeometry(cardWidth, 1, 0.01);
  const cardTexture = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const card = new THREE.Mesh(cardGeometry, cardTexture);
  card.position.set(0, 0, -0.01);
  root.add(card);

  const linkWidth = (90 / texture.width) * cardWidth;
  const linkHeight = 30 / texture.height;
  const linkGeometry = new THREE.PlaneGeometry(linkWidth, linkHeight);
  const linkMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  function addLink(x, y) {
    const link = new THREE.Mesh(linkGeometry, linkMaterial);

    link.position.set(x, y, 0);
    link.visible = false;

    root.add(link);
    links.push(link);
    return link;
  }

  const lBufferX = (25 / texture.width) * cardWidth;
  const rBufferX = (15 / texture.width) * cardWidth;
  const bufferY = 25 / texture.height;
  lLink = addLink(
    -cardWidth / 2 + linkWidth / 2 + lBufferX,
    1 / 2 - linkHeight / 2 - bufferY
  );
  rLink = addLink(
    cardWidth / 2 - linkWidth / 2 - rBufferX,
    1 / 2 - linkHeight / 2 - bufferY
  );

  scene.add(root);
});

camera.position.z = 1.5;

function animate() {
  root.rotation.y = (2 * (mouseX - window.innerWidth / 2)) / window.innerWidth;
  root.rotation.x = (mouseY - window.innerHeight / 2) / window.innerHeight;

  raycaster.setFromCamera(
    new THREE.Vector2(convertX(mouseX), convertY(mouseY)),
    camera
  );

  for (let link of links) {
    const intersection = raycaster.intersectObject(link, false);
    if (link.uuid == lLink.uuid) {
      hoverLinkedIn = false;
    } else {
      hoverGitHub = false;
    }
    if (intersection.length == 1) {
      link.visible = true;
      if (lLink.uuid == intersection[0].object.uuid) {
        hoverLinkedIn = true;
      } else {
        hoverGitHub = true;
      }
    } else {
      link.visible = false;
    }
  }

  if (hoverLinkedIn || hoverGitHub) {
    document.body.style.cursor = "pointer";
  } else {
    document.body.style.cursor = "default";
  }

  renderer.render(scene, camera);
}
