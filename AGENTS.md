Common rules:

- Answer in English, create all texts and comments in English.
- Never use `any` type.
- Create intermidiate indices for newly created modules (with re-exports, in form of `export * from './MODULE'`).
- Always check for typescript (via tsc) and eslint errors. Run eslint only for updated files.
- Always run created tests.
- Carefully update original modules content: don't just ovverride the old contents.

Console tools:

- The project uses `pnpm` package manager.
- Use `;` command separator instead of `&&` for powershell terminal.

For translations:

- Don't duplicate namespace objects: merge data into existed ones. (Check `AvailableCategoriesListPage`.)
- Check json files validity.

For UI (`.tsx`) react components:

- Use tailwind styles.
- Use icons from `src/components/shared/Icons.tsx` (import it as `import * as Icons from '@/components/shared/Icons'`).
- Use shared ui components from `src/components/ui`.
