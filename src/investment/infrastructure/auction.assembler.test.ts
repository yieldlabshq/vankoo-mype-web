import type {AxiosResponse} from 'axios';
import {describe, expect, it} from 'vitest';
import {AuctionAssembler} from './auction.assembler';
import type {AuctionResource} from './auction.resource';
import type {FinancialQuoteResource} from './financial-quote.resource';

const quote: FinancialQuoteResource = {
    quoteId: 'quote-1',
    status: 'ACCEPTED',
    pricingVersion: 'v1',
    riskGrade: 'A',
    currency: 'PEN',
    termDays: 60,
    fundableAmount: 1000,
    investorTeaPct: 12,
    investorTermRatePct: 1.9,
    fundingTarget: 981,
    investorGrossProfit: 19,
    platformMonthlyFeeRatePct: 0.5,
    platformFeeBase: 10,
    platformFeeTaxRatePct: 18,
    platformFeeTax: 1.8,
    platformFeeTotal: 11.8,
    mypeAdvance: 969.2,
    mypeTotalCost: 30.8,
    mypeTceaPct: 20.1,
    createdAt: '2026-10-01T10:00:00Z',
    validUntil: '2026-10-02T10:00:00Z',
    acceptedAt: '2026-10-01T11:00:00Z'
};

const auction: AuctionResource = {
    auctionId: 'auc-1',
    invoiceId: 'inv-1',
    mypeId: 'mype-1',
    status: 'PUBLISHED',
    riskGrade: 'A',
    invoiceAmount: 1000,
    fundableAmount: 1000,
    targetAmount: 981,
    currentFunding: 200,
    currency: 'PEN',
    payerRuc: '20169004359',
    payerName: 'UNI',
    dueDate: '2026-12-15',
    greenCertified: false,
    fullBalanceOutstandingConfirmed: true,
    assessmentId: 'assess-1',
    assessedAt: '2026-10-01T09:00:00Z',
    publishedAt: '2026-10-01T11:00:00Z',
    expiresAt: null,
    closedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    acceptedQuote: quote
};

describe('AuctionAssembler.toAuctionFromResource', () => {
    it('maps amounts in the auction currency and its accepted quote', () => {
        const result = AuctionAssembler.toAuctionFromResource(auction);

        expect(result?.targetAmount).toEqual({value: 981, currency: 'PEN'});
        expect(result?.currentFunding).toEqual({value: 200, currency: 'PEN'});
        expect(result?.publishedAt).toEqual(new Date('2026-10-01T11:00:00Z'));
        expect(result?.expiresAt).toBeNull();
        expect(result?.acceptedQuote?.mypeAdvance).toEqual({value: 969.2, currency: 'PEN'});
        expect(result?.isPublished()).toBe(true);
    });

    it('treats an unknown risk grade as still under evaluation', () => {
        expect(AuctionAssembler.toAuctionFromResource({...auction, riskGrade: 'Z'})?.riskGrade).toBe(
            'UNDER_EVALUATION'
        );
    });

    it('keeps a missing target amount as null', () => {
        expect(AuctionAssembler.toAuctionFromResource({...auction, targetAmount: null})?.targetAmount).toBeNull();
    });

    it('returns null for a status the app does not know', () => {
        expect(AuctionAssembler.toAuctionFromResource({...auction, status: 'ARCHIVED'})).toBeNull();
    });
});

describe('AuctionAssembler.toAuctionForInvoiceFromResponse', () => {
    const response = {data: [auction, {...auction, auctionId: 'auc-2', invoiceId: 'inv-2'}]} as AxiosResponse<
        AuctionResource[]
    >;

    it('picks the auction of the given invoice', () => {
        expect(AuctionAssembler.toAuctionForInvoiceFromResponse(response, 'inv-2')?.id).toBe('auc-2');
    });

    it('returns null when the invoice has no auction yet', () => {
        expect(AuctionAssembler.toAuctionForInvoiceFromResponse(response, 'inv-9')).toBeNull();
    });
});
