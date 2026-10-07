/**
 * The values `AuctionStatus` can hold — Investment's `AuctionStatus`, all eight.
 *
 * Only the first three matter to a MYPE reading her own invoice: the auction waits
 * for the risk evaluation, then sits in `DRAFT` until she accepts a quote, and from
 * `PUBLISHED` on it is the investors' turn. The rest are what happens to it there.
 */
export type AuctionStatus =
    | 'PENDING_VERIFICATION_RISK'
    | 'DRAFT'
    | 'PUBLISHED'
    | 'FUNDING'
    | 'FULLY_FUNDED'
    | 'CLOSED'
    | 'EXPIRED'
    | 'CANCELLED';

const KNOWN_STATUSES: readonly AuctionStatus[] = [
    'PENDING_VERIFICATION_RISK',
    'DRAFT',
    'PUBLISHED',
    'FUNDING',
    'FULLY_FUNDED',
    'CLOSED',
    'EXPIRED',
    'CANCELLED'
];

/** Narrows a string from the wire into a status this build understands. */
export function isAuctionStatus(value: string): value is AuctionStatus {
    return (KNOWN_STATUSES as readonly string[]).includes(value);
}

/**
 * Whether the MYPE has already accepted a quote for an auction in this status.
 *
 * Everything from `PUBLISHED` onwards: the invoice is out with the investors, and
 * whether it is still filling, full or settled is their concern, not hers. `EXPIRED`
 * and `CANCELLED` are not here — an expired auction was published once, but the
 * screen has nothing to say about it yet.
 */
export function isPublishedStatus(status: AuctionStatus): boolean {
    return status === 'PUBLISHED' || status === 'FUNDING' || status === 'FULLY_FUNDED' || status === 'CLOSED';
}

/** The grade the risk evaluation gave an auction; `UNDER_EVALUATION` until it has. */
export type RiskGrade = 'A' | 'B' | 'C' | 'UNDER_EVALUATION';
