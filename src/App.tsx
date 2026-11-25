import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react';
import PortfolioSections from './PortfolioSections';
import ContourField from './ContourField';
import MotionHeadline from './MotionHeadline';
import Workstation from './Workstation';

const links = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];
const motionQuery = '(prefers-reduced-motion: reduce)';

export default function App() {
  const [section, setSection] = useState('');
  const [motionEnabled, setMotionEnabled] = useState(() => !window.matchMedia(motionQuery).matches);

  useEffect(() => {
    const media = window.matchMedia(motionQuery);
    const reflectPreference = () => setMotionEnabled(!media.matches);
    media.addEventListener('change', reflectPreference);
    return () => media.removeEventListener('change', reflectPreference);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.motion = motionEnabled ? 'playing' : 'paused';
    return () => {
      delete document.documentElement.dataset.motion;
    };
  }, [motionEnabled]);
  useEffect(() => {
    function update() {
      const line = Math.min(window.innerHeight * 0.36, 240);
      const passed = links.filter(({ id }) => {
        const node = document.getElementById(id);
        return node && node.getBoundingClientRect().top <= line;
      });
      const atEnd =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3;
      setSection(atEnd ? 'contact' : (passed.at(-1)?.id ?? ''));
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="portfolio-mast">
        <div className="mast-inner">
          <a className="mast-identity" href="#main" aria-label="Brennan LeBlanc home">
            <span className="signature" aria-hidden="true">
              bl<span>.</span>
            </span>
            <span>Brennan LeBlanc</span>
          </a>
          <div className="mast-tools">
            <nav className="mast-nav" aria-label="Main navigation">
              {links.map(({ id, label }) => (
                <a key={id} href={`#${id}`} aria-current={section === id ? 'location' : undefined}>
                  {label}
                </a>
              ))}
            </nav>
            <button
              className="motion-switch"
              type="button"
              onClick={() => setMotionEnabled(!motionEnabled)}
              aria-label={motionEnabled ? 'Pause motion' : 'Play motion'}
              title={motionEnabled ? 'Pause motion' : 'Play motion'}
            >
              {motionEnabled ? (
                <Pause size={14} fill="currentColor" />
              ) : (
                <Play size={14} fill="currentColor" />
              )}
            </button>
          </div>
        </div>
      </header>
      <main id="main">
        <section className="intro-scene" aria-labelledby="intro-heading">
          <ContourField />
          <div className="intro-inner">
            <div className="intro-type">
              <p className="intro-greeting">
                <span aria-hidden="true" />
                Hi, I’m Brennan LeBlanc.
              </p>
              <MotionHeadline motionEnabled={motionEnabled} />
              <p className="intro-summary">
                I bring a manufacturing and quality-control background to building software that
                catches errors and makes everyday work easier.
              </p>
              <div className="intro-actions">
                <a className="intro-work" href="#work">
                  Explore my work <ArrowDownRight size={16} aria-hidden="true" />
                </a>
                <a
                  className="intro-profile"
                  href={`${import.meta.env.BASE_URL}Brennan-LeBlanc-Project-Profile.pdf`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Project profile <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="intro-room">
              <Workstation motionEnabled={motionEnabled} />
            </div>
            <a className="scene-scroll" href="#work" aria-label="Scroll to selected work">
              <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
        </section>
        <PortfolioSections motionEnabled={motionEnabled} />
      </main>
    </>
  );
}
