<script lang="ts">
	import { isEmpty } from 'src/common/dataParsing';
	import { toaster } from 'src/stores/toaster.store';
	import type { Contact } from 'src/types/Contact.types';
	import { TrashSolid } from 'svelte-awesome-icons';

	let { id, contact, mail, name, phone, onDelete }: Contact & { onDelete: Function } = $props();
	let modal: HTMLDialogElement;
	let postFormData = $state({
		id,
		contact,
		mail,
		name,
		phone
	});

	/**
	 *  Calls the DELETE API function to delete the contact
	 *  based on its ID. This function is triggered at the
	 *  confirmation of the dialog message. In case of success,
	 *  a parent function 'onDelete' will be called to remove
	 *  the element from the DOM.
	 */
	async function deleteContact() {
		const contactFormData = new FormData();
		contactFormData.append('id', id!.toString());

		const response = await fetch('?/deleteContact', {
			method: 'POST',
			body: contactFormData
		});
		const responseData = await response.json();

		if (responseData.status === 200) {
			toaster.show('EventProps deleted', 'success');
			onDelete();
		} else toaster.show('Error: could not delete event', 'error');
		modal.close();
	}

	// Creates a POST request body to save a new contact
	async function saveContact() {
		// Form validation
		if (isEmpty(postFormData.contact)) {
			toaster.show('Please include a contact.', 'error');
			return;
		}

		if (isEmpty(postFormData.name)) {
			toaster.show('Please include a name.', 'error');
			return;
		}

		if (isEmpty(postFormData.mail)) {
			toaster.show('Please inclde an e-mail.', 'error');
			return;
		}

		const contactFormData = new FormData();
		const body: Contact = {
			id,
			contact: postFormData.contact,
			mail: postFormData.mail,
			phone: postFormData.phone,
			name: postFormData.name
		};

		Object.entries(body).forEach(([k, v]) => {
			if (v) contactFormData.append(k, v);
		});

		const response = !id
			? await fetch('?/saveContact', {
					method: 'POST',
					body: contactFormData
				})
			: await fetch('?/updateContact', {
					method: 'POST',
					body: contactFormData
				});

		const responseData = await response.json();
		switch (responseData.status) {
			case 200:
				toaster.show('Contact successfully updated', 'success');
				break;
			case 201:
				toaster.show('New contact successfully created', 'success');
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
		<label for="name" class="input w-[20.28vw] text-xl">
			<input
				type="input"
				class="input input-lg"
				bind:value={postFormData.name}
				placeholder="Title"
			/>
		</label>
		<label for="contact" class="input w-[30vw] text-xl">
			<input
				type="input"
				class="input input-lg"
				bind:value={postFormData.contact}
				placeholder="Person in charge"
			/>
		</label>
		<label for="mail" class="input w-[28.66vw] text-xl">
			<input
				type="input"
				class="input input-lg"
				bind:value={postFormData.mail}
				placeholder="E-mail"
			/>
		</label>
		<label for="phone" class="input w-[28.66vw] text-xl">
			<input
				type="input"
				class="input input-lg"
				bind:value={postFormData.phone}
				placeholder="Phone number"
			/>
		</label>
	</div>
	<div class="flex justify-between">
		<button class="btn btn-primary mt-10" onclick={saveContact}>Save</button>
		<button class="btn btn-error mt-10 text-white" onclick={showModal}>
			<TrashSolid />
			Remove
		</button>
	</div>
</fieldset>
<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Remove contact</h3>
		<p class="py-4">Are you sure you want to proceed?</p>
		<div class="modal-action">
			<form class="flex gap-x-4" method="dialog">
				<button class="btn btn-error text-white" onclick={deleteContact}>Yes</button>
				<button class="btn btn-secondary text-white">No</button>
			</form>
		</div>
	</div>
</dialog>
