export type IStartParam<T extends Record<string, string> = Record<string, string>> = {
    [K in keyof T]: string
} & {
    channel: string,
    invite: string,
};

export const StartParamKeyMap = {
    invite: 'i_',
    channel: 'c_',
} as const;

/**
 * @description parse telegram web app start param
 */
export function getTGWebAppStartParam<T extends Record<string, string>>(startParam?: string, extraKeyMap: T = {} as T): IStartParam<T> {
    if (!startParam) {
        const params = new URLSearchParams(location.search);
        startParam = params.get("tgWebAppStartParam") as string;
    }

    const obj: IStartParam<T> = {
        invite: '',
        channel: '',
        ...Object.fromEntries(Object.keys(extraKeyMap).map(key => [key, ''])) as T,
    };

    if (startParam) {
        const params = startParam.split('-');
        const combinedKeyMap = {
            ...StartParamKeyMap,
            ...extraKeyMap,
        };

        params.forEach(v => {
            const [key, val] = v.split("_");
            const fullKey = `${key}_`;
            if (key && val) {
                const k = Object.keys(combinedKeyMap).find(k => combinedKeyMap[k] === fullKey);
                if (k) {
                    (obj as any)[k] = val;
                }
            }
        });
    }

    return obj;
}

/**
 * @description generate telegram web app start param
 */
export function generateTGWebAppStartParam<T extends Record<string, string>>(param: Partial<IStartParam<T>>, extraKeyMap: T = {} as T): string {
    let str = '';

    const combinedKeyMap = {
        ...StartParamKeyMap,
        ...extraKeyMap,
    };

    for (const k in param) {
        const prefix = combinedKeyMap[k as keyof typeof combinedKeyMap];
        if (prefix) {
            if (str !== '') {
                str += '-';
            }
            str += `${prefix}${param[k as keyof IStartParam<T>]}`;
        }
    }
    return str;
}
