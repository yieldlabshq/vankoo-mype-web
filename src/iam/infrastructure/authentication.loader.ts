import {redirect} from 'react-router';
import {useIamStore} from '../application/iam.store';
import {iamPaths} from '../presentation/iam-paths';

/**
 * Keeps visitors without a valid session out of the routes that require an account.
 *
 * A loader runs before the route's component renders, so an unauthenticated visitor
 * never sees a flash of the protected screen. It reads the store with `.getState()`
 * because a loader is not a component and has no hooks available to it.
 *
 * An expired token is treated exactly like no token at all. That check matters here
 * rather than later: the JWT lasts seven days and there is no refresh, so a returning
 * visitor routinely arrives holding one that has run out, and without this they would
 * get through the guard and meet a 401 instead of a sign-in form.
 */
export function authenticationLoader() {
    const {session} = useIamStore.getState();
    if (!session || session.isExpired()) return redirect(iamPaths.signIn());
    return null;
}
