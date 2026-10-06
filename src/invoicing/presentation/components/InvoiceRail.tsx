import {cn} from '@/lib/utils';

interface RailStep {
    label: string;
}

interface InvoiceRailProps {
    steps: readonly RailStep[];
    /**
     * Index of the milestone in progress. Steps before it read as done, steps after as
     * not yet reached. Omitted before anything has been uploaded, when there is no
     * progress to report and every dot reads the same neutral "not yet".
     */
    currentIndex?: number;
    /**
     * Automatic (indigo) — the system is working it. Attention (amber) — a person has
     * to. Blocked (solid red) — a dead end.
     */
    currentState?: 'automatic' | 'attention' | 'blocked';
}

type StepState = 'done' | 'current-automatic' | 'current-attention' | 'current-blocked' | 'pending';

function stateFor(
    index: number,
    currentIndex: number | undefined,
    currentState: 'automatic' | 'attention' | 'blocked'
): StepState {
    if (currentIndex === undefined) return 'pending';
    if (index < currentIndex) return 'done';
    if (index === currentIndex) {
        if (currentState === 'attention') return 'current-attention';
        if (currentState === 'blocked') return 'current-blocked';
        return 'current-automatic';
    }
    return 'pending';
}

const LINE_CLASS: Record<StepState, string> = {
    done: 'bg-fg',
    'current-automatic': 'bg-status-ocr-processing',
    'current-attention': 'bg-status-requires-review',
    // A dead end is a solid punctuation mark, not something actively moving through —
    // its segments stay the neutral "not yet" gray rather than taking its color.
    'current-blocked': 'bg-border-strong',
    pending: 'bg-border-strong'
};

/**
 * The five-milestone rail (the design's `Riel`).
 *
 * Each dot draws its own two half-segments in its own color — the design's rule is
 * that a segment belongs to the dot it leaves, not the one it enters, so the color
 * change between two different states falls at the segment's midpoint. That rule has
 * one exception: a blocked (dead-end) dot's segments stay gray, per `LINE_CLASS`'s own
 * note. Done is navy, automatic progress is indigo with a hollow ring, attention (a
 * person has to act) is amber with a hollow ring, blocked is solid red with no ring,
 * and not-yet is gray.
 */
export function InvoiceRail({steps, currentIndex, currentState = 'automatic'}: InvoiceRailProps) {
    return (
        <ol className="flex w-full items-start">
            {steps.map((step, index) => {
                const state = stateFor(index, currentIndex, currentState);
                return (
                    <li key={step.label} className="flex min-w-0 flex-1 flex-col items-center gap-2.5">
                        <div className="flex w-full items-center">
                            <span className={cn('h-0.5 flex-1', index === 0 ? 'bg-transparent' : LINE_CLASS[state])} />
                            <span
                                className={cn(
                                    'size-4 shrink-0 rounded-full',
                                    state === 'done' && 'bg-fg',
                                    state === 'current-automatic' && 'bg-surface-raised border-2 border-status-ocr-processing',
                                    state === 'current-attention' && 'bg-surface-raised border-2 border-status-requires-review',
                                    state === 'current-blocked' && 'bg-status-rejected',
                                    state === 'pending' && 'bg-border-strong'
                                )}
                            />
                            <span
                                className={cn('h-0.5 flex-1', index === steps.length - 1 ? 'bg-transparent' : LINE_CLASS[state])}
                            />
                        </div>
                        <p className="text-fg w-full px-1 text-center text-[11px] leading-4 break-words sm:text-caption">
                            {step.label}
                        </p>
                    </li>
                );
            })}
        </ol>
    );
}
