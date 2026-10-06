export interface Document {
	id: number;
	description?: string;
	path: string;
	title?: string;
	locale: string;
}

export interface DocumentDTO {
	id?: string;
	description?: string;
	path: string;
	title?: string;
	locale: string;
}
