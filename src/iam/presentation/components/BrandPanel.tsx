import {useTranslation} from 'react-i18next';
import {Wordmark} from '../../../shared/presentation/components/Wordmark';

/**
 * The navy brand surface: a radial gradient plus two soft green lights.
 *
 * It is a fixed-brand surface — navy in light mode and in dark mode alike, the same
 * way the Logo does not react to the theme. That is why its text uses
 * `decor/panel-fg` and not `text/inverse`: the latter flips with the theme and would
 * resolve to navy on navy in dark, at 1.92:1.
 *
 * The blur radii are 240px and 200px because that is what the design system says, and
 * the number matters more than it looks: at half that the lights stop being
 * atmosphere and start tinting the whole panel teal. Their opacity ceiling — under
 * 20% — is the other half of the same rule, and both exist so the decorative green
 * never competes with the primary button, which is the one place green is supposed to
 * mean "press here".
 *
 * The lights sit deliberately away from the wordmark, at the bottom-left and off the
 * top-right corner. Contrast must not depend on where a glow happens to fall.
 *
 * They shrink below `lg`, and that is not a tweak: the band is 200px tall there, so a
 * 620px light covers all of it and the navy reads green. The mockup's mobile band is a
 * crop of this panel from a region between the two lights, and these sizes are what
 * makes the browser land in the same place.
 */
export function BrandPanel() {
    const {t} = useTranslation();

    return (
        <aside
            className="relative isolate flex h-50 flex-col items-center justify-center overflow-hidden px-4 text-center lg:h-auto lg:px-16"
            style={{
                backgroundImage:
                    'radial-gradient(120% 90% at 50% 50%, var(--vk-decor-panel-from), var(--vk-decor-panel-to))'
            }}
        >
            <div
                aria-hidden
                className="absolute -bottom-20 -left-20 size-70 rounded-full opacity-8 blur-[110px] lg:-bottom-40 lg:-left-40 lg:size-155 lg:opacity-16 lg:blur-[240px]"
                style={{backgroundColor: 'var(--vk-decor-light-primary)'}}
            />
            <div
                aria-hidden
                className="absolute -top-16 -right-10 size-50 rounded-full opacity-5 blur-[95px] lg:-top-30 lg:-right-20 lg:size-105 lg:opacity-10 lg:blur-[200px]"
                style={{backgroundColor: 'var(--vk-decor-light-secondary)'}}
            />

            <div className="text-decor-panel-fg relative flex flex-col items-center gap-3">
                <Wordmark className="w-45 lg:w-60" />
                <p className="text-h2 font-bold">{t('common.tagline')}</p>
            </div>
        </aside>
    );
}
