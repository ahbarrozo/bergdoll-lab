import { Image } from './Image.type';

export interface Person {
	id: number;
	date: string;
	description: string;
	title: string;
	images: Image[];
	link?: string;
	locale: string;
}

export interface PersonDTO {
	date: string;
	description: string;
	title: string;
	link?: string;
	locale: string;
}
