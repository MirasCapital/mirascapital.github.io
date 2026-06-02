// GLSL shaders for the WaveField component.
// Written in GLSL ES 1.00 (attribute/varying) for max compatibility across WebGL1 + WebGL2.
// OGL accepts both; using 1.00 syntax means the same shader runs on older mobile GPUs.

// ─── Wave surface (point sprites with in-shader glow) ───────────────────────

export const surfaceVertex = /* glsl */ `
  precision highp float;

  attribute vec3 position;
  attribute vec3 aColor;
  attribute float aSeed;
  attribute float aSize;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float u_time;
  uniform float u_speed;
  uniform float u_pr;
  uniform float u_intensity;

  varying vec3 vColor;
  varying float vDist;
  varying float vAmp;

  void main() {
    vec3 pos = position;

    // Forward motion: surface flows toward camera, wraps at far plane
    float zR = 110.0;
    pos.z = mod(pos.z + u_time * u_speed, zR) - zR;

    // Wave displacement: calm centre, amplitude grows toward edges
    float edge = max(0.0, abs(pos.x) - 4.5);
    float amp = min(edge * 0.25 * u_intensity, 5.2);

    float w1 = sin(pos.x * 0.18 + pos.z * 0.07 + u_time * 0.30) * amp;
    float w2 = sin(pos.x * 0.34 - u_time * 0.18) * amp * 0.32;
    float w3 = cos(pos.z * 0.11 + u_time * 0.22 + aSeed * 6.28) * 0.35;
    pos.y += w1 + w2 + w3;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float dist = length(mvPos.xyz);
    gl_PointSize = aSize * 4.5 * (38.0 / dist) * u_pr;

    vColor = aColor;
    vDist = -mvPos.z;
    vAmp = amp;
  }
`;

export const surfaceFragment = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  varying float vDist;
  varying float vAmp;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    // Three-layer falloff: tight core, soft inner, wide halo
    // The wide halo feeds the bloom pass without making the dot look mushy.
    float core  = smoothstep(0.18, 0.0, d);
    float inner = smoothstep(0.35, 0.10, d) * 0.55;
    float outer = smoothstep(0.5,  0.25, d) * 0.30;
    float alpha = core + inner + outer;

    float nearFade = smoothstep(0.5, 5.0, vDist);
    float farFade  = 1.0 - smoothstep(85.0, 110.0, vDist);
    float boost    = 1.0 + smoothstep(0.0, 18.0, vAmp) * 0.45;

    gl_FragColor = vec4(vColor * boost * 1.20, alpha * nearFade * farFade);
  }
`;

// ─── Instanced streaks (thin vertical quads with bright head + fading tail) ─

export const streakVertex = /* glsl */ `
  precision highp float;

  attribute vec3 position;
  attribute vec2 uv;
  attribute vec3 instancePos;
  attribute float instanceHeight;
  attribute float instanceSeed;
  attribute vec3 instanceColor;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float u_time;
  uniform float u_speed;

  varying vec2 vUv;
  varying vec3 vColor;
  varying float vDist;
  varying float vY;

  void main() {
    // Stretch the unit quad: thin in x, tall in y per instance
    vec3 quadVertex = position;
    quadVertex.x *= 0.06;
    quadVertex.y *= instanceHeight;

    // Animate the streak rising over time. Each instance has its own phase
    // so collectively the field always has visible streaks.
    float cycle = 16.0;
    float yOffset = mod(u_time * u_speed * 0.45 + instanceSeed * cycle, cycle) - 10.0;

    vec3 worldPos = instancePos + quadVertex;
    worldPos.y += yOffset;

    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    vUv = uv;
    vColor = instanceColor;
    vDist = -mvPos.z;
    vY = worldPos.y;
  }
