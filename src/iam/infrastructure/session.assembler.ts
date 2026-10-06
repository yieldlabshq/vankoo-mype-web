import {Session} from '../domain/model/session.entity';
import {User, type RoleName} from '../domain/model/user.entity';
import type {AuthenticatedUserResource} from './authenticated-user.resource';

const KNOWN_ROLES: readonly string[] = ['ROLE_USER', 'ROLE_ADMIN', 'ROLE_MYPE', 'ROLE_INVESTOR'];

/** The claims the IAM service puts in the token. */
interface TokenClaims {
    sub: string;
    email: string;
    roles: string[];
    exp: number;
}

/**
 * Narrows the decoded payload, which arrives as `unknown`.
 *
 * The assembler is the boundary where an unknown shape becomes a known one, so the
 * check belongs here rather than a cast somewhere downstream.
 */
function isTokenClaims(value: unknown): value is TokenClaims {
    if (typeof value !== 'object' || value === null) return false;
    const claims = value as Record<string, unknown>;
    return typeof claims.sub === 'string'
        && typeof claims.email === 'string'
        && typeof claims.exp === 'number'
        && Array.isArray(claims.roles)
        && claims.roles.every(role => typeof role === 'string');
}

/**
 * Reads the payload of a JWT without verifying it.
 *
 * Verification is the server's job and cannot be done here anyway — the signing
 * secret never reaches the browser. This only reads what the server already told us,
 * to save a round trip to `GET /users/{email}`; nothing here is a security decision.
 *
 * `TextDecoder` rather than `atob` alone because `atob` yields one byte per
 * character, which mangles any non-ASCII in an email address.
 */
function decodePayload(token: string): unknown {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    try {
        const bytes = Uint8Array.from(atob(padded), character => character.charCodeAt(0));
        return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
    } catch {
        return null;
    }
}

/**
 * Turns a token into the session the app runs on.
 *
 * This exists because sign-in answers with a token and no roles. Rather than firing a
 * second request to `GET /users/{email}` on every sign-in, the roles are read from
 * the `roles` claim the service already put in the token.
 */
export class SessionAssembler {
    /** Builds a session from the sign-in response, or null when the token is unusable. */
    static toSessionFromResource(resource: AuthenticatedUserResource): Session | null {
        return this.toSessionFromToken(resource.token, resource.id, resource.email);
    }

    /**
     * Builds a session from a bare token, for restoring one that survived a reload.
     *
     * `id` and `email` are optional overrides: on sign-in the response body is the
     * authority for both, while a token read back from storage is all there is.
     */
    static toSessionFromToken(token: string, id?: string, email?: string): Session | null {
        const claims = decodePayload(token);
        if (!isTokenClaims(claims)) return null;

        // An unknown role is dropped rather than carried as a lie: the union says
        // what the app understands, and a fifth role would be new to it.
        const roles = claims.roles.filter((role): role is RoleName => KNOWN_ROLES.includes(role));

        return new Session({
            token,
            user: new User({id: id ?? claims.sub, email: email ?? claims.email, roles}),
            expiresAt: new Date(claims.exp * 1000)
        });
    }
}
