import {useTranslation} from 'react-i18next';
import {Link} from 'react-router';
import {Button} from '@/components/ui/button';

/** Shown for any URL the router does not recognise. */
export function NotFound() {
    const {t} = useTranslation();

    return (
        <main className="mx-auto max-w-3xl px-6 py-24 text-center">
            <p className="text-overline text-fg-muted uppercase">{t('notFound.code')}</p>
            <h1 className="text-h1 text-fg mt-2 font-bold">{t('notFound.title')}</h1>
            <p className="text-body text-fg-secondary mt-2">{t('notFound.body')}</p>
            <Button className="mt-6" render={<Link to="/" />}>
                {t('notFound.back')}
            </Button>
        </main>
    );
}
