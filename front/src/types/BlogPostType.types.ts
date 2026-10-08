export interface BlogPostType {
    id?: number;
    color: string;
    display_name: string;
    name: string;
}

export interface BlogPostTypesProps {
    blogPostTypes: BlogPostType[];
}