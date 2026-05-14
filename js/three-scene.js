/**
 * Three.js 3D Floating Card System
 * ES Module — self-initializes, sets window.__threeReady or window.__threeError
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
let cardMeshes = [];       // flat array of main plane meshes for raycasting
let cardDataMap = [];      // maps mesh → { group, initialY, initialZ, baseColor, glowMesh }
let lastHovered = null;
let isMobile = false;

const mouse = { x: 0, y: 0 };
const target = { x: 0, y: 0 };
const current = { x: 0, y: 0 };
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

// ── Rounded Rectangle Geometry ────────────────────
function createRoundedRectGeometry(width, height, radius, segments) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  return new THREE.ShapeGeometry(shape, segments, segments);
}

// ── Create Card Mesh ──────────────────────────────
function createCardMesh(artwork, index) {
  const group = new THREE.Group();

  // Glow border (behind card, slightly larger)
  const glowGeo = createRoundedRectGeometry(1.5, 1.95, 0.1, 4);
  const glowMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(artwork.color),
    opacity: 0.12,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.position.z = -0.02;
  group.add(glowMesh);

  // Main card face
  const cardGeo = createRoundedRectGeometry(1.4, 1.85, 0.08, 4);
  const cardMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(artwork.color),
    roughness: 0.4,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const cardMesh = new THREE.Mesh(cardGeo, cardMat);
  cardMesh.userData = { artworkIndex: index };
  group.add(cardMesh);

  // Try loading texture from images folder
  const textureLoader = new THREE.TextureLoader();
  const imgName = artwork.id;
  textureLoader.load(
    `images/${imgName}.jpg`,
    (texture) => {
      cardMat.map = texture;
      cardMat.color.set('#ffffff');
      cardMat.needsUpdate = true;
    },
    undefined,
    () => {
      // Fallback: use colored material — already set
    }
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
  cardDataMap.push({ group, glowMesh, glowMat, cardMat, baseColor: new THREE.Color(artwork.color), artwork });

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

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

  // Position cards in orbital layout
  // Inner ring: 3 cards, radius ~2.8; Outer ring: 3 cards, radius ~4.5
  const positions = [
    { angle: -0.7, radius: 2.6, y: 0.4,  z: 0.3,  ry: 0.3 },
    { angle: 0.05, radius: 2.9, y: -0.15, z: -0.1, ry: -0.05 },
    { angle: 0.7,  radius: 2.6, y: 0.55, z: 0.2,  ry: -0.35 },
    { angle: -1.1, radius: 4.2, y: -0.5, z: -0.7, ry: 0.45 },
    { angle: -0.25,radius: 4.0, y: 0.1,  z: -0.9, ry: -0.15 },
    { angle: 1.1,  radius: 4.2, y: -0.3, z: -0.5, ry: -0.5 },
  ];

  const groups = [];
  artworks.forEach((art, i) => {
    const group = createCardMesh(art, i);
    const pos = positions[i] || positions[0];
    group.position.set(
      Math.sin(pos.angle) * pos.radius,
      pos.y,
      pos.z + Math.cos(pos.angle) * pos.radius * 0.5
    );
    group.rotation.y = pos.ry;
    cardGroup.add(group);
    groups.push(group);
  });

  // Store initial Y and Z positions for each group
  groups.forEach((g, i) => {
    g.userData.initialY = g.position.y;
    g.userData.initialZ = g.position.z;
    g.userData.cardGroup = g;
  });
}

// ── Hover Handlers ────────────────────────────────
function hoverCard(data) {
  const { group, glowMat } = data;
  gsap.to(group.scale, { x: 1.15, y: 1.15, duration: 0.5, ease: 'power2.out', overwrite: true });
  gsap.to(glowMat, { opacity: 0.35, duration: 0.5, overwrite: true });
}

function unhoverCard(data) {
  const { group, glowMat } = data;
  gsap.to(group.scale, { x: 1, y: 1, duration: 0.5, ease: 'power2.out', overwrite: true });
  gsap.to(glowMat, { opacity: 0.12, duration: 0.5, overwrite: true });
}

function handleHover(intersects) {
  if (intersects.length > 0) {
    const mesh = intersects[0].object;
    const data = cardDataMap.find(d => d.group.userData.cardMesh === mesh || d.group.userData.cardGroup.contains(mesh));
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
  // Don't intercept clicks on interactive DOM elements
  if (e.target.closest('a, button, input, textarea, .project-item, .filter-btn')) return;

  // Check if hovering a card
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
  current.x += (target.x - current.x) * 0.04;
  current.y += (target.y - current.y) * 0.04;
  cardGroup.rotation.y = current.x;
  cardGroup.rotation.x = current.y;

  // Auto-float oscillation per card
  cardGroup.children.forEach((group, i) => {
    if (!group.userData) return;
    const iniY = group.userData.initialY || group.position.y;
    const iniZ = group.userData.initialZ || group.position.z;
    const floatY = Math.sin(time * 0.7 + i * 1.1) * 0.12;
    const floatZ = Math.cos(time * 0.55 + i * 0.85) * 0.08;
    group.position.y = iniY + floatY;
    group.position.z = iniZ + floatZ;
  });

  // Scroll-driven camera zoom
  const scrollY = window.__lenisScrollY || window.scrollY || 0;
  const heroH = window.innerHeight;
  const sp = Math.min(Math.max(scrollY / heroH, 0), 1);
  const targetZ = 9 + sp * 4;
  camera.position.z += (targetZ - camera.position.z) * 0.03;

  // Fade card opacity as user scrolls past hero
  const alpha = 1 - sp * 0.9;
  cardGroup.children.forEach(group => {
    if (!group.userData) return;
    const { cardMat } = group.userData;
    if (cardMat) {
      cardMat.opacity = Math.max(alpha, 0.1);
      cardMat.transparent = true;
      cardMat.needsUpdate = true;
    }
  });

  // Raycaster hover
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(cardMeshes);
  handleHover(intersects);

  // Render
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

  // On mobile, hide outer ring cards for performance
  if (cardGroup) {
    cardGroup.children.forEach((group, i) => {
      if (isMobile && i >= 3) {
        group.visible = false;
      } else {
        group.visible = true;
      }
    });
    // Move camera closer on mobile
    camera.position.z = isMobile ? 11 : 9;
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
      gsap.to(camera.position, {
        z: 9,
        duration: 1.2,
        ease: 'power2.out',
        delay: 0.3,
      });
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

    // Initial mobile check
    isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      camera.position.z = 11;
      if (cardGroup) {
        cardGroup.children.forEach((group, i) => {
          if (i >= 3) group.visible = false;
        });
      }
    }

    // Mobile gyroscope fallback
    if (isMobile && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.beta === null) return;
        mouse.x = Math.max(-1, Math.min(1, (e.gamma || 0) / 30));
        mouse.y = Math.max(-1, Math.min(1, (e.beta || 0) / 45 - 0.5));
        pointer.x = mouse.x;
        pointer.y = -mouse.y;
      });
    }

    // Start animation loop
    animate();

    // Signal ready
    window.__threeReady = true;

    // If GSAP available, hide loader smoothly
    if (typeof gsap !== 'undefined') {
      const loader = document.getElementById('loader');
      if (loader) {
        gsap.to(loader, { opacity: 0, duration: 0.6, onComplete: () => {
          if (loader.parentNode) loader.parentNode.removeChild(loader);
        }});
      }
    }
  } catch (err) {
    console.warn('Three.js initialization failed:', err);
    window.__threeError = true;
  }
}

// Self-init
init();
