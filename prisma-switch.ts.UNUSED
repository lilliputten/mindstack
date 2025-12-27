/* eslint-disable no-console */
/**
 * @desc Script to automatically switch prisma database provider from
 * postgresql (for vercel deployment environment) to sqlite (for local
 * development).
 * @changed 2025.09.27, 03:14
 */

import fs from 'fs';
import { glob } from 'glob';

const VERCEL_URL = process.env.VERCEL_URL;
const isVercel = !!VERCEL_URL;

console.log('prisma-switch: VERCEL_URL:', VERCEL_URL);

const prismaFile = 'prisma/schema.prisma';

type TProvider = 'postgresql' | 'sqlite';

/** Replace provider for required in the current environment: postgresql is only for vercel */
const requiredProvider = isVercel ? 'postgresql' : 'sqlite';
// TODO: Provider also should depend on a local `DATABASE_URL` environment parameter.<F2>

const providerRegex = /^(\s*provider\s*=\s*)"(sqlite|postgresql)"/m;
const content = fs.readFileSync(prismaFile, 'utf8');
const match = content.match(providerRegex);
const foundProvider = match && match[2];

console.log('prisma-switch: Found provider:', foundProvider);
console.log('prisma-switch: Required provider:', requiredProvider);

type TReplacement = { provider: TProvider; from: RegExp; to: string };

// prettier-ignore
const replacements: TReplacement[] = [
  { provider: 'postgresql', from: /DATETIME/g, to: 'TIMESTAMP(3)' },
  { provider: 'sqlite', from: /TIMESTAMP\(3\)/g, to: 'DATETIME' },
  { provider: 'postgresql', from: /^PRAGMA/gm, to: '-- PRAGMA' },
  { provider: 'sqlite', from: /^-- PRAGMA/gm, to: 'PRAGMA' },
  { provider: 'postgresql', from: /INTEGER\b(.*)\bPRIMARY KEY AUTOINCREMENT/g, to: 'SERIAL$1PRIMARY KEY' },
  { provider: 'sqlite', from: /SERIAL\b(.*)\bPRIMARY KEY/g, to: 'INTEGER$1PRIMARY KEY AUTOINCREMENT' },
  { provider: 'postgresql', from: /'c' \|\| lower\(hex\(randomblob\(12\)\)\) \|\| printf\('%08x', abs\(random\(\)\)\)/g, to: "'c' || encode(gen_random_bytes(12), 'hex') || lpad(to_hex(floor(random() * 4294967295)::int), 8, '0')" },
  { provider: 'sqlite', from: /'c' \|\| encode\(gen_random_bytes\(12\), 'hex'\) \|\| lpad\(to_hex\(floor\(random\(\) \* 4294967295\)::int\), 8, '0'\)/g, to: "'c' || lower(hex(randomblob(12))) || printf('%08x', abs(random()))" },
];

function applyAllReplacements(
  content: string,
  replacements: TReplacement[],
  requiredProvider: TProvider,
): string {
  return replacements.reduce((content, { provider, from, to }) => {
    const doApply = provider === requiredProvider;
    if (doApply) {
      /* // prettier-ignore
       * console.log('prisma-switch: Replaceing', provider, ':', from, '->', to, 'CONTENT:', content.substring(0, 100).replace(/\n/g, '\\n'));
       */
      const newContent = content.replace(from, to);
      const isChanged = content !== newContent;
      /* if (to.includes('KEY') && (content.includes('AUTOINCREMENT') || content.includes('SERIAL'))) {
       *   debugger;
       * }
       */
      if (isChanged) {
        return newContent;
      }
    }
    return content;
  }, content);
}

if (match && requiredProvider !== foundProvider) {
  // Update migration SQL files
  console.log('prisma-switch: Update SQL files...');
  const migrationFiles = glob.sync('prisma/migrations/**/*.sql');
  if (migrationFiles.length > 0) {
    console.log('prisma-switch: Updating migration files...');
    migrationFiles.forEach((file) => {
      const sqlContent = fs.readFileSync(file, 'utf8');
      const updatedContent = applyAllReplacements(sqlContent, replacements, requiredProvider); // sqlContent.replace(lookupReg, replaceStr);
      const isChanged = updatedContent !== sqlContent;
      console.log('prisma-switch: ' + file + ': ' + (isChanged ? 'changed' : 'unchanged'));
      if (isChanged) {
        fs.writeFileSync(file, updatedContent);
        console.log('prisma-switch: Updated', file);
      }
    });
  }
  console.log('prisma-switch: Updating schema...');
  const newContent = content.replace(providerRegex, '$1"' + requiredProvider + '"');
  fs.writeFileSync(prismaFile, newContent);
  console.log('prisma-switch: OK');
} else {
  console.log('prisma-switch: No changes are required, done.');
}
