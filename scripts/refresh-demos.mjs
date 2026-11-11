import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Run after rebuilding each sibling source project. The checked-in demo builds
// allow this portfolio repository to deploy independently of those repositories.
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const name of ['gaugeworks', 'relaylab', 'patchglass']) {
  const source = path.resolve(project, '..', name, 'dist');
  const destination = path.join(project, 'public', 'demos', name);
  await mkdir(path.dirname(destination), { recursive: true });
  await rm(destination, { recursive: true, force: true });
  await cp(source, destination, { recursive: true });
  console.log(`Updated bundled demo: ${name}`);
}
