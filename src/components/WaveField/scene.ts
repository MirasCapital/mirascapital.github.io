// OGL scene: wave surface (point sprites) + instanced streaks (thin quads) +
// selective bloom (threshold → blur → composite). Exposes a handle for pause,
// resume, speed changes, and cleanup. No React in here — pure WebGL lifecycle.

import {
  Renderer,
  Camera,
  Transform,
  Geometry,
  Program,
  Mesh,
  RenderTarget,
  Vec2,
  type OGLRenderingContext,
} from 'ogl';

import * as Shaders from './shaders';

// ─── Public types ───────────────────────────────────────────────────────────

export interface WaveFieldConfig {
  speed: number;
  intensity: number;
  particleCount: number;
  streakCount: number;
  pixelRatio: number;
  bloom: boolean;
  bloomStrength: number;
  bloomThreshold: number;
}

export interface SceneHandle {
  destroy: () => void;
  pause: () => void;
  resume: () => void;
  setSpeed: (speed: number) => void;
  setIntensity: (intensity: number) => void;
}

// ─── Scene factory ──────────────────────────────────────────────────────────

export function createScene(
  canvas: HTMLCanvasElement,
  config: WaveFieldConfig,
): SceneHandle {
  const renderer = new Renderer({
    canvas,
    antialias: true,
    alpha: true,
    dpr: config.pixelRatio,
    powerPreference: 'high-performance',
  });

  const gl: OGLRenderingContext = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const camera = new Camera(gl, { fov: 55, near: 0.1, far: 250 });
  camera.position.set(0, 3.5, 0);
  camera.lookAt([0, 0.4, -25]);

  const scene = new Transform();

  // ─── Wave surface ────────────────────────────────────────────────────────

  const surface = buildSurface(gl, config);
  surface.mesh.setParent(scene);

  // ─── Instanced streaks ───────────────────────────────────────────────────

  const streaks = buildStreaks(gl, config);
  streaks.mesh.setParent(scene);

  // ─── Bloom pipeline (optional) ───────────────────────────────────────────

  let bloom: BloomPipeline | null = null;
  if (config.bloom) {
    bloom = buildBloomPipeline(renderer, gl, canvas, config);
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  let prevWidth = 0;
  let prevHeight = 0;

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    if (w === prevWidth && h === prevHeight) return;

    renderer.setSize(w, h);
    camera.perspective({ aspect: w / h });
    if (bloom) bloom.resize(w, h);

    prevWidth = w;
    prevHeight = h;
  }

  let animationId = 0;
  let startTime = performance.now();
  let pausedAt = 0;
  let isPaused = false;
  let isDestroyed = false;

  function tick(): void {
    if (isPaused || isDestroyed) return;
    animationId = requestAnimationFrame(tick);

    resize();

    const t = (performance.now() - startTime) / 1000;
    surface.program.uniforms.u_time.value = t;
    streaks.program.uniforms.u_time.value = t;

    if (bloom) {
      bloom.render(scene, camera);
    } else {
      renderer.render({ scene, camera });
    }
  }

  // Handle WebGL context loss gracefully — modern browsers can yank the GPU.
  const onContextLost = (e: Event): void => {
    e.preventDefault();
    if (animationId) cancelAnimationFrame(animationId);
  };
  const onContextRestored = (): void => {
    if (!isPaused && !isDestroyed) tick();
  };
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);

  tick();

  return {
    destroy(): void {
      isDestroyed = true;
      if (animationId) cancelAnimationFrame(animationId);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      // Force context loss to release GPU memory immediately
      const ext = gl.getExtension('WEBGL_lose_context');
      ext?.loseContext();
    },
    pause(): void {
      if (isPaused) return;
      isPaused = true;
      pausedAt = performance.now();
      if (animationId) cancelAnimationFrame(animationId);
    },
    resume(): void {
      if (!isPaused) return;
      isPaused = false;
      // Shift the timeline so the animation doesn't jump
      startTime += performance.now() - pausedAt;
      tick();
    },
    setSpeed(speed: number): void {
      surface.program.uniforms.u_speed.value = speed;
      streaks.program.uniforms.u_speed.value = speed;
    },
    setIntensity(intensity: number): void {
      surface.program.uniforms.u_intensity.value = intensity;
    },
  };
}

// ─── Wave surface builder ───────────────────────────────────────────────────

interface SurfaceData {
  program: Program;
  mesh: Mesh;
}

