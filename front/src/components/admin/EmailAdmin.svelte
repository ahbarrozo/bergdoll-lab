<script lang="ts">
	import { toaster } from 'src/stores/toaster.store';
	import { emailTypes, locales } from 'src/common/constants';
	import { isEmpty } from 'src/common/dataParsing';
	import type { Email } from 'src/types/Email.types';
	import TextEditor from '../TextEditor.svelte';

	let modal: HTMLDialogElement;
	let emailForm = $state({
		images: [],
		title: '',
		type: null,
		locale: null,
		text: ''
	});

	/**
	 *  Calls the POST or PUT API request for blog posts, depending
	 *  on the 'isFirst' props.
	 */
	async function sendEmail() {
		if (isEmpty(emailForm.locale)) {
			toaster.show('Please include a locale.', 'error');
			return;
		}

		if (isEmpty(emailForm.text)) {
			toaster.show('Please include a text.', 'error');
			return;
		}

		if (isEmpty(emailForm.title)) {
			toaster.show('Please include a title.', 'error');
			return;
		}

		if (isEmpty(emailForm.type)) {
			toaster.show('Please include a type.', 'error');
			return;
		}

		const emailFormData = new FormData();
		const body: Email = {
			locale: emailForm.locale!,
			text: emailForm.text,
			type: emailForm.type!,
			title: emailForm.title
		};

		Object.entries(body).forEach(([k, v]: [string, any]) => {
			if (v) emailFormData.append(k, v);
		});

		const response = await fetch('?/sendEmail', {
			method: 'POST',
			body: emailFormData
		});

		const responseData = await response.json();
		switch (responseData.status) {
			case 200:
				toaster.show('E-mails successfully sent', 'success');
				break;
			default:
				const message: string = JSON.parse(responseData.data)[0];
				toaster.show(message, 'error');
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

<fieldset class={`fieldset bg-base-200 border-base-300 rounded-box w-full border p-4`}>
	<div class="flex flex-row gap-6">
		<label for="name" class="select w-[15%] text-xl">
			<select class="select select-lg" bind:value={emailForm.locale} placeholder="Language">
				{#each locales as locale}
					<option value={locale.name}>
						{locale.displayName}
					</option>
				{/each}
			</select>
		</label>
		<label for="name" class="floating-label select w-[40%] text-xl">
			<span>Type</span>
			<select class="select select-lg" bind:value={emailForm.type} placeholder="Type">
				{#each emailTypes as type}
					<option value={type.name}>
						{type.displayName}
					</option>
				{/each}
			</select>
		</label>
	</div>
	<label for="title" class="input w-auto text-xl">
		<input type="input" class="input input-lg" placeholder="Título" bind:value={emailForm.title} />
	</label>
	<label
		for="text"
		class="input bg-base-300 flex h-100 w-auto flex-col gap-y-4 overflow-y-scroll text-xl"
	>
		<TextEditor bind:html={emailForm.text} imageContent youtubeContent />
	</label>
	<div class="mt-4 flex justify-between">
		<button class="btn btn-primary" onclick={showModal}>Send e-mails</button>
	</div>
</fieldset>
<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Send e-mail "{emailForm.title}"</h3>
		<p class="py-4">Are you sure you want to proceed?</p>
		<div class="modal-action">
			<form class="flex gap-x-4" method="dialog">
				<!-- if there is a button in form, it will close the modal -->
				<button class="btn btn-error text-white" onclick={sendEmail}>Yes</button>
				<button class="btn btn-secondary text-white">No</button>
			</form>
		</div>
	</div>
</dialog>
