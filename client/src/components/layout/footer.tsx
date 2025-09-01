import { Link } from 'react-router';

export default function Footer() {
    return (
        <footer className='flex flex-col items-start gap-1 border-t border-gray-800 px-6 py-2 text-gray-400'>
            <div className='flex flex-wrap gap-2 text-xs'>
                <Link to='/about' className='text-nowrap hover:underline'>
                    About
                </Link>
                <Link to='/tos' className='text-nowrap hover:underline'>
                    Terms of Service
                </Link>
                <Link to='/privacy' className='text-nowrap hover:underline'>
                    Privacy Policy
                </Link>
            </div>
            <div>&copy; 2025, Echo Corp.</div>
        </footer>
    );
}
