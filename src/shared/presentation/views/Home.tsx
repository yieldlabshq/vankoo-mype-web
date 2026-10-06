import {Trans, useTranslation} from 'react-i18next';
import {useIamStore} from '../../../iam/application/iam.store';

/**
 * Where a signed-in user lands.
 *
 * A stand-in, and knowingly so: the MYPE dashboard has not been designed yet, and the
 * screens that would fill it — invoices, wallet, profile — have no frontend either.
 * It exists so signing in leads somewhere real, and so the session survives a reload
 * visibly. Replace it with the dashboard; nothing else depends on what is inside.
 */
export function Home() {
    const {t, i18n} = useTranslation();
    const session = useIamStore(state => state.session);

    return (
        <main className="mx-auto max-w-3xl px-6 py-16">
            <h1 className="text-h1 text-fg font-bold">{t('home.title')}</h1>
            <p className="text-body text-fg-secondary mt-2">
                {/*
                  Trans rather than three concatenated pieces: the address sits in a
                  different position in other languages, and a sentence assembled from
                  fragments cannot be reordered by whoever translates it.
                */}
                <Trans
                    i18nKey="home.signedInAs"
                    values={{email: session?.user.email ?? ''}}
                    components={{strong: <span className="text-fg font-semibold" />}}
                />
            </p>

            <dl className="border-subtle mt-8 grid gap-4 rounded-xl border p-6 sm:grid-cols-2">
                <div>
                    <dt className="text-overline text-fg-muted uppercase">{t('home.roles')}</dt>
                    <dd className="text-body text-fg mt-1">{session?.user.roles.join(', ') || '—'}</dd>
                </div>
                <div>
                    <dt className="text-overline text-fg-muted uppercase">{t('home.expiresAt')}</dt>
                    <dd className="text-body text-fg mt-1">
                        {session?.expiresAt.toLocaleString(i18n.language) ?? '—'}
                    </dd>
                </div>
            </dl>

            <p className="text-caption text-fg-muted mt-6">{t('home.placeholder')}</p>
        </main>
    );
}
