import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Keep the reading cadence tied to real time, including on devices with slow 3D frames.
gsap.ticker.lagSmoothing(0);

const words = ['quality.', 'automation.', 'reliability.'];

export default function MotionHeadline({ motionEnabled }: { motionEnabled: boolean }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const enabled = useRef(motionEnabled);
  const syncMotion = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    if (!heading.current) return;
    const root = heading.current;
    const rows = Array.from(root.querySelectorAll<HTMLElement>('.headline-word'));
    const letters = rows.map((row) =>
      Array.from(row.querySelectorAll<HTMLElement>('.headline-letter')),
    );
    const beat = 2.85;
    let stage: gsap.core.Timeline;
    let inView = true;
    const ctx = gsap.context(() => {
      stage = gsap.timeline({ repeat: -1, paused: true });
      rows.forEach((row, i) => {
        gsap.set(row, { visibility: i === 0 ? 'visible' : 'hidden' });
        const next = (i + 1) % words.length;
        const turn = beat * (i + 1) - 1.08;
        stage
          .set(rows[next], { visibility: 'visible' }, turn + 0.09)
          .fromTo(
            letters[next],
            { yPercent: 95, rotationX: -84, z: -18, opacity: 0 },
            {
              yPercent: 0,
              rotationX: 0,
              z: 0,
              opacity: 1,
              duration: 0.68,
              stagger: 0.023,
              ease: 'power3.out',
              immediateRender: false,
            },
            turn + 0.09,
          )
          .to(
            letters[i],
            {
              yPercent: -92,
              rotationX: 78,
              z: -22,
              opacity: 0,
              duration: 0.47,
              stagger: 0.014,
              ease: 'power2.in',
            },
            turn,
          )
          .set(row, { visibility: 'hidden' }, turn + 0.64);
      });
      stage.to({}, { duration: 0.01 }, beat * words.length);
    }, root);
    function updatePlayback() {
      stage.paused(!enabled.current || !inView || document.hidden);
    }
    syncMotion.current = () => {
      if (!enabled.current) {
        // A pause in the middle of a turn should still leave a whole, readable word.
        const nearestWord = Math.floor((stage.time() + 0.78) / beat) % words.length;
        stage.time(nearestWord * beat);
      }
      updatePlayback();
    };
    updatePlayback();
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updatePlayback();
    });
    observer.observe(root);
    document.addEventListener('visibilitychange', updatePlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updatePlayback);
      syncMotion.current = null;
      ctx.revert();
    };
  }, []);

  useLayoutEffect(() => {
    enabled.current = motionEnabled;
    syncMotion.current?.();
  }, [motionEnabled]);

  return (
    <h1
      id="intro-heading"
      ref={heading}
      aria-label="Software for quality, automation, and reliability."
    >
      <span className="headline-prefix" aria-hidden="true">
        Software for
      </span>
      <span className="headline-slot" aria-hidden="true">
        <span className="headline-float">
          {words.map((word) => (
            <span className="headline-word" key={word} data-word={word}>
              {Array.from(word).map((letter, i) => (
                <span key={i} className="headline-letter">
                  {letter}
                </span>
              ))}
            </span>
          ))}
        </span>
      </span>
    </h1>
  );
}
