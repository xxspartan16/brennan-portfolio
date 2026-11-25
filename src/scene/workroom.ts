import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export type CameraPose = { yaw: number; tilt: number; hoverX: number; hoverY: number };
export type WorkroomRenderer = {
  setMotion: (enabled: boolean) => void;
  setPose: (pose: CameraPose) => void;
  dispose: () => void;
};

const frontAngle = -0.54;
const elevation = 0.46;
const up = new THREE.Vector3(0, 1, 0);

function environmentTexture() {
  const panel = document.createElement('canvas');
  panel.width = 256;
  panel.height = 128;
  const paint = panel.getContext('2d')!;
  const dome = paint.createLinearGradient(0, 0, 0, 128);
  dome.addColorStop(0, '#fff9e9');
  dome.addColorStop(0.42, '#c1cbba');
  dome.addColorStop(0.63, '#888d7f');
  dome.addColorStop(1, '#677265');
  paint.fillStyle = dome;
  paint.fillRect(0, 0, 256, 128);
  paint.fillStyle = '#fffdf1';
  paint.fillRect(25, 15, 30, 35);
  paint.fillRect(146, 10, 57, 37);
  paint.fillStyle = '#4d5b53';
  paint.fillRect(75, 47, 13, 22);
  const texture = new THREE.CanvasTexture(panel);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

function groundedShadow() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 96;
  const ctx = canvas.getContext('2d')!;
  const wash = ctx.createRadialGradient(48, 48, 2, 48, 48, 48);
  wash.addColorStop(0, 'rgba(32,48,36,.55)');
  wash.addColorStop(0.6, 'rgba(40,60,45,.28)');
  wash.addColorStop(1, 'rgba(42,60,43,0)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, 96, 96);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    depthWrite: false,
    transparent: true,
    toneMapped: false,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 7), material);
  floor.rotation.x = -Math.PI / 2;
  return floor;
}

function windowMotes() {
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  const paint = sprite.getContext('2d')!;
  const gradient = paint.createRadialGradient(16, 16, 1, 16, 16, 16);
  gradient.addColorStop(0, 'white');
  gradient.addColorStop(0.45, 'rgba(255,255,255,.8)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  paint.fillStyle = gradient;
  paint.fillRect(0, 0, 32, 32);
  const geometry = new THREE.BufferGeometry();
  const grains = 22;
  const positions = new THREE.Float32BufferAttribute(grains * 3, 3).setUsage(
    THREE.DynamicDrawUsage,
  );
  geometry.setAttribute('position', positions);
  const material = new THREE.PointsMaterial({
    size: 3.5,
    color: 0xfff6d8,
    map: new THREE.CanvasTexture(sprite),
    transparent: true,
    opacity: 0.84,
    depthWrite: false,
    sizeAttenuation: false,
    toneMapped: false,
  });
  const points = new THREE.Points(geometry, material);
  // The window is on the rear wall, left of the desk. Confine the dust to its shaft of light.
  function drift(seconds: number) {
    for (let i = 0; i < grains; i++) {
      const phase = i * 2.39996;
      const distance = ((i * 17) % grains) / grains;
      const x =
        -1.55 + Math.sin(phase) * 1.24 - distance * 0.55 + Math.sin(seconds * 0.31 + phase) * 0.17;
      const y =
        3.94 + Math.cos(phase * 1.3) * 0.68 - distance * 1.22 + Math.sin(seconds * 0.43 + i) * 0.14;
      const z = -2.78 + distance * 3.55 + Math.cos(seconds * 0.26 + phase) * 0.19;
      positions.setXYZ(i, x, y, z);
    }
    positions.needsUpdate = true;
  }
  drift(0);
  geometry.computeBoundingSphere();
  return { points, drift };
}

function disposeModel(object: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const surfaces = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh || child instanceof THREE.Points)) return;
    geometries.add(child.geometry);
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      surfaces.add(material);
      for (const slot of Object.values(material))
        if (slot instanceof THREE.Texture) textures.add(slot);
    });
  });
  textures.forEach((texture) => {
    const image = texture.source.data;
    texture.dispose();
    if (typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap) image.close();
  });
  surfaces.forEach((material) => material.dispose());
  geometries.forEach((geometry) => geometry.dispose());
}

