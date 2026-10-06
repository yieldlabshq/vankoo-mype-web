import type {AxiosResponse} from 'axios';
import type {SignUpCommand} from '../domain/model/sign-up.command';
import type {UserResource} from './user.resource';

/** Anti-corruption layer for the sign-up call. */
export class SignUpAssembler {
    /**
     * The body to send.
     *
     * `roles` goes out as a plain array of the literal strings, because
     * `RoleName.valueOf()` on the server is case-sensitive and exact — anything it
     * does not recognise becomes an unhandled exception, and therefore a 500.
     */
    static toRequestFromCommand(command: SignUpCommand) {
        return {
            email: command.email,
            password: command.password,
            roles: [...command.roles]
        };
    }

    /** The created user, or null when the call did not succeed. */
    static toResourceFromResponse(response: AxiosResponse<UserResource>): UserResource | null {
        if (response.status !== 200 && response.status !== 201) return null;
        return response.data;
    }
}
