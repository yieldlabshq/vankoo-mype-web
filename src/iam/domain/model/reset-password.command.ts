/**
 * Intent to set a new password using a link received by email.
 *
 * The token is the credential here — there is no session yet — so it is required and
 * has no default, like every other field of a command in this context.
 */
export class ResetPasswordCommand {
    readonly token: string;
    readonly password: string;

    constructor({token, password}: {token: string; password: string}) {
        this.token = token;
        this.password = password;
    }
}
