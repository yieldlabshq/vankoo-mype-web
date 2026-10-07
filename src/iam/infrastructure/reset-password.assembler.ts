import type {ResetPasswordCommand} from '../domain/model/reset-password.command';

/** Anti-corruption layer for the reset call, which answers 204 and no body. */
export class ResetPasswordAssembler {
    static toRequestFromCommand(command: ResetPasswordCommand) {
        return {token: command.token, password: command.password};
    }
}
