export interface Cover {
    id?: number;
    description: string;
    locale: string;
    path: string;
    title?: string;
}

export interface CoversProps {
    covers: Cover[];
}
