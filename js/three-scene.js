/**
 * Three.js 3D Floating Card System — Performance Optimized
 */
import * as THREE from 'three';

// ── Artwork Data ──────────────────────────────────
const artworks = [
  { id: 'spring',  title: '春日絮语', meta: 'Watercolor / 2026', desc: '以湿画法捕捉初春庭院中光影斑驳的午后，水色交融间呈现宁静与生机。', category: 'watercolor', color: '#c17a5c', ch: '春' },
  { id: 'dream',   title: '梦境漫游', meta: 'Digital / 2025',    desc: '探索潜意识边界的系列插画，柔和的色块与有机的线条交织出梦的轮廓。', category: 'digital',    color: '#5b8cff', ch: '梦' },
  { id: 'rain',    title: '雨季',     meta: 'Watercolor / 2025', desc: '江南雨季系列之一，晕染的灰蓝色调记录石板路上倒映的天光。',       category: 'watercolor', color: '#5b8caa', ch: '雨' },
  { id: 'alley',   title: '城市速写：巷弄', meta: 'Sketch / 2024', desc: '钢笔淡彩记录的老城巷弄，在拆与留之间，为即将消失的风景画像。', category: 'sketch',     color: '#8c7a6b', ch: '巷' },
  { id: 'light',   title: '追光者',   meta: 'Digital / 2025',    desc: '以光影为主题的系列创作，探索不同时刻中光线与情感的交织。',       category: 'digital',    color: '#d4a040', ch: '光' },
  { id: 'flowers', title: '二十四番花信风', meta: 'Watercolor / 2024', desc: '以中国传统节气花卉为主题的系列水彩创作，一花一时节。',         category: 'watercolor', color: '#cc7788', ch: '花' },
];

// ── Globals ───────────────────────────────────────
let scene, camera, renderer, cardGroup;
let cardMeshes = [];
let cardDataMap = [];
let lastHovered = null;
let isMobile = false;

const mouse = { x: 0, y: 0 };
const target = { x: 0, y: 0 };
const current = { x: 0, y: 0 };
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let raycasterThrottle = 0;
let lastOpacity = 1;

// ── Create Card Mesh ──────────────────────────────
function createCardMesh(artwork, index) {
  const group = new THREE.Group();

  // Glow border (behind card, slightly larger) — simple plane
  const glowGeo = new THREE.PlaneGeometry(1.55, 1.95);
  const glowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(artwork.color),
    opacity: 0.12,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.position.z = -0.02;
  group.add(glowMesh);

  // Main card face — simple plane
  const cardGeo = new THREE.PlaneGeometry(1.4, 1.85);
  const cardMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(artwork.color),
    roughness: 0.4,
    metalness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: true,
  });
  const cardMesh = new THREE.Mesh(cardGeo, cardMat);
  cardMesh.userData = { artworkIndex: index };
  group.add(cardMesh);

  // Load texture
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    `images/${artwork.id}.jpg`,
    (texture) => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      cardMat.map = texture;
      cardMat.color.set('#ffffff');
      cardMat.needsUpdate = true;
    },
    undefined,
    () => {} // fallback: colored material
  );

  group.userData = {
    cardMesh,
    glowMesh,
    glowMat,
    cardMat,
    baseColor: new THREE.Color(artwork.color),
    artwork,
  };

  cardMeshes.push(cardMesh);
  cardDataMap.push({
    group,
    glowMesh,
    glowMat,
    cardMat,
    baseColor: new THREE.Color(artwork.color),
    artwork,
  });

  return group;
}

// ── Scene Setup ────────────────────────────────────
function setupScene() {
  const container = document.getElementById('three-container');
  if (!container) return;

  const w = window.innerWidth;
  const h = window.innerHeight;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 50);
  camera.position.set(0, 0, 9);

  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  const directional = new THREE.DirectionalLight(0xffffff, 0.6);
  directional.position.set(5, 5, 8);
  scene.add(ambient, directional);

  // Card group
  cardGroup = new THREE.Group();
  scene.add(cardGroup);

  // Orbital layout
  const positions = [
    { angle: -0.7,  radius: 2.6, y: 0.4,  z: 0.3,  ry: 0.3 },
    { angle: 0.05,  radius: 2.9, y: -0.15, z: -0.1, ry: -0.05 },
    { angle: 0.7,   radius: 2.6, y: 0.55, z: 0.2,  ry: -0.35 },
    { angle: -1.1,  radius: 4.2, y: -0.5, z: -0.7, ry: 0.45 },
    { angle: -0.25, radius: 4.0, y: 0.1,  z: -0.9, ry: -0.15 },
    { angle: 1.1,   radius: 4.2, y: -0.3, z: -0.5, ry: -0.5 },
  ];

  artworks.forEach((art, i) => {
    const group = createCardMesh(art, i);
    const pos = positions[i] || positions[0];
    group.position.set(
      Math.sin(pos.angle) * pos.radius,
      pos.y,
      pos.z + Math.cos(pos.angle) * pos.radius * 0.5
    );
    group.rotation.y = pos.ry;

    // Store initial Y/Z for float animation
    group.userData.initialY = group.position.y;
    group.userData.initialZ = group.position.z;

    cardGroup.add(group);
  });
}

