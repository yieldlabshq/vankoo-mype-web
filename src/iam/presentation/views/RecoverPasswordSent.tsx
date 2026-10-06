import {CircleCheck} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Navigate, useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {useIamStore} from '../../application/iam.store';
import {AuthLayout} from '../components/AuthLayout';
import {iamPaths} from '../iam-paths';

/**
 * Routed view confirming that a reset link is on its way.
 *
 * The wording deliberately does not confirm whether the account exists. Saying so
 * would turn the form before it into a way of asking the service which addresses are
 * registered — and it is also literally what happened: the request was accepted, and
 * whether a mail followed is not something this client was told.
 *
 * Reached only after that request, so without an address in the store there is
 * nothing to confirm and the visitor goes back a step.
 */
export function RecoverPasswordSent() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const recoveryEmail = useIamStore(state => state.recoveryEmail);

    if (!recoveryEmail) return <Navigate to={iamPaths.recoverPassword()} replace />;

    return (
        <AuthLayout>
            <span className="bg-success-bg text-success flex size-14 items-center justify-center rounded-full">
                <CircleCheck className="size-7" />
            </span>

            <h1 className="text-h1 text-fg mt-5 font-bold">{t('iam.recoverSent.title')}</h1>
            <p className="text-body text-fg-secondary mt-2">
                {t('iam.recoverSent.body', {email: recoveryEmail})}
            </p>

            <Button
                type="button"
                variant="secondary"
                size="lg"
                className="mt-6 w-full"
                onClick={() => navigate(iamPaths.signIn())}
            >
                {t('iam.recoverSent.back')}
            </Button>
        </AuthLayout>
    );
}
