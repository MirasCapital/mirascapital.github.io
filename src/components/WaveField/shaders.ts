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
    float edge = max(0.0, abs(pos.x) - 8.5);
    float amp = min(edge * 0.30 * u_intensity, 6.5);

    // w1/w2 are coherent per-row (functions of x,z only) so dots read as smooth
    // flowing lines, not scatter. w3 is a small spatial ripple — NOT keyed to
    // aSeed, which would jitter each dot independently and break the line.
    float w1 = sin(pos.x * 0.16 + pos.z * 0.06 + u_time * 0.30) * amp;
    float w2 = sin(pos.x * 0.30 - u_time * 0.18) * amp * 0.30;
    float w3 = cos(pos.z * 0.13 + u_time * 0.22) * 0.45;
    pos.y += w1 + w2 + w3;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float dist = length(mvPos.xyz);
    gl_PointSize = aSize * 5.5 * (38.0 / dist) * u_pr;

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
    float farFade  = 1.0 - smoothstep(52.0, 92.0, vDist);
    float boost    = 1.0 + smoothstep(0.0, 18.0, vAmp) * 0.45;

    // Center fade: the calm centre (amp ~0) drops to near-dark so the middle
    // reads as an empty valley between the two corner wave systems — instead of
    // a flat band of dots crossing behind the wordmark.
    float centerFade = 0.10 + 0.90 * smoothstep(0.0, 2.2, vAmp);

    gl_FragColor = vec4(vColor * boost * 1.5, alpha * nearFade * farFade * centerFade);
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
    quadVertex.x *= 0.045;
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
    gl_FragColor = vec4(vColor * 1.9, alpha);
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

// ─── Background gradient (drawn first, inside the scene) ─────────────────────
// Renders the deep-navy → teal radial atmosphere AS PART OF the WebGL scene, so
// the canvas is self-contained: a screenshot of any frame includes the gradient,
// waves, streaks and bloom together. Kept dark enough that the bloom threshold
// never picks it up — only the dots glow.
export const gradientFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  void main() {
    // Elliptical radial falloff centred near the top-middle.
    // (uv.y is 0 at the bottom of the canvas, 1 at the top.)
    vec2 d = vUv - vec2(0.5, 0.84);
    float r = length(vec2(d.x / 0.62, d.y / 0.55));

    vec3 teal = vec3(0.055, 0.255, 0.355); // glow core (kept below bloom thresh)
    vec3 mid  = vec3(0.043, 0.150, 0.223);
    vec3 navy = vec3(0.028, 0.094, 0.149);
    vec3 deep = vec3(0.020, 0.060, 0.098); // dark corners

    vec3 col = mix(teal, mid, smoothstep(0.0, 0.40, r));
    col = mix(col, navy, smoothstep(0.40, 0.70, r));
    col = mix(col, deep, smoothstep(0.70, 1.05, r));

    gl_FragColor = vec4(col, 1.0);
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
