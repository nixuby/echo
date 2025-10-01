import { t } from '@/i18next';

const cache: Record<
    string,
    { rel: Intl.RelativeTimeFormat; date: Intl.DateTimeFormat }
> = {};

function getFormat(locale: string) {
    if (cache[locale]) {
        return cache[locale];
    }
    const rel = new Intl.RelativeTimeFormat(locale, { style: 'narrow' });
    const date = new Intl.DateTimeFormat(locale);
    cache[locale] = { rel, date };
    return cache[locale];
}

// Less than a minute ago -> "just now"
// Less that an hour ago -> "x minutes ago"
// Less than a day ago -> "x hours ago"
// Less than a month ago -> "x days ago"
// Otherwise -> "MM/DD/YY"
export default function formatRelativeDate(locale: string, date: Date) {
    const MINUTE_MS = 60_000;
    const HOUR_MS = 3_600_000;
    const DAY_MS = 86_400_000;
    const MONTH_MS = DAY_MS * 30;

    const now = new Date();

    const diff = now.getTime() - date.getTime();

    const { rel, date: dtf } = getFormat(locale);

    if (diff < MINUTE_MS) {
        return t('messages.just-now');
    } else if (diff < HOUR_MS) {
        return rel.format(-Math.floor(diff / MINUTE_MS), 'minute');
    } else if (diff < DAY_MS) {
        return rel.format(-Math.floor(diff / HOUR_MS), 'hour');
    } else if (diff < MONTH_MS) {
        return rel.format(-Math.floor(diff / DAY_MS), 'day');
    } else {
        return dtf.format(date);
    }
}
