import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Rotate3d } from 'lucide-react';
import type { CameraPose, WorkroomRenderer } from './scene/workroom';
import './scene/workroom.css';

const studioUrl = `${import.meta.env.BASE_URL}studio/`;
const posters = [
  'workroom-left',
  'workroom-left-mid',
  'workroom-poster',
  'workroom-right-mid',
  'workroom-right',
] as const;
const home: CameraPose = { yaw: 0, tilt: 0, hoverX: 0, hoverY: 0 };
const yawLimit = 0.6;
const clamp = (n: number, limit: number) => Math.max(-limit, Math.min(limit, n));

type WorkstationProps = { motionEnabled?: boolean };

export default function Workstation({ motionEnabled = true }: WorkstationProps) {
  const [mode, setMode] = useState<'loading' | 'webgl' | 'poster'>('loading');
  const [yaw, setYaw] = useState(0);
  const [posterVisible, setPosterVisible] = useState(!document.hidden);
  const [dragging, setDragging] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const engine = useRef<WorkroomRenderer | null>(null);
  const motion = useRef(motionEnabled);
  const pose = useRef<CameraPose>({ ...home });
  const drag = useRef<{ x: number; y: number; yaw: number; tilt: number; id: number } | null>(null);
  const posterIndex = Math.round((yaw / yawLimit) * 2) + 2;
  const step = yawLimit / (mode === 'poster' ? 2 : 3);
  const poster =
    mode === 'poster' && posterVisible && motionEnabled && !dragging && Math.abs(yaw) < 0.02
      ? 'workroom-motion'
      : posters[posterIndex];

  useEffect(() => {
    motion.current = motionEnabled;
    engine.current?.setMotion(motionEnabled);
  }, [motionEnabled]);

  useEffect(() => {
    const viewport = host.current;
    if (!viewport) return;
    let cancelled = false;
    function usePoster() {
      if (cancelled) return;
      engine.current?.dispose();
      engine.current = null;
      setMode('poster');
    }
    import('./scene/workroom')
      .then(({ createWorkroom }) => {
        if (cancelled) return;
        engine.current = createWorkroom(
          viewport,
          `${studioUrl}workroom.glb`,
          motion.current,
          pose.current,
          () => {
            if (!cancelled) setMode('webgl');
          },
          usePoster,
        );
        if (!engine.current) usePoster();
      })
      .catch(usePoster);
    return () => {
      cancelled = true;
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    if (mode !== 'poster' || !host.current) return;
    let onScreen = true;
    const refresh = () => setPosterVisible(onScreen && !document.hidden);
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      refresh();
    });
    visibility.observe(host.current);
    document.addEventListener('visibilitychange', refresh);
    refresh();
    return () => {
      visibility.disconnect();
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [mode]);

  function updatePose(changes: Partial<CameraPose>) {
    pose.current = { ...pose.current, ...changes };
    engine.current?.setPose(pose.current);
    if (changes.yaw !== undefined) setYaw(changes.yaw);
  }
  function orbit(amount: number) {
    updatePose({ yaw: clamp(pose.current.yaw + amount, yawLimit), hoverX: 0, hoverY: 0 });
  }
  function endDrag() {
    drag.current = null;
    setDragging(false);
    updatePose({ hoverX: 0, hoverY: 0 });
  }

  return (
    <div
      className="live-workstation"
      data-renderer={mode}
      data-motion={motionEnabled ? 'on' : 'off'}
    >
      <div
        className="live-scene-viewport"
        data-dragging={dragging}
        tabIndex={0}
        role="group"
        aria-label="Interactive 3D developer studio. Drag or use the arrow keys to rotate. Press Home to center."
        onKeyDown={(event) => {
          switch (event.key) {
            case 'ArrowLeft':
              orbit(-step);
              break;
            case 'ArrowRight':
              orbit(step);
              break;
            case 'ArrowUp':
              updatePose({ tilt: clamp(pose.current.tilt + 0.06, 0.18) });
              break;
            case 'ArrowDown':
              updatePose({ tilt: clamp(pose.current.tilt - 0.06, 0.18) });
              break;
            case 'Home':
              updatePose(home);
              break;
            default:
              return;
          }
          event.preventDefault();
        }}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.button !== 0) return;
          drag.current = {
            id: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            yaw: pose.current.yaw,
            tilt: pose.current.tilt,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }}
        onPointerMove={(event) => {
          if (!event.isPrimary) return;
          const box = event.currentTarget.getBoundingClientRect();
          const gesture = drag.current;
          if (gesture) {
            if (gesture.id !== event.pointerId) return;
            updatePose({
              yaw: clamp(gesture.yaw - ((event.clientX - gesture.x) / box.width) * 1.9, yawLimit),
              tilt: clamp(gesture.tilt + ((event.clientY - gesture.y) / box.height) * 0.52, 0.18),
              hoverX: 0,
              hoverY: 0,
            });
          } else if (motion.current && event.pointerType === 'mouse') {
            updatePose({
              hoverX: ((event.clientX - box.left) / box.width) * 2 - 1,
              hoverY: 1 - ((event.clientY - box.top) / box.height) * 2,
            });
          }
        }}
        onPointerLeave={() => {
          if (!drag.current) updatePose({ hoverX: 0, hoverY: 0 });
        }}
        onLostPointerCapture={endDrag}
      >
        <div className="live-scene-canvas" ref={host} aria-hidden="true" />
        {mode !== 'webgl' && (
          <div className="live-scene-poster" aria-hidden="true">
            <img
              src={`${studioUrl}${poster}.webp`}
              width="900"
              height="750"
              alt=""
              draggable="false"
              fetchPriority="high"
            />
          </div>
        )}
      </div>
      <div className="live-scene-controls" role="group" aria-label="Studio view controls">
        <Rotate3d size={15} aria-hidden="true" />
        <span>Orbit studio</span>
        <button
          type="button"
          aria-label="Rotate studio left"
          disabled={yaw <= -yawLimit}
          onClick={() => orbit(-step)}
        >
          <ArrowLeft size={14} />
        </button>
        <button
          type="button"
          aria-label="Rotate studio right"
          disabled={yaw >= yawLimit}
          onClick={() => orbit(step)}
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
