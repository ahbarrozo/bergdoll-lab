export interface EventProps {
    id?: number;
    dates: { start: string; stop: string; }[];
    location: string;
    name: string;
    link?: string;
    start?: string;
    stop?: string;
    type?: string;
}

export interface EventPropsDTO {
    id?: number;
    dates: string;
    start?: string;
    stop?: string;
    location: string;
    name: string;
    link?: string;
    type?: string;
}

export interface EventsProps {
    events: EventProps[];
}
