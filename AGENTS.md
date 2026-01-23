Common rules:

- Answer in English, create all texts and comments in English.
- Never use `any` type.
- Create intermidiate indices for newly created modules (with re-exports, in form of `export * from './MODULE'`).
- Always check for typescript (via tsc) and eslint errors. Run eslint only for updated files.
- Never run tsc for specific files. Run only ` npx tsc --noEmit` for the whole project.
- Always run created tests.
- Carefully update original modules content: don't just ovverride the old contents.
- Don't use dynamic imports (`await import`), if it isn't necessary.

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

Always use the following error processing:

```
// eslint-disable-next-line no-console
console.error('[MODULE_ID:SCOPE_ID]', comboMsg, {
  error,
  // Output other related details
});
debugger; // eslint-disable-line no-debugger
```

Always put the real code into modules with meaningful names. Use `index.ts` files only for re-export. Eg., use `src/lib/indexedDB.ts` instead of `src/lib/indexedDB/index.ts` (or, alternatively, use `src/lib/indexedDB/indexedDB.ts` with reexport via `index.ts`).

(End of common rules.)
