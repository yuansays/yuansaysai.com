"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  color: string;
  accent: boolean;
};

type TrailPoint = {
  x: number;
  y: number;
  life: number;
};

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let reducedMotion = motionPreference.matches;
    let width = 0;
    let height = 0;
    let mobile = false;
    let targetFrameLength = 1000 / 60;
    let lastFrameTime = 0;
    let frame = 0;
    let canvasVisible = true;
    let particles: Particle[] = [];
    let links: Array<[number, number]> = [];
    let trail: TrailPoint[] = [];
    let lastTrailSample = 0;
    let palette = {
      colors: ["#ff2bd6", "#2ad9ff", "#f4f0e8"],
      primaryRgb: "255, 43, 214",
      secondaryRgb: "42, 217, 255",
    };

    const readThemePalette = () => {
      const styles = window.getComputedStyle(document.documentElement);
      const read = (name: string, fallback: string) =>
        styles.getPropertyValue(name).trim() || fallback;

      palette = {
        colors: [
          read("--particle-primary", "#ff2bd6"),
          read("--particle-secondary", "#2ad9ff"),
          read("--particle-neutral", "#f4f0e8"),
        ],
        primaryRgb: read("--acid-rgb", "255, 43, 214"),
        secondaryRgb: read("--mint-rgb", "42, 217, 255"),
      };

      particles.forEach((particle, index) => {
        particle.color = palette.colors[index % palette.colors.length];
      });
    };

    const pointer = {
      x: 0,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      active: false,
      burst: 0,
    };

    const createParticles = () => {
      const lowPowerDevice =
        typeof navigator.hardwareConcurrency === "number" &&
        navigator.hardwareConcurrency <= 4;
      const count = reducedMotion
        ? 32
        : mobile
          ? lowPowerDevice
            ? 40
            : 54
          : lowPowerDevice
            ? 64
            : 86;
      const centerX = width * (mobile ? 0.53 : 0.66);
      const centerY = height * (mobile ? 0.4 : 0.5);
      const spreadX = width * (mobile ? 0.44 : 0.36);
      const spreadY = height * (mobile ? 0.25 : 0.35);

      particles = Array.from({ length: count }, (_, index) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.sqrt(Math.random());
        const homeX = centerX + Math.cos(angle) * spreadX * distance;
        const homeY = centerY + Math.sin(angle) * spreadY * distance;

        return {
          x: homeX,
          y: homeY,
          homeX,
          homeY,
          vx: (Math.random() - 0.5) * 0.7,
          vy: (Math.random() - 0.5) * 0.7,
          radius: index % 13 === 0 ? 3.1 : 1.2 + Math.random(),
          phase: Math.random() * Math.PI * 2,
          color: palette.colors[index % palette.colors.length],
          accent: index % 13 === 0,
        };
      });

      const linkKeys = new Set<string>();
      const nextLinks: Array<[number, number]> = [];

      particles.forEach((particle, index) => {
        const nearest = particles
          .map((other, otherIndex) => ({
            otherIndex,
            distance:
              (other.homeX - particle.homeX) ** 2 +
              (other.homeY - particle.homeY) ** 2,
          }))
          .filter(({ otherIndex }) => otherIndex !== index)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, index % 3 === 0 ? 2 : 1);

        nearest.forEach(({ otherIndex, distance }) => {
          if (distance > 170 ** 2) return;
          const start = Math.min(index, otherIndex);
          const end = Math.max(index, otherIndex);
          const key = `${start}:${end}`;
          if (linkKeys.has(key)) return;
          linkKeys.add(key);
          nextLinks.push([start, end]);
        });
      });

      links = nextLinks;
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      mobile = width < 720;
      const lowPowerDevice =
        typeof navigator.hardwareConcurrency === "number" &&
        navigator.hardwareConcurrency <= 4;
      targetFrameLength =
        1000 / (reducedMotion ? 30 : mobile || lowPowerDevice ? 45 : 60);
      const dpr = Math.min(
        window.devicePixelRatio || 1,
        mobile ? 1.25 : 1.5,
      );

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      trail = [];
      createParticles();
    };

    const render = (time: number, deltaScale: number) => {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "source-over";

      trail.forEach((point) => {
        point.life *= Math.pow(0.82, deltaScale);
      });
      trail = trail.filter((point) => point.life > 0.035);
      if (!reducedMotion && trail.length > 1) {
        context.save();
        context.globalCompositeOperation = "lighter";
        context.lineCap = "round";
        context.lineJoin = "round";

        trail.forEach((point, index) => {
          if (index === 0) return;

          const previous = trail[index - 1];
          const progress = index / Math.max(trail.length - 1, 1);
          const alpha = point.life * (0.13 + progress * 0.35);

          context.beginPath();
          context.moveTo(previous.x, previous.y);
          context.lineTo(point.x, point.y);
          context.strokeStyle =
            index % 2 === 0
              ? `rgba(${palette.primaryRgb}, ${alpha})`
              : `rgba(${palette.secondaryRgb}, ${alpha})`;
          context.lineWidth = 0.7 + progress * 2.1;
          context.stroke();
        });

        context.restore();
      }

      particles.forEach((particle) => {
        const wanderScale = reducedMotion ? 0.35 : 1;
        const interactionScale = reducedMotion ? 0.78 : 1;
        particle.vx +=
          Math.cos(particle.phase + time * 0.00034) *
          0.0045 *
          wanderScale *
          deltaScale;
        particle.vy +=
          Math.sin(particle.phase * 1.7 + time * 0.00029) *
          0.0045 *
          wanderScale *
          deltaScale;

        if (pointer.active) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.max(Math.hypot(dx, dy), 14);
          const bursting = pointer.burst > 0.02;
          const influence = bursting
            ? mobile
              ? 280
              : 350
            : mobile
              ? 230
              : 300;

          if (distance < influence) {
            const falloff = 1 - distance / influence;
            const force = bursting
              ? -0.92 *
                pointer.burst *
                Math.pow(falloff, 1.25) *
                interactionScale
              : 0.16 * Math.pow(falloff, 1.45) * interactionScale;
            particle.vx += (dx / distance) * force * deltaScale;
            particle.vy += (dy / distance) * force * deltaScale;

            if (!bursting) {
              particle.vx +=
                pointer.velocityX * falloff * 0.018 * interactionScale;
              particle.vy +=
                pointer.velocityY * falloff * 0.018 * interactionScale;
            }
          }
        }

        const speed = Math.hypot(particle.vx, particle.vy);
        const maximumSpeed = reducedMotion ? 3.2 : 4.8;
        if (speed > maximumSpeed) {
          particle.vx = (particle.vx / speed) * maximumSpeed;
          particle.vy = (particle.vy / speed) * maximumSpeed;
        }

        const drag = reducedMotion ? 0.987 : 0.992;
        particle.vx *= Math.pow(drag, deltaScale);
        particle.vy *= Math.pow(drag, deltaScale);
        particle.x += particle.vx * deltaScale;
        particle.y += particle.vy * deltaScale;

        const edgePadding = 42;
        if (particle.x < edgePadding) {
          particle.vx +=
            (edgePadding - particle.x) * 0.0008 * deltaScale;
        } else if (particle.x > width - edgePadding) {
          particle.vx -=
            (particle.x - (width - edgePadding)) * 0.0008 * deltaScale;
        }
        if (particle.y < edgePadding) {
          particle.vy +=
            (edgePadding - particle.y) * 0.0008 * deltaScale;
        } else if (particle.y > height - edgePadding) {
          particle.vy -=
            (particle.y - (height - edgePadding)) * 0.0008 * deltaScale;
        }

        if (particle.x < -20) {
          particle.x = -20;
          particle.vx = Math.abs(particle.vx) * 0.8;
        } else if (particle.x > width + 20) {
          particle.x = width + 20;
          particle.vx = -Math.abs(particle.vx) * 0.8;
        }
        if (particle.y < -20) {
          particle.y = -20;
          particle.vy = Math.abs(particle.vy) * 0.8;
        } else if (particle.y > height + 20) {
          particle.y = height + 20;
          particle.vy = -Math.abs(particle.vy) * 0.8;
        }
      });

      links.forEach(([startIndex, endIndex]) => {
        const start = particles[startIndex];
        const end = particles[endIndex];
        const distance = Math.hypot(end.x - start.x, end.y - start.y);
        if (distance > 190) return;
        const alpha = 0.11 + 0.22 * (1 - distance / 190);

        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.strokeStyle =
          (startIndex + endIndex) % 4 === 0
            ? `rgba(${palette.secondaryRgb}, ${alpha * 0.9})`
            : `rgba(${palette.primaryRgb}, ${alpha})`;
        context.lineWidth = 1;
        context.stroke();
      });

      if (pointer.active) {
        const nearby = particles
          .map((particle, index) => ({
            index,
            distance:
              (particle.x - pointer.x) ** 2 +
              (particle.y - pointer.y) ** 2,
          }))
          .filter(({ distance }) => distance < 260 ** 2)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 9);

        nearby.forEach(({ index, distance }) => {
          const particle = particles[index];
          const normalizedDistance = Math.sqrt(distance) / 260;
          context.beginPath();
          context.moveTo(pointer.x, pointer.y);
          context.lineTo(particle.x, particle.y);
          context.strokeStyle = `rgba(${palette.secondaryRgb}, ${
            0.12 + 0.3 * (1 - normalizedDistance)
          })`;
          context.lineWidth = 1;
          context.stroke();
        });
      }

      particles.forEach((particle) => {
        if (particle.accent) {
          context.beginPath();
          context.arc(
            particle.x,
            particle.y,
            particle.radius + 4,
            0,
            Math.PI * 2,
          );
          context.fillStyle = `rgba(${palette.primaryRgb}, 0.09)`;
          context.fill();
        }

        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2,
        );
        context.fillStyle = particle.color;
        context.globalAlpha = particle.accent ? 0.96 : 0.76;
        context.fill();
        context.globalAlpha = 1;
      });

    };

    const draw = (time: number) => {
      if (document.hidden || !canvasVisible) {
        frame = 0;
        return;
      }

      const elapsed = time - lastFrameTime;
      if (elapsed < targetFrameLength) {
        frame = requestAnimationFrame(draw);
        return;
      }

      const deltaScale = Math.min(elapsed / (1000 / 60), 2);
      lastFrameTime = time;
      render(time, deltaScale);

      pointer.velocityX *= Math.pow(0.68, deltaScale);
      pointer.velocityY *= Math.pow(0.68, deltaScale);
      pointer.burst *= Math.pow(0.9, deltaScale);
      frame = requestAnimationFrame(draw);
    };

    const startAnimation = () => {
      if (frame || document.hidden || !canvasVisible) return;
      lastFrameTime = performance.now();
      frame = requestAnimationFrame(draw);
    };

    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const nextX = event.clientX - bounds.left;
      const nextY = event.clientY - bounds.top;
      const wasActive = pointer.active;
      const inside =
        nextX >= 0 &&
        nextX <= bounds.width &&
        nextY >= 0 &&
        nextY <= bounds.height;

      if (inside) {
        if (wasActive) {
          pointer.velocityX = Math.max(
            -32,
            Math.min(32, nextX - pointer.x),
          );
          pointer.velocityY = Math.max(
            -32,
            Math.min(32, nextY - pointer.y),
          );
        }

        if (!reducedMotion && event.pointerType !== "touch") {
          const now = performance.now();
          const movement = wasActive
            ? Math.hypot(nextX - pointer.x, nextY - pointer.y)
            : Number.POSITIVE_INFINITY;

          if (!wasActive) trail = [];
          if (!wasActive || movement >= 3 || now - lastTrailSample >= 24) {
            trail.push({ x: nextX, y: nextY, life: 1 });
            if (trail.length > 14) {
              trail.splice(0, trail.length - 14);
            }
            lastTrailSample = now;
          }
        }

        pointer.x = nextX;
        pointer.y = nextY;
      }
      pointer.active = inside;
    };

    const pressPointer = (event: PointerEvent) => {
      updatePointer(event);
      if (pointer.active) pointer.burst = 1;
    };

    const updateMotion = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      trail = [];
      cancelAnimationFrame(frame);
      frame = 0;
      resize();
      render(0, 0);
      startAnimation();
    };

    const updateVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else {
        startAnimation();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        canvasVisible = entry.isIntersecting;
        if (!canvasVisible) {
          cancelAnimationFrame(frame);
          frame = 0;
        } else {
          startAnimation();
        }
      },
      { threshold: 0.02 },
    );

    readThemePalette();
    const themeObserver = new MutationObserver(readThemePalette);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    resize();
    render(0, 0);
    startAnimation();
    observer.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerdown", pressPointer, { passive: true });
    document.addEventListener("visibilitychange", updateVisibility);
    motionPreference.addEventListener("change", updateMotion);

    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", pressPointer);
      document.removeEventListener("visibilitychange", updateVisibility);
      motionPreference.removeEventListener("change", updateMotion);
    };
  }, []);

  return (
    <canvas
      className="particle-field"
      ref={canvasRef}
      data-pointer-trail="short"
      aria-hidden="true"
    />
  );
}
