import {describe, expect, it} from 'vitest';
import {FinancialQuote} from './financial-quote.entity';

function quoteWith(fundable: number, target: number, validUntil = new Date('2026-10-10T12:00:00Z')): FinancialQuote {
    const soles = (value: number) => ({value, currency: 'PEN'});
    return new FinancialQuote({
        id: 'quote-1',
        status: 'ACTIVE',
        riskGrade: 'B',
        termDays: 60,
        fundableAmount: soles(fundable),
        fundingTarget: soles(target),
        platformFeeTotal: soles(25),
        mypeAdvance: soles(target - 25),
        mypeTceaPct: 18.5,
        validUntil
    });
}

describe('FinancialQuote.discount', () => {
    it('is the difference between the fundable amount and the funding target', () => {
        expect(quoteWith(1000, 970).discount()).toEqual({amount: {value: 30, currency: 'PEN'}, percentage: 3});
    });

    it('is zero percent when nothing is fundable', () => {
        expect(quoteWith(0, 0).discount().percentage).toBe(0);
    });
});

describe('FinancialQuote.isExpiredAt', () => {
    const quote = quoteWith(1000, 970, new Date('2026-10-10T12:00:00Z'));

    it('is valid before its deadline', () => {
        expect(quote.isExpiredAt(new Date('2026-10-10T11:59:59Z'))).toBe(false);
    });

    it('expires exactly at its deadline', () => {
        expect(quote.isExpiredAt(new Date('2026-10-10T12:00:00Z'))).toBe(true);
    });
});
