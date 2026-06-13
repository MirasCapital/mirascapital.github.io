"use client"

import { useEffect, useRef } from "react"

/**
 * FlowField — smooth flowing-liquid backdrop for the Miras site.
 *
 * Domain-warped fBm flow rendered as a restrained monochrome haze (black base
 * → dark grey → muted grey highlight). Full-bleed fixed backdrop; the page
 * applies scrims so left-aligned text stays legible over it.
 *
 * Honors prefers-reduced-motion (single static frame) and pauses when the tab
 * is hidden.
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
uniform float u_amp;
uniform float u_warp;
uniform float u_soft;
uniform float u_chroma;
uniform float u_grain;
uniform float u_bright;
uniform float u_sat;
uniform vec2  u_mouse; // pointer in p-space (aspect-corrected, scaled)
uniform float u_mstr;  // pointer influence 0..1, eased in/out
uniform vec3  u_c1; // cyan highlight
uniform vec3  u_c2; // Apple blue
uniform vec3  u_c3; // black base

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

void main() {
  vec2 p = (vUv - 0.5);
  p.x *= u_res.x / u_res.y;
  p *= u_scale;

  float t = u_time;

  // Pointer influence: a soft falloff around the cursor that stirs the warp
  // (perpendicular swirl) and lifts brightness, so the liquid reacts to you.
  vec2 dm = p - u_mouse;
  float md = exp(-dot(dm, dm) * 1.6) * u_mstr;

  // Two-pass domain warp → organic, liquid flow.
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.10)),
                fbm(p + vec2(5.2, 1.3) - t * 0.12));
  q += 0.45 * md * vec2(dm.y, -dm.x);
  vec2 r = vec2(fbm(p + u_warp * q + vec2(1.7, 9.2) + t * 0.08),
                fbm(p + u_warp * q + vec2(8.3, 2.8) - t * 0.09));
  float n = fbm(p + u_warp * r);
  n = clamp(n * u_amp + 0.5 + 0.08 * md, 0.0, 1.0);

  float e = mix(0.04, 0.26, u_soft);
  vec3 col = u_c3;
  col = mix(col, u_c2, smoothstep(0.22 - e, 0.55 + e, n));
  col = mix(col, u_c1, smoothstep(0.62 - e, 0.92 + e, n + 0.15 * r.x));

  // Cyan edge glow on the brightest ridges.
  float edge = smoothstep(0.6, 0.95, n);
  col += u_chroma * edge * u_c1;

  // Tone.
  col += u_bright;
  float l = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(l), col, 1.0 + u_sat);

  // Subtle grain for texture.
  float g = fract(sin(dot(vUv * u_res + t, vec2(12.9898, 78.233))) * 43758.5453);
  col += (g - 0.5) * u_grain;

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

export function FlowField({
  className,
  style,
  intensityRef,
}: {
  className?: string
  style?: React.CSSProperties
  // 0.4‒1 multiplier on the flow speed, read every frame so the parent can
  // "calm" the shader as content scrolls in. Defaults to full speed.
  intensityRef?: React.RefObject<number>
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
    const uMouse = u("u_mouse")
    const uMstr = u("u_mstr")

    // Monochrome haze, tuned restrained for an advisory firm: large, slow,
    // soft forms (low scale + amp + warp, high soft) that drift rather than
    // churn, and a muted-grey highlight (not white) with no edge glow — so the
    // backdrop reads as quiet smoke, mostly black, never busy.
    const SCALE = 0.85
    gl.uniform1f(u("u_scale"), SCALE)
    gl.uniform1f(u("u_amp"), 0.62)
    gl.uniform1f(u("u_warp"), 0.8)
    gl.uniform1f(u("u_soft"), 0.85)
    gl.uniform1f(u("u_chroma"), 0.0)
    gl.uniform1f(u("u_grain"), 0.035)
    gl.uniform1f(u("u_bright"), -0.12)
    gl.uniform1f(u("u_sat"), 0.0)
    gl.uniform3fv(u("u_c1"), hex("#86868c")) // muted grey highlight
    gl.uniform3fv(u("u_c2"), hex("#2c2c32")) // dark grey
    gl.uniform3fv(u("u_c3"), hex("#000000")) // black base

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Pointer state in shader p-space. Position and strength are lerped each
    // frame so the swirl trails the cursor and fades in/out rather than
    // snapping. Strength stays 0 until the pointer first moves over the hero.
    const mouse = { x: 0, y: 0, s: 0, tx: 0, ty: 0, ts: 0 }
    const onPointerMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      const inside =
        e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top && e.clientY <= r.bottom
      mouse.ts = inside ? 1 : 0
      if (inside) {
        const aspect = r.width / r.height
        mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * aspect * SCALE
        mouse.ty = (0.5 - (e.clientY - r.top) / r.height) * SCALE
      }
    }
    const onPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) mouse.ts = 0
    }
    if (!reduced) {
      window.addEventListener("pointermove", onPointerMove, { passive: true })
      window.addEventListener("pointerout", onPointerOut)
    }

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
    // Flow time is *accumulated* (not derived from a fixed epoch) so the
    // parent can vary the speed each frame — slowing the flow as content
    // scrolls in — without the phase jumping when the speed changes.
    let last = performance.now()
    let tAccum = 0
    let speed = 1
    const render = (now: number) => {
      resize()
      const dt = Math.min(now - last, 50) // clamp so a resumed tab doesn't jump
      last = now
      const target = intensityRef?.current ?? 1
      speed += (target - speed) * 0.05
      if (!reduced) tAccum += dt * 0.001 * 0.085 * speed
      const t = reduced ? 14 : tAccum
      gl.uniform1f(uTime, t)
      mouse.x += (mouse.tx - mouse.x) * 0.06
      mouse.y += (mouse.ty - mouse.y) * 0.06
      mouse.s += (mouse.ts - mouse.s) * 0.05
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.uniform1f(uMstr, reduced ? 0 : mouse.s)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!reduced) raf = requestAnimationFrame(render)
    }

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else if (!reduced) {
        last = performance.now()
        raf = requestAnimationFrame(render)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    render(last)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerout", onPointerOut)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buf)
    }
  }, [intensityRef])

  return <canvas ref={ref} aria-hidden className={className} style={style} />
}
