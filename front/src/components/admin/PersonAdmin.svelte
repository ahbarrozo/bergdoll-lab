<script lang="ts">
	import { onMount } from 'svelte';

	import { type Person } from 'src/types/Person.types';
	import { PlusSolid, TrashSolid } from 'svelte-awesome-icons';
	import { toaster } from 'src/stores/toaster.store';
	import ImageUploader from '../ImageUploader.svelte';
	import { type Image } from 'src/types/Image.types';
	import { locales } from 'src/common/constants';
	import TextEditor from '../TextEditor.svelte';

	let {
		id,
		date,
		description,
		images,
		link,
		locale,
		title,
		isNew,
		onDelete
	}: Person & { isNew?: boolean; onDelete: Function } = $props();

	let cally;
	let calendar = $state(date);
	let calendarRef = $state<HTMLInputElement | null>(null);
	let inputRef = $state<HTMLInputElement | null>(null);
	let modal: HTMLDialogElement;
	let postForm = $state({
		date,
		description,
		images,
		link,
		locale,
		title
	});
	let showCalendar = $state(false);

	// cally is a module that works only on client-side
	onMount(async () => {
		cally = await import('cally');
	});

	/**
	 *  Upon mounting, the tiptap editor will be initialized,
	 *  including a callback to update the text field and all
	 *  its buttons.
	 */
	onMount(async () => {
		document.addEventListener('click', handleClickOutside);
	});

	/**
	 *  Update the calendar variable when dates are selected
	 *  The exact event properties depend on the cally library's implementation
	 */
	function handleClickInside() {
		if (calendarRef) calendar = calendarRef.value;
	}

	function handleClickOutside(event: MouseEvent) {
		if (
			showCalendar &&
			calendarRef &&
			inputRef &&
			!calendarRef.contains(event.target as Node) &&
			!inputRef.contains(event.target as Node)
		)
			showCalendar = false;
	}

	/**
	 *  Add an empty image to the submission form
	 */
	function addImage() {
		const emptyImage: Image = {
			title: '',
			description: '',
			path: '',
			locale: postForm.locale
		};
		postForm.images.push(emptyImage);
	}

	/**
	 *  Calls the DELETE API function to delete the person
	 *  based on its ID. This function is triggered at the
	 *  confirmation of the dialog message. In case of success,
	 *  a parent function 'onDelete' will be called to remove
	 *  the element from the DOM.
	 */
	async function deletePerson() {
		const personFormData = new FormData();
		personFormData.append('id', id!.toString());

		const response = await fetch('?/deletePerson', {
			method: 'POST',
			body: personFormData
		});
		const responseData = await response.json();

		if (responseData.status === 200) {
			toaster.show('Person successfully deleted.', 'success');
			onDelete(id);
		} else toaster.show('Error: could not delete person from database.', 'error');
		modal.close();
	}

	/**
	 *  Function to be called upon an onDelete event from
	 *  ImageUploader is triggered on the child component.
	 *  It filters people by ID for deleted people
	 *
	 *  @param index : number index of the deleted work
	 */
	function deleteImage(index: number) {
		postForm.images = postForm.images?.slice(0, index).concat(postForm.images?.slice(index + 1));
	}

	/**
	 *  Calls the POST or PUT API request for people, depending
	 *  on the presence of an id prop.
	 */
	async function savePerson() {
        console.log('START HERE')
		// Form validation
		if (!postForm.title || postForm.title.length === 0) {
			toaster.show('Please include a name.', 'error');
			return;
		}

		if (!calendar || calendar.length === 0) {
			toaster.show('Please choose a date.', 'error');
			return;
		}

		const personFormData = new FormData();
		const body: Person = {
			id, // include only if it exists
			date: calendar,
			description,
			link: postForm.link,
			locale: postForm.locale,
			title: postForm.title,
			images: []
		};
        console.log({ body })
		Object.entries(body).forEach(([k, v]) => {
			if (v) personFormData.append(k, v);
		});

		/**
		 *  JSON stringify the array, to prevent issues with
		 *  formData converting empty arrays into empty strings
		 */
		personFormData.set('images', JSON.stringify(postForm.images));

        console.log(personFormData)
		const response = !id
			? await fetch('?/savePerson', {
					method: 'POST',
					body: personFormData
				})
			: await fetch('?/updatePerson', {
					method: 'POST',
					body: personFormData
				});

        console.log({response})
		const responseData = await response.json();
		switch (responseData.status) {
			case 200:
				toaster.show('Person successfully updated.', 'success');
				break;
			case 201:
				toaster.show('New person successfully created.', 'success');
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

<fieldset
	class={`fieldset ${isNew ? 'w-full' : 'w-[4/9]'} bg-base-200 border-base-300 rounded-box border p-4`}
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
	<div class="flex flex-row gap-x-4">
		<label for="title" class="input w-full text-xl">
			<input type="input" class="input input-lg" bind:value={postForm.title} placeholder="Name" />
		</label>
		<label for="date" class="input z-50 w-100 text-xl">
			<input
				type="input"
				class="input input-lg"
				value={calendar.slice(0, 10)}
				placeholder="Date"
				bind:this={inputRef}
				onfocus={() => (showCalendar = true)}
			/>
			{#if showCalendar}
				<div class="card w-180 p-10">
					<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
					<calendar-date
						class="z-50 w-full"
						months={1}
						bind:this={calendarRef}
						value={calendar}
						onclick={handleClickInside}
					>
						<svg
							aria-label="Previous"
							class="calendar-nav-button"
							slot="previous"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
						>
							<path d="M15.75 19.5 8.25 12l7.5-7.5"></path>
						</svg>
						<svg
							aria-label="Next"
							class="calendar-nav-button"
							slot="next"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
						>
							<path d="M8.25 4.5 15.75 12l-7.5 7.5"></path>
						</svg>
						<div class="flex flex-row gap-x-24">
							<calendar-month></calendar-month>
						</div>
					</calendar-date>
				</div>
			{/if}
		</label>
	</div>
	<label for="title" class="input w-full text-xl">
		<input type="input" class="input input-lg" bind:value={postForm.link} placeholder="Link" />
	</label>
	<label
		for="text"
		class="input bg-base-300 flex h-100 w-auto flex-col gap-y-4 overflow-y-scroll text-xl"
	>
		<TextEditor bind:html={description} />
	</label>

	<h3 class="m-4 text-3xl">Image</h3>
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
		<button class="btn btn-primary mt-10" onclick={savePerson}>Save</button>
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
		<h3 class="text-lg font-bold">Delete "{title}"</h3>
		<p class="py-4">Are you sure you want to proceed?</p>
		<div class="modal-action">
			<form class="flex gap-x-4" method="dialog">
				<button class="btn btn-error text-white" onclick={deletePerson}>Yes</button>
				<button class="btn btn-secondary text-white">No</button>
			</form>
		</div>
	</div>
</dialog>
