export type Project = {
  id: string;
  number: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  problem: string;
  decisions: string[];
  limits: string;
  demoUrl: string;
  sourceUrl: string | null;
  next: string;
};

// Bundled demo builds keep each case study runnable from the portfolio itself.
export const projects: Project[] = [
  {
    id: 'gaugeworks',
    number: '01',
    title: 'Gaugeworks',
    category: 'Process quality / Data analysis',
    summary:
      'A clearer picture of process drift. Turn a batch of measurements into an inspectable control chart.',
    tags: ['TypeScript', 'React', 'Statistical analysis'],
    problem:
      'An average can look acceptable while a production process quietly shifts. Gaugeworks separates a reference baseline from new observations so the shift cannot simply move its own goalposts.',
    decisions: [
      'Separate CSV parsing, statistics, and presentation so the calculations can be tested without a browser.',
      'Estimate variation from adjacent moving ranges, and keep specification limits separate from control limits.',
      'Surface the exact observations behind each signal. A warning should be something you can inspect.',
    ],
    limits:
      'An exploratory tool using synthetic examples. Statistical signals warrant investigation; they do not establish a cause or certify a production process.',
    next: 'Measurement-system studies and saved, comparable baseline revisions.',
    demoUrl: './demos/gaugeworks/index.html',
    sourceUrl: 'https://github.com/xxspartan16/gaugeworks',
  },
  {
    id: 'relaylab',
    number: '02',
    title: 'Relaylab',
    category: 'Workflow reliability / Simulation',
    summary:
      'Make a workflow fail on purpose. Follow retries, parallel work, and duplicate requests through a reproducible trace.',
    tags: ['TypeScript', 'State machines', 'Graph algorithms'],
    problem:
      'The happy path tells very little about a workflow. Relaylab makes the awkward paths visible: a dependency fails, a retry collides with another delivery, or two branches finish in an unexpected order.',
    decisions: [
      'Use a logical clock and deterministic inputs so a failure can be reproduced without waiting on real services.',
      'Validate the dependency graph before executing a run. Missing dependencies and cycles are explicit errors.',
      'Keep the event trace separate from its visual replay, and model idempotency conflicts rather than silently hiding them.',
    ],
    limits:
      'A local simulator, not a durable job runner. It does not send webhooks or promise exactly-once execution in a distributed system.',
    next: 'Persisted trace comparison and pluggable scheduling policies.',
    demoUrl: './demos/relaylab/index.html',
    sourceUrl: 'https://github.com/xxspartan16/relaylab',
  },
  {
    id: 'patchglass',
    number: '03',
    title: 'Patchglass',
    category: 'Developer tooling / Configuration',
    summary:
      'See exactly what a configuration change does. Compare JSON, preview a migration, and walk it back.',
    tags: ['TypeScript', 'Tree traversal', 'JSON Patch'],
    problem:
      'A small configuration edit can change more than it appears to. Patchglass turns the difference between two JSON documents into explicit operations, with a before-and-after view for every step.',
    decisions: [
      'Treat missing values, null, arrays, and objects as different cases. Text comparison alone misses those distinctions.',
      'Use escaped JSON Pointers and a documented JSON Patch subset to keep the exported operations understandable.',
      'Apply changes immutably and generate a rollback plan so inspection never mutates the original document.',
    ],
    limits:
      'Arrays are compared by position, not domain identity. A valid patch is not proof that an application will accept the resulting configuration.',
    next: 'Identity-aware array matching and a reusable command-line package.',
    demoUrl: './demos/patchglass/index.html',
    sourceUrl: 'https://github.com/xxspartan16/patchglass',
  },
];
