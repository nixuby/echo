import AuthLayout from '@/components/auth/auth-layout';
import Button from '@/components/shared/button';
import TextBox from '@/components/shared/textbox';
import { t, tErr } from '@/i18next';
import {
    useGetOAuthProfileInfoQuery,
    useOauthSignInMutation,
} from '@/redux/auth/auth-api';
import { setUser } from '@/redux/auth/auth-slice';
import { useAppDispatch } from '@/redux/hooks';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

// #access_token=...&token_type=Bearer ... -> { accessToken: ..., tokenType: 'Bearer' }
function parseOAuthResponse() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const tokenType = params.get('token_type');
    const expiresIn = params.get('expires_in');
    const scope = params.get('scope');

    if (!accessToken || !tokenType) return null;
    return { accessToken, tokenType, expiresIn, scope };
}

export default function GoogleOAuthPage() {
    const oauthResponse = parseOAuthResponse();

    return (
        <AuthLayout title={t('sign-in-google')}>
            {oauthResponse ? (
                <GoogleOAuthCallback accessToken={oauthResponse.accessToken} />
            ) : (
                'Failed'
            )}
        </AuthLayout>
    );
}

type GoogleOAuthCallbackProps = {
    accessToken: string;
};

function GoogleOAuthCallback({ accessToken }: GoogleOAuthCallbackProps) {
    const { data, error, isLoading } = useGetOAuthProfileInfoQuery({
        provider: 'google',
        accessToken,
    });
    const [oauthSignIn] = useOauthSignInMutation();
    const [formError, setFormError] = useState<Record<string, string>>({});
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    function signIn(accessToken_: string, username?: string) {
        oauthSignIn({
            provider: 'google',
            accessToken: accessToken_,
            username,
        }).then((res) => {
            if (res.error) {
                setFormError((res.error as any).data.errors);
            } else {
                const user = res.data.user;
                dispatch(setUser(user));
                navigate('/');
            }
        });
    }

    function handleCreateAccount(username: string) {
        signIn(accessToken, username);
    }

    useEffect(() => {
        if (data && data.exists) {
            signIn(accessToken);
        }
    }, [data]);

    return (
        <div>
            {isLoading && 'Loading...'}
            {error && 'Error'}
            {data &&
                (data.exists ? null : (
                    <OAuthNewUser
                        name={data.name}
                        picture={data.picture}
                        error={formError}
                        onCreateAccount={handleCreateAccount}
                    />
                ))}
        </div>
    );
}

export type OAuthNewUserProps = {
    name: string;
    picture: string;
    error: Record<string, string>;
    onCreateAccount: (username: string) => void;
};

function OAuthNewUser({
    name,
    picture,
    error,
    onCreateAccount,
}: OAuthNewUserProps) {
    const [username, setUsername] = useState('');

    function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
        setUsername(ev.target.value);
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-4 border border-gray-800 px-4 py-2'>
                <img
                    src={picture}
                    alt='Profile Picture'
                    className='size-12 rounded-full'
                />
                <div className='flex flex-col gap-0.5'>
                    <span>{name}</span>
                    <span className='text-sm text-gray-400'>@{username}</span>
                </div>
            </div>
            <div className='text-sm text-gray-400'>
                {t('oauth-create-account-info')}
            </div>
            <TextBox
                label={t('username')}
                value={username}
                error={tErr(error.username)}
                onChange={handleChange}
            />
            <Button onClick={() => onCreateAccount(username)}>
                {t('create-account')}
            </Button>
        </div>
    );
}
