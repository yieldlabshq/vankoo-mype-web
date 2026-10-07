import {describe, expect, it} from 'vitest';
import {
    ALL_INVOICE_STATUSES,
    isInvoiceInProgress,
    isInvoiceStatus,
    presentationForStatus,
    railStateFor,
    type InvoiceStatus
} from './invoice-status';

describe('isInvoiceStatus', () => {
    it.each(ALL_INVOICE_STATUSES)('recognises %s', status => {
        expect(isInvoiceStatus(status)).toBe(true);
    });

    it.each(['', 'uploaded', 'PAID', 'IN_AUCTION'])('rejects the unknown status "%s"', value => {
        expect(isInvoiceStatus(value)).toBe(false);
    });
});

describe('presentationForStatus', () => {
    it.each(ALL_INVOICE_STATUSES)('gives %s a label and colours of its own', status => {
        const presentation = presentationForStatus(status);

        expect(presentation.labelKey).toBe(`invoicing.status.${status}`);
        expect(presentation.fgClass).toMatch(/^text-status-/);
        expect(presentation.bgClass).toMatch(/^bg-status-.*-bg$/);
    });
});

describe('railStateFor', () => {
    it.each<[InvoiceStatus, number]>([
        ['UPLOADED', 0],
        ['OCR_PROCESSING', 1],
        ['DATA_EXTRACTED', 1],
        ['CONSISTENCY_PASSED', 2],
        ['SUNAT_VALIDATING', 2],
        ['SUNAT_VALIDATED', 2],
        ['APPROVED', 3],
        ['PUBLISHED', 4]
    ])('places %s on milestone %i and advances automatically', (status, index) => {
        expect(railStateFor(status)).toEqual({currentIndex: index, currentState: 'automatic'});
    });

    it('asks for attention when the invoice requires review', () => {
        expect(railStateFor('REQUIRES_REVIEW')).toEqual({currentIndex: 1, currentState: 'attention'});
    });

    it('blocks the rail when the invoice is not eligible', () => {
        expect(railStateFor('NOT_ELIGIBLE')).toEqual({currentIndex: 2, currentState: 'blocked'});
    });

    it('has no rail for a rejected invoice', () => {
        expect(railStateFor('REJECTED')).toBeNull();
    });
});

describe('isInvoiceInProgress', () => {
    it.each<InvoiceStatus>(['UPLOADED', 'OCR_PROCESSING', 'SUNAT_VALIDATING', 'APPROVED'])(
        'is in progress while %s',
        status => {
            expect(isInvoiceInProgress(status)).toBe(true);
        }
    );

    it.each<InvoiceStatus>(['PUBLISHED', 'REQUIRES_REVIEW', 'NOT_ELIGIBLE', 'REJECTED'])(
        'is not in progress once %s',
        status => {
            expect(isInvoiceInProgress(status)).toBe(false);
        }
    );
});
