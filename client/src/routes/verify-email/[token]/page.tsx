import { useVerifyEmailMutation } from '@/redux/settings/settings-api';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import clsx from 'clsx/lite';
import { useAppDispatch } from '@/redux/hooks';
import { setUser } from '@/redux/auth/auth-slice';
import { t } from '@/i18next';

type VerifyEmailPageParams = {
    token: string;
};

export default function VerifyEmailPage() {
    const effectRan = useRef<boolean>(false);
    const navigate = useNavigate();
    const params = useParams<VerifyEmailPageParams>();
    const [verifyEmail] = useVerifyEmailMutation();
    const dispatch = useAppDispatch();
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    useEffect(() => {
        if (effectRan.current) return;

        if (params.token) {
            verifyEmail({ token: params.token }).then((res) => {
                if (res.data) {
                    dispatch(setUser(res.data.user));
                    setResult({
                        success: true,
                        message: t('email-verify.success'),
                    });
                } else if (res.error) {
                    setResult({
                        success: false,
                        message: t('email-verify.failed'),
                    });
                }

                setTimeout(() => {
                    navigate('/');
                }, 1000);
            });
        }

        effectRan.current = true;
    }, []);

    return (
        <div className='flex h-screen w-full items-center justify-center bg-gray-950 text-white'>
            <div className='flex flex-col items-center gap-2'>
                <img
                    src='/echo.svg'
                    alt='Logo'
                    className='size-12 animate-pulse'
                />
                <span
                    className={clsx(
                        'text-gray-400',
                        result
                            ? result.success
                                ? 'text-green-400'
                                : 'text-red-400'
                            : '',
                    )}
                >
                    {result ? result.message : t('email-verify.loading')}
                </span>
            </div>
        </div>
    );
}
