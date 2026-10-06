/**
 * Wire shape of a user, as returned by sign-up and by `GET /users/{email}`.
 *
 * `roles` is typed as `string[]` rather than the domain union on purpose: this is the
 * shape the API actually sends, and narrowing it is the assembler's job.
 */
export interface UserResource {
    id: string;
    email: string;
    roles: string[];
}
