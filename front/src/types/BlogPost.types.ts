import type { Audio } from "./Audio.types";
import type { Document } from "./Document.types";
import type { Image } from "./Image.types";

export interface BlogPostProps {
    id?: number;
    color: string;
    date: string;
    postNum?: number;
    title: string;
    subtitle?: string;
    locale: string;
    text: string;
    type: string;
    images: Image[];
    audios: Audio[];
    documents: Document[];
    isFirst?: boolean;
}
