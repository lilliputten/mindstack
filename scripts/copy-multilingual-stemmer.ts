/* eslint-disable no-console */

/**
 * Copy multilingual-stemmer dist files to local folder
 * and strip index.js to only keep the Languages enum
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const projectRoot = path.resolve(__dirname, '..');
const nodeModulesPath = path.join(
  projectRoot,
  'node_modules/.pnpm/multilingual-stemmer@1.0.2/node_modules/multilingual-stemmer/dist',
);
const destPath = path.join(projectRoot, 'src/packages/text-comparator/multilingual-stemmer');
const publicPath = path.join(projectRoot, 'public/multilingual-stemmer');

// Files to copy
const filesToCopy = ['index.d.ts', 'index.js', 'index_bg.wasm'];

// Ensure destination directories exist
[destPath, publicPath].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Copy and process files
filesToCopy.forEach((file) => {
  const srcFile = path.join(nodeModulesPath, file);
  const destFile = path.join(destPath, file);

  if (!fs.existsSync(srcFile)) {
    console.error(`Source file not found: ${srcFile}`);
    process.exit(1);
  }

  if (file === 'index.js') {
    // Read the file
    const content = fs.readFileSync(srcFile, 'utf-8');

    // Keep only the Languages enum export
    const languagesMatch = content.match(
      /^module\.exports\.Languages = Object\.freeze\(\{[^}]+\}\);/m,
    );

    if (languagesMatch) {
      // Create a minimal index.js with just the Languages export
      const minimalContent = `${languagesMatch[0]}

// Minimal wrapper for browser compatibility
// Original file stripped to avoid Node.js dependencies (fs, path, util)
`;
      fs.writeFileSync(destFile, minimalContent, 'utf-8');
      console.log(`Processed and copied: ${file} (stripped to Languages only)`);
    } else {
      console.error('Could not find Languages export in index.js');
      process.exit(1);
    }
  } else {
    // Copy other files as-is
    fs.copyFileSync(srcFile, destFile);
    console.log(`Copied: ${file}`);
  }

  // Also copy WASM to public folder
  if (file === 'index_bg.wasm') {
    const publicFile = path.join(publicPath, file);
    fs.copyFileSync(srcFile, publicFile);
    console.log(`Copied to public: ${file}`);
  }
});

console.log('\nDone!');
console.log('  Local copy:', destPath);
console.log('  Public copy:', publicPath);