// Keep the model interactive on GPUs that struggle with image-based lighting. The studio
// lights are fixed, so their diffuse contribution can be calculated once in model space.
function bakeStudioLighting(model: THREE.Object3D) {
  const keyDirection = new THREE.Vector3(-4.5, 7, 5).normalize();
  const rimDirection = new THREE.Vector3(4, 3, -4).normalize();
  const normal = new THREE.Vector3();
  const worldNormals = new THREE.Matrix3();
  const originals = new Set<THREE.MeshStandardMaterial>();
  model.traverse((mesh) => {
    if (!(mesh instanceof THREE.Mesh) || !(mesh.material instanceof THREE.MeshStandardMaterial))
      return;
    const material = mesh.material;
    const geometry = mesh.geometry;
    const normals = geometry.getAttribute('normal');
    if (!normals) return;
    const ambientOcclusion = geometry.getAttribute('color');
    const shades = new Float32Array(normals.count * 3);
    worldNormals.getNormalMatrix(mesh.matrixWorld);
    for (let i = 0; i < normals.count; i++) {
      normal.fromBufferAttribute(normals, i).applyNormalMatrix(worldNormals);
      const key = 0.89 * Math.max(0, normal.dot(keyDirection));
      const rim = 0.21 * Math.max(0, normal.dot(rimDirection));
      const ambient = 0.31 + 0.16 * (normal.y + 1);
      shades[i * 3] = (ambient + key + rim * 0.86) * (ambientOcclusion?.getX(i) ?? 1);
      shades[i * 3 + 1] = (ambient + key * 0.9 + rim) * (ambientOcclusion?.getY(i) ?? 1);
      shades[i * 3 + 2] =
        (ambient * 0.97 + key * 0.8 + rim * 0.93) * (ambientOcclusion?.getZ(i) ?? 1);
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(shades, 3));
    const paint = new THREE.MeshBasicMaterial({
      color: material.color,
      map: material.map,
      vertexColors: true,
      transparent: material.transparent,
      opacity: material.opacity,
      alphaTest: material.alphaTest,
      side: material.side,
      depthWrite: material.depthWrite,
    });
    if (material.emissiveMap && material.name === 'MonitorInterface')
      paint.color.multiplyScalar(1.5);
    paint.name = material.name;
    mesh.material = paint;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    originals.add(material);
  });
  originals.forEach((material) => material.dispose());
}

