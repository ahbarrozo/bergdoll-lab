export function isEmpty(str: undefined | null | string): boolean {
    return !str || str.length === 0;
}

export function orderByDate(arr: any[], attribute: string): any[] {
    if (arr.length === 0) return arr;

    if (!arr[0].hasOwnProperty('date')) {
        console.error(`Attribute ${attribute} not found in objects inside array to be sorted.`);
        return arr;
    }

    arr.sort((a, b) => {
        const dateA = new Date(a[attribute]);
        const dateB = new Date(b[attribute]);

        return dateA.getTime() - dateB.getTime();
    })

    return arr;
}
