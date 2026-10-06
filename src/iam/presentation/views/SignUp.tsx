import {useId, useState, type FormEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {Field, FieldGroup, FieldLabel} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {Spinner} from '@/components/ui/spinner';
import {useIamStore} from '../../application/iam.store';
import {SignUpCommand} from '../../domain/model/sign-up.command';
import {AuthLayout} from '../components/AuthLayout';
import {IamErrorAlert} from '../components/IamErrorAlert';
import {PasswordField} from '../components/PasswordField';
import {iamPaths} from '../iam-paths';

/** The shortest password this form will submit. A courtesy to the user, not a rule. */
const MINIMUM_PASSWORD_LENGTH = 8;

/** Routed view that creates an account. */
export function SignUp() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const emailId = useId();
    const termsId = useId();
    const errors = useIamStore(state => state.errors);
    const submitting = useIamStore(state => state.submitting);
    const signUp = useIamStore(state => state.signUp);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const passwordsMatch = password === confirmation;
    const canSubmit =
        email.trim().length > 0 &&
        password.length >= MINIMUM_PASSWORD_LENGTH &&
        passwordsMatch &&
        termsAccepted &&
        !submitting;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        // The web app is the MYPE client, so the role is fixed rather than chosen.
        // It is the only discriminator in the system: profile-service reads it off the
        // event this call publishes to decide whether to create a Company or an
        // Investor, and an account created without one never gets a profile at all.
        const created = await signUp(new SignUpCommand({
            email: email.trim(),
            password,
            roles: ['ROLE_MYPE']
        }));
        // Sign-up answers without a token, so there is no session to walk into: the
        // next step is signing in, with the address already filled in by the store.
        if (created) navigate(iamPaths.signIn());
    }

    return (
        <AuthLayout>
            <h1 className="text-h1 text-fg font-bold">{t('iam.signUp.title')}</h1>
            <p className="text-body text-fg-secondary mt-2">{t('iam.signUp.subtitle')}</p>

            <form className="mt-6" onSubmit={handleSubmit}>
                <FieldGroup>
                    <IamErrorAlert errors={errors} fallback="iam.errors.signUpFailed" />

                    <Field>
                        <FieldLabel htmlFor={emailId}>{t('iam.fields.email')}</FieldLabel>
                        <Input
                            id={emailId}
                            type="email"
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            autoComplete="email"
                            disabled={submitting}
                            required
                        />
                    </Field>

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

                    <Field orientation="horizontal">
                        <Checkbox
                            id={termsId}
                            checked={termsAccepted}
                            onCheckedChange={checked => setTermsAccepted(checked === true)}
                            disabled={submitting}
                        />
                        <FieldLabel htmlFor={termsId} className="text-caption font-normal">
                            {t('iam.signUp.acceptTerms')}
                        </FieldLabel>
                    </Field>

                    <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
                        {submitting && <Spinner data-icon="inline-start" />}
                        {submitting ? t('iam.signUp.submitting') : t('iam.signUp.submit')}
                    </Button>

                    <p className="text-caption text-fg-secondary text-center">
                        {t('iam.signUp.haveAccount')}{' '}
                        <Link className="text-fg-link font-semibold hover:underline" to={iamPaths.signIn()}>
                            {t('iam.signUp.signInLink')}
                        </Link>
                    </p>
                </FieldGroup>
            </form>
        </AuthLayout>
    );
}
