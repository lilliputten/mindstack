/* eslint-disable no-console */

import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

function runCommand(command: string, args: string[], cwd: string) {
  try {
    const result = execSync(`${command} ${args.join(' ')}`, {
      cwd,
      stdio: 'inherit',
      encoding: 'utf-8',
    });
    return { success: true, stdout: result, stderr: '' };
  } catch (error) {
    let stdout = '';
    let stderr = '';
    let message = '';

    // Check if error is an instance of Error for message
    if (error instanceof Error) {
      message = error.message;
    }

    // Check if error has stdout/stderr properties (like ChildProcessError)
    if (typeof error === 'object' && error !== null) {
      if ('stdout' in error && error.stdout instanceof Buffer) {
        stdout = error.stdout.toString();
      }
      if ('stderr' in error && error.stderr instanceof Buffer) {
        stderr = error.stderr.toString();
      }
    }

    return {
      success: false,
      stdout,
      stderr: stderr || message,
    };
  }
}

async function main() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const packageRoot = join(__dirname, '../');
  const projectRoot = join(__dirname, '../../../../');

  console.log('Running unit tests...');
  const testResult = runCommand(
    'pnpm',
    ['test', 'text-similarity-comparators.test.ts'],
    projectRoot,
  );

  if (!testResult.success) {
    console.error('Unit tests failed:');
    console.error(testResult.stderr);
    throw new Error('Unit tests failed');
  }

  console.log('\nRunning benchmarks...');
  const benchmarkResult = runCommand(
    'pnpm',
    ['exec', 'tsx', join(packageRoot, 'test-scripts/run-benchmarks.ts')],
    projectRoot,
  );

  if (!benchmarkResult.success) {
    console.error('Benchmarks failed:');
    console.error(benchmarkResult.stderr);
    throw new Error('Benchmarks failed');
  }

  console.log('\nAll tests and benchmarks completed successfully');
}

main().catch((err) => {
  let errorMessage = 'Unknown error';
  let errorStack = '';

  if (err instanceof Error) {
    errorMessage = err.message;
    errorStack = err.stack || '';
  }

  console.error('[TEXT_SIMILARITY:TEST_RUNNER]', `Error running tests: ${errorMessage}`, {
    error: err instanceof Error ? err : undefined,
    stack: errorStack,
  });
  debugger; // eslint-disable-line no-debugger

  process.exit(1);
});
