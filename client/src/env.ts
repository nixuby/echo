type Type = 'string' | 'number' | 'boolean';

function totype(value: string, type: Type): string | number | boolean | null {
    switch (type) {
        case 'string':
            return value;
        case 'number':
            let num = Number(value);
            if (isNaN(num)) return null;
            return num;
        case 'boolean':
            return value === 'true';
    }
}

function need<T>(key: string, type: Type = 'string'): T {
    const value = import.meta.env[key];
    if (!value) throw new Error(`Missing environment variable: ${key}`);
    const parsed = totype(value, type);
    if (parsed === null)
        throw new Error(`Invalid environment variable type: ${key}`);
    return parsed as T;
}

const env = {
    ENV: need<string>('VITE_ENV'),
    API_URL: need<string>('VITE_API_URL'),
};

export default env;
