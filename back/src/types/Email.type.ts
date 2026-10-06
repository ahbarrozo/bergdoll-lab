export interface EmailSubscription {
	id: number;
	date: string;
	email: string;
	events: boolean;
	updates: boolean;
	locale: string;
}

export interface EmailSubscriptionDTO {
	date?: string;
	email: string;
	events: boolean;
	updates: boolean;
	locale: string;
}

export interface Email {
	text: string;
	title: string;
	type: string;
	locale: string;
}