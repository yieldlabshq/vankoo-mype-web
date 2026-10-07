import {useEffect, useState, type FormEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useSearchParams} from 'react-router';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {FieldGroup} from '@/components/ui/field';
import {Spinner} from '@/components/ui/spinner';
import {useIamStore} from '../../application/iam.store';
import {ResetPasswordCommand} from '../../domain/model/reset-password.command';
import {AuthLayout} from '../components/AuthLayout';
import {IamErrorAlert} from '../components/IamErrorAlert';
import {PasswordField} from '../components/PasswordField';
import {iamPaths} from '../iam-paths';

/** The shortest password this form will submit. A courtesy to the user, not a rule. */
const MINIMUM_PASSWORD_LENGTH = 8;

/**
 * Where the link in the recovery email lands.
 *
 * **This screen has no mockup.** The IAM set in Figma has four, and consuming a reset
 * link needs a fifth that was never designed, because the backend it depends on did
 * not exist when they were drawn. It is built from the same tokens and the same
 * components as its neighbours, and it should be designed properly before anyone
 * calls it finished.
 *
 * The token is taken out of the address bar as soon as it is read. It is a bearer
 * credential for the next half hour, and a URL is the least private place in a
 * browser: it survives in history, and it leaves in the `Referer` of anything the
 * page loads from somewhere else.
 */
export function ResetPassword() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const errors = useIamStore(state => state.errors);
    const submitting = useIamStore(state => state.submitting);
    const resetPassword = useIamStore(state => state.resetPassword);

    const [token] = useState(() => searchParams.get('token') ?? '');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');

    useEffect(() => {
        if (!token) return;
        window.history.replaceState(null, '', iamPaths.resetPassword());
    }, [token]);

    const passwordsMatch = password === confirmation;
    const canSubmit =
        password.length >= MINIMUM_PASSWORD_LENGTH && passwordsMatch && !submitting;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const changed = await resetPassword(new ResetPasswordCommand({token, password}));
        // No confirmation screen: the next thing anyone wants is to get in, and the
        // sign-in form is where they prove the new password works.
        if (changed) navigate(iamPaths.signIn());
    }

    if (!token) {
        return (
            <AuthLayout>
                <h1 className="text-h1 text-fg font-bold">{t('iam.reset.title')}</h1>
                <Alert className="mt-6">
                    <AlertTitle>{t('iam.reset.missingTokenTitle')}</AlertTitle>
                    <AlertDescription>{t('iam.reset.missingTokenBody')}</AlertDescription>
                </Alert>
                <Button
                    type="button"
                    size="lg"
                    variant="secondary"
                    className="mt-6 w-full"
                    onClick={() => navigate(iamPaths.recoverPassword())}
                >
                    {t('iam.reset.askForAnother')}
                </Button>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <h1 className="text-h1 text-fg font-bold">{t('iam.reset.title')}</h1>
            <p className="text-body text-fg-secondary mt-2">{t('iam.reset.subtitle')}</p>

            <form className="mt-6" onSubmit={handleSubmit}>
                <FieldGroup>
                    <IamErrorAlert errors={errors} fallback="iam.errors.unreachable" />

                    <PasswordField
                        label={t('iam.fields.password')}
                        value={password}
                        onValueChange={setPassword}
                        description={t('iam.signUp.passwordHint', {count: MINIMUM_PASSWORD_LENGTH})}
                        autoComplete="new-password"
                        disabled={submitting}
                    />

                    <PasswordField
                        label={t('iam.fields.passwordConfirmation')}
                        value={confirmation}
                        onValueChange={setConfirmation}
                        description={confirmation.length > 0 && !passwordsMatch ? t('iam.signUp.passwordMismatch') : undefined}
                        autoComplete="new-password"
                        disabled={submitting}
                    />

                    <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
                        {submitting && <Spinner data-icon="inline-start" />}
                        {submitting ? t('iam.reset.submitting') : t('iam.reset.submit')}
                    </Button>
                </FieldGroup>
            </form>
        </AuthLayout>
    );
}
