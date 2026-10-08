<script lang="ts">
	import { PlusSolid, TrashSolid } from 'svelte-awesome-icons';

	import { toaster } from 'src/stores/toaster.store';
	import { type BlogPostProps } from 'src/types/BlogPost.types';
	import { PUBLIC_LOCALE } from '$env/static/public';
	import ImageUploader from '../ImageUploader.svelte';
	import type { Image } from 'src/types/Image.types';
	import { blogPostTypes, locales } from 'src/common/constants';
	import DocumentUploader from '../DocumentUploader.svelte';
	import { type Document } from 'src/types/Document.types';
	import TextEditor from '../TextEditor.svelte';

	let {
		id,
		audios,
		date,
		documents,
		postNum,
		images,
		locale,
		subtitle,
		text,
		title,
		type,
		isFirst,
		onDelete
	}: BlogPostProps & { onDelete: Function } = $props();

	const dateFormat = new Intl.DateTimeFormat(PUBLIC_LOCALE, {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	});
	const dateString = $derived(dateFormat.format(new Date(date)));

	let modal: HTMLDialogElement;
	let postForm = $state({
		locale,
		subtitle,
		title,
		type,
		images,
		documents
	});

	function addDocument() {
		const emptyDocument = {
			title: '',
			description: '',
			path: '',
			locale: postForm.locale
		};
		postForm.documents.push(emptyDocument);
	}

	function addImage() {
		const emptyImage = {
			title: '',
			description: '',
			path: '',
			locale: postForm.locale
		};
		postForm.images.push(emptyImage);
	}

	/**
	 *  Calls the DELETE API function to delete the post
	 *  based on its ID. This function is triggered at the
	 *  confirmation of the dialog message. In case of success,
	 *  a parent function 'onDelete' will be called to remove
	 *  the element from the DOM.
	 */
	async function deletePost() {
		const blogPostFormData = new FormData();
		blogPostFormData.append('id', id!.toString());

		const response = await fetch('?/deleteBlogPost', {
			method: 'POST',
			body: blogPostFormData
		});
		const responseData = await response.json();

		if (responseData.status === 200) {
			toaster.show('Post deleted', 'success');
			onDelete(id);
		} else toaster.show('Error: could not delete post', 'error');
		modal.close();
	}

	/**
	 *  Function to be called upon an onDelete event from
	 *  ImageUploader is triggered on the child component.
	 *  It filters the sections by ID for deleted sections
	 *
	 *  @param index : number index of the deleted section
	 */
	function deleteImage(index: number) {
		postForm.images = postForm.images?.slice(0, index).concat(postForm.images?.slice(index + 1));
	}

	/**
	 *  Function to be called upon an onDelete event from
	 *  DocumentUploader is triggered on the child component.
	 *  It filters the sections by ID for deleted sections
	 *
	 *  @param index : number index of the deleted section
	 */
	function deleteDocument(index: number) {
		postForm.documents = postForm.documents
			?.slice(0, index)
			.concat(postForm.documents?.slice(index + 1));
	}

	/**
	 *  Calls the POST or PUT API request for blog posts, depending
	 *  on the 'isFirst' props.
	 */
	async function savePost() {
		let response;

		if (!postForm.title || postForm.title.length === 0) {
			toaster.show('Please include a title.', 'error');
			return;
		}

		if (!postForm.subtitle || postForm.subtitle.length === 0) {
			toaster.show('Please include a subtitle.', 'error');
			return;
		}

		if (!text || text.length === 0) {
			toaster.show('Please include a text.', 'error');
			return;
		}

		const blogPostFormData = new FormData();
		const body = {
			id: id && id.toString(), // include only if it exists
			date: date ?? new Date().toISOString(),
			postNum: postNum && postNum.toString(),
			locale: postForm.locale,
			text,
			title: postForm.title,
			type: postForm.type,
			subtitle: postForm.subtitle
		};

		Object.entries(body).forEach(([k, v]: [string, any]) => {
			if (v) blogPostFormData.append(k, v);
		});

		/**
		 *  JSON stringify the array, to prevent issues with
		 *  formData converting empty arrays into empty strings
		 */
		blogPostFormData.append('audios', JSON.stringify(postForm.audios));
		blogPostFormData.append('images', JSON.stringify(postForm.images));
		blogPostFormData.append('documents', JSON.stringify(postForm.documents));

		if (body.id)
			response = await fetch('?/updateBlogPost', {
				method: 'POST',
				body: blogPostFormData
			});
		else {
			response = await fetch('?/saveBlogPost', {
				method: 'POST',
				body: blogPostFormData
			});
		}

		const responseData = await response.json();
		switch (responseData.status) {
			case 200:
				toaster.show('Post saved to the database', 'success');
				break;
			case 201:
				toaster.show('New text successfully created', 'success');
				break;
			default:
				toaster.show('An error has occurred', 'error');
		}
	}

	/**
	 *  Checks if the dialog HTML element is mounted, and if so,
	 *  calls the showModal function
	 */
	function showModal() {
		if (modal) {
			modal.showModal();
		}
	}

	/**
	 *  Updates the list of images by updating the image at the
	 *  index i of the array
	 *
	 *  @param i : number - index in the array of images
	 *  @param image : Image - image object to replace in index i
	 */
	function updateImage(i: number, image: Image) {
		if (postForm.images && postForm.images.length > i) postForm.images[i] = { ...image };
	}

	/**
	 *  Updates the list of documents by updating the document at the
	 *  index i of the array
	 *
	 *  @param i : number - index in the array of documents
	 *  @param document : Document - document object to replace in index i
	 */
	function updateDocument(i: number, document: Document) {
		if (postForm.documents && postForm.documents.length > i)
			postForm.documents[i] = { ...document };
	}
