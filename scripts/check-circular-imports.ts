#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Circular Import Checker
 *
 * Scans TypeScript/JavaScript files for circular dependency chains.
 * Usage: pnpm check-circular-imports
 *
 * Exit codes:
 *   0 - No circular dependencies found
 *   1 - Circular dependencies detected
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';

// ANSI colors
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

interface FileImportMap {
  [filePath: string]: string[];
}

/**
 * Resolve an import path to an actual file path
 */
function resolveImportPath(
  importPath: string,
  importingFile: string,
  srcDir: string,
  // tsconfigPaths: Record<string, string> = {},
): string | null {
  // Skip third-party modules
  if (!importPath.startsWith('.') && !importPath.startsWith('..') && !importPath.startsWith('@/')) {
    return null;
  }

  let basePath: string;
  let relativePath: string;

  if (importPath.startsWith('@/')) {
    // Alias import
    basePath = srcDir;
    relativePath = importPath.slice(2);
  } else if (importPath.startsWith('.') || importPath.startsWith('..')) {
    // Relative import
    basePath = dirname(importingFile);
    relativePath = importPath;
  } else {
    return null;
  }

  const resolvedBase = resolve(basePath, relativePath);
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];

  // Try direct file with extensions
  for (const ext of extensions) {
    const fullPath = resolvedBase + ext;
    if (fileExists(fullPath)) {
      return fullPath;
    }
  }

  // Try as directory with index file
  for (const ext of extensions) {
    const indexPath = join(resolvedBase, 'index' + ext);
    if (fileExists(indexPath)) {
      return indexPath;
    }
  }

  return null;
}

function fileExists(path: string): boolean {
  try {
    readFileSync(path, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract imports from a file, excluding comments
 */
function extractImports(filePath: string): string[] {
  const content = readFileSync(filePath, 'utf-8');
  const imports: string[] = [];

  // Remove comments
  const withoutComments = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  // Match import and export statements
  const importRegex = /(?:import|export)\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(withoutComments)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

/**
 * Build import graph for all files
 */
function buildImportGraph(srcDir: string): FileImportMap {
  const graph: FileImportMap = {};

  function scanDirectory(dir: string) {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (!entry.startsWith('.') && entry !== 'node_modules') {
          scanDirectory(fullPath);
        }
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
        const rawImports = extractImports(fullPath);
        // Resolve each import to an actual file path
        const resolvedImports: string[] = [];
        for (const imp of rawImports) {
          const resolved = resolveImportPath(imp, fullPath, srcDir);
          if (resolved) {
            resolvedImports.push(resolved);
          }
        }
        graph[fullPath] = resolvedImports;
      }
    }
  }

  scanDirectory(srcDir);
  return graph;
}

/**
 * Detect all circular dependencies using DFS with proper cycle tracking
 */
function detectCycles(graph: FileImportMap): string[][] {
  const cycles: string[][] = [];
  const allCyclesSet = new Set<string>();

  function dfs(node: string, path: string[], visited: Set<string>, visiting: Set<string>) {
    if (visiting.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart);
        // Create a unique key for this cycle
        const cycleKey = [...cycle].sort().join('|');
        if (!allCyclesSet.has(cycleKey)) {
          allCyclesSet.add(cycleKey);
          cycles.push([...cycle, node]); // Include the node again to show the cycle
        }
      }
      return;
    }

    if (visited.has(node)) {
      return;
    }

    visiting.add(node);
    path.push(node);

    const imports = graph[node] || [];
    for (const imp of imports) {
      if (graph[imp]) {
        // Only follow imports that exist in our graph
        dfs(imp, path, visited, visiting);
      }
    }

    path.pop();
    visiting.delete(node);
    visited.add(node);
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();
  const path: string[] = [];

  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) {
      dfs(node, path, visited, visiting);
    }
  }

  return cycles;
}

/**
 * Format cycle for human-readable output
 */
function formatCycle(cycle: string[], srcDir: string): string {
  return cycle
    .map((file) => {
      const relPath = relative(srcDir, file);
      return relPath.replace(/\\/g, '/');
    })
    .join(`\n  ${CYAN}→${RESET} `);
}

/**
 * Main
 */
function main() {
  const srcDir = resolve(process.cwd(), 'src');

  console.log(`${BOLD}${CYAN}Checking for circular dependencies...${RESET}\n`);

  try {
    const entries = readdirSync(srcDir);
    if (!entries.length) {
      console.error(`${RED}Error: src directory is empty${RESET}`);
      process.exit(1);
    }
  } catch {
    console.error(`${RED}Error: src directory not found${RESET}`);
    process.exit(1);
  }

  console.log(`Building import graph from ${CYAN}src/${RESET}...`);
  const graph = buildImportGraph(srcDir);
  const fileCount = Object.keys(graph).length;
  console.log(`Indexed ${CYAN}${fileCount}${RESET} files\n`);

  console.log('Analyzing import chains...');
  const cycles = detectCycles(graph);

  if (cycles.length === 0) {
    console.log(`\n${BOLD}${GREEN}✓ No circular dependencies found${RESET}\n`);
    process.exit(0);
  } else {
    console.log(
      `\n${BOLD}${RED}✗ Found ${cycles.length} circular dependenc${cycles.length === 1 ? 'y' : 'ies'}${RESET}\n`,
    );

    cycles.forEach((cycle, index) => {
      console.log(`${YELLOW}${BOLD}Cycle ${index + 1}:${RESET}`);
      console.log(formatCycle(cycle, srcDir));
      console.log('');
    });

    console.log(`${YELLOW}${BOLD}How to fix:${RESET}`);
    console.log(`Replace barrel imports with direct relative imports to break cycles.`);
    console.log(
      `Example: Use ${CYAN}import { x } from './helpers'${RESET} instead of ${CYAN}import { x } from '@/entities/Module'${RESET}\n`,
    );

    process.exit(1);
  }
}

main();
