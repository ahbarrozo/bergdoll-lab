<script lang="ts">
	import type { PeopleProps } from '../types/Person.types';
	import Person from './Person.svelte';

	const { people }: PeopleProps = $props();
</script>

<div class=" mb-10 flex flex-wrap gap-x-8 gap-y-4 p-6">
	{#each people as person}
		<Person {...person} />
	{/each}
</div>
