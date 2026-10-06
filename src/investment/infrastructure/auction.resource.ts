import type {FinancialQuoteResource} from './financial-quote.resource';

/**
 * Wire shape of `GET /auctions/{id}` and of each item of `GET /auctions/mype/{mypeId}`,
 * mirroring Investment's `AuctionDetailsResource`.
 *
 * `fundableAmount` and `targetAmount` are null until the auction has been evaluated
 * and quoted respectively; the instants are null until the step they mark has
 * happened. `acceptedQuote` is the only quote this carries — an active one that was
 * not accepted yet has to be asked for separately.
 */
export interface AuctionResource {
    auctionId: string;
    invoiceId: string;
    mypeId: string;
    status: string;
    riskGrade: string;
    invoiceAmount: number;
    fundableAmount: number | null;
    targetAmount: number | null;
    currentFunding: number;
    currency: string;
    payerRuc: string;
    payerName: string;
    dueDate: string;
    greenCertified: boolean;
    fullBalanceOutstandingConfirmed: boolean;
    assessmentId: string | null;
    assessedAt: string | null;
    publishedAt: string | null;
    expiresAt: string | null;
    closedAt: string | null;
    cancelledAt: string | null;
    cancellationReason: string | null;
    acceptedQuote: FinancialQuoteResource | null;
}
