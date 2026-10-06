import {User} from './user.entity';

/** Attributes a session is built from. */
export interface SessionAttributes {
    token: string;
    user: User;
    expiresAt: Date;
}

/**
 * An authenticated session: the bearer token and who it belongs to.
 *
 * This is a client-side concept. The IAM service is stateless — there is no logout
 * endpoint and no refresh token — so signing out is deleting this object, and the
 * only thing standing between a stale token and a confusing 401 is `isExpired()`.
 * The token lasts seven days, which is long enough that a returning visitor will
 * routinely find one that has run out.
 *
 * `user` is hydrated in the constructor so a session is never half domain and half
 * payload, and rebuilding one from an existing session stays safe.
 */
export class Session {
    readonly token: string;
    readonly user: User;
    readonly expiresAt: Date;

    constructor({token, user, expiresAt}: SessionAttributes) {
        this.token = token;
        this.user = user instanceof User ? user : new User(user);
        this.expiresAt = expiresAt;
    }

    /**
     * Whether the token has run out and the user has to sign in again.
     *
     * Asked before every protected navigation. Without it the app would let someone
     * through the route guard and only discover the problem when the API answered
     * 401, which is a worse place to find out.
     */
    isExpired(): boolean {
        return this.expiresAt.getTime() <= Date.now();
    }
}
