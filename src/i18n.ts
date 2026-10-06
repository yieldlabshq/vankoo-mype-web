import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

/** Spanish is the product's language; anything unrecognised falls back to it. */
export const FALLBACK_LANGUAGE = 'es';

/** Where the choice survives a reload, in the same family as the session token. */
export const LANGUAGE_STORAGE_KEY = 'vankoo.locale';

/**
 * Sets up translation for the whole app.
 *
 * At the root of `src/` for the same reason as `router.tsx`: it composes something
 * every bounded context uses and belongs to none of them.
 *
 * The locale files are imported rather than fetched. They are small, and bundling
 * them means the first paint is already translated — with an HTTP backend the app
 * would need a Suspense boundary and would flash untranslated keys before it resolved.
 */
void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {es: {translation: es}, en: {translation: en}},
        fallbackLng: FALLBACK_LANGUAGE,
        supportedLngs: ['es', 'en'],
        // Without this, a browser set to es-PE or en-GB matches no resource and falls
        // back, which would put a Peruvian user in the fallback path by accident.
        load: 'languageOnly',
        detection: {
            // A remembered choice wins over the browser, so switching language sticks.
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: LANGUAGE_STORAGE_KEY,
            caches: ['localStorage'],
            // Store 'es', not 'es-419'. What gets remembered is then the same set of
            // values a language switcher would write, instead of whatever region the
            // browser happened to report.
            convertDetectedLanguage: language => language.split('-')[0]
        },
        // React escapes what it renders; letting i18next escape too would turn an
        // apostrophe in a translation into &#39; on screen.
        interpolation: {escapeValue: false}
    });

/**
 * Keeps `<html lang>` honest.
 *
 * It is what screen readers use to pick a voice and what the browser uses to
 * hyphenate. The document shipped `lang="en"` over an entirely Spanish interface
 * until this existed.
 */
function syncDocumentLanguage(language: string) {
    document.documentElement.lang = language;
}

syncDocumentLanguage(i18n.resolvedLanguage ?? FALLBACK_LANGUAGE);
i18n.on('languageChanged', syncDocumentLanguage);

export default i18n;
