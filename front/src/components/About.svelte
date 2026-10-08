<script lang="ts">
	import type { AboutProps } from '../types/About.types';

	const { aboutSections }: AboutProps = $props();
</script>

<div class="mb-10 gap-x-8 gap-y-4 p-6 text-justify text-lg">
	{#each aboutSections as section, i}
		<div class="mb-12">
			{#if section.images && section.images.length > 0}
				<img
					src={section.images[0].path}
					alt="Foto da biografia"
					class={`${i % 2 == 0 ? 'float-left' : 'float-right'} 
                        max-h-1/2
                        max-w-2/5
                        m-5 mr-10
                        overflow-hidden`}
				/>
			{/if}
			{@html section.text}
		</div>
	{/each}
</div>
