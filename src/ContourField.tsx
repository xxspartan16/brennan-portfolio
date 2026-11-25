import { useEffect, useRef } from 'react';

export default function ContourField() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const context = element.getContext('2d');
    if (!context) return;
    function draw() {
      if (!element || !context) return;
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio * width, 0, 0, ratio * height, 0, 0);
      // The two families of curves frame the introduction and taper into the paper.
      const rightInk = context.createLinearGradient(0.54, 0, 1.1, 0.24);
      rightInk.addColorStop(0, 'rgba(65,111,72,0)');
      rightInk.addColorStop(0.45, 'rgba(79,120,80,0.24)');
      rightInk.addColorStop(1, 'rgba(48,95,58,0.51)');
      context.strokeStyle = rightInk;
      context.lineWidth = (width < 700 ? 0.74 : 0.85) / Math.max(width, height);
      for (let i = 0; i < 58; i++) {
        const t = i / 57;
        context.beginPath();
        context.moveTo(0.59 + 0.39 * t, -0.115);
        context.bezierCurveTo(0.82 + 0.19 * t, 0.045, 0.70 + 0.26 * t, 0.21 + 0.02 * t, 0.84 + 0.21 * t, 0.25 + 0.13 * t);
        context.bezierCurveTo(1.06 + 0.08 * t, 0.31 + 0.4 * t, 0.96 - 0.17 * t, 0.47 + 0.34 * t, 1.13, 0.69 + 0.4 * t);
        context.stroke();
      }
      const leftInk = context.createLinearGradient(-0.1, 0.25, 0.37, 0.8);
      leftInk.addColorStop(0, 'rgba(81,116,82,0.38)');
      leftInk.addColorStop(0.55, 'rgba(98,132,92,0.21)');
      leftInk.addColorStop(1, 'rgba(113,136,99,0)');
      context.strokeStyle = leftInk;
      for (let i = 0; i < 48; i++) {
        const t = i / 47;
        context.beginPath();
        context.moveTo(-0.14, 0.20 + 0.48 * t);
        context.bezierCurveTo(0.01 + 0.045 * t, 0.34 + 0.43 * t, -0.09 + 0.22 * t, 0.91 - 0.24 * t, 0.07 + 0.23 * t, 0.86 + 0.06 * t);
        context.bezierCurveTo(0.17 + 0.17 * t, 0.91 + 0.10 * t, 0.20 + 0.21 * t, 0.79 + 0.2 * t, 0.44, 1.1);
        context.stroke();
      }
    }
    const observer = new ResizeObserver(draw);
    observer.observe(element);
    draw();
    return () => observer.disconnect();
  }, []);

  return <canvas className="contour-field" ref={canvas} aria-hidden="true" />;
}
