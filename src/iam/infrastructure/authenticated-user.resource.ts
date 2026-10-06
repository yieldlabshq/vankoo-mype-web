/**
 * What the IAM service returns after a successful sign-in.
 *
 * Note what is missing: the roles. The service answers with the token and nothing
 * about what the account is allowed to do, so the only way to learn that without a
 * second round trip is to read the JWT — see `session.assembler.ts`.
 */
export interface AuthenticatedUserResource {
    id: string;
    email: string;
    token: string;
}
