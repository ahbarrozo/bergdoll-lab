<script lang="ts">
	import type { Person, PeopleProps } from 'src/types/Person.types';
	import PersonAdmin from './PersonAdmin.svelte';
	import type { Image } from 'src/types/Image.types';
	import { locales } from 'src/common/constants';

	const PEOPLE_PER_PAGE = 6;

	const { people }: PeopleProps = $props();
	const emptyPerson: Person & { isNew?: boolean } = {
		date: new Date().toISOString(),
		title: '',
		description: '',
		images: [] as Image[],
		locale: 'en',
		isNew: true
	};

	let peopleList = $state(people);
	let currentPage = $state(1);
	let firstPerson = $derived((currentPage - 1) * PEOPLE_PER_PAGE);
	let displayedPeople = $derived(peopleList.slice(firstPerson, firstPerson + PEOPLE_PER_PAGE));
	let numPages = $derived(Math.ceil(peopleList.length / PEOPLE_PER_PAGE));
	let pages = $derived(Array.from({ length: numPages }, (_, i) => i + 1));
	let newPersonId = $state(0);

	function displayNewPerson() {
		newPersonId++;
		peopleList.unshift({ ...emptyPerson });
	}

	function duplicatePerson(title: string, date: string) {
		const index = peopleList.findIndex((s) => s.title === title && s.date === date);
		if (index !== -1) {
			const locale = locales.find((l) => l.name !== peopleList[index].locale);

			if (locale) {
				const images = peopleList[index].images.map((i) => {
					i.locale = locale.name;
					return i;
				});
				peopleList.splice(index + 1, 0, {
					...peopleList[index],
					images,
					locale: locale.name,
					id: undefined
				});
			}
		}
	}

	/**
	 *  Function to be called upon an onDelete event is
	 *  triggered on the child component. It filters the
	 *  works by ID for deleted works
	 *
	 *  @param id : number ID of the deleted album
	 */
	function onDelete(id: number) {
		peopleList = peopleList.filter((work) => work.id !== id);
	}

	/**
	 *  Function that determines whether the duplicate
	 *  button is to be displayed. It calculates the
	 *  number of works per title. If all languages
	 *  where used, the button will be hidden.
	 *
	 *  @param id : number ID of the section to be duplicated
	 */
	function showDuplicateButton(title: string) {
		const count = peopleList.filter((s) => s.title === title).length;
		return count < locales.length;
	}
</script>

<div class="mb-10 flex flex-wrap justify-center gap-x-8 gap-y-4">
	<button class="btn btn-primary w-full" onclick={displayNewPerson}>New person</button>
	{#each displayedPeople as person, i (person.id ?? 'new-' + newPersonId)}
		<PersonAdmin {...person} onDelete={() => onDelete(person.id!)} />
		{#if person.title && showDuplicateButton(person.title)}
			<button class="btn btn-primary w-full" onclick={() => duplicatePerson(person.title, person.date)}
				>Add language</button
			>
		{/if}
		{#if i < peopleList.length - 1 && peopleList[i].title !== peopleList[i + 1].title}
			<div class="divider my-12"></div>
		{/if}
	{/each}
</div>
<div class="join">
	{#each pages as page}
		<input
			class="join-item btn btn-square"
			type="radio"
			name="options"
			value={page}
			aria-label={`${page}`}
			checked={page === currentPage}
			bind:group={currentPage}
		/>
	{/each}
</div>
