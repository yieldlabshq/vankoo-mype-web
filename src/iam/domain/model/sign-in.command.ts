/**
 * Intent to open a session with an email and a password.
 *
 * Not a CRUD write: the body carries credentials rather than a user, and the backend
 * answers with a token instead of the resource that was written.
 */
export class SignInCommand {
    readonly email: string;
    readonly password: string;

    constructor({email, password}: {email: string; password: string}) {
        this.email = email;
        this.password = password;
    }
}