// ── Hover Handlers ────────────────────────────────
function hoverCard(data) {
  data.group.scale.set(1.15, 1.15, 1.15);
  data.glowMat.opacity = 0.35;
  data.glowMat.needsUpdate = true;
}

function unhoverCard(data) {
  data.group.scale.set(1, 1, 1);
  data.glowMat.opacity = 0.12;
  data.glowMat.needsUpdate = true;
}

function handleHover() {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(cardMeshes);

  if (intersects.length > 0) {
    const mesh = intersects[0].object;
    const data = cardDataMap.find(d => {
      const g = d.group;
      return g.userData.cardMesh === mesh || g.children.includes(mesh);
    });
    if (!data) {
      if (lastHovered) { unhoverCard(lastHovered); lastHovered = null; }
      return;
    }
    if (lastHovered !== data) {
      if (lastHovered) unhoverCard(lastHovered);
      hoverCard(data);
      lastHovered = data;
    }
  } else {
    if (lastHovered) {
      unhoverCard(lastHovered);
      lastHovered = null;
    }
  }
}

// ── Click Handler ─────────────────────────────────
function onDocumentClick(e) {
  if (e.target.closest('a, button, input, textarea, .project-item, .filter-btn')) return;
  if (!lastHovered) return;

  const art = lastHovered.artwork;
  if (art && window.__openProjectOverlay) {
    window.__openProjectOverlay({
      placeholder: art.ch,
      title: art.title,
      meta: art.meta,
      desc: art.desc,
    });
  }
}

// ── Animation Loop ────────────────────────────────
function animate() {
  requestAnimationFrame(animate);

  if (!cardGroup) return;

  const time = performance.now() * 0.001;

  // Mouse lerp rotation
  target.x = mouse.x * 0.35;
  target.y = mouse.y * 0.18;
  current.x += (target.x - current.x) * 0.035;
  current.y += (target.y - current.y) * 0.035;
  cardGroup.rotation.y = current.x;
  cardGroup.rotation.x = current.y;

  // Auto-float oscillation + scroll fade
  const scrollY = window.__lenisScrollY || window.scrollY || 0;
  const heroH = window.innerHeight;
  const sp = Math.min(Math.max(scrollY / heroH, 0), 1);
  const targetOpacity = 1 - sp * 0.9;

  cardGroup.children.forEach((group, i) => {
    if (!group.userData) return;
    const iniY = group.userData.initialY || group.position.y;
    const iniZ = group.userData.initialZ || group.position.z;
    group.position.y = iniY + Math.sin(time * 0.7 + i + group.position.x * 0.3) * 0.1;
    group.position.z = iniZ + Math.cos(time * 0.5 + i * 0.8) * 0.06;

    // Only update material when opacity actually changes
    const { cardMat } = group.userData;
    if (cardMat && Math.abs(cardMat.opacity - targetOpacity) > 0.005) {
      cardMat.opacity = targetOpacity;
      cardMat.transparent = targetOpacity < 1;
      cardMat.needsUpdate = true;
    }
  });

  // Scroll-driven camera zoom
  const targetZ = 9 + sp * 4;
  camera.position.z += (targetZ - camera.position.z) * 0.03;

  // Throttle raycaster to every 3 frames
  raycasterThrottle = (raycasterThrottle + 1) % 3;
  if (raycasterThrottle === 0) {
    handleHover();
  }

  renderer.render(scene, camera);
}

// ── Mouse Tracking ────────────────────────────────
function onMouseMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  pointer.x = mouse.x;
  pointer.y = mouse.y;
}

// ── Resize Handler ────────────────────────────────
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);

  isMobile = w < 768;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));

  if (cardGroup) {
    cardGroup.children.forEach((group, i) => {
      group.visible = !(isMobile && i >= 4);
    });
    if (isMobile) camera.position.z = 11;
  }
}

// ── Explore Button Fly-Through ────────────────────
window.__flyThrough = function () {
  if (!camera) return;
  gsap.to(camera.position, {
    z: 5.5,
    duration: 0.8,
    ease: 'power2.inOut',
    onComplete: () => {
      gsap.to(camera.position, { z: 9, duration: 1.2, ease: 'power2.out', delay: 0.3 });
    },
  });
};

// ── Init ───────────────────────────────────────────
async function init() {
  try {
    setupScene();
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('click', onDocumentClick);

    // Initial mobile detection
    isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      camera.position.z = 11;
      if (cardGroup) {
        cardGroup.children.forEach((group, i) => {
          if (i >= 4) group.visible = false;
        });
      }
    }

    // Mobile gyroscope
    if (isMobile && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.beta === null) return;
        mouse.x = Math.max(-1, Math.min(1, (e.gamma || 0) / 30));
        mouse.y = Math.max(-1, Math.min(1, (e.beta || 0) / 45 - 0.5));
        pointer.x = mouse.x;
        pointer.y = -mouse.y;
      });
    }

    animate();

    window.__threeReady = true;

    // Hide loader
    const loader = document.getElementById('loader');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.6s cubic-bezier(0.19,1,0.22,1)';
        setTimeout(() => {
          if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 600);
      }, 300);
    }
  } catch (err) {
    console.warn('Three.js initialization failed:', err);
    window.__threeError = true;
  }
}

init();
