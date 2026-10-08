import { type AboutSection } from './About.types';
import { type BlogPostProps } from './BlogPost.types';
import { type BlogPostTypesProps } from './BlogPostType.types';
import { type Contact } from './Contact.types';
import { type  Cover } from './Cover.types';
import { type EventProps } from './Event.types';
import { type  Image } from './Image.types';
import { type Person } from './Person.types';
import { type SocialMedia } from './SocialMedia.types';

export interface ApiData {
    about_sections: AboutSection[],
    blog_posts: BlogPostProps[],
    blog_post_types: BlogPostTypesProps,
    blog_comments: BlogPostProps[],
    contacts: Contact[],
    covers: Cover[],
    events: EventProps[],
    social_media: SocialMedia[],
    people: Person[],
}

export interface PageData {
    apiData: ApiData,
    coverImg: Image | null
}
