"use client"

import { useEffect, useRef } from "react"

/**
 * WaveDots — procedural dotted wave field for the Miras hero.
 *
 * Bootstrapped from the tools-site `shader-background.tsx` (dependency-free raw
 * WebGL, domain-warped fBm). Evolved here into the brand cover-art look: rows of
 * glowing orange/teal dots flowing in waves across the lower frame, a calm dark
 * centre valley, and a navy→teal sky — ALL rendered in a single fullscreen
 * fragment shader, so any frame is the complete picture.
 *
 * Honors prefers-reduced-motion (renders one static frame) and pauses when the
 * tab is hidden or the hero scrolls out of view.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;
varying vec2 vUv;

uniform float u_time;
uniform vec2  u_res;
uniform float u_scale;
uniform float u_warp;
uniform float u_stretch;
uniform float u_speed;
uniform float u_chroma;
uniform vec3  u_orange;
uniform vec3  u_gold;
uniform vec3  u_teal;

// ── simplex noise + fBm (from the tools-site shader) ────────────────────────
vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x){ return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                          dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    s += a * snoise(p);
    p = p * 2.0 + 17.0;
    a *= 0.5;
  }
  return s;
}

// Domain-warped flow field → returns value in [0,1], plus the warp vector.
float flow(vec2 p, out vec2 warpv) {
  float t = u_time * 0.08;
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + u_warp * 4.0 * q + vec2(1.7, 9.2)),
                fbm(p + u_warp * 4.0 * q + vec2(8.3, 2.8)));
  warpv = r;
  float n = fbm(p + u_warp * 4.0 * r);
  return clamp(n * 0.5 + 0.5, 0.0, 1.0);
}

// Background sky: navy base with a soft teal glow near the top-centre.
vec3 sky(vec2 uv) {
  vec2 d = uv - vec2(0.5, 0.84);
  float r = length(vec2(d.x / 0.62, d.y / 0.55));
  vec3 teal = vec3(0.055, 0.255, 0.355);
  vec3 mid  = vec3(0.043, 0.150, 0.223);
  vec3 navy = vec3(0.028, 0.094, 0.149);
  vec3 deep = vec3(0.020, 0.060, 0.098);
  vec3 c = mix(teal, mid, smoothstep(0.0, 0.40, r));
  c = mix(c, navy, smoothstep(0.40, 0.70, r));
  c = mix(c, deep, smoothstep(0.70, 1.05, r));
  return c;
}

void main() {
  vec2 uv = vUv;
  float aspect = u_res.x / u_res.y;

  // Flow field in stretched field-space; drifts over time.
  vec2 fp = vec2((uv.x - 0.5) * aspect, uv.y) * u_scale;
  fp.x *= (1.0 - 0.5 * u_stretch);
  vec2 wv;
  float n = flow(fp + vec2(0.0, -u_time * u_speed), wv);
  float warpAmt = (n - 0.5) * 2.0;

  // Composition envelopes.
  float cd = abs(uv.x - 0.5);                       // distance from centre
  float calm = smoothstep(0.05, 0.24, cd);          // narrow dark centre valley
  float lower = smoothstep(0.60, -0.05, uv.y);      // energy in the lower frame
  float env = lower * calm;

  // Warped wave height — a low-frequency wave folded by the domain-warp field.
  // It is a function of x only (per column), so every row shares it and the
  // rows move together as PARALLEL flowing lines (the cover-art look). Kept
  // smooth (low warp jitter) for elegant sweeping curves.
  float waveH = sin(uv.x * 6.2831 * 1.4 + warpAmt * 2.2 + wv.x * 1.0) * 0.55
              + warpAmt * 0.7;
  float amp = 0.065 * lower * (0.6 + 0.8 * calm);
  float yy = uv.y + waveH * amp;

  // Dot lattice on the displaced rows. Per-row x offset staggers the dots so
  // it reads as flowing lines of dots, not a rigid grid. Dots grow toward the
  // foreground (bottom) for depth.
  float rows = 18.0;
  float cols = 130.0;
  float ry = yy * rows;
  float rowCell = fract(ry) - 0.5;
  float cx = fract(uv.x * cols + floor(ry) * 0.37) - 0.5;
  float dd = sqrt(rowCell * rowCell * 1.15 + cx * cx);
  float sz = 0.32 + 0.16 * lower;
  float core = smoothstep(sz, 0.0, dd);
  float halo = smoothstep(sz + 0.26, sz - 0.18, dd) * 0.42;   // wide halo = glow
  float dotv = core + halo;

  // Brightness along the lines, modulated by the flow crest.
  float crest = smoothstep(0.30, 0.92, n + 0.12 * calm);
  float bright = dotv * env * (0.5 + 0.85 * crest);

  // Color.
  vec3 col = sky(uv);
  vec3 warm = mix(u_gold, u_orange, smoothstep(0.20, 1.0, crest));
  col += warm * bright * 2.7;

  // Rare teal accent dots.
  float rnd = fract(sin(dot(floor(vec2(uv.x * cols, ry)),
                          vec2(12.9898, 78.233))) * 43758.5453);
  float tealKey = step(0.87, rnd) * dotv * env * (0.4 + 0.6 * calm);
  col += u_teal * tealKey * 1.0;

  // Saturation/chroma lift on the brightest dots.
  col += u_chroma * bright * u_orange * 2.0;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    // eslint-disable-next-line no-console
    console.error(gl.getShaderInfoLog(sh))
    gl.deleteShader(sh)
    return null
  }
  return sh
}

const hex = (h: string): [number, number, number] => {
  const n = parseInt(h.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export function WaveDots({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { antialias: true, alpha: false })
    if (!gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      // eslint-disable-next-line no-console
      console.error(gl.getProgramInfoLog(prog))
      return
    }
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, "aPos")
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const u = (name: string) => gl.getUniformLocation(prog, name)
    const uTime = u("u_time")
    const uRes = u("u_res")

    // Look params (baseline from the supplied shader config, retuned for dots).
    gl.uniform1f(u("u_scale"), 0.95)
    gl.uniform1f(u("u_warp"), 0.3)
    gl.uniform1f(u("u_stretch"), 0.45)
    gl.uniform1f(u("u_speed"), 0.06)
    gl.uniform1f(u("u_chroma"), 0.05)
    gl.uniform3fv(u("u_orange"), hex("#f5a531"))
    gl.uniform3fv(u("u_gold"), hex("#caa45d"))
    gl.uniform3fv(u("u_teal"), hex("#1fb6d6"))

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const w = Math.floor(canvas.clientWidth * dpr)
      const h = Math.floor(canvas.clientHeight * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform2f(uRes, canvas.width, canvas.height)
    }

    let raf = 0
    let running = true
    const start = performance.now()
    const render = (now: number) => {
      resize()
      const t = reduced ? 12 : (now - start) / 1000
      gl.uniform1f(uTime, t)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!reduced && running) raf = requestAnimationFrame(render)
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else if (!reduced && running) {
        raf = requestAnimationFrame(render)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    // Pause when the hero scrolls out of view.
    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting
        if (running && !reduced) raf = requestAnimationFrame(render)
        else cancelAnimationFrame(raf)
      },
      { rootMargin: "100px" },
    )
    io.observe(canvas)

    render(start)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("visibilitychange", onVisibility)
      io.disconnect()
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
    }
  }, [])

  return <canvas ref={ref} aria-hidden className={className} style={style} />
}
