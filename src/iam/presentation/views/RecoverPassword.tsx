import {useId, useState, type FormEvent} from 'react';
import {ChevronLeft} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Link, useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {Field, FieldGroup, FieldLabel} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {Spinner} from '@/components/ui/spinner';
import {useIamStore} from '../../application/iam.store';
import {RequestPasswordResetCommand} from '../../domain/model/request-password-reset.command';
import {AuthLayout} from '../components/AuthLayout';
import {IamErrorAlert} from '../components/IamErrorAlert';
import {iamPaths} from '../iam-paths';

/**
 * Routed view that starts a password reset.
 *
 * It always walks forward when the call succeeds, and the call succeeds for any
 * well-formed address: the service answers 202 whether or not it knows the account.
 * Telling the two apart here would put back the account enumeration the endpoint is
 * shaped to prevent.
 */
export function RecoverPassword() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const emailId = useId();
    const errors = useIamStore(state => state.errors);
    const submitting = useIamStore(state => state.submitting);
    const requestPasswordReset = useIamStore(state => state.requestPasswordReset);

    const [email, setEmail] = useState('');
    const canSubmit = email.trim().length > 0 && !submitting;

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        const requested = await requestPasswordReset(new RequestPasswordResetCommand({email: email.trim()}));
        if (requested) navigate(iamPaths.recoverPasswordSent());
    }

    return (
        <AuthLayout>
            <Link
                className="text-caption text-fg-link inline-flex items-center gap-1 font-semibold hover:underline"
                to={iamPaths.signIn()}
            >
                <ChevronLeft className="size-4" />
                {t('iam.recover.back')}
            </Link>

            <h1 className="text-h1 text-fg mt-4 font-bold">{t('iam.recover.title')}</h1>
            <p className="text-body text-fg-secondary mt-2">{t('iam.recover.subtitle')}</p>

            <form className="mt-6" onSubmit={handleSubmit}>
                <FieldGroup>
                    <IamErrorAlert errors={errors} fallback="iam.errors.unreachable" />

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

                    <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
                        {submitting && <Spinner data-icon="inline-start" />}
                        {submitting ? t('iam.recover.submitting') : t('iam.recover.submit')}
                    </Button>
                </FieldGroup>
            </form>
        </AuthLayout>
    );
}
