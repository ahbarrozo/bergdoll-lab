<script lang="ts">
	import * as m from 'src/paraglide/messages';
	import BlogPost from './BlogPost.svelte';
	import { type BlogPostProps } from '../types/BlogPost.types';
	import type { BlogCommentProps } from 'src/types/BlogComment.types';
	import type { BlogPostType } from 'src/types/BlogPostType.types';

	interface BlogProps {
		blogPosts: BlogPostProps[];
		blogPostTypes: BlogPostType[];
		blogComments: BlogCommentProps[];
	}

	const POSTS_PER_PAGE = 6;

	const { blogPosts, blogComments, blogPostTypes }: BlogProps = $props();
	let currentPage = $state(1);
	let posts = $state(blogPosts);
	let postTypes = $state(blogPostTypes.map((t) => t.name));

	let comments = $derived(
		blogComments.reduce((map: Map<number, BlogCommentProps[]>, c: BlogCommentProps) => {
			if (c.blog_post_id) {
				if (!map.has(c.blog_post_id)) {
					map.set(c.blog_post_id, [c]);
				} else {
					const prevComments: BlogCommentProps[] = map.get(c.blog_post_id)!;
					map.set(c.blog_post_id, [...prevComments, c]);
				}
			}
			return map;
		}, new Map())
	);
	let firstPost = $derived((currentPage - 1) * POSTS_PER_PAGE);
	let displayedPosts = $derived(
		posts.filter((p) => postTypes.includes(p.type!)).slice(firstPost, firstPost + POSTS_PER_PAGE)
	);
	let newestPost = $derived(
		displayedPosts.length > 0 ? { ...displayedPosts[0], isFirst: true } : null
	);

	const numPages = $derived(Math.ceil(posts.length / POSTS_PER_PAGE));
	const pages = $derived(Array.from({ length: numPages }, (_, i) => i + 1));

	function displayType(postType: string) {
		return postTypes.includes(postType);
	}

	function toggleType(postType: string) {
		const index = postTypes.findIndex((p) => p === postType);

		if (index === -1) postTypes.push(postType);
		else postTypes.splice(index, 1);
	}

	function typeColor(postType: string) {
		const blogType = blogPostTypes.find((p) => p.name === postType);

		return blogType ? blogType.color : 'oklch(27% 0.006 286.033)';
	}
</script>

<div class="flex flex-row gap-2">
	{#each blogPostTypes as type}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div
			aria-label="Toggle type"
			class="badge hover:cursor-pointer"
			style={`background-color: ${typeColor(type.name)}; opacity: ${displayType(type.name) ? 1 : 0.2};`}
			onclick={() => toggleType(type.name)}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2.5"
				stroke="currentColor"
				class="size-[0.8em]"
			>
				<path
					d="M19 6.41L17.59 5 12 10.59 
						6.41 5 5 6.41 10.59 12 5 
							17.59 6.41 19 12 13.41 17.59 
							19 19 17.59 13.41 12z"
				></path>
			</svg>
			{m[type.name]()}
		</div>
	{/each}
</div>
<div class="mb-10 flex flex-wrap justify-center gap-x-8 gap-y-4 p-6">
	{#if newestPost}
		<BlogPost
			{...newestPost}
			color={typeColor(newestPost.type)}
			comments={comments.get(newestPost.id) ?? []}
		></BlogPost>
	{/if}
	{#each displayedPosts as post}
		{#if !post.isFirst && newestPost && post.id !== newestPost.id}
			<BlogPost {...post} color={typeColor(post.type)} comments={comments.get(post.id) ?? []}
			></BlogPost>
		{/if}
	{/each}
</div>
<div class="join">
	{#each pages as page}
		<input
			class="join-item btn btn-square"
			type="radio"
			name="options"
			value={page}
			aria-label={`${page}`}
			checked={page === currentPage}
			bind:group={currentPage}
		/>
	{/each}
</div>
