<script lang="ts">
	import BlogPostTypeAdmin from './BlogPostTypeAdmin.svelte';
	import type { BlogPostType, BlogPostTypesProps } from 'src/types/BlogPostType.types';

	const WORKS_PER_PAGE = 6;

	const { blogPostTypes }: BlogPostTypesProps = $props();
	const emptyBlogPostType: BlogPostType = {
		color: '',
		display_name: '',
		name: ''
	};

	let blogPostTypesList = $state(blogPostTypes);

	function displayNewBlogPostType() {
		blogPostTypesList.push({ ...emptyBlogPostType });
	}

	/**
	 *  Function to be called upon an onDelete event is
	 *  triggered on the child component. It filters the
	 *  works by ID for deleted works
	 *
	 *  @param id : number ID of the deleted album
	 */
	function onDelete(id: number) {
		blogPostTypesList = blogPostTypesList.filter((work) => work.id !== id);
	}
</script>

<div class="mb-10 flex flex-wrap justify-center gap-x-8 gap-y-4">
	<button class="btn btn-primary w-full" onclick={displayNewBlogPostType}>New work</button>
	{#each blogPostTypesList as blogPostType, i (i)}
		<BlogPostTypeAdmin {...blogPostType} onDelete={() => onDelete(blogPostType.id!)} />
	{/each}
</div>
