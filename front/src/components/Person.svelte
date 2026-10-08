<script lang="ts">
	import * as m from 'src/paraglide/messages';

	import type { Person } from '../types/Person.types';

	const { date, description, link, title, images }: Person = $props();

	let modal: HTMLDialogElement;

	function parseYouTubeLink() {
		const match =
			link &&
			link.match(
				/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
			);

		const id = match && match[1];
		return 'https://youtube.com/embed/' + id;
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

	function truncatedHTML(limit: number = 150) {
		if (description.length <= 150) return description;
		return description.slice(0, limit) + '...';
	}
</script>

<div class="hero bg-base-200 xl:w-7/15 mb-10 w-[95vw] rounded-2xl">
	<div class="hero-content flex-col sm:flex-row">
		{#if images.length > 0}
			<img
				src={images[0].path}
				alt={'Capa da works ' + title}
				class="ml-4 mr-4
                        h-80 w-80 overflow-hidden
                        rounded-lg object-cover object-top shadow-2xl sm:mr-10"
			/>
		{/if}
		<div class="relative h-80 w-80">
			<div class="absolute top-0">
				<h2 class="text-2xl font-bold">{title}</h2>
				<span class="text-sm">{date.slice(0, 4)}</span>
				<div class="py-6">
					{@html truncatedHTML()}
				</div>
			</div>
			<button class="btn btn-primary absolute bottom-0 right-0 m-4" onclick={showModal}
				>{m.see_more()}</button
			>
		</div>
	</div>

	<dialog bind:this={modal} class="modal">
		<div
			class="modal-box lg:max-w-3/4 absolute left-[2.5vw] h-[95vh] w-[95vw] max-w-[95vw] p-4 lg:static lg:w-3/4"
		>
			<div class="flex justify-between">
				<div class="pl-6 pt-6">
					<h1 class="font-bold">{title}</h1>
				</div>
				<form method="dialog">
					<!-- if there is a button in form, it will close the modal -->
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
			<div class="flex-1 space-y-2 py-4 text-justify">
				{#if link}
					{#if link.includes('youtu')}
						<iframe
							class="lg:h-120 lg:w-2xl
                                   h-80
                                   w-[90vw]
                                   lg:float-left lg:mr-5"
							title="Toque este trabalho"
							src={parseYouTubeLink()}
						>
						</iframe>
					{/if}
				{:else if images.length == 1}
					<img
						src={images[0].path}
						alt="Foto da postagem"
						class="float-left m-5
                            mr-10
                            aspect-[4/3] w-3/5
                            overflow-hidden"
					/>
				{/if}
				{@html description}
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button aria-label="Fechar">close</button>
		</form>
	</dialog>
</div>
