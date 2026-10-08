<script lang="ts">
	import type { Button } from 'src/types/TextEditor.types';
	import { onMount } from 'svelte';
	import { createEditor } from 'svelte-tiptap';
	import type { Readable } from 'svelte/store';

	let { html = $bindable(), imageContent = false, youtubeContent = false } = $props();
	let editor = $state() as Readable<any>;
	let editorDiv: HTMLElement;
	let menuItems: Button[] = $state([]);

	/**
	 *  Upon mounting, the tiptap editor will be initialized,
	 *  including a callback to update the text field and all
	 *  its buttons.
	 */
	onMount(async () => {
		let Audio = await import('src/lib/AudioExtension');
		let { Image } = await import('@tiptap/extension-image');
		let { StarterKit } = await import('@tiptap/starter-kit');
		let { Youtube } = await import('@tiptap/extension-youtube');

		editor = createEditor({
			//@ts-ignore
			extensions: [StarterKit, Image, Youtube],
			element: editorDiv,
			content: html,
			onUpdate: ({ editor }) => {
				html = editor.getHTML();
			},
			editorProps: {
				attributes: {
					class: `rounded-b-md p-8 outline-hidden h-82 w-auto`
				}
			}
		});

		editor.subscribe(($editor) => {
			if ($editor) {
				const isActive = (name: string, attrs = {}) => $editor.isActive(name, attrs);

				menuItems = [
					{
						active: () => isActive('heading', { level: 1 }),
						command: () => $editor.chain().focus().toggleHeading({ level: 1 }).run(),
						content: 'H1',
						name: 'heading-1',
						type: 'block'
					},
					{
						active: () => isActive('heading', { level: 2 }),
						command: () => $editor.chain().focus().toggleHeading({ level: 2 }).run(),
						content: 'H2',
						name: 'heading-2',
						type: 'block'
					},
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

				if (imageContent)
					menuItems.push({
						active: () => false,
						command: () => insertImage(),
						content: '🖼️',
						name: 'image',
						type: 'block'
					});

				if (youtubeContent)
					menuItems.push({
						active: () => false,
						command: () => insertYoutubeVideo(),
						content: '📺',
						name: 'video',
						type: 'block'
					});
			}
		});
	});

	/**
	 * Shows a prompt to upload an image and include it in the text
	 */
	function insertImage() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.multiple = false;

		input.oncancel = () => input.remove();
		input.onchange = async (e: Event) => {
			// @ts-ignore
			const file = e.target?.files?.[0];

			uploadToServer(file);

			if (file && editor) {
				$editor
					.chain()
					.focus()
					.insertContent({
						type: 'image',
						attrs: {
							src: `images/${file.name}`,
							alt: file.name
						}
					})
					.run();
			}

			input.remove();
		};

		input.click();
		return true;
	}

	function insertYoutubeVideo() {
		const url = prompt('Enter YouTube URL: ');
		const width = 640;
		const height = 480;

		if (url) {
			return $editor.commands.setYoutubeVideo({
				src: url,
				width: Math.max(320, width) || 640,
				height: Math.max(180, height) || 480
			});
		}

		return false;
	}

	// Function to upload file to server
	function uploadToServer(file: File) {
		try {
			const formData = new FormData();
			formData.append('image', file);

			fetch('?/uploadImage', {
				method: 'POST',
				body: formData
			});
		} catch (error) {
			console.error('Error uploading file:', error);
		}
	}
</script>

<div class="sticky top-0 z-1 flex gap-x-4 bg-transparent pt-4">
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
