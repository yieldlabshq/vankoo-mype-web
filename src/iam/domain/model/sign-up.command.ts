import type {RoleName} from './user.entity';

/**
 * Intent to create an account.
 *
 * `roles` is required and has no default even though the server would fall back to
 * `ROLE_USER`, because that fallback is a trap: profile-service only reacts to
 * `ROLE_MYPE` and `ROLE_INVESTOR`, so an account created without a role registers
 * successfully and then never gets a profile. Making the caller say it out loud is
 * the point of a command having no defaults.
 */
export class SignUpCommand {
    readonly email: string;
    readonly password: string;
    readonly roles: readonly RoleName[];

    constructor({email, password, roles}: {
        email: string;
        password: string;
        roles: readonly RoleName[];
    }) {
        this.email = email;
        this.password = password;
        this.roles = roles;
    }
}
