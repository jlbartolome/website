import {
  Box3, Group, Material, Mesh, NoToneMapping, OrthographicCamera,
  Quaternion, Scene, Vector3, WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/** User-controlled only: no animation loop, auto-rotation, inertia or scroll trap. */
export async function mountHeroModel(host: HTMLElement): Promise<() => void> {
  const stage = host.querySelector<HTMLElement>('.hero-stage')!;
  const canvas = host.querySelector<HTMLCanvasElement>('canvas')!;
  const tools = host.querySelector<HTMLElement>('.hero-model-tools')!;
  const status = host.querySelector<HTMLElement>('[data-model-status]')!;
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setClearColor(0xffffff, 0);
  renderer.toneMapping = NoToneMapping;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new Scene();
  const model = new Group();
  const camera = new OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
  camera.position.z = 40;
  const abort = new AbortController();
  const { signal } = abort;
  const geometries = new Set<Mesh['geometry']>();
  const materials = new Set<Material>();
  const bounds: Box3[] = [];
  const projectedBounds = new Box3();
  const transformedBounds = new Box3();
  const horizontal = new Quaternion();
  const vertical = new Quaternion();
  const xAxis = new Vector3(1, 0, 0);
  const yAxis = new Vector3(0, 1, 0);
  let observer: ResizeObserver | undefined;
  let frame = 0;
  let renderWidth = 0;
  let renderHeight = 0;
  let disposed = false;
  let pointer: { id: number; x: number; y: number; touch: boolean; started: boolean } | undefined;
  let baseHeight = 12;

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    abort.abort();
    if (pointer && stage.hasPointerCapture(pointer.id)) stage.releasePointerCapture(pointer.id);
    tools.hidden = true;
    stage.removeAttribute('tabindex');
    stage.setAttribute('aria-hidden', 'true');
    host.classList.remove('is-ready', 'is-interacting', 'is-dragging');
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    renderer.dispose();
  };

  const render = () => {
    frame = 0;
    if (disposed || !host.isConnected) return;
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    const aspect = width / height;
    model.updateMatrixWorld(true);
    projectedBounds.makeEmpty();
    for (const box of bounds) {
      projectedBounds.union(transformedBounds.copy(box).applyMatrix4(model.matrixWorld));
    }
    // Match the PNG's contain sizing at rest and keep the complete model in
    // frame at every angle, including rings viewed face-on after tilting.
    const extentX = Math.max(Math.abs(projectedBounds.min.x), Math.abs(projectedBounds.max.x));
    const extentY = Math.max(Math.abs(projectedBounds.min.y), Math.abs(projectedBounds.max.y));
    const halfHeight = Math.max(baseHeight / 2, baseHeight * (4 / 3) / aspect / 2,
      extentY / 0.92, extentX / aspect / 0.92);
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    const nextWidth = Math.round(width);
    const nextHeight = Math.round(height);
    if (nextWidth !== renderWidth || nextHeight !== renderHeight) {
      renderWidth = nextWidth;
      renderHeight = nextHeight;
      renderer.setSize(renderWidth, renderHeight, false);
    }
    renderer.render(scene, camera);
  };
  const requestRender = () => { if (!disposed && !frame) frame = requestAnimationFrame(render); };
  const rotate = (yaw: number, pitch: number) => {
    horizontal.setFromAxisAngle(yAxis, yaw);
    vertical.setFromAxisAngle(xAxis, pitch);
    model.quaternion.premultiply(horizontal).premultiply(vertical).normalize();
    host.classList.add('is-interacting');
    requestRender();
  };
  const reset = () => {
    model.quaternion.identity();
    host.classList.remove('is-interacting');
    status.textContent = host.dataset.resetStatus ?? ''; 
    requestRender();
  };
  const act = (action: string) => {
    const step = Math.PI / 12;
    status.textContent = '';
    if (action === 'reset') reset();
    else if (action === 'left') rotate(-step, 0);
    else if (action === 'right') rotate(step, 0);
    else if (action === 'up') rotate(0, -step);
    else if (action === 'down') rotate(0, step);
  };

  try {
    const gltf = await new GLTFLoader().loadAsync(host.dataset.model!);
    if (!host.isConnected) {
      gltf.scene.traverse((object) => {
        if (object instanceof Mesh) {
          geometries.add(object.geometry);
          for (const material of [object.material].flat()) materials.add(material);
        }
      });
      dispose();
      return dispose;
    }
    baseHeight = Number(gltf.scene.userData.heroViewHeight) || baseHeight;
    gltf.scene.updateMatrixWorld(true);
    const center = new Box3().setFromObject(gltf.scene, true).getCenter(new Vector3());
    gltf.scene.position.sub(center);
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      geometries.add(object.geometry);
      object.geometry.computeBoundingBox();
      bounds.push(object.geometry.boundingBox!.clone().applyMatrix4(object.matrixWorld));
      for (const material of [object.material].flat()) {
        materials.add(material);
        // Render both sides of translucent surfaces; individual lobes are
        // separate meshes so Three.js can sort them as the model rotates.
        if (material.transparent) material.forceSinglePass = false;
      }
    });
    model.add(gltf.scene);
    scene.add(model);
    render(); // Keep the PNG visible until the first deliberate rotation.
    stage.tabIndex = 0;
    stage.removeAttribute('aria-hidden');
    tools.hidden = false;
    host.classList.add('is-ready');

    stage.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0 || pointer) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY,
        touch: event.pointerType === 'touch', started: event.pointerType !== 'touch' };
      stage.setPointerCapture(event.pointerId);
      if (event.pointerType === 'mouse') stage.focus({ preventScroll: true });
      if (pointer.started) host.classList.add('is-dragging');
    }, { signal });
    stage.addEventListener('pointermove', (event) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (pointer.touch && !pointer.started) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
        // A vertical gesture belongs to page scrolling; don't turn the model
        // briefly while waiting for the browser to send pointercancel.
        if (Math.abs(dy) >= Math.abs(dx)) { endDrag(event); return; }
        pointer.started = true;
        host.classList.add('is-dragging');
      }
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (dx || dy) rotate(dx * 0.008, dy * 0.008);
    }, { signal });
    const endDrag = (event: PointerEvent) => {
      if (event.pointerId !== pointer?.id) return;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      pointer = undefined;
      host.classList.remove('is-dragging');
    };
    stage.addEventListener('pointerup', endDrag, { signal });
    stage.addEventListener('pointercancel', endDrag, { signal });
    stage.addEventListener('lostpointercapture', endDrag, { signal });
    stage.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const action = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', Home: 'reset' }[event.key];
      if (!action) return;
      event.preventDefault();
      act(action);
    }, { signal });
    tools.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
      button.addEventListener('click', () => act(button.dataset.action!), { signal });
    });
    canvas.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      dispose();
      status.textContent = host.dataset.fallbackStatus ?? '';
    }, { signal });
    observer = new ResizeObserver(requestRender);
    observer.observe(stage);
    return dispose;
  } catch (error) {
    dispose();
    throw error;
  }
}
