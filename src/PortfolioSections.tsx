import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Code2,
  X,
} from 'lucide-react';
import { projects } from './projects';
import type { Project } from './projects';
import './sections.css';

const assetRoot = import.meta.env.BASE_URL;
const github = 'https://github.com/xxspartan16';

const disciplines = [
  {
    id: 'quality',
    label: 'Quality control',
    detail:
      'Manufacturing and team leadership taught me to look at individual measurements when a process starts to drift.',
  },
  {
    id: 'automation',
    label: 'Workflow automation',
    detail:
      'I model dependencies and retries so I can trace exactly what happens when a step in a workflow fails.',
  },
  {
    id: 'software',
    label: 'Software development',
    detail:
      'I work with TypeScript, React, and Python. My projects pair a working demo with tests for the decisions behind it.',
  },
];

const categories = [
  { id: 'all', label: 'All projects' },
  { id: 'gaugeworks', label: 'Quality' },
  { id: 'relaylab', label: 'Automation' },
  { id: 'patchglass', label: 'Developer tools' },
];

const verification: Record<string, string> = {
  gaugeworks:
    'In a 26-part measurement run, the tool identified the one shaft outside specification. The exported report preserved the original rows and the baseline used to evaluate them.',
  relaylab:
    'In a dispatch simulation, a failed inspection blocked shipment. An independent archive task retried and completed. Both outcomes appeared in the exported trace.',
  patchglass:
    'Changing a stock threshold and adding a notification recipient produced two targeted edits. Applying the patch reproduced the target JSON. Rolling it back restored the source values.',
};

