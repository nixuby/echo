import Header from './header';
import MobileNavBar from './mobile-navbar';
import NavBar from './navbar';

export type LayoutProps = {
    title?: string; // Page title
    children?: React.ReactNode;
};

// Default layout
export default function Layout({ title, children }: LayoutProps) {
    return (
        <>
            <title>{title ? `${title} — Echo` : 'Echo'}</title>
            <div className='flex h-full min-h-screen flex-col'>
                <div className='flex w-full max-w-screen-lg flex-1 flex-col self-center border-x border-gray-800 bg-gray-950'>
                    <Header />
                    <div className='flex grow items-start'>
                        <NavBar />
                        <main className='grow'>{children}</main>
                    </div>
                    <MobileNavBar />
                </div>
            </div>
        </>
    );
}
