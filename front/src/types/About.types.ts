import type { Image } from "./Image.types";

export interface AboutSection {
    id?: number;
    sectionNum?: number;
    images: Image[];
    text: string;
    locale: string;
}

export interface AboutProps {
    aboutSections: AboutSection[];
}
