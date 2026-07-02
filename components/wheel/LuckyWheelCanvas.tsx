"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Registrant } from "@/types/registration";
import { WHEEL_COLORS } from "@/lib/constants";

interface LuckyWheelCanvasProps {
  participants: Registrant[];
  spinKey: number;
  targetUuid: string | null;
  onSpinComplete: (winner: Registrant) => void;
}

const FULL_CIRCLE = Math.PI * 2;
const POINTER_ANGLE = -Math.PI / 2;

export function LuckyWheelCanvas({
  onSpinComplete,
  participants,
  spinKey,
  targetUuid,
}: LuckyWheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const [size, setSize] = useState(420);

  const draw = useCallback(
    (rotation: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(size * pixelRatio);
      canvas.height = Math.floor(size * pixelRatio);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawWheel(context, size, participants, rotation);
    },
    [participants, size],
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 420;
      setSize(Math.max(280, Math.min(560, width)));
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    draw(rotationRef.current);
  }, [draw]);

  useEffect(() => {
    if (!targetUuid || spinKey === 0 || participants.length === 0) {
      return undefined;
    }

    const targetIndex = participants.findIndex((participant) => participant.uuid === targetUuid);
    if (targetIndex < 0) {
      return undefined;
    }

    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current);
    }

    const winner = participants[targetIndex];
    const segmentAngle = FULL_CIRCLE / participants.length;
    const targetRotation = normalizeAngle(POINTER_ANGLE - (targetIndex + 0.5) * segmentAngle);
    const startRotation = rotationRef.current;
    const currentRotation = normalizeAngle(startRotation);
    const forwardDelta = normalizeAngle(targetRotation - currentRotation);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const spinTurns = prefersReducedMotion ? 1 : 6;
    const finalRotation = startRotation + FULL_CIRCLE * spinTurns + forwardDelta;
    const durationMs = prefersReducedMotion ? 800 : 4600;
    const startedAt = performance.now();

    const frame = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const easedProgress = easeOutCubic(progress);
      const nextRotation = startRotation + (finalRotation - startRotation) * easedProgress;

      rotationRef.current = nextRotation;
      draw(nextRotation);

      if (progress < 1) {
        animationRef.current = window.requestAnimationFrame(frame);
        return;
      }

      rotationRef.current = normalizeAngle(finalRotation);
      draw(rotationRef.current);
      onSpinComplete(winner);
    };

    animationRef.current = window.requestAnimationFrame(frame);

    return () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw, onSpinComplete, participants, spinKey, targetUuid]);

  return (
    <div className="grid place-items-center" ref={containerRef}>
      <div className="relative aspect-square w-full max-w-[35rem]">
        <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-[var(--accent)] drop-shadow" />
        <canvas
          aria-label="Lucky wheel"
          className="h-full w-full rounded-full"
          ref={canvasRef}
          role="img"
        />
      </div>
    </div>
  );
}

function drawWheel(
  context: CanvasRenderingContext2D,
  size: number,
  participants: Registrant[],
  rotation: number,
) {
  const center = size / 2;
  const radius = center - 12;

  context.clearRect(0, 0, size, size);
  context.save();
  context.translate(center, center);

  if (participants.length === 0) {
    context.beginPath();
    context.arc(0, 0, radius, 0, FULL_CIRCLE);
    context.fillStyle = "rgba(127, 127, 127, 0.12)";
    context.fill();
    context.strokeStyle = "rgba(127, 127, 127, 0.28)";
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = getCanvasTextColor();
    context.font = "700 18px system-ui";
    context.textAlign = "center";
    context.fillText("ไม่มีรายชื่อ", 0, 6);
    context.restore();
    return;
  }

  const segmentAngle = FULL_CIRCLE / participants.length;
  const fontSize = participants.length > 28 ? 9 : participants.length > 16 ? 11 : 13;

  participants.forEach((participant, index) => {
    const startAngle = rotation + index * segmentAngle;
    const endAngle = startAngle + segmentAngle;
    const middleAngle = startAngle + segmentAngle / 2;

    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, radius, startAngle, endAngle);
    context.closePath();
    context.fillStyle = WHEEL_COLORS[index % WHEEL_COLORS.length] ?? "#0f766e";
    context.fill();
    context.strokeStyle = "rgba(255, 255, 255, 0.72)";
    context.lineWidth = 1.5;
    context.stroke();

    context.save();
    context.rotate(middleAngle);
    context.textAlign = "right";
    context.textBaseline = "middle";
    context.fillStyle = "#ffffff";
    context.font = `800 ${fontSize}px system-ui`;
    context.fillText(
      truncateName(`${participant.firstName} ${participant.lastName}`),
      radius - 18,
      0,
    );
    context.restore();
  });

  context.beginPath();
  context.arc(0, 0, Math.max(34, radius * 0.14), 0, FULL_CIRCLE);
  context.fillStyle = getCenterColor();
  context.fill();
  context.strokeStyle = "rgba(255, 255, 255, 0.82)";
  context.lineWidth = 3;
  context.stroke();
  context.fillStyle = "#ffffff";
  context.font = "900 15px system-ui";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("SPIN", 0, 1);
  context.restore();
}

function truncateName(value: string): string {
  return value.length > 24 ? `${value.slice(0, 22)}...` : value;
}

function normalizeAngle(angle: number): number {
  return ((angle % FULL_CIRCLE) + FULL_CIRCLE) % FULL_CIRCLE;
}

function easeOutCubic(value: number): number {
  return 1 - (1 - value) ** 3;
}

function getCanvasTextColor(): string {
  return document.documentElement.classList.contains("dark") ? "#eef8f1" : "#18231f";
}

function getCenterColor(): string {
  return document.documentElement.classList.contains("dark") ? "#17211d" : "#18231f";
}
