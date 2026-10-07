import {useId, useState} from 'react';
import {Eye, EyeOff} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {Field, FieldDescription, FieldLabel} from '@/components/ui/field';
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from '@/components/ui/input-group';

interface PasswordFieldProps {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    description?: string;
    autoComplete?: 'current-password' | 'new-password';
    disabled?: boolean;
}

/**
 * A password input with a reveal toggle.
 *
 * Dumb by design: it reports what was typed and keeps the only thing it owns —
 * whether the characters are currently visible — to itself. Whether the value is
 * acceptable is not its business.
 *
 * The toggle lives in an `InputGroupAddon` rather than being positioned by hand, so
 * the input reserves room for it instead of running text underneath. It takes a size
 * up from the addon's `xs` default: at 24px it read as an afterthought next to a 40px
 * field, and the mockup gives it the same weight as the icon it carries.
 */
export function PasswordField({
    label,
    value,
    onValueChange,
    description,
    autoComplete = 'current-password',
    disabled = false
}: PasswordFieldProps) {
    const {t} = useTranslation();
    const id = useId();
    const [visible, setVisible] = useState(false);

    return (
        <Field>
            <FieldLabel htmlFor={id}>{label}</FieldLabel>
            <InputGroup>
                <InputGroupInput
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={event => onValueChange(event.target.value)}
                    autoComplete={autoComplete}
                    disabled={disabled}
                    required
                />
                <InputGroupAddon align="inline-end">
                    <InputGroupButton
                        type="button"
                        size="icon-sm"
                        aria-label={visible ? t('iam.fields.hidePassword') : t('iam.fields.showPassword')}
                        aria-pressed={visible}
                        onClick={() => setVisible(current => !current)}
                    >
                        {visible ? <EyeOff /> : <Eye />}
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
            {description && <FieldDescription>{description}</FieldDescription>}
        </Field>
    );
}
