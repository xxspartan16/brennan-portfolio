import type { Project } from './projects';

export default function ProjectArt({ id }: Pick<Project, 'id'>) {
  if (id === 'gaugeworks')
    return (
      <div className="project-art gauge-art" aria-hidden="true">
        <div className="art-top">
          <span>
            <i className="tiny-mark" /> GAUGEWORKS
          </span>
          <span>PROCESS MONITOR</span>
        </div>
        <div className="art-chart-title">
          A shift worth a closer look.<span>Baseline → monitoring</span>
        </div>
        <svg viewBox="0 0 580 180" preserveAspectRatio="xMidYMid meet">
          <rect x="24" y="21" width="250" height="133" fill="#e8eee4" />
          {[34, 83, 132].map((y) => (
            <path key={y} d={`M24 ${y} H556`} stroke="#b4c2b1" strokeDasharray="4 5" fill="none" />
          ))}
          <path
            d="M24 88 L44 95 L64 67 L84 89 L104 76 L124 92 L144 74 L164 98 L184 81 L204 66 L224 89 L244 73 L264 87 L284 71 L304 57 L324 62 L344 41 L364 48 L384 29 L404 33 L424 14 L444 27 L464 12 L484 21 L504 8 L524 18 L544 9"
            stroke="#285441"
            strokeWidth="2.5"
            strokeLinejoin="round"
            fill="none"
          />
          <line x1="274" y1="15" x2="274" y2="157" stroke="#95a58f" strokeDasharray="2 4" />
          <circle cx="424" cy="14" r="5" fill="#c56841" stroke="#fff" strokeWidth="2" />
          <circle cx="464" cy="12" r="5" fill="#c56841" stroke="#fff" strokeWidth="2" />
          <text x="24" y="176" fill="#758270" fontSize="11">
            REFERENCE WINDOW
          </text>
          <text x="300" y="176" fill="#758270" fontSize="11">
            NEW OBSERVATIONS
          </text>
        </svg>
        <div className="art-bottom">
          <span>
            <i className="signal-dot" /> Frozen baseline
          </span>
          <span>Individual observations / I–MR</span>
        </div>
      </div>
    );
  if (id === 'relaylab')
    return (
      <div className="project-art relay-art" aria-hidden="true">
        <div className="art-top">
          <span>↳ RELAYLAB</span>
          <span>DETERMINISTIC REPLAY</span>
        </div>
        <svg viewBox="0 0 580 180">
          <g fill="none" stroke="#4b5359" strokeWidth="1.5">
            <path d="M128 90 H173 V40 H218" />
            <path d="M173 90 V140 H218" />
            <path d="M350 40 H393 V90 H438" />
            <path d="M350 140 H393 V90" />
          </g>
          <g fill="#242d34" stroke="#536756">
            <rect x="18" y="66" width="110" height="48" rx="7" />
            <rect x="218" y="16" width="132" height="48" rx="7" />
            <rect x="438" y="66" width="124" height="48" rx="7" />
          </g>
          <rect x="218" y="116" width="132" height="48" rx="7" fill="#39342a" stroke="#c8a36b" />
          <g fill="#cbd7c4" fontFamily="monospace" fontSize="12" textAnchor="middle">
            <text x="73" y="94">
              validate
            </text>
            <text x="284" y="44">
              reserve_stock
            </text>
            <text x="500" y="94">
              dispatch
            </text>
          </g>
          <text
            x="284"
            y="145"
            fill="#edc581"
            fontFamily="monospace"
            fontSize="12"
            textAnchor="middle"
          >
            charge → retry
          </text>
          <circle cx="393" cy="90" r="4" fill="#c7d4c1" />
        </svg>
        <div className="trace-line">
          <span>t + 0400</span>
          <b>retry.scheduled</b>
          <span>backoff = 800 ms</span>
        </div>
        <div className="art-bottom">
          <span>
            <i className="signal-dot" /> Same seed. Same trace.
          </span>
          <span>Simulated execution</span>
        </div>
      </div>
    );
  return (
    <div className="project-art patch-art" aria-hidden="true">
      <div className="art-top">
        <span>◈ PATCHGLASS</span>
        <span>CHANGE INSPECTOR</span>
      </div>
      <div className="patch-preview">
        <div>
          <span className="code-label">BEFORE</span>
          <pre>{'{\n  "retries": 1,\n  "timeout": 500,\n  "mode": "manual"\n}'}</pre>
        </div>
        <div>
          <span className="code-label">AFTER</span>
          <pre>{'{\n  "retries": 3,\n  "timeout": 1200,\n  "mode": "auto"\n}'}</pre>
        </div>
      </div>
      <div className="patch-step">
        <span>REPLACE</span>
        <code>/retries</code>
        <span>1 → 3</span>
      </div>
      <div className="art-bottom">
        <span>Inspect → apply → reverse</span>
        <span>JSON Patch operations</span>
      </div>
    </div>
  );
}
