import type {AxiosResponse} from 'axios';
import {describe, expect, it} from 'vitest';
import {InvoiceAssembler} from './invoice.assembler';
import type {InvoiceDetailResource} from './invoice-detail.resource';
import type {InvoiceListItemResource} from './invoice-list.resource';
import type {InvoiceResource} from './invoice.resource';

function responseOf<T>(data: T, status = 200): AxiosResponse<T> {
    return {data, status} as AxiosResponse<T>;
}

const listItem: InvoiceListItemResource = {
    id: 'inv-1',
    number: 'E001-4',
    payerName: 'Universidad Nacional de Ingeniería',
    payerRuc: '20169004359',
    dueDate: '2026-12-15',
    status: 'APPROVED',
    amount: {value: 1650, currency: 'PEN'}
};

const detail: InvoiceDetailResource = {
    invoiceId: 'inv-1',
    mypeId: 'mype-1',
    status: 'REQUIRES_REVIEW',
    sunatVerificationStatus: 'PENDING',
    consistencyStatus: 'FAILED',
    eligibleForFunding: false,
    integrationEventStatus: 'NOT_SENT',
    fiscalInvoiceNumber: 'E001-4',
    issuerRuc: '20573093420',
    issuerName: null,
    issuerTradeName: 'Alvacor',
    payerRuc: '20169004359',
    payerName: 'Universidad Nacional de Ingeniería',
    issueDate: '2026-10-01',
    dueDate: 'not-a-date',
    currency: 'PEN',
    subtotal: 1398.31,
    tax: 251.69,
    discount: null,
    total: 1650,
    items: [{description: 'Servicio de ingeniería', quantity: 1, unitPrice: 1398.31, subtotal: 1398.31}],
    validationIssues: [
        {code: 'TOTALS_DO_NOT_RECONCILE', message: 'Los totales no cuadran', severity: 'ERROR'},
        {code: 'LOW_OCR_CONFIDENCE', message: 'Fecha poco legible', severity: 'WARNING'}
    ]
};

describe('InvoiceAssembler.toInvoiceIdFromResponse', () => {
    it('returns the id of a created invoice', () => {
        const response = responseOf({invoiceId: 'inv-1'} as InvoiceResource, 201);

        expect(InvoiceAssembler.toInvoiceIdFromResponse(response)).toBe('inv-1');
    });

    it('returns null for any other status', () => {
        const response = responseOf({invoiceId: 'inv-1'} as InvoiceResource, 202);

        expect(InvoiceAssembler.toInvoiceIdFromResponse(response)).toBeNull();
    });
});

describe('InvoiceAssembler.toInvoicesFromResponse', () => {
    it('maps a plain list of invoices', () => {
        const invoices = InvoiceAssembler.toInvoicesFromResponse(responseOf([listItem]));

        expect(invoices).toHaveLength(1);
        expect(invoices[0].number).toBe('E001-4');
        expect(invoices[0].dueDate).toEqual(new Date('2026-12-15'));
        expect(invoices[0].status).toBe('APPROVED');
    });

    it('flattens a list grouped by key', () => {
        const grouped = {approved: [listItem], published: [{...listItem, id: 'inv-2', status: 'PUBLISHED'}]};

        const invoices = InvoiceAssembler.toInvoicesFromResponse(responseOf(grouped));

        expect(invoices.map(invoice => invoice.id)).toEqual(['inv-1', 'inv-2']);
    });

    it('drops invoices with a status the app does not know', () => {
        const invoices = InvoiceAssembler.toInvoicesFromResponse(
            responseOf([listItem, {...listItem, id: 'inv-3', status: 'ARCHIVED'}])
        );

        expect(invoices.map(invoice => invoice.id)).toEqual(['inv-1']);
    });
});

describe('InvoiceAssembler.toInvoiceDetailFromResponse', () => {
    it('maps the OCR data, totals and first validation issue', () => {
        const invoice = InvoiceAssembler.toInvoiceDetailFromResponse(responseOf(detail));

        expect(invoice).not.toBeNull();
        expect(invoice?.issuerName).toBe('Alvacor');
        expect(invoice?.issuedAt).toEqual(new Date('2026-10-01'));
        expect(invoice?.totals?.total).toEqual({value: 1650, currency: 'PEN'});
        expect(invoice?.totals?.commercialDiscount).toEqual({value: 0, currency: 'PEN'});
        expect(invoice?.lineItems[0].unitPrice).toEqual({value: 1398.31, currency: 'PEN'});
        expect(invoice?.alertMessage).toBe('Los totales no cuadran');
    });

    it('turns an unreadable date into null instead of an invalid date', () => {
        expect(InvoiceAssembler.toInvoiceDetailFromResponse(responseOf(detail))?.dueDate).toBeNull();
    });

    it('has no totals until the OCR reads the total', () => {
        const invoice = InvoiceAssembler.toInvoiceDetailFromResponse(responseOf({...detail, total: null}));

        expect(invoice?.totals).toBeNull();
    });

    it('labels line items in soles when the currency is still unknown', () => {
        const invoice = InvoiceAssembler.toInvoiceDetailFromResponse(responseOf({...detail, currency: null}));

        expect(invoice?.currency).toBeNull();
        expect(invoice?.lineItems[0].subtotal.currency).toBe('PEN');
    });

    it('has no alert when the service reported no issues', () => {
        const invoice = InvoiceAssembler.toInvoiceDetailFromResponse(responseOf({...detail, validationIssues: []}));

        expect(invoice?.alertMessage).toBeNull();
    });

    it('returns null for a status the app does not know', () => {
        expect(InvoiceAssembler.toInvoiceDetailFromResponse(responseOf({...detail, status: 'ARCHIVED'}))).toBeNull();
    });
});
