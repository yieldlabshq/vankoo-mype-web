import {FileText, House, LogOut, User, Wallet} from 'lucide-react';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Outlet, useNavigate} from 'react-router';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {useIamStore} from '../../../iam/application/iam.store';
import {iamPaths} from '../../../iam/presentation/iam-paths';
import {invoicingPaths} from '../../../invoicing/presentation/invoicing-paths';
import {SidebarItem} from './SidebarItem';
import {TopBar} from './TopBar';
import {Wordmark} from './Wordmark';

/**
 * The app shell: a navy sidebar for navigation, a top bar, and whatever the router
 * puts in the outlet.
 *
 * The layout is the one place allowed to reach into a bounded context from outside,
 * and it does so through that context's store and its paths, which is the loosest
 * coupling available. Wallet and profile have no screens yet, so their sidebar
 * entries render inert instead of linking somewhere that would 404.
 */
export function Layout() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const session = useIamStore(state => state.session);
    const signOut = useIamStore(state => state.signOut);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function handleSignOut() {
        signOut();
        navigate(iamPaths.signIn());
    }

    return (
        <div className="flex min-h-dvh">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside
                className={cn(
                    'bg-sidebar border-sidebar-border fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 -translate-x-full flex-col gap-6 border-r p-6 transition-transform duration-200 lg:static lg:translate-x-0',
                    sidebarOpen && 'translate-x-0'
                )}
            >
                <Wordmark className="text-sidebar-foreground h-8 w-auto" />

                <nav className="flex flex-col gap-1">
                    <SidebarItem icon={House} label={t('common.nav.home')} to="/" />
                    <SidebarItem
                        icon={FileText}
                        label={t('common.nav.invoices')}
                        to={invoicingPaths.myInvoices()}
                        end={false}
                    />
                    <SidebarItem icon={Wallet} label={t('common.nav.wallet')} />
                    <SidebarItem icon={User} label={t('common.nav.profile')} />
                </nav>

                <div className="flex-1" />

                {session && (
                    <div className="flex flex-col gap-4">
                        <p className="text-caption text-sidebar-foreground truncate font-semibold">
                            {session.user.email}
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="border-border-strong text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full"
                            onClick={handleSignOut}
                        >
                            <LogOut data-icon="inline-start" />
                            {t('common.signOut')}
                        </Button>
                    </div>
                )}
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <TopBar onMenuClick={() => setSidebarOpen(true)} />
                <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
