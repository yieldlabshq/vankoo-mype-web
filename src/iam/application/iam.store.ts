import {create} from 'zustand';
import {IamApi} from '../infrastructure/iam-api';
import {iamInterceptor} from '../infrastructure/iam.interceptor';
import {SessionAssembler} from '../infrastructure/session.assembler';
import {SignInAssembler} from '../infrastructure/sign-in.assembler';
import {SignUpAssembler} from '../infrastructure/sign-up.assembler';
import type {RequestPasswordResetCommand} from '../domain/model/request-password-reset.command';
import type {ResetPasswordCommand} from '../domain/model/reset-password.command';
import type {Session} from '../domain/model/session.entity';
import type {SignInCommand} from '../domain/model/sign-in.command';
import type {SignUpCommand} from '../domain/model/sign-up.command';

/** Where the token survives a reload. Persistence is an application-layer decision. */
export const TOKEN_STORAGE_KEY = 'vankoo.iam.token';

const iamApi = new IamApi({requestInterceptors: [iamInterceptor]});

/**
 * Rebuilds the session from whatever the last visit left behind.
 *
 * Runs synchronously while the store's initial state is built, so a route loader
 * asking `.getState()` on the very first navigation already has an answer. An expired
 * or unreadable token is discarded here rather than carried forward to fail later.
 */
function restoreSession(): Session | null {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) return null;
    const session = SessionAssembler.toSessionFromToken(token);
    if (!session || session.isExpired()) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        return null;
    }
    return session;
}

/** State and use cases of the IAM bounded context. */
export interface IamState {
    session: Session | null;
    errors: Error[];
    submitting: boolean;
    /** Carries the address from sign-up to sign-in, so the form arrives filled in. */
    signedUpEmail: string | null;
    /** Carries the address to the confirmation screen, so it can say where it wrote. */
    recoveryEmail: string | null;
    signIn: (command: SignInCommand) => Promise<boolean>;
    signUp: (command: SignUpCommand) => Promise<boolean>;
    requestPasswordReset: (command: RequestPasswordResetCommand) => Promise<boolean>;
    resetPassword: (command: ResetPasswordCommand) => Promise<boolean>;
    signOut: () => void;
    clearErrors: () => void;
}

/**
 * The application layer of the IAM context.
 *
 * The only thing that talks to `IamApi`, and the only place an assembler is called.
 * It imports nothing from React, which is what lets the route loader and the axios
 * interceptor read it with `useIamStore.getState()`.
 *
 * `signIn` and `signUp` resolve to a boolean rather than void, breaking with the
 * usual shape on purpose: both views have to decide whether to navigate, and the
 * outcome is the only honest way to tell them. The navigation itself stays in the
 * view, because `useNavigate` is a hook and this file cannot hold one.
 */
export const useIamStore = create<IamState>()(set => ({
    session: restoreSession(),
    errors: [],
    submitting: false,
    signedUpEmail: null,
    recoveryEmail: null,

    signIn: async (command: SignInCommand) => {
        set({submitting: true, errors: []});
        try {
            const response = await iamApi.signIn(command);
            const resource = SignInAssembler.toResourceFromResponse(response);
            const session = resource && SessionAssembler.toSessionFromResource(resource);
            if (!session) {
                // Nothing threw: the call answered, and the answer was unusable. The
                // message is diagnostic and never reaches a screen — the view has its
                // own wording for a failure the server did not explain.
                set({errors: [new Error('Sign-in answered without a usable session')], submitting: false});
                return false;
            }
            localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
            set({session, submitting: false, signedUpEmail: null});
            return true;
        } catch (error) {
            // The error is stored as it arrived, not as a sentence. Wording it here
            // would freeze it in one language, and the store is the wrong place to
            // decide what a user reads anyway.
            set({errors: [error as Error], submitting: false});
            return false;
        }
    },

    signUp: async (command: SignUpCommand) => {
        set({submitting: true, errors: []});
        try {
            const response = await iamApi.signUp(command);
            const resource = SignUpAssembler.toResourceFromResponse(response);
            if (!resource) {
                set({errors: [new Error('Sign-up answered without a user')], submitting: false});
                return false;
            }
            // Sign-up answers without a token, so there is no session to open here:
            // the user goes to sign in, and this is what fills the form for them.
            set({signedUpEmail: resource.email, submitting: false});
            return true;
        } catch (error) {
            set({errors: [error as Error], submitting: false});
            return false;
        }
    },

    requestPasswordReset: async (command: RequestPasswordResetCommand) => {
        set({submitting: true, errors: []});
        try {
            await iamApi.requestPasswordReset(command);
            // True regardless of whether that address has an account: the service
            // answers 202 either way, and asking again here would undo the point.
            set({recoveryEmail: command.email, submitting: false});
            return true;
        } catch (error) {
            set({errors: [error as Error], submitting: false});
            return false;
        }
    },

    resetPassword: async (command: ResetPasswordCommand) => {
        set({submitting: true, errors: []});
        try {
            await iamApi.resetPassword(command);
            // The link is spent and the address it belonged to is no longer needed.
            set({recoveryEmail: null, submitting: false});
            return true;
        } catch (error) {
            set({errors: [error as Error], submitting: false});
            return false;
        }
    },

    signOut: () => {
        // There is no logout endpoint: the service is stateless and the token stays
        // valid until it expires. Signing out is forgetting it on this device.
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        set({session: null, errors: [], signedUpEmail: null, recoveryEmail: null});
    },

    clearErrors: () => set({errors: []})
}));
