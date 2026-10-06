import { Image } from './Image.type';

export interface AboutSection {
	id: number;
	sectionNum: number;
	text: string;
	images: Image[];
	locale: string;
}

export interface AboutSectionDTO {
	sectionNum?: number;
	text: string;
	locale: string;
}
