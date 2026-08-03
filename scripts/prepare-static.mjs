import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const browser = join('dist', 'angular-project', 'browser');
const out = join('dist', 'static');

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

cpSync(join(browser, 'pt'), out, { recursive: true });
cpSync(join(browser, 'en-US'), join(out, 'en-US'), { recursive: true });

console.log(`Static deploy folder ready at ${out}`);
