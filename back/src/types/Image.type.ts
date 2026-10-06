export interface Image {
	id: number;
	description?: string;
	path: string;
	title?: string;
	locale: string;
}

export interface ImageDTO {
	id?: string;
	description?: string;
	path: string;
	title?: string;
	locale: string;
}
