/**
 * Every URL the IAM context owns, built in one place.
 *
 * React Router has no named routes, so a path typed into `navigate()` is a broken
 * link waiting for someone to rename a segment. These builders give the guarantee a
 * route name would: change a segment here and every caller follows.
 */
export const iamPaths = {
    signIn: () => '/iam/sign-in',
    signUp: () => '/iam/sign-up',
    recoverPassword: () => '/iam/recover',
    recoverPasswordSent: () => '/iam/recover/sent',
    /** Where the link in the recovery email lands. The token rides in `?token=`. */
    resetPassword: () => '/iam/reset'
} as const;
