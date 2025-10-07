import env from '@/env';
import { useLazySearchQuery } from '@/redux/user/users-api';
import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router';
import Post from '../post/post';

export default function HeaderSearchBar() {
    const containerId = useId();
    const [showResults, setShowResults] = useState(false);
    const [input, setInput] = useState('');
    const [fetchSearch, { data, reset: resetSearch }] = useLazySearchQuery();

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            if (input.trim().length >= 3) {
                fetchSearch({ q: input, type: 'users,posts', limit: 6 });
            } else {
                resetSearch();
            }
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [input]);

    // Close search results when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const container = document.getElementById(containerId);
            if (container && !container.contains(event.target as Node)) {
                setShowResults(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [containerId]);

    function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
        setInput(ev.target.value);
    }

    return (
        <div id={containerId} className='relative z-1 grow self-stretch'>
            <input
                type='text'
                name='search'
                placeholder='Search'
                value={input}
                onChange={handleChange}
                onFocus={() => setShowResults(true)}
                className='relative z-3 h-full w-full border-l border-gray-800 px-4 transition-colors outline-none placeholder:text-gray-400 hover:bg-gray-900 focus:bg-gray-800 focus:ring-2'
            />
            {showResults && (
                <div className='_scrollbar-thin absolute top-full -right-px left-0 z-2 max-h-[50vh] overflow-y-scroll border border-gray-800 bg-gray-950'>
                    <div className='flex flex-col'>
                        {data && data.users && data.users.length > 0 && (
                            <div className='flex flex-col'>
                                <h3 className='border-b border-gray-800 px-4 py-2 font-semibold'>
                                    Users
                                </h3>
                                <div className='border-b border-gray-800'>
                                    <div className='grid w-max grid-cols-4 md:grid-cols-6'>
                                        {data.users.map((user) => (
                                            <Link
                                                key={user.username}
                                                to={`/@${user.username}`}
                                                onClick={() =>
                                                    setShowResults(false)
                                                }
                                                className='flex cursor-pointer flex-col items-center gap-1 bg-gray-950 p-4 transition hover:bg-gray-900'
                                            >
                                                <img
                                                    src={`${env.API_URL}/users/pic/${user.username}-sm`}
                                                    alt='Profile Picture'
                                                    className='size-12 rounded-full'
                                                />
                                                <span className='text-sm text-gray-400'>
                                                    {user.name ??
                                                        `@${user.username}`}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {data && data.posts && data.posts.length > 0 && (
                            <>
                                <h3 className='border-b border-gray-800 px-4 py-2 font-semibold'>
                                    Posts
                                </h3>
                                <div>
                                    <div className='flex flex-col'>
                                        {data.posts?.map((post) => (
                                            <Post
                                                key={post.id}
                                                short
                                                preview
                                                post={post}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
