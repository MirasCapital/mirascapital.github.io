'use client';

// React wrapper for the WaveField scene.
// Handles: SSR safety, prefers-reduced-motion fallback, IntersectionObserver
// pause/resume, mobile tuning, poster image transition, WebGL feature detection,
// and clean teardown.

import { useEffect, useRef, useState } from 'react';
import { createScene, type SceneHandle, type WaveFieldConfig } from './scene';

// ─── Public API ─────────────────────────────────────────────────────────────

export type WaveFieldIntensity = 'subtle' | 'balanced' | 'pronounced';
export type WaveFieldSpeed = 'drift' | 'walk' | 'flow';

export interface WaveFieldProps {
  /** URL of the static poster image. Shown until WebGL loads and as the
   *  reduced-motion fallback. Recommend the same image used in pitch decks. */
  posterSrc: string;
  /** Optional className applied to the wrapper div. */
  className?: string;
  /** Inline styles applied to the wrapper. */
  style?: React.CSSProperties;
  /** Visual intensity preset. Default: balanced. */
  intensity?: WaveFieldIntensity;
  /** Animation speed preset. Default: drift (slow, contemplative). */
  speed?: WaveFieldSpeed;
  /** Enable the selective bloom post-process. Default: true on desktop,
   *  auto-disabled on low-end mobile. */
  bloom?: boolean;
  /** ARIA description for screen readers. The animation itself is decorative. */
  ariaLabel?: string;
}

// ─── Presets ────────────────────────────────────────────────────────────────

const SPEED_MAP: Record<WaveFieldSpeed, number> = {
  drift: 1.5,
  walk: 3.5,
  flow: 7.0,
};

interface IntensityPreset {
  intensity: number;
  particleCount: number;
  streakCount: number;
  bloomStrength: number;
  bloomThreshold: number;
}

const INTENSITY_MAP: Record<WaveFieldIntensity, IntensityPreset> = {
  subtle:     { intensity: 0.7, particleCount: 8000,  streakCount: 40,  bloomStrength: 0.8, bloomThreshold: 0.35 },
  balanced:   { intensity: 1.0, particleCount: 14000, streakCount: 75,  bloomStrength: 1.2, bloomThreshold: 0.25 },
  pronounced: { intensity: 1.3, particleCount: 20000, streakCount: 120, bloomStrength: 1.6, bloomThreshold: 0.18 },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function WaveField({
  posterSrc,
  className,
  style,
  intensity = 'balanced',
  speed = 'drift',
  bloom,
  ariaLabel,
}: WaveFieldProps): React.JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneHandle | null>(null);

  // Start with poster visible. Swap to canvas once WebGL is mounted and ready.
  const [canvasReady, setCanvasReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [webglUnsupported, setWebglUnsupported] = useState(false);

  // ── prefers-reduced-motion ────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent): void => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── WebGL feature detection ───────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const probe = document.createElement('canvas');
    const ctx = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!ctx) setWebglUnsupported(true);
  }, []);

  // ── Scene lifecycle ───────────────────────────────────────────────────────

  useEffect(() => {
    if (reduceMotion || webglUnsupported) return;
    if (!canvasRef.current || !wrapperRef.current) return;
    if (sceneRef.current) return;

    const preset = INTENSITY_MAP[intensity];
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isLowEnd = (navigator.hardwareConcurrency ?? 4) <= 4;

    // Mobile and low-end devices get a lighter config
    const particleCount = isMobile || isLowEnd
      ? Math.floor(preset.particleCount * 0.5)
      : preset.particleCount;
    const streakCount = isMobile || isLowEnd
      ? Math.floor(preset.streakCount * 0.5)
      : preset.streakCount;
    const pixelRatio = isMobile
      ? Math.min(window.devicePixelRatio, 1.5)
      : Math.min(window.devicePixelRatio, 2);
    // Bloom defaults on for desktop, off for low-end
    const bloomEnabled = bloom ?? (!isLowEnd);

    const config: WaveFieldConfig = {
      speed: SPEED_MAP[speed],
      intensity: preset.intensity,
      particleCount,
      streakCount,
      pixelRatio,
      bloom: bloomEnabled,
      bloomStrength: preset.bloomStrength,
      bloomThreshold: preset.bloomThreshold,
    };

    let cancelled = false;
    try {
      sceneRef.current = createScene(canvasRef.current, config);
      // Defer the poster fade-out by a couple of frames so the first frame
      // of the canvas has actually rasterized — prevents a black flash.
      requestAnimationFrame(() => {
        if (cancelled) return;
        requestAnimationFrame(() => {
          if (cancelled) return;
          setCanvasReady(true);
        });
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[WaveField] WebGL initialization failed; falling back to poster.', err);
      setWebglUnsupported(true);
    }

    return () => {
      cancelled = true;
      sceneRef.current?.destroy();
      sceneRef.current = null;
    };
  }, [intensity, speed, bloom, reduceMotion, webglUnsupported]);

  // ── IntersectionObserver: pause when off-screen ───────────────────────────
  // Always reads from sceneRef.current so it survives scene recreations
  // (e.g. when intensity prop changes mid-mount).

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!wrapperRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!sceneRef.current) return;
        if (entry.isIntersecting) sceneRef.current.resume();
        else sceneRef.current.pause();
      },
      { rootMargin: '100px' },
    );
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  const useFallback = reduceMotion || webglUnsupported;

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    >
      {/* Poster: always rendered. Sits beneath the canvas, fades out once WebGL
          paints. Acts as the reduced-motion and no-WebGL fallback. */}
      <img
        src={posterSrc}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: useFallback ? 1 : canvasReady ? 0 : 1,
          transition: 'opacity 700ms ease-out',
          pointerEvents: 'none',
        }}
      />
      {!useFallback && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            opacity: canvasReady ? 1 : 0,
            transition: 'opacity 700ms ease-out',
          }}
        />
      )}
    </div>
  );
}
