import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import './GradientWaves.css';

const hexToRgb = (hex) => {
  let value = hex.trim();

  if (value.startsWith('#')) value = value.slice(1);

  if (value.length === 3) {
    value = value
      .split('')
      .map((char) => char + char)
      .join('');
  }

  const num = parseInt(value, 16);

  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255
  ];
};

const GradientWaves = ({
  horizonColor = '#5227FF',
  waveColor = '#FF9FFC',
  crestColor = '#FFFFFF',
  speed = 0.4,
  amplitude = 2.5,
  waveScale = 0.6,
  waveRatio = 0.9,
  swell = 35,
  turbulence = 20,
  tilt = 1.11,
  zoom = 1,
  height = 5.5,
  fogDepth = 15,
  detail = 'medium',
  brightness = 1,
  opacity = 1,
  mouseInteraction = true,
  parallaxStrength = 0.5,
  grain = true,
  grainIntensity = 0.05
}) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });

    rendererRef.current = renderer;

    const gl = renderer.gl;

    gl.clearColor(0, 0, 0, 0);

    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);

    const detailLevel =
      detail === 'high'
        ? 5
        : detail === 'low'
          ? 2
          : 3;

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: [1, 1] },
      uMouse: { value: [0.5, 0.5] },
      uHorizonColor: { value: hexToRgb(horizonColor) },
      uWaveColor: { value: hexToRgb(waveColor) },
      uCrestColor: { value: hexToRgb(crestColor) },
      uSpeed: { value: speed },
      uAmplitude: { value: amplitude },
      uWaveScale: { value: waveScale },
      uWaveRatio: { value: waveRatio },
      uSwell: { value: swell },
      uTurbulence: { value: turbulence },
      uTilt: { value: tilt },
      uZoom: { value: zoom },
      uHeight: { value: height },
      uFogDepth: { value: fogDepth },
      uBrightness: { value: brightness },
      uOpacity: { value: opacity },
      uParallaxStrength: { value: parallaxStrength },
      uGrain: { value: grain ? 1 : 0 },
      uGrainIntensity: { value: grainIntensity },
      uDetail: { value: detailLevel }
    };

    const vertex = /* glsl */ `
      attribute vec2 uv;
      attribute vec3 position;

      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragment = /* glsl */ `
      precision highp float;

      varying vec2 vUv;

      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;

      uniform vec3 uHorizonColor;
      uniform vec3 uWaveColor;
      uniform vec3 uCrestColor;

      uniform float uSpeed;
      uniform float uAmplitude;
      uniform float uWaveScale;
      uniform float uWaveRatio;
      uniform float uSwell;
      uniform float uTurbulence;
      uniform float uTilt;
      uniform float uZoom;
      uniform float uHeight;
      uniform float uFogDepth;
      uniform float uBrightness;
      uniform float uOpacity;
      uniform float uParallaxStrength;
      uniform float uGrain;
      uniform float uGrainIntensity;
      uniform float uDetail;

      #define PI 3.14159265359

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 345.45));
        p += dot(p, p + 34.345);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);

        f = f * f * (3.0 - 2.0 * f);

        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));

        return mix(
          mix(a, b, f.x),
          mix(c, d, f.x),
          f.y
        );
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitudeValue = 0.5;

        for (int i = 0; i < 5; i++) {
          if (float(i) >= uDetail) break;

          value += amplitudeValue * noise(p);
          p *= 2.0;
          amplitudeValue *= 0.5;
        }

        return value;
      }

      float waveHeight(vec2 p) {
        float time = uTime * uSpeed;

        float largeWave =
          sin(
            p.x * uWaveScale * 2.0 +
            time +
            sin(p.y * 0.7 + time * 0.35) * uTurbulence * 0.01
          );

        float swellWave =
          sin(
            p.y * uWaveScale * 1.7 -
            time * 0.7 +
            largeWave * uSwell * 0.01
          );

        float detailWave =
          fbm(
            p * uWaveScale * 1.8 +
            vec2(time * 0.15, -time * 0.12)
          );

        return (
          largeWave * 0.55 +
          swellWave * 0.3 +
          detailWave * 0.45
        ) * uAmplitude;
      }

      void main() {
        vec2 uv = vUv;

        vec2 aspectUv = uv;

        float aspect = uResolution.x / max(uResolution.y, 1.0);

        aspectUv.x *= aspect;

        vec2 mouseOffset =
          (uMouse - 0.5) *
          uParallaxStrength *
          0.15;

        aspectUv += mouseOffset;

        aspectUv *= uZoom;

        float horizon =
          smoothstep(
            0.0,
            0.75,
            uv.y
          );

        float perspective =
          mix(
            1.0,
            0.45,
            horizon
          );

        vec2 waveUv =
          aspectUv *
          perspective;

        waveUv.y +=
          (1.0 - uv.y) *
          uTilt *
          0.15;

        float wave =
          waveHeight(
            waveUv * 2.0
          );

        float normalizedWave =
          wave / max(uAmplitude, 0.001);

        float crest =
          smoothstep(
            0.35,
            1.0,
            normalizedWave
          );

        float valley =
          smoothstep(
            -1.0,
            -0.1,
            normalizedWave
          );

        vec3 baseColor =
          mix(
            uHorizonColor,
            uWaveColor,
            horizon
          );

        baseColor =
          mix(
            baseColor,
            uCrestColor,
            crest * 0.85
          );

        baseColor =
          mix(
            baseColor,
            uHorizonColor,
            valley * 0.25
          );

        float depth =
          smoothstep(
            0.0,
            1.0,
            uv.y
          );

        float fog =
          exp(
            -depth * uFogDepth * 0.08
          );

        vec3 finalColor =
          mix(
            uHorizonColor,
            baseColor,
            fog
          );

        finalColor *= uBrightness;

        if (uGrain > 0.5) {
          float grainNoise =
            hash21(
              uv * uResolution +
              uTime
            );

          finalColor +=
            (grainNoise - 0.5) *
            uGrainIntensity;
        }

        float edgeFade =
          smoothstep(
            0.0,
            0.08,
            uv.x
          ) *
          smoothstep(
            0.0,
            0.08,
            1.0 - uv.x
          );

        finalColor *= edgeFade;

        gl_FragColor =
          vec4(
            finalColor,
            uOpacity
          );
      }
    `;

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms,
      transparent: true
    });

    const mesh = new Mesh(gl, {
      geometry,
      program
    });

    const resize = () => {
      const width = container.clientWidth;
      const heightValue = container.clientHeight;

      renderer.setSize(width, heightValue);

      uniforms.uResolution.value = [
        width * renderer.dpr,
        heightValue * renderer.dpr
      ];
    };

    const handleMouseMove = (event) => {
      if (!mouseInteraction) return;

      const rect = container.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) /
        Math.max(rect.width, 1);

      const y =
        1 -
        (event.clientY - rect.top) /
        Math.max(rect.height, 1);

      uniforms.uMouse.value[0] +=
        (x - uniforms.uMouse.value[0]) * 0.08;

      uniforms.uMouse.value[1] +=
        (y - uniforms.uMouse.value[1]) * 0.08;
    };

    const handleMouseLeave = () => {
      uniforms.uMouse.value[0] +=
        (0.5 - uniforms.uMouse.value[0]) * 0.04;

      uniforms.uMouse.value[1] +=
        (0.5 - uniforms.uMouse.value[1]) * 0.04;
    };

    const render = (time) => {
      uniforms.uTime.value = time * 0.001;

      renderer.render({
        scene: mesh
      });

      animationRef.current =
        requestAnimationFrame(render);
    };

    resize();

    window.addEventListener(
      'resize',
      resize
    );

    container.addEventListener(
      'mousemove',
      handleMouseMove
    );

    container.addEventListener(
      'mouseleave',
      handleMouseLeave
    );

    animationRef.current =
      requestAnimationFrame(render);

    return () => {
      window.removeEventListener(
        'resize',
        resize
      );

      container.removeEventListener(
        'mousemove',
        handleMouseMove
      );

      container.removeEventListener(
        'mouseleave',
        handleMouseLeave
      );

      if (animationRef.current) {
        cancelAnimationFrame(
          animationRef.current
        );
      }

      if (gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }

      rendererRef.current = null;
    };
  }, [
    horizonColor,
    waveColor,
    crestColor,
    speed,
    amplitude,
    waveScale,
    waveRatio,
    swell,
    turbulence,
    tilt,
    zoom,
    height,
    fogDepth,
    detail,
    brightness,
    opacity,
    mouseInteraction,
    parallaxStrength,
    grain,
    grainIntensity
  ]);

  return (
    <div
      ref={containerRef}
      className="gradient-waves"
      aria-hidden="true"
    />
  );
};

export default GradientWaves;