function DepthHeading({ title, id }: { title: string; id: string }) {
  const words = (title + '.').split(' ');
  let letterOffset = 0;
  return (
    <h2 className="pf-heading" id={id} data-enter aria-label={title + '.'}>
      {words.map((word, wordIndex) => {
        const start = letterOffset;
        letterOffset += word.length;
        return (
          <span className="pf-word" aria-hidden="true" key={word}>
            {Array.from(word).map((letter, i) => (
              <span
                key={i}
                className={letter === '.' ? 'pf-letter pf-dot' : 'pf-letter'}
                style={{ '--letter-index': start + i } as CSSProperties}
              >
                {letter}
              </span>
            ))}
            {wordIndex < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </h2>
  );
}

function inclineArtwork(event: PointerEvent<HTMLButtonElement>) {
  if (event.pointerType === 'touch') return;
  const cover = event.currentTarget;
  const rect = cover.getBoundingClientRect();
  cover.style.setProperty(
    '--cover-yaw',
    ((event.clientX - rect.left) / rect.width) * 9 - 4.5 + 'deg',
  );
  cover.style.setProperty(
    '--cover-pitch',
    4.5 - ((event.clientY - rect.top) / rect.height) * 9 + 'deg',
  );
}

function levelArtwork(event: PointerEvent<HTMLButtonElement>) {
  event.currentTarget.style.removeProperty('--cover-yaw');
  event.currentTarget.style.removeProperty('--cover-pitch');
}

function ProjectImage({ project }: { project: Project }) {
  return (
    <div className={'pf-art pf-art-' + project.id}>
      <img
        src={assetRoot + 'projects/' + project.id + '.webp'}
        width="600"
        height="360"
        loading="lazy"
        decoding="async"
        alt=""
      />
    </div>
  );
}

function CaseStudy({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (project && element && !element.open) element.showModal();
    if (!project && element?.open) element.close();
  }, [project]);
  return (
    <dialog
      className="pf-dialog"
      ref={dialog}
      onClose={onClose}
      aria-labelledby="portfolio-case-title"
      onClick={(event) => {
        if (event.target === dialog.current) event.currentTarget.close();
      }}
    >
      {project && (
        <div className="pf-case">
          <div className="pf-case-bar">
            <span>Project notes</span>
            <button
              type="button"
              className="pf-icon-button"
              aria-label="Close case study"
              onClick={() => dialog.current?.close()}
              autoFocus
            >
              <X size={19} />
            </button>
          </div>
          <ProjectImage project={project} />
          <div className="pf-case-copy">
            <p className="pf-label">{project.category}</p>
            <h2 id="portfolio-case-title">{project.title}</h2>
            <p className="pf-case-lead">{project.summary}</p>
            <dl className="pf-case-details">
              <div>
                <dt>The problem</dt>
                <dd>{project.problem}</dd>
              </div>
              <div>
                <dt>Engineering decisions</dt>
                <dd>
                  <ul>
                    {project.decisions.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt>What I verified</dt>
                <dd>{verification[project.id]}</dd>
              </div>
              <div>
                <dt>Current limits</dt>
                <dd>{project.limits}</dd>
              </div>
              <div>
                <dt>Next iteration</dt>
                <dd>{project.next}</dd>
              </div>
            </dl>
            <div className="pf-actions">
              <a
                className="pf-button pf-solid"
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open app <ArrowUpRight size={15} />
              </a>
              {project.sourceUrl && (
                <a
                  className="pf-button pf-outline"
                  href={project.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Code2 size={15} /> Source code
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

type SectionProps = { contactEmail?: string; motionEnabled?: boolean };

export default function PortfolioSections({
  contactEmail,
  motionEnabled = true,
}: SectionProps = {}) {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Project | null>(null);
  const sections = useRef<HTMLDivElement>(null);
  const timeline = useRef<HTMLDivElement>(null);
  const visible = projects.filter((project) => filter === 'all' || project.id === filter);

  useEffect(() => {
    const root = sections.current;
    if (!root || !motionEnabled || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.entered = '';
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.09 },
    );
    root
      .querySelectorAll('[data-enter]:not([data-entered])')
      .forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [motionEnabled, filter]);

  useEffect(() => {
    const track = timeline.current;
    if (!motionEnabled || !track || !('IntersectionObserver' in window)) return;
    let active = false;
    let frame = 0;
    const draw = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(1, (window.innerHeight * 0.73 - rect.top) / rect.height),
      );
      track.style.setProperty('--track-progress', String(progress));
    };
    const schedule = () => {
      if (active && !frame) frame = requestAnimationFrame(draw);
    };
    const observer = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      schedule();
    });
    observer.observe(track);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
      track.style.removeProperty('--track-progress');
    };
  }, [motionEnabled]);

  useEffect(() => {
    const host = timeline.current;
    if (!host || !motionEnabled || !('IntersectionObserver' in window)) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void import('./skillObjects')
          .then(({ mountSkillObjects }) => {
            if (!cancelled) dispose = mountSkillObjects(host);
          })
          .catch(() => {
            /* The original illustrations stay visible when WebGL is unavailable. */
          });
      },
      { rootMargin: '180px' },
    );
    observer.observe(host);
    return () => {
      cancelled = true;
      observer.disconnect();
      dispose?.();
    };
  }, [motionEnabled]);

  return (
    <div className="pf-sections" data-motion={motionEnabled ? 'on' : 'off'} ref={sections}>
      <section className="pf-work" id="work" aria-labelledby="pf-work-title">
        <div className="pf-bound">
          <div className="pf-work-top">
            <div>
              <p className="pf-label">Selected work</p>
              <DepthHeading title="Projects" id="pf-work-title" />
            </div>
            <div role="group" aria-label="Filter projects" className="pf-filters">
              {categories.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={filter === item.id}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="pf-project-grid" data-filter={filter} aria-live="polite">
            {visible.map((project, index) => (
              <article
                className="pf-project"
                key={project.id}
                data-enter
                style={{ '--project-order': index } as CSSProperties}
              >
                <button
                  type="button"
                  className="pf-project-cover"
                  onPointerMove={motionEnabled ? inclineArtwork : undefined}
                  onPointerLeave={levelArtwork}
                  onClick={() => setSelected(project)}
                  aria-label={'Read the ' + project.title + ' case study'}
                >
                  <ProjectImage project={project} />
                  <span className="pf-cover-arrow" aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                </button>
                <div className="pf-project-copy">
                  <p className="pf-label">{project.category}</p>
                  <h3>{project.title}</h3>
                  <p className="pf-summary">{project.summary}</p>
                  <ul className="pf-tags" aria-label="Technologies">
                    {project.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </div>
                <div className="pf-project-actions">
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={'Open ' + project.title + ' app'}
                  >
                    Open app <ArrowUpRight size={16} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelected(project)}
                    aria-label={project.title + ' engineering notes'}
                  >
                    Case study <ArrowRight size={15} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pf-about" id="about" aria-labelledby="pf-about-title">
        <div className="pf-bound pf-about-layout">
          <div className="pf-intro-copy">
            <p className="pf-label">Introduction</p>
            <DepthHeading title="Overview" id="pf-about-title" />
            <p className="pf-lead">
              I came to software through manufacturing, quality control, and team leadership. I
              build tools that help people see what changed, find the step that failed, and check
              the result for themselves.
            </p>
            <aside className="pf-training">
              <span className="pf-training-icon">
                <BookOpen size={20} strokeWidth={1.6} />
              </span>
              <div>
                <p className="pf-label">Current training</p>
                <strong>AI Automation</strong>
                <p>TripleTen · In progress</p>
              </div>
            </aside>
          </div>
          <div
            className="pf-timeline"
            id="approach"
            aria-label="Experience and skills"
            role="region"
            ref={timeline}
          >
            {disciplines.map((discipline) => (
              <article className="pf-milestone" key={discipline.id} data-enter>
                <div className="pf-milestone-copy">
                  <h3>{discipline.label}</h3>
                  <p>{discipline.detail}</p>
                </div>
                <div className="pf-object-slot" data-object={discipline.id} aria-hidden="true">
                  <img
                    src={assetRoot + 'skills/' + discipline.id + '.webp'}
                    alt=""
                    width="360"
                    height="270"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pf-contact" id="contact" aria-labelledby="pf-contact-title">
        <div className="pf-bound">
          <div className="pf-contact-surface">
            <div className="pf-contact-copy">
              <p className="pf-label">For hiring teams</p>
              <DepthHeading
                title={contactEmail ? 'Get in touch' : 'Career profile'}
                id="pf-contact-title"
              />
              <p>
                I’m looking for junior software development, automation, and quality assurance
                opportunities. You can share my one-page project profile with your team.
              </p>
              <div className="pf-actions">
                {contactEmail && (
                  <a className="pf-button pf-solid" href={'mailto:' + contactEmail}>
                    Email Brennan <ArrowUpRight size={16} />
                  </a>
                )}
                <a
                  className={'pf-button ' + (contactEmail ? 'pf-outline' : 'pf-solid')}
                  href={assetRoot + 'Brennan-LeBlanc-Project-Profile.pdf'}
                  download="Brennan-LeBlanc-Project-Profile.pdf"
                >
                  <ArrowDownToLine size={16} /> Project profile{' '}
                  <span className="pf-format">PDF</span>
                </a>
                <a className="pf-contact-github" href={github} target="_blank" rel="noreferrer">
                  GitHub <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
            <div className="pf-orbit" aria-hidden="true">
              <div className="pf-orbit-shell">
                <div className="pf-orbit-axis">
                  {[-74, -54, -34, -15, 4, 23, 43, 64, 82].map((degree) => (
                    <i
                      className="pf-meridian"
                      key={degree}
                      style={{ transform: 'rotateY(' + degree + 'deg)' }}
                    />
                  ))}
                  {[-66, -44, -22, 0, 22, 44, 66].map((degree) => {
                    const theta = (degree * Math.PI) / 180;
                    return (
                      <i
                        className="pf-parallel"
                        key={degree}
                        style={{
                          top: 50 - Math.sin(theta) * 50 + '%',
                          width: Math.cos(theta) * 100 + '%',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="pf-footer">
        <div className="pf-bound">
          <span>Brennan LeBlanc</span>
          <p>Personal projects developed with AI assistance.</p>
          <a href="#main">
            Back to top <ArrowUp size={14} />
          </a>
        </div>
      </footer>
      <CaseStudy project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
