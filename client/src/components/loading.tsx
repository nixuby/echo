import EchoIcon from './icon/echo-icon';

export default function Loading() {
    return (
        <div className='_bg-pattern-wave flex h-full min-h-screen flex-col items-center justify-center bg-gray-950 text-white'>
            <EchoIcon className='size-12 animate-pulse' />
        </div>
    );
}
