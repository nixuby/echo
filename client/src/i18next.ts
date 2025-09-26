import i18next from 'i18next';
import env from './env';

import en from '@/lang/en.json';
import es from '@/lang/es.json';

const dev = env.ENV === 'development';

// turn nested keys into flat keys for easier access (obj.a.b.c -> "a.b.c")
function flatKeys(obj: object): Set<string> {
    const result = new Set<string>();

    function recurse(curr: any, prefix: string) {
        for (const key in curr) {
            const value = curr[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'object' && value !== null) {
                recurse(value, newKey);
            } else {
                result.add(newKey);
            }
        }
    }

    recurse(obj, '');
    return result;
}

// Ensure that keys match to the main language (en)
function validateResources(resources: Record<string, object>) {
    const DEFAULT_LANG = 'en';

    const defaultKeys = flatKeys(resources[DEFAULT_LANG]);

    for (const lang in resources) {
        if (lang === DEFAULT_LANG) continue;
        const langKeys = flatKeys(resources[lang]);

        for (const key of defaultKeys) {
            if (!langKeys.has(key)) {
                console.warn(
                    `[i18next] Missing translation key "${key}" in language "${lang}"`,
                );
            }
        }
    }
}

export function initalizeI18next(lng: string) {
    if (i18next.isInitialized) return;

    const resources = {
        en,
        es,
    };

    if (dev) validateResources(resources);

    i18next.init({
        lng,
        debug: dev,
        fallbackLng: 'en',
        resources,
    });
}

const t = i18next.t;
const tErr = (key?: string) => (key ? t(`errors.${key}`) : undefined);

export { t, tErr };
