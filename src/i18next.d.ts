import type es from './locales/es.json';

/**
 * Types `t()` against the Spanish file, which is the source of truth for the key set.
 *
 * A mistyped key becomes a compile error instead of the raw key rendered on screen,
 * and `pnpm build` catches a translation someone forgot to add.
 *
 * Named after the module it augments, not after `i18n.ts`: a `i18n.d.ts` sitting next
 * to `i18n.ts` would shadow it when TypeScript resolves `./i18n`.
 */
declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: {translation: typeof es};
    }
}
