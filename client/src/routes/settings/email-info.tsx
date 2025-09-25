import { useAppSelector } from '@/redux/hooks';
import { useResendVerificationEmailMutation } from '@/redux/settings/settings-api';
import { useState } from 'react';
import { Link } from 'react-router';
import { EMAIL_INTERVAL } from '@shared/consts';

type ResendState =
    | {
          type: 'none';
      }
    | {
          type: 'loading';
      }
    | {
          type: 'success';
          token: string;
      }
    | {
          type: 'error';
          error: string;
      };

export default function SettingsPageEmailInfo() {
    const user = useAppSelector((s) => s.auth.user);
    const timePassed =
        Date.now() - (new Date(user?.emailVerifiedAt ?? 0).getTime() ?? 0);

    const [resendState, setResendState] = useState<ResendState>(
        timePassed > EMAIL_INTERVAL
            ? {
                  type: 'none',
              }
            : {
                  type: 'error',
                  error: `Please wait ${Math.ceil((EMAIL_INTERVAL - timePassed) / 1000 / 60)} minutes before resending the verification email`,
              },
    );

    const [resendVerificationEmail] = useResendVerificationEmailMutation();

    function handleClick(ev: React.MouseEvent<HTMLButtonElement>) {
        ev.preventDefault();
        setResendState({ type: 'loading' });
        resendVerificationEmail()
            .unwrap()
            .then(({ token }) => {
                setResendState({ type: 'success', token });
            })
            .catch((res) => {
                const error = res?.data?.errors?.root ?? 'Error sending email';
                setResendState({ type: 'error', error });
            });
    }

    return (
        <>
            {!user?.email ? (
                <div className='flex flex-col items-start gap-1 border-b border-gray-800 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-500'>
                    <p>
                        Make your account more secure by adding and verifying
                        your email address
                    </p>
                    <Link
                        to='/settings/account-info/email'
                        className='font-semibold hover:underline'
                    >
                        Click here to add an email address
                    </Link>
                </div>
            ) : (
                !user?.isEmailVerified && (
                    <div className='flex flex-col items-start gap-1 border-b border-gray-800 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-500'>
                        <p>Your email address is not verified!</p>
                        <div className='flex flex-col gap-1 md:flex-row md:gap-2'>
                            {resendState.type === 'none' ? (
                                <button
                                    type='button'
                                    role='button'
                                    onClick={handleClick}
                                    className='cursor-pointer font-semibold hover:underline'
                                >
                                    Resend verification email
                                </button>
                            ) : (
                                <span>
                                    {resendState.type === 'loading' ? (
                                        'Sending...'
                                    ) : resendState.type === 'success' ? (
                                        <>
                                            Email sent!{' '}
                                            <Link
                                                to={`/verify-email/${resendState.token}`}
                                                className='text-xs underline'
                                            >
                                                Verify Email
                                            </Link>
                                        </>
                                    ) : (
                                        resendState.error
                                    )}
                                </span>
                            )}
                            <span className='hidden md:inline'>&middot;</span>
                            <Link
                                to='/settings/account-info/email'
                                className='font-semibold hover:underline'
                            >
                                Change the email address
                            </Link>
                        </div>
                    </div>
                )
            )}
        </>
    );
}
