import {Bell, Menu, Search, Settings} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {PreferencesBar} from './PreferencesBar';

interface TopBarProps {
    /** Opens the sidebar drawer — only rendered below `lg`, where the sidebar hides. */
    onMenuClick: () => void;
}

/**
 * The bar above the page content: search, notifications, settings, and the language
 * and theme switcher.
 *
 * Search, notifications and settings are visual only — none of the services behind
 * them exist on this frontend yet, so they render as plain icons rather than an
 * affordance that does nothing when pressed.
 */
export function TopBar({onMenuClick}: TopBarProps) {
    const {t} = useTranslation();

    return (
        <div className="bg-surface-raised border-border-subtle flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
            <button
                type="button"
                onClick={onMenuClick}
                aria-label={t('common.topBar.openMenu')}
                className="text-fg -ml-1 flex size-9 shrink-0 items-center justify-center lg:hidden"
            >
                <Menu className="size-5" aria-hidden="true" />
            </button>

            <div className="bg-surface-sunken border-border-strong hidden h-9 min-w-0 flex-1 items-center gap-2 rounded-md border px-3 sm:flex md:max-w-80">
                <Search className="text-fg-muted size-4 shrink-0" aria-hidden="true" />
                <input
                    type="search"
                    placeholder={t('common.topBar.searchPlaceholder')}
                    className="text-body text-fg placeholder:text-fg-muted w-full bg-transparent outline-none"
                />
            </div>

            <div className="ml-auto flex items-center gap-3 sm:gap-6">
                <Bell className="text-fg size-5 shrink-0" aria-hidden="true" />
                <Settings className="text-fg hidden size-5 shrink-0 sm:block" aria-hidden="true" />
                <PreferencesBar />
            </div>
        </div>
    );
}
