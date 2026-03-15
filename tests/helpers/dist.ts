import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const DIST = join(process.cwd(), 'dist');

export function requireDist(): void {
  if (!existsSync(DIST)) {
    throw new Error(
      'dist/ directory not found. Run `npm run build` before running build tests.'
    );
  }
}

export function distPath(...segments: string[]): string {
  return join(DIST, ...segments);
}
