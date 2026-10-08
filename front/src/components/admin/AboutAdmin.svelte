<script lang="ts">
	import type { AboutProps, AboutSection } from 'src/types/About.types';
	import AboutSectionAdmin from './AboutSectionAdmin.svelte';
	import type { Image } from 'src/types/Image.types';
	import { locales } from 'src/common/constants';

	const { aboutSections }: AboutProps = $props();
	const emptySection: AboutSection = {
		text: '',
		locale: 'en',
		images: [] as Image[]
	};

	let sections: AboutSection[] = $state(aboutSections);

	$effect(() => {
		if (sections.find((s) => !s.sectionNum)) {
			const sectionsEN = sections.filter((s) => s.locale === 'en');
			const sectionsFR = sections.filter((s) => s.locale === 'fr');

			sectionsEN.forEach((s: AboutSection, i) => (s.sectionNum = i + 1));
			sectionsFR.forEach((s: AboutSection, i) => (s.sectionNum = i + 1));

			sections = [...sectionsEN, ...sectionsFR].sort((sa, sb) => sa.sectionNum! - sb.sectionNum!);
		}
	});

	function displayNewSection() {
		sections = [...sections, { ...emptySection }];
	}

	function duplicateSection(sectionNum: number) {
		const index = sections.findIndex((s) => s.sectionNum === sectionNum);

		if (index !== -1) {
			const locale = locales.find((l) => l.name !== sections[index].locale);

			if (locale) {
				const images = sections[index].images.map((i) => {
					i.locale = locale.name;
					return i;
				});
				sections.splice(index + 1, 0, {
					...sections[index],
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
	 *  sections by ID for deleted sections
	 *
	 *  @param id : number ID of the deleted section
	 */
	function onDelete(id: number | undefined) {
		sections = sections.filter((section) => section.id !== id);
	}

	/**
	 *  Function that determines whether the duplicate
	 *  button is to be displayed. It calculates the
	 *  number of available languages for a certain section
	 *  number. If all languages where used, the button will
	 *  be hidden.
	 *
	 *  @param sectionNum : number ID of the section to be duplicated
	 */
	function showDuplicateButton(sectionNum: number) {
		const count = sections.filter((s) => s.sectionNum === sectionNum).length;

		return count < locales.length;
	}
</script>

<div class="mb-10 gap-x-8 gap-y-4 text-justify text-lg">
	{#each sections as section, i (section.sectionNum + section.locale)}
		<div class="mb-4">
			<AboutSectionAdmin {...section} onDelete={() => onDelete(section.id!)} />
			{#if section.sectionNum && showDuplicateButton(section.sectionNum)}
				<button class="btn btn-primary w-full" onclick={() => duplicateSection(section.sectionNum!)}
					>Add language</button
				>
			{/if}
			{#if i < sections.length - 1 && sections[i].sectionNum !== sections[i + 1].sectionNum}
				<div class="divider my-12"></div>
			{/if}
		</div>
	{/each}
	<button class="btn btn-primary w-full" onclick={displayNewSection}>New section</button>
</div>
