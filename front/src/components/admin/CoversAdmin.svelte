<script lang="ts">
	import type { Cover, CoversProps } from 'src/types/Cover.types';
	import CoverAdmin from './CoverAdmin.svelte';
	import { locales } from 'src/common/constants';

	const { covers }: CoversProps = $props();
	const emptyCover: Cover & { isNew?: boolean } = {
		title: '',
		description: '',
		path: '',
		locale: 'en',
		isNew: true
	};
	let newCoverId = $state(0);

	let coversList = $state(covers);

    function displayNewCover() {
		newCoverId++;
		coversList.unshift({ ...emptyCover });
	}

	function duplicateCover(title: string) {
		const index = coversList.findIndex((s) => s.title === title);
		if (index !== -1) {
			const locale = locales.find((l) => l.name !== coversList[index].locale);

				coversList.splice(index + 1, 0, {
					...coversList[index],
					locale: locale!.name,
					id: undefined
				});
		}
	}

	/**
	 *  Function to be called upon an onDelete event is
	 *  triggered on the child component. It filters the
	 *  covers by ID for deleted covers
	 *
	 *  @param id : number ID of the deleted album
	 */
	function onDelete(id: number) {
		coversList = coversList.filter((cover: Cover) => cover.id !== id);
	}

	/**
	 *  Function that determines whether the duplicate
	 *  button is to be displayed. It calculates the
	 *  number of covers per title. If all languages
	 *  where used, the button will be hidden.
	 *
	 *  @param id : number ID of the section to be duplicated
	 */
	function showDuplicateButton(title: string) {
		const count = coversList.filter((s) => s.title === title).length;
		return count < locales.length;
	}
</script>

<div class="mb-10 flex flex-wrap justify-center gap-x-8 gap-y-4">
	<button class="btn btn-primary w-full" onclick={displayNewCover}>New cover</button>    
	{#each coversList as cover, i}
		<CoverAdmin {...cover} onDelete={() => onDelete(cover.id!)} />
		{#if cover.title && showDuplicateButton(cover.title)}
			<button class="btn btn-primary w-full" onclick={() => duplicateCover(cover.title || '')}
				>Add language</button
			>
		{/if}
		{#if i < coversList.length - 1 && coversList[i].title !== coversList[i + 1].title}
			<div class="divider my-12"></div>
		{/if}
	{/each}
</div>
