// One transparent canvas serves the three rows. The existing artwork is the static fallback.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const tau = Math.PI * 2;

function paintedFace(size: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
}

function metal(color: number, metalness = 0.24, roughness = 0.36) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D) {
  const object = new THREE.Mesh(geometry, material);
  parent.add(object);
  return object;
}

function makeGauge() {
  const root = new THREE.Group();
  const caseMetal = metal(0x416451, 0.38);
  const chrome = metal(0xa9b4a2, 0.45, 0.22);
  const cylinder = (radius: number, height: number, material: THREE.Material, y = 0) => {
    const part = mesh(new THREE.CylinderGeometry(radius, radius, height, 48), material, root);
    part.position.y = y;
    return part;
  };
  const housing = cylinder(0.88, 0.34, caseMetal);
  housing.rotation.x = Math.PI / 2;
  cylinder(0.16, 0.52, chrome, -1.01);
  cylinder(0.072, 0.32, chrome, -1.35);
  cylinder(0.13, 0.29, chrome, 0.96);
  cylinder(0.21, 0.15, caseMetal, 1.15);
  const rim = mesh(new THREE.TorusGeometry(0.79, 0.085, 12, 64), chrome, root);
  rim.position.z = 0.19;
  const face = mesh(
    new THREE.CircleGeometry(0.775, 64),
    paintedFace(256, (ctx) => {
      ctx.fillStyle = '#eaf0dc';
      ctx.fillRect(0, 0, 256, 256);
      ctx.translate(128, 128);
      ctx.strokeStyle = '#1f4635';
      ctx.fillStyle = '#284f39';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < 50; i++) {
        const angle = (tau * i) / 50 - Math.PI / 2;
        const major = i % 5 === 0;
        const dx = Math.cos(angle),
          dy = Math.sin(angle);
        ctx.beginPath();
        ctx.lineWidth = major ? 3.1 : 1.8;
        ctx.moveTo(dx * (major ? 86 : 101), dy * (major ? 86 : 101));
        ctx.lineTo(dx * 111, dy * 111);
        ctx.stroke();
        if (major) ctx.fillText(String(i * 2), dx * 68, dy * 68);
      }
    }),
    root,
  );
  face.position.z = 0.212;
  const needle = new THREE.Group();
  root.add(needle);
  needle.position.z = 0.225;
  const hand = mesh(new THREE.ConeGeometry(0.044, 0.59, 8), metal(0x974827, 0.05), needle);
  hand.position.y = 0.245;
  const pin = mesh(new THREE.SphereGeometry(0.083, 16, 12), caseMetal, needle);
  pin.scale.z = 0.35;
  root.rotation.z = -0.24;
  return { root, needle };
}

function makeLinks() {
  const root = new THREE.Group();
  const shape = new THREE.CurvePath<THREE.Vector3>();
  const xy = (x: number, y: number) => new THREE.Vector3(x, y, 0);
  const line = (a: THREE.Vector3, b: THREE.Vector3) => shape.add(new THREE.LineCurve3(a, b));
  const curve = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) =>
    shape.add(new THREE.CubicBezierCurve3(a, b, c, d));
  line(xy(-0.4, -0.28), xy(-0.4, 0.28));
  curve(xy(-0.4, 0.28), xy(-0.4, 0.82), xy(0.4, 0.82), xy(0.4, 0.28));
  line(xy(0.4, 0.28), xy(0.4, -0.28));
  curve(xy(0.4, -0.28), xy(0.4, -0.82), xy(-0.4, -0.82), xy(-0.4, -0.28));
  const tube = new THREE.TubeGeometry(shape, 52, 0.13, 12, true);
  const finishes = [metal(0xb3c8a0), metal(0x557b5e), metal(0x284f3e)];
  finishes.forEach((finish, i) => {
    const link = mesh(tube, finish, root);
    link.position.y = (i - 1) * 0.93;
    link.rotation.y = i % 2 ? 1.29 : -0.18;
  });
  root.rotation.z = -0.85;
  root.scale.setScalar(0.89);
  return root;
}

function makeKeys() {
  const root = new THREE.Group();
  const back = metal(0x315a49);
  const colors = [0x47745c, 0xd9dfbd, 0x729773];
  const layout = [
    [-0.5, 0.49],
    [0.52, 0.28],
    [-0.11, -0.57],
  ];
  ['{', '/', '}'].forEach((label, i) => {
    const key = new THREE.Group();
    root.add(key);
    key.position.set(layout[i][0], layout[i][1], i === 0 ? 0.04 : 0);
    const base = mesh(new RoundedBoxGeometry(0.94, 0.94, 0.42, 3, 0.11), back, key);
    base.position.z = -0.1;
    const cap = mesh(new RoundedBoxGeometry(0.87, 0.87, 0.34, 3, 0.12), metal(colors[i]), key);
    cap.position.z = 0.1;
    const ink = paintedFace(96, (ctx) => {
      ctx.fillStyle = i === 1 ? '#31523f' : '#f4f3db';
      ctx.font = 'bold 65px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 48, 48);
    });
    const face = mesh(new THREE.PlaneGeometry(0.71, 0.71), ink, key);
    face.position.z = 0.276;
  });
  root.scale.setScalar(1.12);
  root.rotation.z = -0.14;
  return root;
}

