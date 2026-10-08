<script lang="ts">
	import type { EventProps, EventPropsDTO } from 'src/types/Event.types';
	import { TrashSolid } from 'svelte-awesome-icons';
	import { onMount } from 'svelte';
	import { toaster } from 'src/stores/toaster.store';
	import { isEmpty } from 'src/common/dataParsing';
	import { eventTypes } from 'src/common/constants';

	let {
		id,
		dates,
		link,
		location,
		name,
		start,
		stop,
		type,
		onDelete
	}: EventProps & { onDelete: Function } = $props();
	let modal: HTMLDialogElement;
	let cally;
	let calendar = $state(dates.map((d) => d.start.slice(0, 10)).join(' '));
	let calendarRef = $state<HTMLInputElement | null>(null);
	let inputRef = $state<HTMLInputElement | null>(null);
	let postFormData = $state({
		dates,
		link,
		location,
		name,
		start,
		stop,
		type
	});
	let showCalendar = $state(false);

	// importing module on the client-side
	onMount(async () => {
		cally = await import('cally');
	});

	/* Add event listener separately on a non async function to be
	 * able to return the destructor
	 */
	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	/**
	 *  Update the calendar variable when dates are selected
	 *  The exact event properties depend on the cally library's
	 *  implementation
	 */
	function handleClickInside() {
		if (calendarRef) calendar = calendarRef.value;
	}

	/**
	 *  Check if click event target does not contain neither the
	 *  date input, nor the calendar element. If so, close the
	 *  calendar.
	 *
	 *  @param event - MouseEvent : click event
	 */
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
	 *  Calls the DELETE API function to delete the event
	 *  based on its ID. This function is triggered at the
	 *  confirmation of the dialog message. In case of success,
	 *  a parent function 'onDelete' will be called to remove
	 *  the element from the DOM.
	 */
	async function deleteEvent() {
		const eventFormData = new FormData();
		eventFormData.append('id', id!.toString());

		const response = await fetch('?/deleteEvent', {
			method: 'POST',
			body: eventFormData
		});
		const responseData = await response.json();

		if (responseData.status === 200) {
			toaster.show('Evento removido com sucesso.', 'success');
			onDelete(id);
		} else toaster.show('Erro ao remover evento ', 'error');
		modal.close();
	}

	/**
	 *  Creates a POST request body and send a query to save an
	 *  event. Depending on the existence of an ID, the query
	 *  will be either a POST or a PUT
	 */
	async function saveEvent() {
		// Validating submission
		if (isEmpty(postFormData.name)) {
			toaster.show('Please include a title.', 'error');
			return;
		}

		if (isEmpty(postFormData.location)) {
			toaster.show('Please include a location.', 'error');
			return;
		}

		if (isEmpty(calendar)) {
			toaster.show('Please include at least a date.', 'error');
			return;
		}

		const eventFormData = new FormData();
		const body: EventPropsDTO = {
			id,
			dates: calendar,
			link: postFormData.link,
			location: postFormData.location,
			name: postFormData.name,
			start: postFormData.start,
			stop: postFormData.stop,
			type: postFormData.type
		};

		Object.entries(body).forEach(([k, v]) => {
			if (v) eventFormData.append(k, v);
		});

		const response = !id
			? await fetch('?/saveEvent', {
					method: 'POST',
					body: eventFormData
				})
			: await fetch('?/updateEvent', {
					method: 'POST',
					body: eventFormData
				});

		const responseData = await response.json();
		switch (responseData.status) {
			case 200:
				toaster.show('Event successfully updated', 'success');
				break;
			case 201:
				toaster.show('New event successfully created', 'success');
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
		<label for="name" class="floating-label input w-[20.28vw] text-xl">
			<span>Title</span>
			<input
				type="input"
				class="input input-lg"
				bind:value={postFormData.name}
				placeholder="Title"
			/>
		</label>
		<label for="location" class="floating-label input w-[30vw] text-xl">
			<span>Location</span>
			<input
				type="input"
				class="input input-lg"
				bind:value={postFormData.location}
				placeholder="Location"
			/>
		</label>
		<label for="type" class="floating-label select w-[20.28vw] text-xl">
			<span>Type</span>
			<select class="select select-lg" bind:value={postFormData.type} placeholder="Type">
				{#each eventTypes as eventType}
					<option value={eventType.name}>
						{eventType.displayName}
					</option>
				{/each}
			</select>
		</label>
		<label for="link" class="floating-label input w-[28.66vw] text-xl">
			<span>Link</span>
			<input
				type="input"
				class="input input-lg"
				bind:value={postFormData.link}
				placeholder="Link"
			/>
		</label>
		<label for="date" class="input w-[60vw] text-xl">
			<input
				type="input"
				class="input input-lg"
				value={calendar.split(' ').join(', ')}
				placeholder="Dates"
				bind:this={inputRef}
				onfocus={() => (showCalendar = true)}
			/>
			{#if showCalendar}
				<div class="card w-180 p-10">
					<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
					<calendar-multi
						class="w-full"
						months={2}
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
							<calendar-month offset={1}></calendar-month>
						</div>
					</calendar-multi>
				</div>
			{/if}
		</label>
		<div class="mt-[-24px]">
			<label for="start" class="label">From</label>
			<input
				type="time"
				class="input input-lg"
				bind:value={postFormData.start}
				placeholder="From"
			/>
		</div>
		<div class="mt-[-24px]">
			<label for="stop" class="label">To</label>
			<input
				type="time"
				class="input input-lg"
				bind:value={postFormData.stop}
				placeholder="Until"
			/>
		</div>
	</div>
	<div class="flex justify-between">
		<button class="btn btn-primary mt-10" onclick={saveEvent}>Save</button>
		<button class="btn btn-error mt-10 text-white" onclick={showModal}>
			<TrashSolid />
			Remove
		</button>
	</div>
</fieldset>
<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<h3 class="text-lg font-bold">Remove evento</h3>
		<p class="py-4">Are you sure you want to proceed?</p>
		<div class="modal-action">
			<form class="flex gap-x-4" method="dialog">
				<button class="btn btn-error text-white" onclick={deleteEvent}>Yes</button>
				<button class="btn btn-secondary text-white">No</button>
			</form>
		</div>
	</div>
</dialog>