`;

export const streakFragment = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vColor;
  varying float vDist;
  varying float vY;

  void main() {
    // Horizontal: bright down the middle, fade at edges (gives the line look)
    float horiz = 1.0 - abs(vUv.x - 0.5) * 2.0;
    horiz = smoothstep(0.0, 1.0, horiz);

    // Vertical: bright head at top, tapering tail downward
    float head = smoothstep(0.85, 1.0, vUv.y) * 2.5;
    float body = pow(vUv.y, 1.5) * 0.7;
    float intensity = head + body;

    // World-space fades so streaks enter/exit the scene smoothly
    float topFade  = 1.0 - smoothstep(4.0, 9.0, vY);
    float botFade  = smoothstep(-7.0, -4.0, vY);
    float distFade = 1.0 - smoothstep(60.0, 90.0, vDist);

    float alpha = intensity * horiz * topFade * botFade * distFade;
    gl_FragColor = vec4(vColor * 1.3, alpha);
  }
`;

// ─── Selective bloom pipeline ───────────────────────────────────────────────
// Architecture: scene → threshold → blur H → blur V → composite with scene.
// "Selective" because the threshold pass only lets bright pixels through, so the
// dark navy background never glows — only the orange particles do.

export const fullscreenVertex = /* glsl */ `
  precision highp float;
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export const thresholdFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tMap;
  uniform float u_threshold;
  uniform float u_softness;

  void main() {
    vec4 color = texture2D(tMap, vUv);
    float luma = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    float weight = smoothstep(u_threshold, u_threshold + u_softness, luma);
    gl_FragColor = vec4(color.rgb * weight, 1.0);
  }
`;

export const blurHorizontalFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tMap;
  uniform vec2 u_resolution;

  void main() {
    vec2 texel = 1.0 / u_resolution;
    vec4 sum = vec4(0.0);
    sum += texture2D(tMap, vUv + vec2(-4.0, 0.0) * texel) * 0.05;
    sum += texture2D(tMap, vUv + vec2(-3.0, 0.0) * texel) * 0.09;
    sum += texture2D(tMap, vUv + vec2(-2.0, 0.0) * texel) * 0.12;
    sum += texture2D(tMap, vUv + vec2(-1.0, 0.0) * texel) * 0.15;
    sum += texture2D(tMap, vUv                          ) * 0.18;
    sum += texture2D(tMap, vUv + vec2( 1.0, 0.0) * texel) * 0.15;
    sum += texture2D(tMap, vUv + vec2( 2.0, 0.0) * texel) * 0.12;
    sum += texture2D(tMap, vUv + vec2( 3.0, 0.0) * texel) * 0.09;
    sum += texture2D(tMap, vUv + vec2( 4.0, 0.0) * texel) * 0.05;
    gl_FragColor = sum;
  }
`;

export const blurVerticalFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tMap;
  uniform vec2 u_resolution;

  void main() {
    vec2 texel = 1.0 / u_resolution;
    vec4 sum = vec4(0.0);
    sum += texture2D(tMap, vUv + vec2(0.0, -4.0) * texel) * 0.05;
    sum += texture2D(tMap, vUv + vec2(0.0, -3.0) * texel) * 0.09;
    sum += texture2D(tMap, vUv + vec2(0.0, -2.0) * texel) * 0.12;
    sum += texture2D(tMap, vUv + vec2(0.0, -1.0) * texel) * 0.15;
    sum += texture2D(tMap, vUv                          ) * 0.18;
    sum += texture2D(tMap, vUv + vec2(0.0,  1.0) * texel) * 0.15;
    sum += texture2D(tMap, vUv + vec2(0.0,  2.0) * texel) * 0.12;
    sum += texture2D(tMap, vUv + vec2(0.0,  3.0) * texel) * 0.09;
    sum += texture2D(tMap, vUv + vec2(0.0,  4.0) * texel) * 0.05;
    gl_FragColor = sum;
  }
`;

export const compositeFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tScene;
  uniform sampler2D tBloom;
  uniform float u_strength;

  void main() {
    vec3 scene = texture2D(tScene, vUv).rgb;
    vec3 bloom = texture2D(tBloom, vUv).rgb;
    gl_FragColor = vec4(scene + bloom * u_strength, 1.0);
  }
`;
