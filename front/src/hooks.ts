import { deLocalizeUrl } from 'src/paraglide/runtime';

export const reroute = (request) => deLocalizeUrl(request.url).pathname;
