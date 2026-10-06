import type es from '@/locales/es.json';

/** Every key under `invoicing.status`, derived from the locale file rather than repeated. */
type InvoiceStatusKey = `invoicing.status.${keyof typeof es.invoicing.status & string}`;

/**
 * The values `InvoiceStatus` can hold — the service's `InvoiceStatus`, all eleven.
 *
 * `CONSISTENCY_PASSED` is the one to keep in mind: it is where a successful read
 * ends, not `DATA_EXTRACTED`, which the service only falls back to when the
 * consistency check returns nothing it recognises. A client that did not know it
 * could not show a single invoice that had been read correctly.
 */
export type InvoiceStatus =
    | 'UPLOADED'
    | 'OCR_PROCESSING'
    | 'DATA_EXTRACTED'
    | 'CONSISTENCY_PASSED'
    | 'SUNAT_VALIDATING'
    | 'SUNAT_VALIDATED'
    | 'APPROVED'
    | 'PUBLISHED'
    | 'REQUIRES_REVIEW'
    | 'NOT_ELIGIBLE'
    | 'REJECTED';

const KNOWN_STATUSES: readonly InvoiceStatus[] = [
    'UPLOADED',
    'OCR_PROCESSING',
    'DATA_EXTRACTED',
    'CONSISTENCY_PASSED',
    'SUNAT_VALIDATING',
    'SUNAT_VALIDATED',
    'APPROVED',
    'PUBLISHED',
    'REQUIRES_REVIEW',
    'NOT_ELIGIBLE',
    'REJECTED'
];

/** Narrows a string from the wire into a status this build understands. */
export function isInvoiceStatus(value: string): value is InvoiceStatus {
    return (KNOWN_STATUSES as readonly string[]).includes(value);
}

interface StatusPresentation {
    labelKey: InvoiceStatusKey;
    fgClass: string;
    bgClass: string;
}

/**
 * Copy and color for each status, for the `StatusPill`.
 *
 * The design documents eleven `InvoiceStatus` values grouped into five rail
 * milestones, and the service defines the same eleven.
 */
const PRESENTATION_BY_STATUS: Record<InvoiceStatus, StatusPresentation> = {
    UPLOADED: {labelKey: 'invoicing.status.UPLOADED', fgClass: 'text-status-uploaded', bgClass: 'bg-status-uploaded-bg'},
    OCR_PROCESSING: {
        labelKey: 'invoicing.status.OCR_PROCESSING',
        fgClass: 'text-status-ocr-processing',
        bgClass: 'bg-status-ocr-processing-bg'
    },
    DATA_EXTRACTED: {
        labelKey: 'invoicing.status.DATA_EXTRACTED',
        fgClass: 'text-status-data-extracted',
        bgClass: 'bg-status-data-extracted-bg'
    },
    CONSISTENCY_PASSED: {
        labelKey: 'invoicing.status.CONSISTENCY_PASSED',
        fgClass: 'text-status-consistency-passed',
        bgClass: 'bg-status-consistency-passed-bg'
    },
    SUNAT_VALIDATING: {
        labelKey: 'invoicing.status.SUNAT_VALIDATING',
        fgClass: 'text-status-sunat-validating',
        bgClass: 'bg-status-sunat-validating-bg'
    },
    SUNAT_VALIDATED: {
        labelKey: 'invoicing.status.SUNAT_VALIDATED',
        fgClass: 'text-status-sunat-validated',
        bgClass: 'bg-status-sunat-validated-bg'
    },
    APPROVED: {labelKey: 'invoicing.status.APPROVED', fgClass: 'text-status-approved', bgClass: 'bg-status-approved-bg'},
    PUBLISHED: {labelKey: 'invoicing.status.PUBLISHED', fgClass: 'text-status-published', bgClass: 'bg-status-published-bg'},
    REQUIRES_REVIEW: {
        labelKey: 'invoicing.status.REQUIRES_REVIEW',
        fgClass: 'text-status-requires-review',
        bgClass: 'bg-status-requires-review-bg'
    },
    NOT_ELIGIBLE: {
        labelKey: 'invoicing.status.NOT_ELIGIBLE',
        fgClass: 'text-status-not-eligible',
        bgClass: 'bg-status-not-eligible-bg'
    },
    REJECTED: {labelKey: 'invoicing.status.REJECTED', fgClass: 'text-status-rejected', bgClass: 'bg-status-rejected-bg'}
};

