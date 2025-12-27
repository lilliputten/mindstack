/* eslint-disable no-console */
/**
 * WARNING: This is a temporary solution to fix incompatibilities between zod, zod-prisma-types and prisma.
 * This script patches the generated file to replace z.cuid() with z.string().cuid().
 * This should be removed once the underlying issue is resolved in the dependencies.
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Path to the generated file
const localFilePath = 'src/generated/prisma/index.ts';
const generatedFilePath = join(process.cwd(), localFilePath);

try {
  // Check if the generated file exists
  if (existsSync(generatedFilePath)) {
    console.log(`Patching generated prisma file (${localFilePath})...`);
    // Read the content of the generated file
    const content = readFileSync(generatedFilePath, 'utf8');

    // Replace all occurrences of z.cuid() with z.string().cuid()
    const updatedContent = content.replace(/z\.cuid\(\)/g, 'z.string().cuid()');

    // Write the updated content back to the file
    writeFileSync(generatedFilePath, updatedContent, 'utf8');

    console.log('Successfully patched!');
  } else {
    console.log('The file does not exist!');
  }
} catch (error) {
  console.error('Error updating the generated file:', error);
  // eslint-disable-next-line no-debugger
  debugger;
  process.exit(1);
}
