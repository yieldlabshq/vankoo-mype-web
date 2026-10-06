import type {RouteObject} from 'react-router';
import {RecoverPassword} from './views/RecoverPassword';
import {RecoverPasswordSent} from './views/RecoverPasswordSent';
import {ResetPassword} from './views/ResetPassword';
import {SignIn} from './views/SignIn';
import {SignUp} from './views/SignUp';

/**
 * Routes of the IAM bounded context, mounted by the root router under `/iam`.
 *
 * Paths stay relative here; `iam-paths.ts` owns the absolute ones. None of these
 * carry the authentication loader — they are the way in.
 */
export const iamRoutes: RouteObject[] = [
    {path: 'sign-in', Component: SignIn},
    {path: 'sign-up', Component: SignUp},
    {path: 'recover', Component: RecoverPassword},
    {path: 'recover/sent', Component: RecoverPasswordSent},
    {path: 'reset', Component: ResetPassword}
];
