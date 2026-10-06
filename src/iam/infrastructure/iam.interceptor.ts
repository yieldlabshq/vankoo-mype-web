import type {InternalAxiosRequestConfig} from 'axios';
import {useIamStore} from '../application/iam.store';

/**
 * Attaches the bearer token to outgoing requests while a session is open.
 *
 * It reads the store with `.getState()`, outside React, which only works because the
 * application layer imports nothing from React.
 *
 * This module and the store import each other, and that is safe rather than
 * accidental: the reference to the store is inside the function body, so it is
 * resolved when a request is made, long after both modules have finished evaluating.
 * The gateway deliberately does not import this file, which keeps the cycle down to
 * these two.
 *
 * Every other bounded context — invoicing, profile, wallet — will pass this same
 * function to its own gateway, because the credential belongs to IAM.
 */
export function iamInterceptor(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    const {session} = useIamStore.getState();
    if (session && !session.isExpired()) {
        config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
}
