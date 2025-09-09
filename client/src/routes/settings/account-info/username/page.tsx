import Layout from '@/components/layout/layout';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import ProtectedRoute from '@/components/protected-route';
import TextBox from '@/components/shared/textbox';
import Button from '@/components/shared/button';
import { useForm } from 'react-hook-form';
import { useChangeUsernameMutation } from '@/redux/settings/settings-api';
import { useState } from 'react';
import { setUser } from '@/redux/auth/auth-slice';
import TitleBar from '@/components/layout/titlebar';

type ChangeUsernameForm = {
    username: string;
};

export default function UsernamePage() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user)!;
    const [changeUsername, { isLoading }] = useChangeUsernameMutation();
    const [success, setSuccess] = useState<boolean>(false);

    const {
        register,
        handleSubmit: onSubmit,
        formState: { errors },
        setError,
        watch,
    } = useForm<ChangeUsernameForm>({
        defaultValues: {
            username: user?.username ?? '',
        },
    });

    const username = watch('username');

    function handleSubmit(data: ChangeUsernameForm) {
        changeUsername(data)
            .unwrap()
            .then(({ user }) => {
                setSuccess(true);
                dispatch(setUser(user));
            })
            .catch((res) => {
                if (!res?.data?.errors) return;
                const errors = res.data.errors as Record<string, string>;
                for (const field in errors) {
                    setError(field as keyof ChangeUsernameForm, {
                        message: errors[field],
                    });
                }
            });
    }

    return (
        <ProtectedRoute>
            <Layout title='Settings / Account Information'>
                <div className='flex flex-col'>
                    <TitleBar>Change Username</TitleBar>
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
                            disabled={success}
                        />
                        {errors.root && (
                            <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                                {errors.root.message}
                            </div>
                        )}
                        {success ? (
                            <div className='border border-green-400/40 bg-green-400/20 px-4 py-2 text-sm text-green-400'>
                                Username changed successfully!
                            </div>
                        ) : (
                            <Button
                                submit
                                disabled={
                                    isLoading || username === user.username
                                }
                            >
                                Save
                            </Button>
                        )}
                    </form>
                </div>
            </Layout>
        </ProtectedRoute>
    );
}