export function mountSkillObjects(host: HTMLElement) {
  const slots = Array.from(host.querySelectorAll<HTMLElement>('[data-object]'));
  if (slots.length !== 3 || !('ResizeObserver' in window)) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'pf-skill-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.setScissorTest(true);
  host.appendChild(canvas);

  const gauge = makeGauge();
  const models = [gauge.root, makeLinks(), makeKeys()];
  const rigs = models.map((model) => {
    const scene = new THREE.Scene();
    const orbit = new THREE.Group();
    scene.add(orbit);
    orbit.add(model);
    scene.add(new THREE.HemisphereLight(0xfff9e7, 0x759a79, 2.05));
    const key = new THREE.DirectionalLight(0xfff5d8, 3.1);
    key.position.set(-4, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xc4f1de, 2.3);
    rim.position.set(4, 1, -1);
    scene.add(rim);
    return { scene, orbit, tx: 0, ty: 0, width: 0, height: 0, bottom: 0, left: 0 };
  });
  const camera = new THREE.OrthographicCamera(-2, 2, 1.72, -1.72, 0.1, 20);
  camera.position.z = 7;
  let contextLost = false;
  let inView = false,
    frame = 0,
    previous = 0,
    elapsed = 0;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    renderer.setSize(
      Math.max(1, Math.round(rect.width)),
      Math.max(1, Math.round(rect.height)),
      false,
    );
    slots.forEach((slot, i) => {
      const region = slot.getBoundingClientRect();
      Object.assign(rigs[i], {
        width: region.width,
        height: region.height,
        left: region.left - rect.left,
        bottom: rect.bottom - region.bottom,
      });
    });
  }
  function animate(now: number) {
    frame = 0;
    if (!inView || document.hidden || contextLost) return;
    frame = requestAnimationFrame(animate);
    const delta = now - previous;
    if (delta < 32) return;
    elapsed += Math.min(delta / 1000, 0.08);
    previous = now;
    gauge.needle.rotation.z = -0.83 + 0.21 * Math.sin(elapsed * 0.88);
    rigs.forEach((rig, i) => {
      if (!rig.width || !rig.height) return;
      const phase = elapsed * 0.65 + i * 1.8;
      rig.orbit.position.y = 0.09 * Math.sin(phase);
      const yaw = (i === 1 ? phase * 0.54 : -0.2 + 0.42 * Math.sin(phase * 0.74)) + rig.tx * 0.76;
      const pitch = 0.14 * Math.cos(phase * 0.72) + rig.ty * 0.4 - (i === 2 ? 0.43 : 0.1);
      rig.orbit.rotation.y += (yaw - rig.orbit.rotation.y) * 0.095;
      rig.orbit.rotation.x += (pitch - rig.orbit.rotation.x) * 0.095;
      camera.left = (-camera.top * rig.width) / rig.height;
      camera.right = -camera.left;
      camera.updateProjectionMatrix();
      renderer.setViewport(rig.left, rig.bottom, rig.width, rig.height);
      renderer.setScissor(rig.left, rig.bottom, rig.width, rig.height);
      renderer.render(rig.scene, camera);
    });
    host.dataset.modelsReady = '';
  }
  function syncAnimation() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (inView && !document.hidden) {
      previous = performance.now() - 34;
      frame = requestAnimationFrame(animate);
    }
  }
  const pointer = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    const row = (event.target as HTMLElement).closest('.pf-milestone');
    const slot = row?.querySelector<HTMLElement>('[data-object]');
    rigs.forEach((rig) => {
      rig.tx = rig.ty = 0;
    });
    if (!row || !slot) return;
    const rig = rigs[slots.indexOf(slot)];
    const rect = row.getBoundingClientRect();
    rig.tx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
    rig.ty = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
  };
  const reset = () =>
    rigs.forEach((rig) => {
      rig.tx = rig.ty = 0;
    });
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  slots.forEach((slot) => resizeObserver.observe(slot));
  const watch = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncAnimation();
  });
  watch.observe(host);
  const onLost = () => {
    contextLost = true;
    inView = false;
    syncAnimation();
    delete host.dataset.modelsReady;
  };
  canvas.addEventListener('webglcontextlost', onLost);
  host.addEventListener('pointermove', pointer, { passive: true });
  host.addEventListener('pointerleave', reset);
  document.addEventListener('visibilitychange', syncAnimation);
  resize();
  return () => {
    resizeObserver.disconnect();
    watch.disconnect();
    cancelAnimationFrame(frame);
    canvas.removeEventListener('webglcontextlost', onLost);
    host.removeEventListener('pointermove', pointer);
    host.removeEventListener('pointerleave', reset);
    document.removeEventListener('visibilitychange', syncAnimation);
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    rigs.forEach(({ scene }) =>
      scene.traverse((item) => {
        if (item instanceof THREE.Mesh) {
          geometries.add(item.geometry);
          for (const material of Array.isArray(item.material) ? item.material : [item.material])
            materials.add(material);
        }
      }),
    );
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) {
      if (material instanceof THREE.MeshBasicMaterial) material.map?.dispose();
      material.dispose();
    }
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    delete host.dataset.modelsReady;
  };
}
