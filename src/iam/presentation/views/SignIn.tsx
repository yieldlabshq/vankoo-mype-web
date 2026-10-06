import {useId, useState, type FormEvent} from 'react';
import {useTranslation} from 'react-i18next';
import {Link, useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {Field, FieldGroup, FieldLabel} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {Spinner} from '@/components/ui/spinner';
import {useIamStore} from '../../application/iam.store';
import {SignInCommand} from '../../domain/model/sign-in.command';
import {AuthLayout} from '../components/AuthLayout';
import {IamErrorAlert} from '../components/IamErrorAlert';
import {PasswordField} from '../components/PasswordField';
import {iamPaths} from '../iam-paths';

/** Routed view that opens a session. */
export function SignIn() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const emailId = useId();
    const errors = useIamStore(state => state.errors);
    const submitting = useIamStore(state => state.submitting);
    const signIn = useIamStore(state => state.signIn);

    // Someone who just registered lands here, and retyping the address they entered
    // ten seconds ago is friction with nothing to show for it. Read once as the
    // initial value rather than synchronised in an effect: sign-up sets it before it
    // navigates, so it is already there on mount, and subscribing to it would let a
    // later change overwrite whatever the user had started typing.
    const [email, setEmail] = useState(() => useIamStore.getState().signedUpEmail ?? '');
    const [password, setPassword] = useState('');

    const canSubmit = email.trim().length > 0 && password.length > 0 && !submitting;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const opened = await signIn(new SignInCommand({email: email.trim(), password}));
        if (opened) navigate('/');
    }

    return (
        <AuthLayout>
            <h1 className="text-h1 text-fg font-bold">{t('iam.signIn.title')}</h1>
            <p className="text-body text-fg-secondary mt-2">{t('iam.signIn.subtitle')}</p>

            <form className="mt-6" onSubmit={handleSubmit}>
                <FieldGroup>
                    <IamErrorAlert errors={errors} fallback="iam.errors.signInFailed" />

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
                        disabled={submitting}
                    />

                    <div className="flex justify-end">
                        <Link className="text-caption text-fg-link font-semibold hover:underline" to={iamPaths.recoverPassword()}>
                            {t('iam.signIn.forgotPassword')}
                        </Link>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
                        {submitting && <Spinner data-icon="inline-start" />}
                        {submitting ? t('iam.signIn.submitting') : t('iam.signIn.submit')}
                    </Button>

                    <p className="text-caption text-fg-secondary text-center">
                        {t('iam.signIn.noAccount')}{' '}
                        <Link className="text-fg-link font-semibold hover:underline" to={iamPaths.signUp()}>
                            {t('iam.signIn.createOne')}
                        </Link>
                    </p>
                </FieldGroup>
            </form>
        </AuthLayout>
    );
}
