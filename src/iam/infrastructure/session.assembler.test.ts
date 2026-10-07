import {describe, expect, it} from 'vitest';
import {SessionAssembler} from './session.assembler';

function base64Url(value: string): string {
    const bytes = new TextEncoder().encode(value);
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function tokenWith(claims: Record<string, unknown>): string {
    return `${base64Url('{"alg":"HS256"}')}.${base64Url(JSON.stringify(claims))}.signature`;
}

const FUTURE = Math.floor(Date.now() / 1000) + 3600;

describe('SessionAssembler.toSessionFromToken', () => {
    it('reads the user and expiration from the token claims', () => {
        const session = SessionAssembler.toSessionFromToken(
            tokenWith({sub: 'user-123', email: 'josé@vankoo.pe', roles: ['ROLE_MYPE'], exp: FUTURE})
        );

        expect(session?.user.id).toBe('user-123');
        expect(session?.user.email).toBe('josé@vankoo.pe');
        expect(session?.user.isMype()).toBe(true);
        expect(session?.expiresAt).toEqual(new Date(FUTURE * 1000));
        expect(session?.isExpired()).toBe(false);
    });

    it('prefers the id and email returned by the sign-in response', () => {
        const session = SessionAssembler.toSessionFromResource({
            id: 'user-from-api',
            email: 'carlos@vankoo.pe',
            token: tokenWith({sub: 'user-123', email: 'old@vankoo.pe', roles: [], exp: FUTURE})
        });

        expect(session?.user.id).toBe('user-from-api');
        expect(session?.user.email).toBe('carlos@vankoo.pe');
    });

    it('drops roles the app does not know', () => {
        const session = SessionAssembler.toSessionFromToken(
            tokenWith({sub: 'user-123', email: 'a@vankoo.pe', roles: ['ROLE_MYPE', 'ROLE_ROOT'], exp: FUTURE})
        );

        expect(session?.user.roles).toEqual(['ROLE_MYPE']);
    });

    it('marks a session past its expiration as expired', () => {
        const session = SessionAssembler.toSessionFromToken(
            tokenWith({sub: 'user-123', email: 'a@vankoo.pe', roles: [], exp: 1})
        );

        expect(session?.isExpired()).toBe(true);
    });

    it.each([
        ['a token without payload', 'header-only'],
        ['a payload that is not JSON', `header.${base64Url('not json')}.sig`],
        ['claims without email', tokenWith({sub: 'user-123', roles: [], exp: FUTURE})],
        ['roles that are not a list', tokenWith({sub: 'user-123', email: 'a@vankoo.pe', roles: 'ROLE_MYPE', exp: FUTURE})]
    ])('returns null for %s', (_, token) => {
        expect(SessionAssembler.toSessionFromToken(token)).toBeNull();
    });
});