</script>

<fieldset class={`fieldset bg-base-200 border-base-300 rounded-box w-full border p-4`}>
	<div class="flex flex-row gap-6">
		<label for="name" class="select w-[15%] text-xl">
			<select class="select select-lg" bind:value={postForm.locale} placeholder="Language">
				{#each locales as locale}
					<option value={locale.name}>
						{locale.displayName}
					</option>
				{/each}
			</select>
		</label>
		<label for="name" class="floating-label select w-[40%] text-xl">
			<span>Type</span>
			<select class="select select-lg" bind:value={postForm.type} placeholder="Type">
				{#each blogPostTypes as blogPostType}
					<option value={blogPostType.name}>
						{blogPostType.displayName}
					</option>
				{/each}
			</select>
		</label>
	</div>
	<h2 class="text-xl">{dateString}</h2>
	<label for="title" class="input w-auto text-xl">
		<input type="input" class="input input-lg" placeholder="Title" bind:value={postForm.title} />
	</label>
	<label for="subtitle" class="input w-auto text-xl">
		<input
			type="input"
			class="input input-lg"
			placeholder="Subtitle"
			bind:value={postForm.subtitle}
		/>
	</label>
	<label
		for="text"
		class="input bg-base-300 flex h-100 w-auto flex-col gap-y-4 overflow-y-scroll text-xl"
	>
		<TextEditor bind:html={text} imageContent youtubeContent />
	</label>
	<h3 class="m-4 text-3xl">Images</h3>
	{#if postForm.images && postForm.images.length > 0}
		{#each postForm.images as image, i}
			<ImageUploader
				{...image}
				onDelete={() => deleteImage(i)}
				onUpdate={(updatedImage: Image) => updateImage(i, updatedImage)}
			/>
		{/each}
	{/if}
	<div class="w-full">
		<button class="btn btn-primary btn-outline" onclick={addImage}>
			<PlusSolid />
			New image
		</button>
	</div>
	<div class="divider"></div>
	<h3 class="m-4 text-3xl">Documents</h3>
	{#if postForm.documents && postForm.documents.length > 0}
		{#each postForm.documents as document, i}
			<DocumentUploader
				{...document}
				onDelete={() => deleteDocument(i)}
				onUpdate={(updatedDocument: Document) => updateDocument(i, updatedDocument)}
			/>
		{/each}
	{/if}
	<div class="w-full">
		<button class="btn btn-primary btn-outline" onclick={addDocument}>
			<PlusSolid />
			New document
		</button>
	</div>
	<div class="mt-4 flex justify-between">
		<button class="btn btn-primary" onclick={savePost}>Save Post</button>
		{#if !isFirst}
			<button class="btn btn-error text-white" onclick={showModal}>
				<TrashSolid />
				Remove Post
			</button>
		{/if}
	</div>
</fieldset>
<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Remove post "{title}"</h3>
		<p class="py-4">Are you sure you want to proceed?</p>
		<div class="modal-action">
			<form class="flex gap-x-4" method="dialog">
				<!-- if there is a button in form, it will close the modal -->
				<button class="btn btn-error text-white" onclick={deletePost}>Yes</button>
				<button class="btn btn-secondary text-white">No</button>
			</form>
		</div>
	</div>
</dialog>
