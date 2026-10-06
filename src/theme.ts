import {useCallback, useSyncExternalStore} from 'react';

/** The two themes the design system defines. There is no third «auto» value — see below. */
export type Theme = 'light' | 'dark';

/** Where the choice survives a reload, in the same family as `vankoo.locale`. */
export const THEME_STORAGE_KEY = 'vankoo.theme';

/** The class `tokens.css` hangs the dark palette off, applied to `<html>`. */
const DARK_CLASS = 'dark';

const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

const listeners = new Set<() => void>();

function notify() {
    for (const listener of listeners) listener();
}

/**
 * The remembered choice, or `null` while the device is still deciding.
 *
 * `null` is the state the app ships in and the one most users stay in: nothing is
 * written until someone actually presses the toggle. That is what gives the web the
 * same behaviour the mobile app gets for free — the system decides — without spending
 * a third «auto» state on screen that would have to be explained.
 */
function storedTheme(): Theme | null {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
}

/** What the interface should actually render right now. */
export function resolveTheme(): Theme {
    return storedTheme() ?? (systemPrefersDark.matches ? 'dark' : 'light');
}

function applyTheme(theme: Theme) {
    document.documentElement.classList.toggle(DARK_CLASS, theme === 'dark');
}

/**
 * Remembers a theme and paints it.
 *
 * From here on the system preference is ignored on this device, which is the point:
 * an explicit choice that a change of daylight could undo would not be a choice.
 */
export function setTheme(theme: Theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
    notify();
}

// While no choice is stored, the app follows the system live — someone whose laptop
// flips to dark at sunset sees the app flip with it, without a reload.
systemPrefersDark.addEventListener('change', () => {
    if (storedTheme() !== null) return;
    applyTheme(resolveTheme());
    notify();
});

applyTheme(resolveTheme());

/**
 * Subscribes a component to the theme.
 *
 * `useSyncExternalStore` rather than a store: the theme lives in the document and in
 * `localStorage`, not in React, and this is the hook React ships for exactly that.
 * Adding a fourth Zustand store for one boolean would also cut against the rule that
 * `shared/` stays small — the theme belongs to no bounded context, same as i18n.
 */
export function useTheme() {
    const theme = useSyncExternalStore(subscribe, resolveTheme);
    const toggleTheme = useCallback(() => {
        setTheme(resolveTheme() === 'dark' ? 'light' : 'dark');
    }, []);

    return {theme, toggleTheme};
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}
