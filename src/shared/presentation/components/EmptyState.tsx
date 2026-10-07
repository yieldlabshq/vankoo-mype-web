import type {ComponentType} from 'react';

interface EmptyStateProps {
    icon: ComponentType<{className?: string}>;
    title: string;
    description: string;
    action?: React.ReactNode;
}

/**
 * The design's `EmptyState`: an icon, a title, a description, and an optional action —
 * as properties rather than hand-composed per screen, so a change to the pattern does
 * not mean editing every empty screen that uses it. The icon is swappable because not
 * every empty state is about documents (a 404, an empty wallet).
 */
export function EmptyState({icon: Icon, title, description, action}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="bg-surface-sunken flex size-14 items-center justify-center rounded-full">
                <Icon className="text-fg size-6" aria-hidden="true" />
            </div>
            <p className="text-h3 text-fg font-semibold">{title}</p>
            <p className="text-body text-fg-secondary max-w-[360px]">{description}</p>
            {action}
        </div>
    );
}
