<script lang="ts">
	import { isEmpty } from 'src/common/dataParsing';
	import { toaster } from 'src/stores/toaster.store';
	import type { BlogPostType } from 'src/types/BlogPostType.types';
	import { TrashSolid } from 'svelte-awesome-icons';
	import ColorPicker from 'svelte-awesome-color-picker';

	let { id, color, display_name, name, onDelete }: BlogPostType & { onDelete: Function } = $props();

	let postFormData = $state<BlogPostType>({
		color,
		display_name,
		name
	});
	let modal: HTMLDialogElement;

	/**
	 *  Calls the DELETE API function to delete blog post types
	 *  based on their ID. This function is triggered at the
	 *  confirmation of the dialog message. In case of success,
	 *  a parent function 'onDelete' will be called to remove
	 *  the element from the DOM.
	 */
	async function deleteBlogPostType() {
		if (!id) return;

		const blogPostTypeFormData = new FormData();
		blogPostTypeFormData.append('id', id.toString());

		const response = await fetch('?/deleteBlogPostType', {
			method: 'POST',
			body: blogPostTypeFormData
		});
		const responseData = await response.json();

		if (responseData.status === 200) {
			toaster.show('Blog post type deleted', 'success');
			onDelete(id);
		} else toaster.show('Error: could not blog post type', 'error');
		modal.close();
	}

	// Creates a POST request body to save a new social meida
	async function saveBlogPostType() {
		// Form validation
		if (isEmpty(postFormData.color)) {
			toaster.show('Please choose a color.', 'error');
			return;
		}

		if (isEmpty(postFormData.display_name)) {
			toaster.show('Please choose a name.', 'error');
			return;
		}

		const blogPostTypeFormData = new FormData();
		const body: BlogPostType = {
			id,
			color: postFormData.color,
			display_name: postFormData.display_name,
			name: postFormData.display_name
		};

		Object.entries(body).forEach(([k, v]) => {
			if (v) blogPostTypeFormData.append(k, v);
		});

		const response = !id
			? await fetch('?/saveBlogPostType', {
					method: 'POST',
					body: blogPostTypeFormData
				})
			: await fetch('?/updateBlogPostType', {
					method: 'POST',
					body: blogPostTypeFormData
				});

		const responseData = await response.json();
		switch (responseData.status) {
			case 200:
				toaster.show('Blog post type successfully updated', 'success');
				break;
			case 201:
				toaster.show('New blog post type successfully created', 'success');
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
</script>

<fieldset class={`fieldset bg-base-200 border-base-300 rounded-box mb-4 w-full border p-4`}>
	<div class="flex w-full flex-row flex-wrap gap-x-4 gap-y-8">
		<label for="color" class="input w-[28.66vw] text-xl">
			<ColorPicker bind:hex={postFormData.color} position="responsive" />
			<input
				type="input"
				class="input input-lg"
				bind:value={postFormData.color}
				placeholder="Color"
			/>
		</label>
		<label for="name" class="input w-[28.66vw] text-xl">
			<input
				type="input"
				class="input input-lg"
				bind:value={postFormData.display_name}
				placeholder="Name"
			/>
		</label>
	</div>
	<div class="flex justify-between">
		<button class="btn btn-primary mt-10" onclick={saveBlogPostType}>Save</button>
		<button class="btn btn-error mt-10 text-white" onclick={showModal}>
			<TrashSolid />
			Remove
		</button>
	</div>
</fieldset>
<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Remove mídia social</h3>
		<p class="py-4">Are you sure you want to proceed?</p>
		<div class="modal-action">
			<form class="flex gap-x-4" method="dialog">
				<button class="btn btn-error text-white" onclick={deleteBlogPostType}>Yes</button>
				<button class="btn btn-secondary text-white">No</button>
			</form>
		</div>
	</div>
</dialog>
