import { exec } from 'child_process';
import { getProjectRoot } from './index.js';

const projectRoot = getProjectRoot()
process.chdir(projectRoot);

// Run dir command in Windows
exec("node command backup");
