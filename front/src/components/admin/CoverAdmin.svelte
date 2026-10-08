<script lang="ts">
	import { TrashSolid } from 'svelte-awesome-icons';
	import { toaster } from 'src/stores/toaster.store';
	import ImageUploader from '../ImageUploader.svelte';
	import { type Image } from 'src/types/Image.types';
	import { locales } from 'src/common/constants';

	let {
		id,
		description,
		path,
		locale,
		title,
        isNew,
        onDelete
	}: Image & { isNew?: boolean; onDelete: Function }  = $props();

	let modal: HTMLDialogElement;
	let postForm = $state({
		description,
		locale,
        path,
		title
	}) as Image;

	/**
	 *  Calls the DELETE API function to delete the cover
	 *  based on its ID. This function is triggered at the
	 *  confirmation of the dialog message. In case of success,
	 *  a parent function 'onDelete' will be called to remove
	 *  the element from the DOM.
	 */
	async function deleteCover() {
		const coverFormData = new FormData();
		coverFormData.append('id', id!.toString());

		const response = await fetch('?/deleteWork', {
			method: 'POST',
			body: coverFormData
		});
		const responseData = await response.json();

		if (responseData.status === 200) {
			toaster.show('Work successfully deleted.', 'success');
			onDelete(id);
		} else toaster.show('Error: could not delete work from database.', 'error');
		modal.close();
	}

	/**
	 *  Calls the POST or PUT API request for works, depending
	 *  on the presence of an id prop.
	 */
	async function saveCover() {
		// Form validation
		if (!postForm.title || postForm.title.length === 0) {
			toaster.show('Please include a title.', 'error');
			return;
		}

		const coverFormData = new FormData();
		const body: Image = {
			id, // include only if it exists
			description,
			locale: postForm.locale,
            path: postForm.path,
			title: postForm.title,
		};

		Object.entries(body).forEach(([k, v]) => {
			if (v) coverFormData.append(k, v);
		});

		const response = !id
			? await fetch('?/saveCover', {
					method: 'POST',
					body: coverFormData
				})
			: await fetch('?/updateCover', {
					method: 'POST',
					body: coverFormData
				});

		const responseData = await response.json();
		switch (responseData.status) {
			case 200:
				toaster.show('Cover successfully updated.', 'success');
				break;
			case 201:
				toaster.show('New cover successfully created.', 'success');
				break;
			default:
				toaster.show('Error: could not store changes to database.', 'error');
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
	 *  Updates the submission form with image info 
	 *
	 *  @param image : Image - image object to replace
	 */
	function updateImage( image: Image) {
		postForm = { ...image };
	}
</script>

<fieldset
	class={`fieldset w-full bg-base-200 border-base-300 rounded-box border p-4`}
>
	<label for="name" class="select w-[20.28vw] text-xl">
		<select class="select select-lg" bind:value={postForm.locale} placeholder="Language">
			{#each locales as locale}
				<option value={locale.name}>
					{locale.displayName}
				</option>
			{/each}
		</select>
	</label>

	<ImageUploader
        {...postForm}
		onDelete={() => null}
		onUpdate={(updatedImage: Image) => updateImage(updatedImage)}
			/>

	<div class="flex justify-between">
		<button class="btn btn-primary mt-10" onclick={saveCover}>Save</button>
		{#if !isNew}
			<button class="btn btn-error mt-10 text-white" onclick={showModal}>
				<TrashSolid />
				Remove
			</button>
		{/if}
	</div>
</fieldset>
<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Delete cover</h3>
		<p class="py-4">Are you sure you want to proceed?</p>
		<div class="modal-action">
			<form class="flex gap-x-4" method="dialog">
				<button class="btn btn-error text-white" onclick={deleteCover}>Yes</button>
				<button class="btn btn-secondary text-white">No</button>
			</form>
		</div>
	</div>
</dialog>
