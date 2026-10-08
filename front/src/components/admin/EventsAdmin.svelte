<script lang="ts">
	import type { EventProps, EventsProps } from 'src/types/Event.types';
	import EventAdmin from './EventAdmin.svelte';

	const { events }: EventsProps = $props();
	const emptyEvent: EventProps = {
		dates: [],
		link: '',
		location: '',
		name: ''
	};

	let eventsList: EventProps[] = $state(events.filter((e) => e.type !== 'external'));

	function displayNewEvent() {
		eventsList = [...eventsList, { ...emptyEvent }];
	}

	/**
	 *  Function to be called upon an onDelete event is
	 *  triggered on the child component. It filters the
	 *  albums by ID for deleted albums
	 *
	 *  @param id : number ID of the deleted album
	 */
	function onDelete(id: number) {
		eventsList = eventsList.filter((event) => event.id !== id);
	}
</script>

<div class="mb-10 gap-x-8 gap-y-4 text-justify text-lg">
	{#each eventsList as event (event.id)}
		<EventAdmin {...event} onDelete={() => onDelete(event.id!)} />
	{/each}
	<button class="btn btn-primary w-full" onclick={displayNewEvent}>New event</button>
</div>
