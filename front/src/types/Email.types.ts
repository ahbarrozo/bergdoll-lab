export interface Email {
    type: string;
    text: string;
    title: string;
    locale: string;
}

export interface EmailSubscriptionProps {
    id?: number;
    events: boolean;
    email: string;
    updates: boolean;
    locale: string;
}
