/**
 * Intent to start a password recovery.
 *
 * Nothing but the address, and nothing comes back: the service answers the same
 * whether or not it knows the account, so there is no outcome to model.
 */
export class RequestPasswordResetCommand {
    readonly email: string;

    constructor({email}: {email: string}) {
        this.email = email;
    }
}
