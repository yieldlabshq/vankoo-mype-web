import {describe, expect, it} from 'vitest';
import {Auction} from '../../investment/domain/model/auction.entity';
import type {AuctionStatus} from '../../investment/domain/model/auction-status';
import {InvoiceDetail} from '../domain/model/invoice-detail.entity';
import type {InvoiceStatus} from '../domain/model/invoice-status';
import {isAwaitingAuction, progressFor, railCaptionKey} from './rail-caption';

function invoiceWith(status: InvoiceStatus): InvoiceDetail {
    return new InvoiceDetail({
        id: 'inv-1',
        number: 'E001-4',
        status,
        issuerName: null,
        issuerRuc: null,
        payerName: null,
        payerRuc: null,
        issuedAt: null,
        dueDate: null,
        currency: 'PEN',
        fiscalNumber: null,
        lineItems: [],
        totals: null,
        alertMessage: null
    });
}

function auctionWith(status: AuctionStatus): Auction {
    return new Auction({
        id: 'auc-1',
        invoiceId: 'inv-1',
        status,
        riskGrade: 'A',
        targetAmount: null,
        currentFunding: {value: 0, currency: 'PEN'},
        publishedAt: null,
        expiresAt: null,
        acceptedQuote: null
    });
}

describe('railCaptionKey', () => {
    it('builds the key from the milestone and its state', () => {
        expect(railCaptionKey({currentIndex: 2, currentState: 'blocked'})).toBe(
            'invoicing.detail.railCaption.validating.blocked'
        );
    });
});

describe('progressFor', () => {
    it('follows the invoice while there is no auction', () => {
        expect(progressFor(invoiceWith('SUNAT_VALIDATING'), null)).toEqual({
            rail: {currentIndex: 2, currentState: 'automatic'},
            status: 'SUNAT_VALIDATING'
        });
    });

    it('asks the MYPE to act once the auction can be quoted', () => {
        expect(progressFor(invoiceWith('CONSISTENCY_PASSED'), auctionWith('DRAFT'))).toEqual({
            rail: {currentIndex: 3, currentState: 'attention'},
            status: 'APPROVED'
        });
    });

    it.each<AuctionStatus>(['PUBLISHED', 'FUNDING', 'FULLY_FUNDED', 'CLOSED'])(
        'shows the invoice in auction when the auction is %s',
        status => {
            expect(progressFor(invoiceWith('APPROVED'), auctionWith(status)).status).toBe('PUBLISHED');
        }
    );
});

describe('isAwaitingAuction', () => {
    it('waits while the invoice passed its checks and no auction exists yet', () => {
        expect(isAwaitingAuction(invoiceWith('CONSISTENCY_PASSED'), null)).toBe(true);
    });

    it('waits while the auction is under risk evaluation', () => {
        expect(isAwaitingAuction(invoiceWith('CONSISTENCY_PASSED'), auctionWith('PENDING_VERIFICATION_RISK'))).toBe(
            true
        );
    });

    it('stops waiting once the auction is a draft', () => {
        expect(isAwaitingAuction(invoiceWith('CONSISTENCY_PASSED'), auctionWith('DRAFT'))).toBe(false);
    });

    it('does not wait for an invoice that has not passed its checks', () => {
        expect(isAwaitingAuction(invoiceWith('OCR_PROCESSING'), null)).toBe(false);
    });
});
