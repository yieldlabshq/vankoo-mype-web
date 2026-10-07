import type {AxiosResponse} from 'axios';
import {isAuctionStatus, type RiskGrade} from '../domain/model/auction-status';
import {Auction} from '../domain/model/auction.entity';
import {FinancialQuote, type FinancialQuoteStatus} from '../domain/model/financial-quote.entity';
import type {AuctionResource} from './auction.resource';
import type {FinancialQuoteResource} from './financial-quote.resource';

/**
 * Anti-corruption layer between Investment's auction API and this context's model.
 *
 * The only place that knows both shapes. Plain decimals become `{value, currency}`
 * pairs here, ISO strings become dates, and a status this build does not know makes
 * the whole auction null rather than a screen that guesses.
 */
export class AuctionAssembler {
    /** One auction, or null when its status is not one this build knows. */
    static toAuctionFromResource(resource: AuctionResource): Auction | null {
        if (!isAuctionStatus(resource.status)) return null;
        const amount = (value: number) => ({value, currency: resource.currency});
        return new Auction({
            id: resource.auctionId,
            invoiceId: resource.invoiceId,
            status: resource.status,
            riskGrade: toRiskGrade(resource.riskGrade),
            targetAmount: resource.targetAmount === null ? null : amount(resource.targetAmount),
            currentFunding: amount(resource.currentFunding),
            publishedAt: toDateOrNull(resource.publishedAt),
            expiresAt: toDateOrNull(resource.expiresAt),
            acceptedQuote: resource.acceptedQuote && this.toQuoteFromResource(resource.acceptedQuote)
        });
    }

    /** The auction of one response, or null when the body is not one this build knows. */
    static toAuctionFromResponse(response: AxiosResponse<AuctionResource>): Auction | null {
        return this.toAuctionFromResource(response.data);
    }

    /**
     * The auction opened for one invoice, out of everything the MYPE owns.
     *
     * Investment has no lookup by invoice, so the client reads the MYPE's whole list
     * and picks. One invoice has at most one auction — the service refuses a second —
     * so the first match is the match.
     */
    static toAuctionForInvoiceFromResponse(
        response: AxiosResponse<AuctionResource[]>,
        invoiceId: string
    ): Auction | null {
        const resource = response.data.find(item => item.invoiceId === invoiceId);
        return resource ? this.toAuctionFromResource(resource) : null;
    }

    /** One quote. Its status is passed through: the four values are all the screen expects. */
    static toQuoteFromResource(resource: FinancialQuoteResource): FinancialQuote {
        const amount = (value: number) => ({value, currency: resource.currency});
        return new FinancialQuote({
            id: resource.quoteId,
            status: resource.status as FinancialQuoteStatus,
            riskGrade: toRiskGrade(resource.riskGrade),
            termDays: resource.termDays,
            fundableAmount: amount(resource.fundableAmount),
            fundingTarget: amount(resource.fundingTarget),
            platformFeeTotal: amount(resource.platformFeeTotal),
            mypeAdvance: amount(resource.mypeAdvance),
            mypeTceaPct: resource.mypeTceaPct,
            validUntil: new Date(resource.validUntil)
        });
    }

    /** The quote of one response. */
    static toQuoteFromResponse(response: AxiosResponse<FinancialQuoteResource>): FinancialQuote {
        return this.toQuoteFromResource(response.data);
    }
}

/** A grade from the wire; anything unexpected reads as still under evaluation. */
function toRiskGrade(value: string): RiskGrade {
    return value === 'A' || value === 'B' || value === 'C' ? value : 'UNDER_EVALUATION';
}

/** A date from the wire, or null when the field is empty or does not parse. */
function toDateOrNull(value: string | null): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
