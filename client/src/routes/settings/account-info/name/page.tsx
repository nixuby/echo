import { Link } from 'react-router';
import Layout from '@/components/layout/layout';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import ProtectedRoute from '@/components/protected-route';
import TextBox from '@/components/shared/textbox';
import Button from '@/components/shared/button';
import { useForm } from 'react-hook-form';
import { useChangeNameMutation } from '@/redux/settings/settings-api';
import { useState } from 'react';
import { setUser } from '@/redux/auth/auth-slice';

type ChangeNameForm = {
    name: string;
};

export default function NamePage() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user);
    const [changeName, { isLoading }] = useChangeNameMutation();
    const [success, setSuccess] = useState<boolean>(false);

    const {
        register,
        handleSubmit: onSubmit,
        formState: { errors },
        setError,
        watch,
    } = useForm<ChangeNameForm>({
        defaultValues: {
            name: user?.name ?? '',
        },
    });

    const name = watch('name');

    function handleSubmit(data: ChangeNameForm) {
        changeName(data)
            .unwrap()
            .then(({ user }) => {
                setSuccess(true);
                dispatch(setUser(user));
            })
            .catch((res) => {
                if (!res?.data?.errors) return;
                const errors = res.data.errors as Record<string, string>;
                for (const field in errors) {
                    setError(field as keyof ChangeNameForm, {
                        message: errors[field],
                    });
                }
            });
    }

    return (
        <ProtectedRoute>
            <Layout title='Settings / Account Information'>
                <div className='flex flex-col'>
                    <div className='flex items-center gap-2 border-b border-gray-800 px-4 py-2'>
                        <Link to='/settings/account-info'>
                            <ArrowLeftIcon className='size-5' />
                        </Link>
                        <h2 className='text-xl font-bold'>Change Name</h2>
                    </div>
                    <form
                        className='flex w-[min(100%,350px)] flex-col gap-2 px-4 py-2'
                        onSubmit={onSubmit(handleSubmit)}
                    >
                        <p className='text-sm text-gray-400'>
                            Name is your display name. It is not used for
                            signing in.
                        </p>
                        <p className='text-sm text-gray-400'>
                            The display name can contain any characters,
                            including spaces and emojis. They are not unique and
                            may be shared by different users.
                        </p>
                        <p className='text-sm text-gray-400'>
                            You can reset your display name by leaving the field
                            blank.
                        </p>
                        <TextBox
                            label='Name'
                            {...register('name')}
                            error={errors.name?.message}
                            disabled={success}
                        />
                        {errors.root && (
                            <div className='border border-red-400/40 bg-red-400/20 px-4 py-2 text-sm text-red-400'>
                                {errors.root.message}
                            </div>
                        )}
                        {success ? (
                            <div className='border border-green-400/40 bg-green-400/20 px-4 py-2 text-sm text-green-400'>
                                Name changed successfully!
                            </div>
                        ) : (
                            <Button
                                submit
                                disabled={isLoading || name === user?.name}
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
