import prisma from '@/prisma.js';
import authRouter from '../../../router.js';
import fetchGoogleUserInfo from '../../../util/fetch-google-user-info.js';

authRouter.get('/oauth/google/profile-info', async (req, res) => {
    const accessToken = req.query.accessToken as string | undefined;

    if (!accessToken) {
        return res
            .status(400)
            .json({ errors: { root: 'oauth.missing-access-token' } });
    }

    try {
        const data = await fetchGoogleUserInfo(accessToken);

        const uid = String(data.sub);
        const name = data.name;
        const picture = data.picture;

        const exists =
            (await prisma.user.findUnique({
                where: {
                    provider_providerId: {
                        provider: 'google',
                        providerId: uid,
                    },
                },
            })) !== null;

        res.json({ uid, name, picture, exists });
    } catch (err) {
        res.status(500).json({
            errors: { root: 'oauth.unable-to-fetch-profile' },
        });
    }
});
