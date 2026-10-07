import type {Auction} from '../../investment/domain/model/auction.entity';
import type {InvoiceDetail} from '../domain/model/invoice-detail.entity';
import {railStateFor, type InvoiceMilestone, type InvoiceStatus, type RailState} from '../domain/model/invoice-status';

/** The rail's five milestones, left to right — what the step labels are built from. */
export const RAIL_MILESTONES: readonly InvoiceMilestone[] = ['received', 'reading', 'validating', 'approved', 'inAuction'];

/**
 * Every key under `invoicing.detail.railCaption` — see `IamErrorAlert` for the same
 * dynamic-key-cast pattern. Written out rather than templated from `InvoiceMilestone`:
 * only the combinations a real status can actually produce (per `MILESTONE_BY_STATUS`)
 * have copy — "received" has no "attention" or "blocked" entry, and "blocked" only
 * exists on "validating", since `NOT_ELIGIBLE` is the only status mapped to it today.
 */
export type RailCaptionKey =
    | 'invoicing.detail.railCaption.received.automatic'
    | 'invoicing.detail.railCaption.reading.automatic'
    | 'invoicing.detail.railCaption.reading.attention'
    | 'invoicing.detail.railCaption.validating.automatic'
    | 'invoicing.detail.railCaption.validating.attention'
    | 'invoicing.detail.railCaption.validating.blocked'
    | 'invoicing.detail.railCaption.approved.automatic'
    | 'invoicing.detail.railCaption.approved.attention'
    | 'invoicing.detail.railCaption.inAuction.automatic'
    | 'invoicing.detail.railCaption.inAuction.attention';

/**
 * The sentence under the rail for where an invoice is.
 *
 * Shared by the detail and the upload screen so the two can never describe the same
 * status in different words — the upload screen used to carry a fixed «estamos
 * leyendo los datos» that stayed on screen long after the rail had moved past reading.
 */
export function railCaptionKey(rail: RailState): RailCaptionKey {
    return `invoicing.detail.railCaption.${RAIL_MILESTONES[rail.currentIndex]}.${rail.currentState}` as RailCaptionKey;
}

/** Where an invoice is, once its auction has had its say: the rail and the status to pill. */
export interface InvoiceProgress {
    rail: RailState | null;
    status: InvoiceStatus;
}

/**
 * Combines the invoice's own status with its auction's to place it on the rail.
 *
 * Invoicing never moves an invoice past `CONSISTENCY_PASSED`: nothing in the
 * platform sets `APPROVED` or `PUBLISHED` on it. What actually happens next lives in
 * Investment — the auction is evaluated, then waits for the MYPE, then is published —
 * so the last two milestones are read off the auction, and the invoice's status
 * only speaks while there is no auction to speak for it.
 *
 * "Aprobada" is amber, not indigo: the platform is done and the next move is the
 * MYPE's. It is the one rail step where "attention" means "your turn" rather than
 * "something to fix".
 */
export function progressFor(invoice: InvoiceDetail, auction: Auction | null): InvoiceProgress {
    if (auction?.isPublished()) return {rail: railStateFor('PUBLISHED'), status: 'PUBLISHED'};
    if (auction?.canBeQuoted()) {
        return {rail: {currentIndex: RAIL_MILESTONES.indexOf('approved'), currentState: 'attention'}, status: 'APPROVED'};
    }
    return {rail: invoice.railState(), status: invoice.status};
}

/**
 * Whether the detail should keep asking Investment about the auction.
 *
 * Only in the gap between the invoice passing its checks and the risk evaluation
 * landing: the auction is created by an event and evaluated by another, and both
 * take a moment. Everywhere else the next change waits on a person, or never comes.
 */
export function isAwaitingAuction(invoice: InvoiceDetail, auction: Auction | null): boolean {
    return invoice.status === 'CONSISTENCY_PASSED' && (auction === null || auction.isAwaitingEvaluation());
}
