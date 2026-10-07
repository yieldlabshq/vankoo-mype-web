/**
 * The four roles the IAM service seeds on start-up.
 *
 * A union rather than an enum: the Vite template enables `erasableSyntaxOnly`, which
 * rejects any syntax that emits JavaScript instead of being stripped. The literals
 * carry the `ROLE_` prefix because that is exactly what `RoleName.valueOf()` expects
 * on the server — it is case-sensitive, and anything else is a 500.
 */
export type RoleName = 'ROLE_USER' | 'ROLE_ADMIN' | 'ROLE_MYPE' | 'ROLE_INVESTOR';

/** Attributes a user is built from. */
export interface UserAttributes {
    id?: string | null;
    email?: string;
    roles?: readonly RoleName[];
}

/**
 * A user account in the IAM context.
 *
 * The identity is a UUID string, not a number: the aggregate uses UUIDv7 as its
 * primary key, so the usual `Number(id)` coercion would destroy it.
 *
 * IAM owns three facts and nothing else — email, password and roles. Everything a
 * person would recognise as their profile (business name, RUC, phone) belongs to
 * profile-service, which builds an empty shell from the Kafka event this account
 * publishes when it is created.
 */
export class User {
    readonly id: string | null;
    readonly email: string;
    readonly roles: readonly RoleName[];

    constructor({id = null, email = '', roles = []}: UserAttributes = {}) {
        this.id = id;
        this.email = email;
        this.roles = roles;
    }

    /** Whether this account carries the given role. */
    hasRole(role: RoleName): boolean {
        return this.roles.includes(role);
    }

    /**
     * Whether this account belongs to a small business rather than an investor.
     *
     * `roles` is the only discriminator in the whole system: profile-service reads it
     * off the same event to decide whether to create a Company or an Investor.
     */
    isMype(): boolean {
        return this.hasRole('ROLE_MYPE');
    }

    /** Whether this account belongs to an investor, who belongs in the mobile app. */
    isInvestor(): boolean {
        return this.hasRole('ROLE_INVESTOR');
    }
}
