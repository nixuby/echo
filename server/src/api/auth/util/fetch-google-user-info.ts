export default async function fetchGoogleUserInfo(accessToken: string) {
    const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${accessToken}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        }
    );
    const data = (await response.json()) as {
        sub: number;
        name: string;
        picture: string;
    };
    return data;
}
