import type {ReactNode} from 'react';
import {useTranslation} from 'react-i18next';
import {PreferencesBar} from '../../../shared/presentation/components/PreferencesBar';
import {BrandPanel} from './BrandPanel';
import {DotField} from './DotField';

interface AuthLayoutProps {
    children: ReactNode;
}

/**
 * The shell every authentication screen sits in.
 *
 * Two compositions, one component, because that is what the mockups agreed on: a
 * split on desktop with the brand panel holding the left 39%, and on narrow screens
 * the same panel collapsed to a band across the top with the form on clean surface
 * below.
 *
 * The column is a flex container so the legal row lands at the foot of the viewport
 * rather than trailing the card. That placement is the whole point of the row: it
 * fills the lower third with something useful instead of more ornament, and a footer
 * that floats just under the form does neither.
 *
 * The dot field is a sibling of the card, not an ancestor, so nothing decorative ever
 * ends up behind the text.
 */
export function AuthLayout({children}: AuthLayoutProps) {
    const {t} = useTranslation();

    return (
        // A proportion, not a fixed 560px: the mockup is drawn at 1440, where the panel
        // takes 39% of the width. Pinning the pixel value instead of the ratio leaves it
        // a thin stripe on a 27" screen. The floor stops it squeezing the brand on a
        // small laptop.
        <div className="bg-surface flex min-h-dvh flex-col lg:grid lg:grid-cols-[minmax(30rem,39%)_1fr]">
            <BrandPanel />

            <main className="relative flex flex-1 flex-col px-4 py-8 lg:px-16">
                <DotField />

                {/*
                  Out of the flow on desktop and in it on narrow screens, which is what
                  the mockups draw. On 1440 the card is centred in the column and a row
                  above it would push that centre down by half its height; on 390 there
                  is nothing to centre, so the row simply sits under the brand band.

                  The z-index is not ornament: the card's container is positioned and
                  comes later in the DOM, so without it that container paints over the
                  buttons and eats the clicks — visible, and dead.
                */}
                <PreferencesBar className="relative z-10 mb-4 self-end lg:absolute lg:top-8 lg:right-16 lg:mb-0" />

                <div className="relative flex flex-1 items-start justify-center lg:items-center">
                    {/*
                      The card is a desktop composition only. On a 390px screen a card
                      with margins either side wastes the width the form needs, so the
                      mockups drop it there and let the surface itself be the card —
                      which is also why the dot field only shows around it on wide
                      screens.
                    */}
                    <div className="lg:bg-surface-raised lg:shadow-elevation-2 w-full max-w-110 lg:rounded-xl lg:p-8">
                        {children}
                    </div>
                </div>

                <footer className="text-caption text-fg-muted relative mt-8 flex items-center justify-center gap-2">
                    <a className="hover:text-fg-secondary" href="#">{t('common.legal.terms')}</a>
                    <span aria-hidden>·</span>
                    <a className="hover:text-fg-secondary" href="#">{t('common.legal.privacy')}</a>
                    <span aria-hidden>·</span>
                    <a className="text-fg-link hover:underline" href="#">{t('common.legal.help')}</a>
                </footer>
            </main>
        </div>
    );
}
