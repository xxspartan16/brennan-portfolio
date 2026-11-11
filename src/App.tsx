import { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  Code2,
  X,
  Check,
  Braces,
  GitBranch,
  Ruler,
  ExternalLink,
} from 'lucide-react';
import ProjectArt from './ProjectArt';
import { projects } from './projects';
import type { Project } from './projects';

function CaseStudy({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (project && element && !element.open) element.showModal();
    if (!project && element?.open) element.close();
  }, [project]);
  return (
    <dialog
      ref={dialog}
      className="case-dialog"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
      aria-labelledby="case-title"
    >
      {project && (
        <div className="case-content">
          <button className="close-button" onClick={onClose} aria-label="Close case study">
            <X size={21} />
          </button>
          <p className="eyebrow">PROJECT {project.number} / ENGINEERING NOTES</p>
          <h2 id="case-title">{project.title}</h2>
          <p className="case-intro">{project.summary}</p>
          <ProjectArt id={project.id} />
          <h3>The problem</h3>
          <p>{project.problem}</p>
          <h3>Decisions in the code</h3>
          <ul className="decision-list">
            {project.decisions.map((decision) => (
              <li key={decision}>
                <Check size={17} />
                <span>{decision}</span>
              </li>
            ))}
          </ul>
          <h3>The boundaries</h3>
          <p>{project.limits}</p>
          <div className="next-note">
            <span>WHAT COMES NEXT</span>
            <p>{project.next}</p>
          </div>
          <div className="case-actions">
            <a href={project.demoUrl} className="button primary" target="_blank" rel="noreferrer">
              Open the working demo <ExternalLink size={16} />
            </a>
            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                className="button secondary"
                target="_blank"
                rel="noreferrer"
              >
                <Code2 size={17} /> Source code
              </a>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

export default function App() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [filter, setFilter] = useState('All projects');
  const visibleProjects = projects.filter(
    (project) => filter === 'All projects' || project.id === filter,
  );
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a href="#" className="identity" aria-label="Brennan LeBlanc home">
          <span className="identity-mark">
            bl<span>.</span>
          </span>
          <span>
            Brennan LeBlanc<small>SOFTWARE PROJECTS</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#work">Selected work</a>
          <a href="#approach">Approach</a>
          <a
            href="https://github.com/xxspartan16"
            target="_blank"
            rel="noreferrer"
            className="github-nav"
          >
            <Code2 size={16} /> GitHub <ArrowUpRight size={14} />
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="small-line" /> QUALITY MINDSET. SOFTWARE TOOLS.
            </p>
            <h1 id="hero-title">
              Make the messy
              <br />
              parts <em>clearer.</em>
            </h1>
            <p className="hero-description">
              Practical tools for finding process drift, understanding failures, and changing
              configurations with confidence.
            </p>
            <a className="button primary" href="#work">
              Explore the projects <ArrowDown size={17} />
            </a>
            <p className="hero-caption">Three working tools. The details are in the code.</p>
          </div>
          <div className="hero-object" aria-hidden="true">
            <div className="object-grid" />
            <span className="object-label">A FEW THINGS WORTH UNDERSTANDING</span>
            <div className="instrument-card instrument-quality">
              <div className="instrument-top">
                <Ruler size={17} />
                <span>01 / QUALITY</span>
                <i />
              </div>
              <div className="mini-spark">
                <svg viewBox="0 0 260 70">
                  <path d="M0 42H260 M0 15H260 M0 65H260" stroke="#d8dfd1" strokeDasharray="3 5" />
                  <path
                    d="M0 42L17 39L33 49L50 31L67 45L83 34L100 43L117 39L133 42L150 28L167 34L183 17L200 24L217 9L233 15L260 5"
                    fill="none"
                    stroke="#355a41"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
              <strong>Notice the shift.</strong>
            </div>
            <div className="instrument-card instrument-reliability">
              <div className="instrument-top">
                <GitBranch size={17} />
                <span>02 / RELIABILITY</span>
                <i />
              </div>
              <div className="mini-flow">
                <span>request</span>
                <ArrowRight size={19} />
                <span className="retry">retry</span>
                <ArrowRight size={19} />
                <span>recover</span>
              </div>
              <strong>Understand the failure.</strong>
            </div>
            <div className="instrument-card instrument-change">
              <div className="instrument-top">
                <Braces size={17} />
                <span>03 / CHANGE</span>
                <i />
              </div>
              <code>
                <span>−</span> "retries": 1<br />
                <b>+</b> "retries": 3
              </code>
              <strong>Know what changed.</strong>
            </div>
            <span className="object-footnote">INSPECTABLE BY DESIGN ↗</span>
          </div>
        </section>
        <div className="intro-strip">
          <span>Built around real engineering questions.</span>
          <div>
            <span>Typed domain logic</span>
            <i />
            <span>Meaningful tests</span>
            <i />
            <span>Explicit tradeoffs</span>
          </div>
        </div>
        <section id="work" className="work-section" aria-labelledby="work-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 — SELECTED WORK</p>
              <h2 id="work-title">
                Small tools.
                <br />
                <em>Substantial problems.</em>
              </h2>
            </div>
            <p>
              Each project has a working interface and a separate, testable engine. Start with a
              demo, then look under the hood.
            </p>
          </div>
          <div className="project-filters" role="group" aria-label="Filter projects">
            {[
              ['All projects', 'All projects'],
              ['gaugeworks', 'Process quality'],
              ['relaylab', 'Reliability'],
              ['patchglass', 'Developer tools'],
            ].map(([value, label]) => (
              <button
                key={value}
                className={filter === value ? 'active' : ''}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {label}
                {value === 'All projects' && <span>03</span>}
              </button>
            ))}
          </div>
          <div className="projects" aria-live="polite">
            {visibleProjects.map((project) => (
              <article className={`project-row ${project.id}`} key={project.id}>
                <div className="project-copy">
                  <p className="project-index">
                    <span>{project.number}</span>
                    {project.category}
                  </p>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <div className="tags">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="project-actions">
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-link"
                    >
                      Try the demo <ArrowUpRight size={18} />
                    </a>
                    <button className="text-link muted-link" onClick={() => setSelected(project)}>
                      Engineering notes <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
                <button
                  className="art-button"
                  onClick={() => setSelected(project)}
                  aria-label={`Read the ${project.title} case study`}
                >
                  <ProjectArt id={project.id} />
                </button>
              </article>
            ))}
          </div>
        </section>
        <section id="approach" className="approach-section" aria-labelledby="approach-title">
          <div className="approach-intro">
            <p className="eyebrow">02 — A LITTLE CONTEXT</p>
            <h2 id="approach-title">
              Quality control
              <br />
              is a useful lens
              <br />
              for <em>software.</em>
            </h2>
            <p>
              My background is in manufacturing, quality control, and team leadership. I’m bringing
              that experience into software through practical projects and my studies in AI
              automation.
            </p>
            <p>
              I’m interested in the same questions on both sides: what changed, where can this fail,
              and how do we know the result is right?
            </p>
            <div className="signature">
              Brennan LeBlanc<span>LEARNING BY BUILDING</span>
            </div>
          </div>
          <div className="principles">
            <article>
              <span>01</span>
              <div>
                <h3>Start with a real problem.</h3>
                <p>
                  A useful tool has a reason to exist beyond demonstrating a framework. These
                  projects start with quality, automation, and configuration problems.
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Make the reasoning inspectable.</h3>
                <p>
                  Show the measurement behind a signal, the event behind a retry, or the exact
                  operation behind a change.
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Test the awkward cases.</h3>
                <p>
                  Constant measurements. Circular dependencies. A JSON key with a slash. The edge
                  cases tell you whether an idea holds up.
                </p>
              </div>
            </article>
            <article>
              <span>04</span>
              <div>
                <h3>Be clear about the limits.</h3>
                <p>
                  The demos use synthetic data and run locally in your browser. The documentation
                  names assumptions and leaves room for the next iteration.
                </p>
              </div>
            </article>
          </div>
        </section>
        <section className="closing">
          <div>
            <p className="eyebrow">THE WORK IS OPEN TO INSPECTION</p>
            <h2>Take a look inside.</h2>
            <p>
              Try a different input. Trigger a failure. Follow a result back to its implementation.
            </p>
          </div>
          <a href="#work" className="button primary">
            Back to the projects <ArrowUpRight size={18} />
          </a>
        </section>
      </main>
      <footer>
        <span>© {new Date().getFullYear()} Brennan LeBlanc</span>
        <span>Personal projects · Built with AI assistance · Documented tradeoffs</span>
        <a href="https://github.com/xxspartan16" target="_blank" rel="noreferrer">
          GitHub <ArrowUpRight size={13} />
        </a>
      </footer>
      <CaseStudy project={selected} onClose={() => setSelected(null)} />
    </>
  );
}
