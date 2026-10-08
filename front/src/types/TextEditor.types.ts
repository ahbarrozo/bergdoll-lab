export interface Button {
    active: () => boolean;
    command: () => boolean;
    content: string;
    name: string;
    type: 'block' | 'inline';
}