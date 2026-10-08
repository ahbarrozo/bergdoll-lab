<script lang="ts">
	import type { AboutSection } from 'src/types/About.types';
	import { PlusSolid, TrashSolid } from 'svelte-awesome-icons';
	import { toaster } from 'src/stores/toaster.store';
	import ImageUploader from '../ImageUploader.svelte';
	import type { Image } from 'src/types/Image.types';
	import { locales } from 'src/common/constants';
	import TextEditor from '../TextEditor.svelte';

	let { id, sectionNum, images, text, locale, onDelete }: AboutSection & { onDelete: Function } =
		$props();

	let modal: HTMLDialogElement;
	let postForm = $state({
		images,
		locale
	});

	/**
	 *  Add an empty image to the submission form
	 */
	function addImage() {
		const emptyImage = {
			title: '',
			description: '',
			path: '',
			locale
		};
		postForm.images.push(emptyImage);
	}

	/**
	 *  Calls the DELETE API function to delete the section
	 *  based on its ID. This function is triggered at the
	 *  confirmation of the dialog message. In case of success,
	 *  a parent function 'onDelete' will be called to remove
	 *  the element from the DOM.
	 */
	async function deleteAboutSection() {
		if (!id) {
			onDelete(id);
			return;
		}
		const aboutSectionFormData = new FormData();
		aboutSectionFormData.append('id', id!.toString());

		const response = await fetch('?/deleteAboutSection', {
			method: 'POST',
			body: aboutSectionFormData
		});
		const responseData = await response.json();

		if (responseData.status === 200) {
			toaster.show('Section deleted', 'success');
			onDelete(id);
		} else toaster.show('Error: could not delete section', 'error');
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
	 *  Calls the POST or PUT API request for about sections, depending
	 *  on the presence of an id prop.
	 */
	async function saveAboutSection() {
		// Validating before allowing submission
		if (!text || text.length === 0) {
			toaster.show('Please insert a valid text', 'error');
			return;
		}

		const aboutSectionFormData = new FormData();
		const body = {
			id: id && id.toString(), // include only if it exists
			sectionNum: sectionNum && sectionNum.toString(), // include only if it exists
			text,
			locale
		};

		Object.entries(body).forEach(([k, v]) => {
			if (v) aboutSectionFormData.append(k, v);
		});

		/**
		 *  JSON stringify the array, to prevent issues with
		 *  formData converting empty arrays into empty strings
		 */
		aboutSectionFormData.append('images', JSON.stringify(postForm.images));

		const response = !body.id
			? await fetch('?/saveAboutSection', {
					method: 'POST',
					body: aboutSectionFormData
				})
			: await fetch('?/updateAboutSection', {
					method: 'POST',
					body: aboutSectionFormData
				});

		const responseData = await response.json();
		switch (responseData.status) {
			case 200:
				toaster.show('Section successfully updated', 'success');
				break;
			case 201:
				toaster.show('New section successfully created', 'success');
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
</script>

<h2 class="m-4 text-3xl">
	{sectionNum === 0 ? `New section` : `Section ${sectionNum} - ${locale.toUpperCase()}`}
</h2>
<fieldset class={`fieldset bg-base-200 border-base-300 rounded-box mb-4 w-full border p-4`}>
	<label for="name" class="select w-[20.28vw] text-xl">
		<select class="select select-lg" bind:value={locale} placeholder="Language">
			{#each locales as locale}
				<option value={locale.name}>
					{locale.displayName}
				</option>
			{/each}
		</select>
	</label>
	<label
		for="text"
		class="input bg-base-300 flex h-100 w-auto flex-col gap-y-4 overflow-y-scroll text-xl"
	>
		<TextEditor bind:html={text} />
	</label>

	<h3 class="m-4 text-3xl">Imagem</h3>
	{#if postForm.images && postForm.images.length > 0}
		{#each postForm.images as image, i}
			<ImageUploader
				{...image}
				onDelete={() => deleteImage(i)}
				onUpdate={(updatedImage: Image) => updateImage(i, updatedImage)}
			/>
		{/each}
	{/if}
	{#if postForm.images && postForm.images.length === 0}
		<div class="w-full">
			<button class="btn btn-primary btn-outline mt-10" onclick={addImage}>
				<PlusSolid />
				New image
			</button>
		</div>
	{/if}

	<div class="flex justify-between">
		<button class="btn btn-primary mt-10" onclick={saveAboutSection}>Save</button>
		<button class="btn btn-error mt-10 text-white" onclick={showModal}>
			<TrashSolid />
			Remove
		</button>
	</div>
</fieldset>
<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Remove paragraph</h3>
		<p class="py-4">Are you sure you want to proceed?</p>
		<div class="modal-action">
			<form class="flex gap-x-4" method="dialog">
				<button class="btn btn-error text-white" onclick={deleteAboutSection}>Yes</button>
				<button class="btn btn-secondary text-white">No</button>
			</form>
		</div>
	</div>
</dialog>
