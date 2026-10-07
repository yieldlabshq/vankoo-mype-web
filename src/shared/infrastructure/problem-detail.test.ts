import {AxiosError, type AxiosResponse} from 'axios';
import {describe, expect, it} from 'vitest';
import {toProblemDetail} from './problem-detail';

function httpError(data: unknown): AxiosError {
    return new AxiosError('Request failed', undefined, undefined, undefined, {data, status: 401} as AxiosResponse);
}

describe('toProblemDetail', () => {
    it('returns the problem+json body of an HTTP error', () => {
        const body = {
            type: 'https://docs.vankoo.dev/errors/unauthenticated',
            title: 'Unauthenticated',
            status: 401,
            detail: 'This endpoint requires a valid bearer token.',
            code: 'unauthenticated'
        };

        expect(toProblemDetail(httpError(body))).toEqual(body);
    });

    it('ignores a body without a code', () => {
        expect(toProblemDetail(httpError({status: 401, title: 'Unauthorized'}))).toBeNull();
    });

    it('ignores a body that is not an object', () => {
        expect(toProblemDetail(httpError('<html>Bad Gateway</html>'))).toBeNull();
    });

    it('ignores errors that are not HTTP errors', () => {
        expect(toProblemDetail(new TypeError('Failed to fetch'))).toBeNull();
    });
});