/** How to word and color one status, for `StatusPill`. */
export function presentationForStatus(status: InvoiceStatus): StatusPresentation {
    return PRESENTATION_BY_STATUS[status];
}

/** Every status, in the order the filter's `Select` should list them. */
export const ALL_INVOICE_STATUSES: readonly InvoiceStatus[] = KNOWN_STATUSES;

/** The five milestones of the rail (`Riel`), left to right. */
export type InvoiceMilestone = 'received' | 'reading' | 'validating' | 'approved' | 'inAuction';

const MILESTONE_ORDER: readonly InvoiceMilestone[] = ['received', 'reading', 'validating', 'approved', 'inAuction'];

/**
 * Which milestone each status belongs to.
 *
 * `REJECTED` has no entry: the backend can reject an invoice from any of five
 * different statuses (see `Invoice.CanBeRejected()`) and does not carry which one it
 * came from, so there is no honest single milestone to place it at. `NOT_ELIGIBLE`
 * does have one — the one confirmed screen for it (a due date too close to fund)
 * always stops at "Validando con SUNAT", since eligibility is only knowable once the
 * due date has been read.
 */
const MILESTONE_BY_STATUS: Partial<Record<InvoiceStatus, InvoiceMilestone>> = {
    UPLOADED: 'received',
    OCR_PROCESSING: 'reading',
    DATA_EXTRACTED: 'reading',
    REQUIRES_REVIEW: 'reading',
    // Read and checked: reading is behind it, and the next thing that happens to it
    // is the validation step.
    CONSISTENCY_PASSED: 'validating',
    SUNAT_VALIDATING: 'validating',
    SUNAT_VALIDATED: 'validating',
    NOT_ELIGIBLE: 'validating',
    APPROVED: 'approved',
    PUBLISHED: 'inAuction'
};

/** Where a status places the rail: which milestone, and how it reads. */
export interface RailState {
    currentIndex: number;
    /**
     * Automatic (indigo) — the system is working it. Attention (amber) — a person has
     * to. Blocked (solid red, no ring) — a dead end; unlike the other two, its
     * connecting segments stay neutral gray rather than taking its color, since
     * nothing is actively moving through it.
     */
    currentState: 'automatic' | 'attention' | 'blocked';
}

/**
 * Computes the rail state for a status, or null when the status has no place on it
 * (`REJECTED` today — see `MILESTONE_BY_STATUS`'s own note).
 *
 * `REQUIRES_REVIEW` always lands on "Leyendo datos": the backend does not carry which
 * stage triggered the review, and the frontend has no other signal to place it more
 * precisely. Treat this as a simplification to revisit once it does.
 */
export function railStateFor(status: InvoiceStatus): RailState | null {
    const milestone = MILESTONE_BY_STATUS[status];
    if (!milestone) return null;
    return {
        currentIndex: MILESTONE_ORDER.indexOf(milestone),
        currentState: status === 'REQUIRES_REVIEW' ? 'attention' : status === 'NOT_ELIGIBLE' ? 'blocked' : 'automatic'
    };
}

/**
 * Whether the platform is still working on an invoice in this status, so a screen
 * should keep asking.
 *
 * Every status the rail draws as automatic, except `PUBLISHED`, which is where the
 * work ends. The rest — a review, a dead end, a rejection — wait on a person or on
 * nothing, and polling them only spends requests.
 */
export function isInvoiceInProgress(status: InvoiceStatus): boolean {
    if (status === 'PUBLISHED') return false;
    return railStateFor(status)?.currentState === 'automatic';
}
