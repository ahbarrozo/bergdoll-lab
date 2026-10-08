<script lang="ts">
	import * as m from 'src/paraglide/messages';
	import { type Readable } from 'svelte/store';
	import { type Editor } from '@tiptap/core';
	import { createEditor } from 'svelte-tiptap';
	import { type BlogCommentProps } from '../types/BlogComment.types';
	import type { Button } from 'src/types/TextEditor.types';
	import { onMount } from 'svelte';
	import { toaster } from 'src/stores/toaster.store';

	interface BlogCommentsProps {
		blogComments: BlogCommentProps[];
	}

	const COMMENTS_PER_PAGE = 6;

	const {
		blogComments,
		blogId,
		onSubmit
	}: BlogCommentsProps & { blogId: number; onSubmit: Function } = $props();

	let currentPage = $state(1);
	let firstComment = $derived((currentPage - 1) * COMMENTS_PER_PAGE);
	let displayedComments = $derived(
		blogComments.slice(firstComment, firstComment + COMMENTS_PER_PAGE)
	);
	const numPages = Math.ceil(blogComments.length / COMMENTS_PER_PAGE);
	const pages = Array.from({ length: numPages }, (_, i) => i + 1);

	let editor = $state() as Readable<Editor>;
	let editorDiv: HTMLElement;
	let menuItems: Button[] = $state([]);
	let postForm = $state({
		author: '',
		text: ''
	});

	/**
	 *  Upon mounting, the tiptap editor will be initialized,
	 *  including a callback to update the text field and all
	 *  its buttons.
	 */
	onMount(async () => {
		// Inconsistent SSR issues on deployment forces import on client side
		// TODO: test v3 of tiptap
		let { StarterKit } = await import('@tiptap/starter-kit');

		editor = createEditor({
			extensions: [StarterKit],
			element: editorDiv,
			content: postForm.text,
			onUpdate: ({ editor }) => {
				postForm.text = editor.getHTML();
			},
			editorProps: {
				attributes: {
					class: `rounded-b-md p-8 outline-hidden w-auto h-82`
				}
			}
		});

		// Function to check if a formatting option is active
		const isActive = (name: string, attrs = {}) => $editor.isActive(name, attrs);

		menuItems = [
			{
				active: () => isActive('paragraph'),
				command: () => $editor.chain().focus().setParagraph().run(),
				content: 'P',
				name: 'paragraph',
				type: 'block'
			},
			{
				active: () => isActive('bold'),
				command: () => $editor.chain().focus().toggleBold().run(),
				content: 'B',
				name: 'bold',
				type: 'inline'
			},
			{
				active: () => isActive('italic'),
				command: () => $editor.chain().focus().toggleItalic().run(),
				content: 'I',
				name: 'italic',
				type: 'inline'
			}
		];
	});

	/**
	 *  Calls the POST or PUT API request for blog posts, depending
	 *  on the 'isFirst' props.
	 */
	async function saveComment() {
		if (!postForm.author || postForm.author.length === 0) {
			postForm.author = 'Anonymous';
		}

		if (!postForm.text || postForm.text.length === 0) {
			return;
		}

		const blogCommentFormData = new FormData();
		const body = {
			author: postForm.author,
			id: blogId,
			text: postForm.text
		};

		Object.entries(body).forEach(([k, v]: [string, any]) => {
			if (v) blogCommentFormData.append(k, v);
		});

		await fetch('?/saveBlogComment', {
			method: 'POST',
			body: blogCommentFormData
		});

		toaster.show(m.comment_save(), 'success');
		onSubmit(body);
	}
</script>

<div class="clear-both mb-10 flex flex-wrap justify-center gap-x-8 gap-y-4">
	<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
		<label for="author" class="input w-auto text-xl">
			<input
				type="input"
				class="input input-lg"
				placeholder="Author"
				bind:value={postForm.author}
			/>
		</label>
		<label
			for="text"
			class="input bg-base-300 flex h-100 w-auto flex-col gap-y-4 overflow-y-scroll text-xl"
		>
			<div class="mt-4 flex gap-x-4">
				{#if editor}
					<div class="join">
						{#each menuItems.filter((item) => item.type === 'block') as item}
							<button
								aria-label={item.content}
								class="btn btn-square join-item {item.active() ? 'btn-active' : ''}"
								onclick={() => item.command()}>{item.content}</button
							>
						{/each}
					</div>
					<div class="join ml-2">
						{#each menuItems.filter((item) => item.type === 'inline') as item}
							<button
								aria-label={item.content}
								class="btn btn-square join-item {item.active() ? 'btn-active' : ''}"
								onclick={() => item.command()}>{item.content}</button
							>
						{/each}
					</div>
				{/if}
			</div>
			<div class="w-full" bind:this={editorDiv}></div>
		</label>
		<div class="flex justify-between">
			<button class="btn btn-primary mt-10" onclick={saveComment}>{m.send()}</button>
		</div>
	</fieldset>
	<div class="mt-6 w-full p-6">
		<h2 class="mb-12 text-3xl">{m.comments()}</h2>
		{#each displayedComments as comment}
			<div class="flex flex-col">
				<div class="flex flex-row justify-between">
					<h2 class="text-xl">{comment.author}</h2>
					<time>{new Date(comment.date).toLocaleDateString()}</time>
				</div>
				{@html comment.text}
			</div>
			<div class="divider my-12"></div>
		{/each}
	</div>
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
