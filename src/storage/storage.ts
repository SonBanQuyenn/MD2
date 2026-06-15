export function save<T>(key: string, data: T): void {
    localStorage.setItem(key,JSON.stringify(data));
}

export function load<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);

    if (!data) {
        return defaultValue;
    }

    return JSON.parse(data) as T;
}