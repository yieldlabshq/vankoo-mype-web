import {AxiosError, type AxiosResponse} from 'axios';
import {describe, expect, it} from 'vitest';
import {investmentErrorKind, investmentErrorMessage} from './investment-error';

function httpError(status: number, data: unknown): AxiosError {
    return new AxiosError('Request failed', undefined, undefined, undefined, {data, status} as AxiosResponse);
}

describe('investmentErrorMessage', () => {
    it('reads the message the service returned', () => {
        expect(investmentErrorMessage(httpError(409, {message: 'Quote is not active'}))).toBe('Quote is not active');
    });

    it('is empty when the body carries no message', () => {
        expect(investmentErrorMessage(httpError(500, 'Internal Server Error'))).toBe('');
    });

    it('is empty for errors that are not HTTP errors', () => {
        expect(investmentErrorMessage(new Error('boom'))).toBe('');
    });
});

describe('investmentErrorKind', () => {
    it('recognises a quote that is no longer active', () => {
        expect(investmentErrorKind(httpError(409, {message: 'Financial quote is NOT ACTIVE'}))).toBe('quoteNotActive');
    });

    it('recognises an invoice too close to its due date', () => {
        expect(
            investmentErrorKind(httpError(409, {message: 'Invoice is too close to its due date to open an auction'}))
        ).toBe('tooCloseToDueDate');
    });

    it('does not guess for a conflict it does not recognise', () => {
        expect(investmentErrorKind(httpError(409, {message: 'Something else'}))).toBe('unknown');
    });

    it('only interprets conflicts', () => {
        expect(investmentErrorKind(httpError(400, {message: 'Quote is not active'}))).toBe('unknown');
    });
});
