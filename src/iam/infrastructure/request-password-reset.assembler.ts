import type {RequestPasswordResetCommand} from '../domain/model/request-password-reset.command';

/**
 * Anti-corruption layer for the recovery request.
 *
 * Only a request mapping: the endpoint answers 202 with an empty body on purpose, so
 * there is no resource to read back. A `toResourceFromResponse` here would be a
 * function whose only honest return value is null.
 */
export class RequestPasswordResetAssembler {
    static toRequestFromCommand(command: RequestPasswordResetCommand) {
        return {email: command.email};
    }
}
