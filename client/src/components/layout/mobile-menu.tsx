import NavBar from './navbar';

export type MobileMenuProps = {
    onClose: () => void;
};

export default function MobileMenu({ onClose }: MobileMenuProps) {
    return (
        <div className='fixed top-0 left-0 z-100 flex h-full w-full bg-black/50 backdrop-blur-sm sm:hidden'>
            <NavBar mobile />
            <div className='w-full' onClick={onClose} />
        </div>
    );
}
