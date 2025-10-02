const cache: Record<string, Intl.DateTimeFormat> = {};

function getFormat(locale: string) {
    if (!cache[locale]) {
        cache[locale] = new Intl.DateTimeFormat(locale, {
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    return cache[locale];
}

export default function formatTime(locale: string, date: Date) {
    return getFormat(locale).format(date);
}