function buildSurface(
  gl: OGLRenderingContext,
  config: WaveFieldConfig,
): SurfaceData {
  // Grid sized so that total ≈ particleCount, with wider x than z (matches the
  // landscape aspect we look down).
  const xCells = Math.ceil(Math.sqrt(config.particleCount * 2.5));
  const zCells = Math.ceil(config.particleCount / xCells);
  const N = xCells * zCells;

  const positions = new Float32Array(N * 3);
  const colors = new Float32Array(N * 3);
  const seeds = new Float32Array(N);
  const sizes = new Float32Array(N);

  const xRange = 80;
  const zRange = 110;

  let i = 0;
  for (let zi = 0; zi < zCells; zi++) {
    for (let xi = 0; xi < xCells; xi++) {
      const x = (xi / (xCells - 1) - 0.5) * xRange + (Math.random() - 0.5) * 0.18;
      const z = -1.0 - (zi / (zCells - 1)) * zRange;
      positions[i * 3] = x;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = z;
      seeds[i] = Math.random();
      sizes[i] = 0.6 + Math.random() * 0.7;

      const ax = Math.abs(x);
      const edge = ax / 40;
      const r = Math.random();

      if (edge > 0.13 && r < 0.82) {
        // Bright orange (the wave-band dots)
        const b = 0.92 + Math.random() * 0.08;
        colors[i * 3] = b;
        colors[i * 3 + 1] = b * (0.48 + Math.random() * 0.18);
        colors[i * 3 + 2] = b * 0.08;
      } else if (r < 0.94) {
        // Dim amber (the off-band dots)
        const dim = 0.48 + Math.random() * 0.3;
        colors[i * 3] = dim * 1.2;
        colors[i * 3 + 1] = dim * 0.5;
        colors[i * 3 + 2] = dim * 0.08;
      } else {
        // Teal accent (rare)
        colors[i * 3] = 0.16 + Math.random() * 0.1;
        colors[i * 3 + 1] = 0.66 + Math.random() * 0.12;
        colors[i * 3 + 2] = 0.88;
      }
      i++;
    }
  }

  const geometry = new Geometry(gl, {
    position: { size: 3, data: positions },
    aColor: { size: 3, data: colors },
    aSeed: { size: 1, data: seeds },
    aSize: { size: 1, data: sizes },
  });

  const program = new Program(gl, {
    vertex: Shaders.surfaceVertex,
    fragment: Shaders.surfaceFragment,
    uniforms: {
      u_time: { value: 0 },
      u_speed: { value: config.speed },
      u_pr: { value: config.pixelRatio },
      u_intensity: { value: config.intensity },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });

  // Additive blending for the layered glow look
  program.blendFunc = { src: gl.SRC_ALPHA, dst: gl.ONE };

  const mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });
  return { program, mesh };
}

// ─── Instanced streak builder ───────────────────────────────────────────────

interface StreakData {
  program: Program;
  mesh: Mesh;
}

