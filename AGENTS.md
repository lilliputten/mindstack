Common rules:

- Never use `any` type.
- Create intermidiate indices for newly created modules (with re-exports, in form of `export * from './MODULE'`).
- Always check for typescript and eslint errors. Run eslint only for updated files.
- Always run created tests.
- Use only English language, create all texts and comments in English. Communicate in English too.
- Carefully update original modules content: don't just ovverride the old contents.
- For powershell use `;` command separator instead of `&&`.

For UI (`.tsx`) react components:

- Use tailwind styles.
- Use icons from `src/components/shared/Icons.tsx` (import it as `import * as Icons from '@/components/shared/Icons'`).
- Use shared ui components from `src/components/ui`.