/** All graphics allocations are owned by this viewport and released on unmount. */
export function createWorkroom(
  viewport: HTMLElement,
  modelUrl: string,
  motionEnabled: boolean,
  initialPose: CameraPose,
  onReady: () => void,
  onUnavailable: () => void,
): WorkroomRenderer | null {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const config: WebGLContextAttributes = {
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    premultipliedAlpha: true,
  };
  const context = canvas.getContext('webgl2', config);
  if (!context) return null;
  const gpuDetails = context.getExtension('WEBGL_debug_renderer_info');
  const gpu = gpuDetails ? String(context.getParameter(gpuDetails.UNMASKED_RENDERER_WEBGL)) : '';
  const software = /swiftshader|llvmpipe|softpipe|software rasterizer/i.test(gpu);
  const simplifiedAtStart = software && motionEnabled;
  const renderer = new THREE.WebGLRenderer({ canvas, context, ...config });
  viewport.append(canvas);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.shadowMap.enabled = !simplifiedAtStart;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const scene = new THREE.Scene();
  const environment = environmentTexture();
  scene.environment = simplifiedAtStart ? null : environment;
  scene.environmentIntensity = 0.7;
  scene.add(new THREE.HemisphereLight(0xfff9ea, 0xacb8aa, 1.28));
  const key = new THREE.DirectionalLight(0xffefd8, 2.35);
  key.position.set(-4.5, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {
    left: -4.6,
    right: 4.6,
    top: 4.6,
    bottom: -4.6,
    near: 0.1,
    far: 23,
  });
  key.shadow.radius = 3;
  key.shadow.normalBias = 0.014;
  key.shadow.bias = -0.00035;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xd0f2e3, 1.15);
  rim.position.set(4, 3, -4);
  scene.add(rim);
  const camera = new THREE.OrthographicCamera(-4, 4, 3, -3, 0.05, 50);
  const room = new THREE.Group();
  scene.add(room);
  const shadow = groundedShadow();
  scene.add(shadow);
  const dust = windowMotes();
  scene.add(dust.points);
  const rotors: THREE.Object3D[] = [];
  const fitVertices: THREE.Vector3[] = [];
  let pose = { ...initialPose };
  let azimuth = frontAngle;
  let pitch = elevation;
  let pausedYawOffset = 0;
  let pausedPitchOffset = 0;
  let width = 0;
  let height = 0;
  let frame = 0;
  let elapsed = 0;
  let previous = 0;
  let active = true;
  let onScreen = true;
  let ready = false;
  let loadedRoom: THREE.Object3D | undefined;
  let lightweight = simplifiedAtStart;
  let pixelBudget = simplifiedAtStart ? 150_000 : 1_150_000;
  let qualityStage = simplifiedAtStart ? 1 : 0;
  let warmupFrames = 4;
  let sampledFrames = 0;
  let sampledSeconds = 0;
  let moving = motionEnabled;
  let homeWidth = 6;
  let homeHeight = 4.5;
  let viewCenterX = 0;
  let viewCenterY = 0;
  const target = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const rightAxis = new THREE.Vector3();
  const topAxis = new THREE.Vector3();

  function getAxes(yaw: number, tilt: number) {
    direction.set(Math.sin(yaw) * Math.cos(tilt), Math.sin(tilt), Math.cos(yaw) * Math.cos(tilt));
    rightAxis.crossVectors(up, direction).normalize();
    topAxis.crossVectors(direction, rightAxis);
  }

  function fit() {
    if (!ready) return;
    getAxes(frontAngle, elevation);
    let left = Infinity,
      right = -Infinity,
      bottom = Infinity,
      top = -Infinity;
    for (const vertex of fitVertices) {
      const x = vertex.dot(rightAxis),
        y = vertex.dot(topAxis);
      left = Math.min(left, x);
      right = Math.max(right, x);
      bottom = Math.min(bottom, y);
      top = Math.max(top, y);
    }
    homeWidth = right - left;
    homeHeight = top - bottom;
    viewCenterX = (left + right) / 2;
    viewCenterY = (bottom + top) / 2;
    target.copy(rightAxis).multiplyScalar(viewCenterX).addScaledVector(topAxis, viewCenterY);
    const aspect = width / height;
    const size = Math.max(homeHeight * 1.1, (homeWidth * 1.09) / aspect);
    camera.left = (-size * aspect) / 2;
    camera.right = (size * aspect) / 2;
    camera.top = size / 2;
    camera.bottom = -size / 2;
    camera.updateProjectionMatrix();
  }

  function schedule() {
    if (active && ready && onScreen && !document.hidden && !frame && width > 0 && height > 0) {
      frame = requestAnimationFrame(draw);
    }
  }

  function simplify() {
    if (lightweight) return;
    if (loadedRoom) bakeStudioLighting(loadedRoom);
    lightweight = true;
    renderer.shadowMap.enabled = false;
    scene.environment = null;
  }

  function checkPlayback(interval: number) {
    if (warmupFrames > 0) {
      warmupFrames--;
      return true;
    }
    sampledSeconds += Math.min(interval, 0.8);
    if (++sampledFrames < 9) return true;
    const secondsPerFrame = sampledSeconds / sampledFrames;
    sampledFrames = 0;
    sampledSeconds = 0;
    if (secondsPerFrame < 0.075) return true;
    if (qualityStage < 2) {
      qualityStage++;
      pixelBudget = qualityStage === 1 ? 280_000 : 82_000;
      if (qualityStage === 2) simplify();
      warmupFrames = 3;
      resize();
    } else if (secondsPerFrame > 0.125) {
      onUnavailable();
      return false;
    }
    return true;
  }

  function draw(now: number) {
    frame = 0;
    if (!active || !ready || !onScreen || document.hidden) {
      previous = 0;
      return;
    }
    const interval = previous ? (now - previous) / 1000 : 0;
    if (moving && previous && !checkPlayback(interval)) return;
    const delta = previous ? Math.min(interval, 0.8) : 1 / 60;
    previous = now;
    if (moving) elapsed += delta;
    const intro = moving ? Math.exp(-elapsed * 1.3) : 0;
    const idleYaw = moving ? Math.sin(elapsed * 0.43) * 0.115 : 0;
    const idlePitch = moving ? Math.sin(elapsed * 0.37) * 0.018 : 0;
    const goalYaw =
      frontAngle +
      pose.yaw +
      idleYaw +
      (moving ? pose.hoverX * 0.065 - intro * 0.145 : pausedYawOffset);
    const goalPitch =
      elevation +
      pose.tilt +
      idlePitch +
      (moving ? pose.hoverY * 0.028 + intro * 0.045 : pausedPitchOffset);
    const smoothing = moving ? 1 - Math.exp(-delta * 9) : 1;
    azimuth = THREE.MathUtils.lerp(azimuth, goalYaw, smoothing);
    pitch = THREE.MathUtils.lerp(pitch, goalPitch, smoothing);
    getAxes(azimuth, pitch);
    camera.position.copy(target).addScaledVector(direction, 13);
    camera.lookAt(target);
    camera.updateMatrixWorld();
    if (moving) {
      for (const fan of rotors) fan.rotateZ(-delta * 3.6);
      dust.drift(elapsed);
    }
    renderer.render(scene, camera);
    if (moving) schedule();
  }

  function resize() {
    width = viewport.clientWidth;
    height = viewport.clientHeight;
    if (!width || !height) return;
    const budget = moving ? pixelBudget : Math.max(pixelBudget, 480_000);
    const ratio = Math.min(
      window.devicePixelRatio || 1,
      width < 620 ? 1.5 : 1.7,
      Math.sqrt(budget / (width * height)),
    );
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    fit();
    schedule();
  }
  const metrics = new ResizeObserver(resize);
  metrics.observe(viewport);
  resize();
  function setVisible() {
    if (onScreen && !document.hidden) {
      previous = 0;
      schedule();
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    }
  }
  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    setVisible();
  });
  visibility.observe(viewport);
  document.addEventListener('visibilitychange', setVisible);
  function contextLost(event: Event) {
    event.preventDefault();
    if (active) onUnavailable();
  }
  canvas.addEventListener('webglcontextlost', contextLost);

  new GLTFLoader().load(
    modelUrl,
    ({ scene: model }) => {
      if (!active) {
        disposeModel(model);
        return;
      }
      const bounds = new THREE.Box3().setFromObject(model, true);
      const size = bounds.getSize(new THREE.Vector3());
      const scale = 5.7 / Math.max(size.x, size.y, size.z, 0.01);
      model.position.sub(bounds.getCenter(new THREE.Vector3()));
      room.scale.setScalar(scale);
      room.add(model);
      scene.updateMatrixWorld(true);
      const vertex = new THREE.Vector3();
      model.traverse((node) => {
        if (/^FanRotor[_\d]/i.test(node.name)) rotors.push(node);
        if (!(node instanceof THREE.Mesh)) return;
        node.castShadow = true;
        node.receiveShadow = true;
        const positions = node.geometry.getAttribute('position');
        if (!positions) return;
        const stride = Math.max(1, Math.floor(positions.count / 340));
        for (let i = 0; i < positions.count; i += stride) {
          fitVertices.push(
            vertex.fromBufferAttribute(positions, i).applyMatrix4(node.matrixWorld).clone(),
          );
        }
      });
      loadedRoom = model;
      if (lightweight) bakeStudioLighting(model);
      model.add(dust.points);
      shadow.position.y = (-size.y * scale) / 2 - 0.018;
      renderer.shadowMap.needsUpdate = true;
      ready = true;
      resize();
      // Render before dismissing the poster so a slow first shader compile never leaves a blank hero.
      cancelAnimationFrame(frame);
      frame = 0;
      draw(performance.now());
      onReady();
    },
    undefined,
    () => {
      if (active) onUnavailable();
    },
  );

  return {
    setMotion(enabled) {
      if (moving === enabled) return;
      if (!enabled) {
        pausedYawOffset = azimuth - frontAngle - pose.yaw;
        pausedPitchOffset = pitch - elevation - pose.tilt;
      }
      if (enabled && software && !lightweight) {
        simplify();
        qualityStage = 1;
        pixelBudget = 150_000;
      }
      moving = enabled;
      previous = 0;
      resize();
    },
    setPose(next) {
      if (next.yaw !== pose.yaw || next.tilt !== pose.tilt) {
        pausedYawOffset = 0;
        pausedPitchOffset = 0;
      }
      pose = { ...next };
      schedule();
    },
    dispose() {
      active = false;
      cancelAnimationFrame(frame);
      metrics.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', setVisible);
      canvas.removeEventListener('webglcontextlost', contextLost);
      disposeModel(scene);
      environment.dispose();
      key.shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
