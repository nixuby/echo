import { Link } from 'react-router';
import Layout from '@/components/layout/layout';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { useAppSelector } from '@/redux/hooks';
import ProtectedRoute from '@/components/protected-route';
import TextBox from '@/components/shared/textbox';
import Button from '@/components/shared/button';
import { useForm } from 'react-hook-form';

type ChangeUsernameForm = {
    username: string;
};

export default function UsernamePage() {
    const user = useAppSelector((s) => s.auth.user)!;

    const {
        register,
        handleSubmit: onSubmit,
        formState: { errors },
    } = useForm<ChangeUsernameForm>({
        defaultValues: {
            username: user.username,
        },
    });

    function handleSubmit(data: ChangeUsernameForm) {
        // TODO: Implement username change logic using RTK Query
    }

    return (
        <ProtectedRoute>
            <Layout title='Settings / Account Information'>
                <div className='flex flex-col'>
                    <div className='flex items-center gap-2 border-b border-gray-800 px-4 py-2'>
                        <Link to='/settings/account-info'>
                            <ArrowLeftIcon className='size-5' />
                        </Link>
                        <h2 className='text-xl font-bold'>Change Username</h2>
                    </div>
                    <form
                        className='flex w-[min(100%,350px)] flex-col gap-2 px-4 py-2'
                        onSubmit={onSubmit(handleSubmit)}
                    >
                        <p className='text-sm text-gray-400'>
                            After changing your username, you will need to use
                            the new username to log in.
                        </p>
                        <p className='text-sm text-gray-400'>
                            The old username will be available for others to
                            use.
                        </p>
                        <TextBox
                            label='Username'
                            {...register('username')}
                            error={errors.username?.message}
                        />
                        {errors.root && (
                            <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                                {errors.root.message}
                            </div>
                        )}
                        <Button submit>Save</Button>
                    </form>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
