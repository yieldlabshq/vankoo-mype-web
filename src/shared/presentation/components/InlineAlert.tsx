import {CircleAlert, CircleCheck, CircleX} from 'lucide-react';
import {cn} from '@/lib/utils';

interface InlineAlertProps {
    variant: 'success' | 'warning' | 'error';
    title?: string;
    message: string;
}

const ICON = {success: CircleCheck, warning: CircleAlert, error: CircleX};

const CLASSES = {
    success: {bg: 'bg-success-bg', border: 'border-[var(--vk-state-success-border)]', text: 'text-success'},
    warning: {bg: 'bg-warning-bg', border: 'border-[var(--vk-state-warning-border)]', text: 'text-warning'},
    error: {bg: 'bg-error-bg', border: 'border-[var(--vk-state-error-border)]', text: 'text-error'}
};

/**
 * A notice that stays next to what it explains — the design's `Alert`, sibling of
 * Toast rather than a replacement for it: Toast floats and dismisses itself, this
 * stays put and can carry a title.
 */
export function InlineAlert({variant, title, message}: InlineAlertProps) {
    const Icon = ICON[variant];
    const classes = CLASSES[variant];

    return (
        <div className={cn('flex items-start gap-3 rounded-md border px-4 py-3', classes.bg, classes.border)}>
            <Icon className={cn('size-5 shrink-0', classes.text)} aria-hidden="true" />
            <div className={cn('text-body flex flex-1 flex-col gap-1', classes.text)}>
                {title && <p className="font-semibold">{title}</p>}
                <p>{message}</p>
            </div>
        </div>
    );
}
