import { Audio } from './Audio.types';
import { Document } from './Document.types';
import { Image } from './Image.type';

export interface BlogPost {
	id: number;
	date: string;
	postNum: number;
	title: string;
	subtitle?: string;
	text: string;
	type?: string;
	images: Image[];
	documents: Document[];
	audios: Audio[];
	locale: string;
}

export interface BlogPostDTO {
	postNum?: number;
	title: string;
	subtitle?: string;
	text: string;
	type: string;
	locale: string;
}
