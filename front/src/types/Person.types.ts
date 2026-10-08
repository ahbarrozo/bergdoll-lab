import type { Image } from "./Image.types";

export interface Person {
    id?: number;
    date: string;
    description: string;
    images: Image[];
    link?: string;
    locale: string;
    title: string;
}

export interface PeopleProps {
    people: Person[];
}
