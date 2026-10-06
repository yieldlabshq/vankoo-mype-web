import type {AxiosResponse} from 'axios';
import type {SignInCommand} from '../domain/model/sign-in.command';
import type {AuthenticatedUserResource} from './authenticated-user.resource';

/** Anti-corruption layer for the sign-in call. */
export class SignInAssembler {
    /** The body to send. */
    static toRequestFromCommand(command: SignInCommand) {
        return {email: command.email, password: command.password};
    }

    /**
     * The authenticated user, or null when the call did not succeed.
     *
     * Returning null rather than throwing keeps the failure a value the store can
     * branch on, and typing it nullable forces the caller to handle it.
     */
    static toResourceFromResponse(
        response: AxiosResponse<AuthenticatedUserResource>
    ): AuthenticatedUserResource | null {
        if (response.status !== 200) return null;
        return response.data;
    }
}
