import Layout from '@/components/layout/layout';
import TitleBar from '@/components/layout/titlebar';
import { changeLanguage as changeLanguageClt, t } from '@/i18next';
import { useAppSelector } from '@/redux/hooks';
import { useChangeLanguageMutation } from '@/redux/settings/settings-api';
import LANGUAGES from '@shared/lang';
import { useNavigate } from 'react-router';

export default function LanguagePage() {
    const navigate = useNavigate();
    const user = useAppSelector((s) => s.auth.user);
    const [changeLanguageSrv] = useChangeLanguageMutation();

    const currentLanguage =
        user?.language || localStorage.getItem('lang') || 'en';

    function handleClick(ev: React.MouseEvent<HTMLButtonElement>) {
        const lang = ev.currentTarget.dataset.lang;
        if (!lang) return;
        if (LANGUAGES[lang] === undefined) return;
        if (lang === currentLanguage) return;

        if (user) {
            changeLanguageSrv({ language: lang }).then(() => {
                changeLanguageClt(lang);
            });
        } else {
            localStorage.setItem('lang', lang);
            changeLanguageClt(lang);
        }

        // Force re-rendering the page to update texts
        navigate(location.pathname, { replace: true });
    }

    return (
        <Layout title={t('settings.language.label')}>
            <TitleBar>{t('settings.language.label')}</TitleBar>
            <div className='flex flex-col'>
                {Object.keys(LANGUAGES).map((lang) => (
                    <button
                        key={lang}
                        disabled={currentLanguage === lang}
                        data-lang={lang}
                        onClick={handleClick}
                        className='cursor-pointer border-b border-gray-800 bg-gray-950 px-4 py-2 text-left text-white transition-colors hover:bg-gray-900 disabled:cursor-default disabled:font-bold disabled:hover:bg-gray-950'
                    >
                        {LANGUAGES[lang]}
                    </button>
                ))}
            </div>
        </Layout>
    );
}
