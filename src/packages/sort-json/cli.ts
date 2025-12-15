#!/usr/bin/env node
/* eslint-disable no-console, no-debugger */
import { readFileSync, writeFileSync } from 'fs';
import { stdin } from 'process';
import chalk from 'chalk';
import { program } from 'commander';
import { glob } from 'glob';

import { PrimitivePosition, sortJson, SortOptions } from './sort-json';

program
  .name('json-sort')
  .description('Sort JSON objects with configurable options')
  .version('1.0.0')
  .option('-i, --input <pattern>', 'Input JSON file or glob pattern (uses stdin if not specified)')
  .option('-o, --output <file>', 'Output file (uses stdout if not specified)')
  .option('--in-place', 'Modify input file in-place', false)
  .option('-p, --primitive <position>', 'Primitive position: first or last', 'first')
  .option('-s, --sort <order>', 'Sort order: asc or desc', 'asc')
  .option('-c, --case-sensitive', 'Case-sensitive sorting', false)
  .option('-n, --numeric-sort', 'Numeric key sorting', false)
  .option('--indent <spaces>', 'Number of spaces for indentation', '2')
  .option('--no-color', 'Disable colored output', false)
  .parse(process.argv);

interface CliOptions {
  input?: string;
  output?: string;
  inPlace: boolean;
  primitive: PrimitivePosition;
  sort: 'asc' | 'desc';
  caseSensitive: boolean;
  numericSort: boolean;
  indent: string;
  color: boolean;
}

async function run() {
  const options = program.opts() as CliOptions;

  // Validate primitive position
  if (options.primitive !== 'first' && options.primitive !== 'last') {
    console.error(
      chalk.red(`Invalid primitive position: ${options.primitive}. Use 'first' or 'last'`),
    );
    process.exit(1);
  }

  // Validate sort order
  if (options.sort !== 'asc' && options.sort !== 'desc') {
    console.error(chalk.red(`Invalid sort order: ${options.sort}. Use 'asc' or 'desc'`));
    process.exit(1);
  }

  // Validate in-place option
  if (options.inPlace && !options.input) {
    console.error(chalk.red('--in-place requires an input pattern'));
    process.exit(1);
  }

  if (options.inPlace && options.output) {
    console.error(chalk.red('Cannot use --in-place with --output'));
    process.exit(1);
  }

  try {
    if (options.input) {
      // Find files using glob pattern
      const files = await glob(options.input, { nodir: true });

      if (files.length === 0) {
        console.error(chalk.red(`No files found matching pattern: ${options.input}`));
        process.exit(1);
      }

      // Sort options
      const sortOptions: SortOptions = {
        order: options.sort,
        primitivePosition: options.primitive,
        caseSensitive: options.caseSensitive,
        numericSort: options.numericSort,
      };

      const indent = parseInt(options.indent) || 2;
      let processedCount = 0;

      // Process each file
      for (const file of files) {
        try {
          const inputData = readFileSync(file, 'utf-8');
          const jsonData = JSON.parse(inputData);
          const sortedData = sortJson(jsonData, sortOptions);
          const output = JSON.stringify(sortedData, null, indent);

          if (options.inPlace) {
            writeFileSync(file, output, 'utf-8');
            if (options.color) {
              console.log(chalk.green(`✓ ${file}`));
            } else {
              console.log(`Processed: ${file}`);
            }
          } else if (options.output) {
            // For multiple files with single output, only process the first one
            if (processedCount === 0) {
              writeFileSync(options.output, output, 'utf-8');
              if (options.color) {
                console.log(chalk.green(`✓ Sorted JSON written to ${options.output}`));
              } else {
                console.log(`Sorted JSON written to ${options.output}`);
              }
            }
          } else {
            // Output to stdout - only for single file or first file
            if (files.length === 1 || processedCount === 0) {
              console.log(output);
            }
          }
          processedCount++;
        } catch (fileError) {
          console.error(
            chalk.red(`Error processing ${file}:`),
            fileError instanceof Error ? fileError.message : 'Unknown error',
          );
        }
      }

      if (options.inPlace && options.color) {
        console.log(chalk.green(`\n✓ Processed ${processedCount} file(s)`));
      }
    } else {
      // Read from stdin
      const inputData = await new Promise<string>((resolve) => {
        let data = '';
        stdin.setEncoding('utf8');
        stdin.on('readable', () => {
          let chunk;
          while ((chunk = stdin.read()) !== null) {
            data += chunk;
          }
        });
        stdin.on('end', () => resolve(data));
      });

      const jsonData = JSON.parse(inputData);
      const sortOptions: SortOptions = {
        order: options.sort,
        primitivePosition: options.primitive,
        caseSensitive: options.caseSensitive,
        numericSort: options.numericSort,
      };
      const sortedData = sortJson(jsonData, sortOptions);
      const indent = parseInt(options.indent) || 2;
      const output = JSON.stringify(sortedData, null, indent);

      if (options.output) {
        writeFileSync(options.output, output, 'utf-8');
        if (options.color) {
          console.log(chalk.green(`✓ Sorted JSON written to ${options.output}`));
        } else {
          console.log(`Sorted JSON written to ${options.output}`);
        }
      } else {
        console.log(output);
      }
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : 'Unknown error');
    debugger;
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}