function buildStreaks(
  gl: OGLRenderingContext,
  config: WaveFieldConfig,
): StreakData {
  const numStreaks = config.streakCount;

  // Per-vertex attributes (the unit quad, 4 verts, 2 triangles)
  const quadPos = new Float32Array([
    -0.5, 0.0, 0,
     0.5, 0.0, 0,
    -0.5, 1.0, 0,
     0.5, 1.0, 0,
  ]);
  const quadUv = new Float32Array([
    0, 0,
    1, 0,
    0, 1,
    1, 1,
  ]);
  const quadIndex = new Uint16Array([0, 1, 2, 1, 3, 2]);

  // Per-instance attributes
  const instancePos = new Float32Array(numStreaks * 3);
  const instanceHeight = new Float32Array(numStreaks);
  const instanceSeed = new Float32Array(numStreaks);
  const instanceColor = new Float32Array(numStreaks * 3);

  for (let i = 0; i < numStreaks; i++) {
    // Weight to right side to match source image composition
    const rightSide = Math.random() < 0.8;
    const xBase = rightSide
      ? 10 + Math.random() * 30
      : -(10 + Math.random() * 30);
    const zBase = -2 - Math.random() * 70;

    instancePos[i * 3] = xBase;
    instancePos[i * 3 + 1] = 0;
    instancePos[i * 3 + 2] = zBase;

    instanceHeight[i] = 3 + Math.random() * 5;
    instanceSeed[i] = Math.random();

    const b = 0.85 + Math.random() * 0.15;
    instanceColor[i * 3] = b;
    instanceColor[i * 3 + 1] = b * (0.52 + Math.random() * 0.22);
    instanceColor[i * 3 + 2] = b * 0.12;
  }

  const geometry = new Geometry(gl, {
    position: { size: 3, data: quadPos },
    uv: { size: 2, data: quadUv },
    index: { size: 1, data: quadIndex },
    instancePos: { size: 3, data: instancePos, instanced: 1 },
    instanceHeight: { size: 1, data: instanceHeight, instanced: 1 },
    instanceSeed: { size: 1, data: instanceSeed, instanced: 1 },
    instanceColor: { size: 3, data: instanceColor, instanced: 1 },
  });

  const program = new Program(gl, {
    vertex: Shaders.streakVertex,
    fragment: Shaders.streakFragment,
    uniforms: {
      u_time: { value: 0 },
      u_speed: { value: config.speed },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
  });

  program.blendFunc = { src: gl.SRC_ALPHA, dst: gl.ONE };

  const mesh = new Mesh(gl, { geometry, program });
  return { program, mesh };
}

// ─── Selective bloom pipeline ───────────────────────────────────────────────
// scene → threshold (only bright pixels) → blur H → blur V → composite over scene.
// Blur targets are half-resolution for performance — the eye doesn't notice on
// soft glow, and it cuts the per-frame cost ~75%.

interface BloomPipeline {
  render: (scene: Transform, camera: Camera) => void;
  resize: (w: number, h: number) => void;
}

function buildBloomPipeline(
  renderer: Renderer,
  gl: OGLRenderingContext,
  canvas: HTMLCanvasElement,
  config: WaveFieldConfig,
): BloomPipeline {
  // Fullscreen triangle trick: a single oversized triangle covers the viewport
  // with fewer vertices and zero overdraw at the clipping plane.
  const fullscreenGeom = new Geometry(gl, {
    position: { size: 2, data: new Float32Array([-1, -1, 3, -1, -1, 3]) },
    uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
  });

  const thresholdProgram = new Program(gl, {
    vertex: Shaders.fullscreenVertex,
    fragment: Shaders.thresholdFragment,
    uniforms: {
      tMap: { value: null },
      u_threshold: { value: config.bloomThreshold },
      u_softness: { value: 0.1 },
    },
  });

  const blurHProgram = new Program(gl, {
    vertex: Shaders.fullscreenVertex,
    fragment: Shaders.blurHorizontalFragment,
    uniforms: {
      tMap: { value: null },
      u_resolution: { value: new Vec2(1, 1) },
    },
  });

  const blurVProgram = new Program(gl, {
    vertex: Shaders.fullscreenVertex,
    fragment: Shaders.blurVerticalFragment,
    uniforms: {
      tMap: { value: null },
      u_resolution: { value: new Vec2(1, 1) },
    },
  });

  const compositeProgram = new Program(gl, {
    vertex: Shaders.fullscreenVertex,
    fragment: Shaders.compositeFragment,
    uniforms: {
      tScene: { value: null },
      tBloom: { value: null },
      u_strength: { value: config.bloomStrength },
    },
  });

  const thresholdMesh = new Mesh(gl, { geometry: fullscreenGeom, program: thresholdProgram });
  const blurHMesh = new Mesh(gl, { geometry: fullscreenGeom, program: blurHProgram });
  const blurVMesh = new Mesh(gl, { geometry: fullscreenGeom, program: blurVProgram });
  const compositeMesh = new Mesh(gl, { geometry: fullscreenGeom, program: compositeProgram });

  let sceneRT: RenderTarget;
  let bloomRT1: RenderTarget;
  let bloomRT2: RenderTarget;

  function allocateTargets(w: number, h: number): void {
    const dpr = config.pixelRatio;
    const fullW = Math.max(1, Math.floor(w * dpr));
    const fullH = Math.max(1, Math.floor(h * dpr));
    const halfW = Math.max(1, Math.floor(fullW / 2));
    const halfH = Math.max(1, Math.floor(fullH / 2));

    sceneRT = new RenderTarget(gl, { width: fullW, height: fullH });
    bloomRT1 = new RenderTarget(gl, { width: halfW, height: halfH });
    bloomRT2 = new RenderTarget(gl, { width: halfW, height: halfH });

    (blurHProgram.uniforms.u_resolution.value as Vec2).set(halfW, halfH);
    (blurVProgram.uniforms.u_resolution.value as Vec2).set(halfW, halfH);
  }

  // Initial allocation; render() will be called once canvas has a size.
  allocateTargets(canvas.clientWidth || 1, canvas.clientHeight || 1);

  return {
    resize(w: number, h: number): void {
      allocateTargets(w, h);
    },

    render(scene: Transform, camera: Camera): void {
      // 1. Render scene to off-screen target
      renderer.render({ scene, camera, target: sceneRT });

      // 2. Threshold: keep only bright pixels
      thresholdProgram.uniforms.tMap.value = sceneRT.texture;
      renderer.render({ scene: thresholdMesh, target: bloomRT1 });

      // 3. Horizontal blur
      blurHProgram.uniforms.tMap.value = bloomRT1.texture;
      renderer.render({ scene: blurHMesh, target: bloomRT2 });

      // 4. Vertical blur
      blurVProgram.uniforms.tMap.value = bloomRT2.texture;
      renderer.render({ scene: blurVMesh, target: bloomRT1 });

      // 5. Composite scene + blurred bright pixels to screen
      compositeProgram.uniforms.tScene.value = sceneRT.texture;
      compositeProgram.uniforms.tBloom.value = bloomRT1.texture;
      renderer.render({ scene: compositeMesh });
    },
  };
}
