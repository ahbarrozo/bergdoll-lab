<script lang="ts">
	import { m } from 'src/paraglide/messages';
	import type { ContactProps } from '../types/Contact.types';

	import {
		FacebookBrands,
		InstagramBrands,
		SpotifyBrands,
		YoutubeBrands
	} from 'svelte-awesome-icons';
	import PrivacyPolicyEn from './privacy_policy/PrivacyPolicyEN.svelte';
	import { getLocale } from 'src/paraglide/runtime';
	import PrivacyPolicyFr from './privacy_policy/PrivacyPolicyFR.svelte';
	import { toaster } from 'src/stores/toaster.store';
	import { isEmpty } from 'src/common/dataParsing';
	import type { EmailSubscriptionProps } from 'src/types/Email.types';

	const { contacts, socialMedia }: ContactProps = $props();

	let locale = getLocale();
	let postForm = $state<EmailSubscriptionProps>({
		email: '',
		events: false,
		updates: false,
		locale
	});

	let modal: HTMLDialogElement;

	function getIcon(name: string) {
		switch (name) {
			case 'facebook':
				return FacebookBrands;
			case 'instagram':
				return InstagramBrands;
			case 'spotify':
				return SpotifyBrands;
			case 'youtube':
				return YoutubeBrands;
		}
	}

	function goToLink(link: string) {
		return window.open(link, '_blank');
	}

	function showModal() {
		if (modal) modal.showModal();
	}

	async function subscribe() {
		if (isEmpty(postForm.email)) {
			toaster.show(m.form_valid_email(), 'error');
			return;
		}

		const subscribeFormData = new FormData();
		const body: EmailSubscriptionProps = {
			email: postForm.email,
			events: postForm.events,
			updates: postForm.updates,
			locale: postForm.locale
		};

		Object.entries(body).forEach(([k, v]) => {
			subscribeFormData.append(k, v);
		});

		console.log(subscribeFormData);
		const response = await fetch('?/subscribe', {
			method: 'POST',
			body: subscribeFormData
		});

		const responseData = await response.json();
		switch (responseData.status) {
			case 200:
				toaster.show('Subscribed!', 'success');
				break;
			default:
				toaster.show('An error has occurred', 'error');
		}
	}
</script>

<div class="flex flex-wrap justify-between gap-y-4 p-6 pb-10 text-justify text-lg">
	<div>
		<h2 class="pb-4 text-2xl">Social media</h2>
		<div class="mb-10 flex gap-x-24 gap-y-4 text-justify text-lg">
			{#each socialMedia as social}
				{@const IconComponent = getIcon(social.name)}
				<IconComponent class="icon" onclick={() => goToLink(social.link)} />
			{/each}
		</div>
	</div>
	<div class="mb-10 flex flex-wrap gap-x-24 gap-y-4 text-justify text-lg">
		{#each contacts as contact}
			<div>
				<h2 class="pb-4 text-2xl">{contact.name}</h2>
				<div>{contact.contact}</div>
				<div>{contact.mail}</div>
				<div>{contact.phone}</div>
			</div>
		{/each}
	</div>
	<!--div class="w-96 md:w-auto">
		<h2 class="pb-4 text-2xl">{m.subscribe_newsletter()}</h2>

		<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-auto border p-4 sm:w-sm">
			<legend class="fieldset-legend">Options</legend>
			<label class="label mb-4 text-lg">
				<input type="checkbox" bind:checked={postForm.updates} class="checkbox" />
				{m.blog_subscription()}
			</label>
			<label class="label mb-4 text-lg">
				<input type="checkbox" bind:checked={postForm.events} class="checkbox" />
				{m.events_subscription()}
			</label-->
			<!-- svelte-ignore a11y_invalid_attribute -->
			<!--a href="" class="mb-8 text-lg" onclick={showModal}>{m.privacy_policy()}</a>
			<label for="mail" class="input validator mb-8 w-auto text-xl">
				<svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
					><g
						stroke-linejoin="round"
						stroke-linecap="round"
						stroke-width="2.5"
						fill="none"
						stroke="currentColor"
						><rect width="20" height="16" x="2" y="4" rx="2"></rect><path
							d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
						></path></g
					></svg
				>
				<input
					type="email"
					class="input input-lg"
					placeholder="E-mail"
					bind:value={postForm.email}
					required
				/>
			</label>
			<div class="validator-hint hidden">{m.form_valid_email()}</div>
			<button class="btn btn-primary" onclick={subscribe}>{m.send()}</button>
		</fieldset>
	</div>

	<dialog bind:this={modal} class="modal">
		<div
			class="modal-box absolute left-[2.5vw] h-[95vh] w-[95vw] max-w-[95vw] p-4 px-8 lg:static lg:w-3/4 lg:max-w-3/4"
		>
			<div class="flex justify-end">
				<form method="dialog">
					<button class="btn btn-circle bg-transparent" aria-label="Fechar janela com post">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2.5"
							stroke="currentColor"
							class="size-[1.2em]"
						>
							<path
								d="M19 6.41L17.59 5 12 10.59 
                                   6.41 5 5 6.41 10.59 12 5 
                                     17.59 6.41 19 12 13.41 17.59 
                                     19 19 17.59 13.41 12z"
							></path>
						</svg>
					</button>
				</form>
			</div>
			{#if locale === 'en'}
				<PrivacyPolicyEn />
			{:else}
				<PrivacyPolicyFr />
			{/if}
		</div>
		<form method="dialog" class="modal-backdrop">
			<button aria-label="Fechar">close</button>
		</form>
	</dialog-->
</div>
