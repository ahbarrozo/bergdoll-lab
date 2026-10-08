<script lang="ts">
	import { type BlogPostProps } from 'src/types/BlogPost.types';
	import BlogPostAdmin from './BlogPostAdmin.svelte';
	import type { Image } from 'src/types/Image.types';
	import { locales } from 'src/common/constants';
	import type { Document } from 'src/types/Document.types';
	import type { Audio } from 'src/types/Audio.types';

	interface BlogProps {
		blogPosts: BlogPostProps[];
	}

	const POSTS_PER_PAGE = 6;

	const { blogPosts }: BlogProps = $props();
	const emptyPost: BlogPostProps = {
		date: new Date().toISOString(),
		audios: [] as Audio[],
		color: '',
		documents: [] as Document[],
		images: [] as Image[],
		isFirst: true,
		locale: 'en',
		subtitle: '',
		title: '',
		text: '',
		type: 'other'
	};

	let posts = $state(blogPosts);
	let currentPage = $state(1);
	let firstPost = $derived((currentPage - 1) * POSTS_PER_PAGE);
	let displayedPosts = $derived(posts.slice(firstPost, firstPost + POSTS_PER_PAGE));
	let numPages = $derived(Math.ceil(posts.length / POSTS_PER_PAGE));
	let pages = $derived(Array.from({ length: numPages }, (_, i) => i + 1));

	$effect(() => {
		if (posts.find((p) => !p.postNum)) {
			const postsEN = posts.filter((s) => s.locale === 'en');
			const postsFR = posts.filter((s) => s.locale === 'fr');

			postsEN.forEach((p: BlogPostProps, i) => (p.postNum = p.postNum ?? postsEN.length));
			postsFR.forEach((p: BlogPostProps, i) => (p.postNum = p.postNum ?? postsFR.length));
			posts = [...postsEN, ...postsFR].sort((sa, sb) => sb.postNum! - sa.postNum!);
		}
	});

	function displayNewPost() {
		posts = [{ ...emptyPost }, ...posts];
	}

	function duplicatePost(postNum: number) {
		const index = posts.findIndex((p) => p.postNum === postNum);
		if (index !== -1) {
			const locale = locales.find((l) => l.name !== posts[index].locale);

			if (locale) {
				const images = posts[index].images.map((i) => {
					i.locale = locale.name;
					return i;
				});
				posts.splice(index + 1, 0, {
					...posts[index],
					images,
					locale: locale.name,
					id: undefined
				});
			}
		}
	}

	/**
	 *  Function to be called upon an onDelete event is
	 *  triggered on the child component. It filters the
	 *  posts by ID for deleted posts
	 *
	 *  @param id : number ID of the deleted post
	 */
	function onDelete(id: number) {
		posts = posts.filter((post) => post.id !== id);
	}

	/**
	 *  Function that determines whether the duplicate
	 *  button is to be displayed. It calculates the
	 *  number of available posts for a given title. If all
	 * languages where used, the button will be hidden.
	 *
	 *  @param id : number ID of the section to be duplicated
	 */
	function showDuplicateButton(postNum: number) {
		const count = posts.filter((p) => p.postNum === postNum).length;
		return count < locales.length;
	}
</script>

<div class="mb-10 flex flex-wrap justify-center gap-x-8 gap-y-4">
	<button class="btn btn-primary w-full" onclick={displayNewPost}>New post</button>
	{#each displayedPosts as post, i (post.date + post.locale)}
		<BlogPostAdmin {...post} onDelete={() => onDelete(post.id!)} />
		{#if post.postNum && showDuplicateButton(post.postNum)}
			<button class="btn btn-primary w-full" onclick={() => duplicatePost(post.postNum!)}
				>Add language</button
			>
		{/if}
		{#if i < posts.length - 1 && posts[i].postNum !== posts[i + 1].postNum}
			<div class="divider my-12 w-full"></div>
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
