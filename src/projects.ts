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

export const projects: Project[] = [
  {
    id: 'gaugeworks',
    number: '01',
    title: 'Gaugeworks',
    category: 'Process quality / Data analysis',
    summary:
      'Import part measurements, set a baseline, and trace signs of process drift back to individual parts.',
    tags: ['TypeScript', 'React', 'Statistical analysis'],
    problem:
      'An average can look acceptable while a production process quietly shifts. Gaugeworks separates a reference baseline from new observations so the shift cannot simply move its own goalposts.',
    decisions: [
      'Separate CSV parsing, statistics, and presentation so the calculations can be tested without a browser.',
      'Estimate variation from adjacent moving ranges, and keep specification limits separate from control limits.',
      'Surface the exact observations behind each signal. A warning should be something you can inspect.',
    ],
    limits:
      'The bundled measurements are synthetic. A signal identifies a part to investigate. A quality engineer still needs to determine its cause.',
    next: 'Measurement-system studies and saved, comparable baseline revisions.',
    demoUrl: 'https://gaugeworks.vercel.app/',
    sourceUrl: 'https://github.com/xxspartan16/gaugeworks',
  },
  {
    id: 'relaylab',
    number: '02',
    title: 'Relaylab',
    category: 'Workflow reliability / Simulation',
    summary:
      'Simulate failed tasks and duplicate requests, then replay the event trace to see which work recovered.',
    tags: ['TypeScript', 'State machines', 'Graph algorithms'],
    problem:
      'The happy path tells very little about a workflow. Relaylab makes the awkward paths visible: a dependency fails, a retry collides with another delivery, or two branches finish in an unexpected order.',
    decisions: [
      'Use a logical clock and deterministic inputs so a failure can be reproduced without waiting on real services.',
      'Validate the dependency graph before executing a run. Missing dependencies and cycles are explicit errors.',
      'Keep the event trace separate from its visual replay, and model idempotency conflicts as distinct results.',
    ],
    limits:
      'The browser models each event locally. Sending real webhooks and running jobs across machines require an external execution system.',
    next: 'Persisted trace comparison and pluggable scheduling policies.',
    demoUrl: 'https://relaylab-theta.vercel.app/',
    sourceUrl: 'https://github.com/xxspartan16/relaylab',
  },
  {
    id: 'patchglass',
    number: '03',
    title: 'Patchglass',
    category: 'Developer tooling / Configuration',
    summary:
      'Compare two JSON configurations, inspect each change, and verify that rollback restores the original.',
    tags: ['TypeScript', 'Tree traversal', 'JSON Patch'],
    problem:
      'A small configuration edit can change more than it appears to. Patchglass turns the difference between two JSON documents into explicit operations, with a before-and-after view for every step.',
    decisions: [
      'Treat missing values, null, arrays, and objects as different cases. Text comparison alone misses those distinctions.',
      'Use escaped JSON Pointers and a documented JSON Patch subset to keep the exported operations understandable.',
      'Apply changes immutably and generate a rollback plan so inspection never mutates the original document.',
    ],
    limits:
      'Arrays are compared by position. The receiving application still needs to validate the resulting configuration against its own schema.',
    next: 'Identity-aware array matching and a reusable command-line package.',
    demoUrl: 'https://patchglass.vercel.app/',
    sourceUrl: 'https://github.com/xxspartan16/patchglass',
  },
];
