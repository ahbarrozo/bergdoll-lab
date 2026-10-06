export function isEmpty(str: undefined | null | string): boolean {
    return !str || str.length === 0;
}