import type { SocialMedia } from "./SocialMedia.types";

export interface Contact {
    id?: number;
    name: string;
    contact: string;
    mail: string;
    phone: string;
    address?: string;
}

export interface ContactProps {
    contacts: Contact[];
    socialMedia: SocialMedia[];
}
