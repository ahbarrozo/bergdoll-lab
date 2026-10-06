export interface BlogComment {
	id: number;
	author: string;
	date: string;
	text: string;
}

export interface BlogCommentDTO {
	author: string;
	date?: string;
	text: string;
}
