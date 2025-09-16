export function jsonReplaceDates(jsonObject: any) {
    if (typeof jsonObject !== 'object' || jsonObject === null) {
        throw new TypeError('Invalid JSON object');
    }

    for (const key in jsonObject) {
        if (jsonObject[key] instanceof Date) {
            jsonObject[key] = {
                __type: 'Date',
                value: jsonObject[key].toISOString(),
            };
        } else if (typeof jsonObject[key] === 'object' && jsonObject[key] !== null) {
            jsonReplaceDates(jsonObject[key]);
        }
    }
}

export function jsonReviveDates(jsonObject: any) {
    if (typeof jsonObject !== 'object' || jsonObject === null) {
        throw new TypeError('Invalid JSON object');
    }

    for (const key in jsonObject) {
        if (jsonObject[key] && typeof jsonObject[key] === 'object') {
            if (jsonObject[key].__type === 'Date') {
                jsonObject[key] = new Date(jsonObject[key].value);
            } else {
                jsonReviveDates(jsonObject[key]);
            }
        }
    }
}
