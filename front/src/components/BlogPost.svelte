<script lang="ts">
	import * as m from 'src/paraglide/messages';
	import { PUBLIC_LOCALE } from '$env/static/public';
	import { type BlogPostProps } from 'src/types/BlogPost.types';
	import BlogComments from './BlogComments.svelte';
	import type { BlogCommentProps } from 'src/types/BlogComment.types';
	import { orderByDate } from 'src/common/dataParsing';

    import { onMount, tick } from 'svelte';

	const {
		id,
		color,
		date,
		documents,
		images,
		subtitle,
		text,
		title,
		type,
		isFirst,
		comments
	}: BlogPostProps & { comments: BlogCommentProps[] } = $props();

	let blogComments: BlogCommentProps[] = $state(orderByDate(comments, 'date'));

	let modal: HTMLDialogElement;

	const dateFormat = new Intl.DateTimeFormat(PUBLIC_LOCALE, {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	});
	const dateString = $derived(dateFormat.format(new Date(date)));

	function downloadDocument(path: string) {
		try {
			validateFilepath(path);

			const anchor = document.createElement('a');
			anchor.href = path;
			anchor.target = '_blank';
			anchor.rel = 'noopener noreferrer'; // Security best practice

			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);

			return true;
		} catch (error) {
			console.error('Error opening file:', error);
			return false;
		}
	}

	/**
	 *  Function to be called upon an onDelete event is
	 *  triggered on the child component. It filters the
	 *  sections by ID for deleted sections
	 *
	 */
	function onSubmit(comment: BlogCommentProps) {
		comment.date = new Date().toISOString();
		blogComments.push(comment);
	}

	/**
	 *  Checks if the dialog HTML element is mounted, and if so,
	 *  calls the showModal function
	 */
	function showModal() {
		if (modal) modal.showModal();
	}

	function typeLabel(postType: string | null) {
		if (postType)
			// @ts-ignore
			return m[postType]();
		return m.other();
	}

	function truncatedHTML(limit: number = 150) {
		const truncatedHTML = text.replace(/<[^>]*>/g, '');
		if (truncatedHTML.length <= 150) return truncatedHTML;
		return truncatedHTML.slice(0, limit) + '...';
	}

	function validateFilepath(path: string) {
		if (path.includes('../') || path.includes('..\\')) {
			throw new Error('Invalid filepath: directory traversal detected');
		}

		const allowedExtensions = ['.pdf', '.jpg', '.png', '.docx', '.xlsx'];
		const extension = path.toLowerCase().substring(path.lastIndexOf('.'));

		if (!allowedExtensions.includes(extension)) {
			throw new Error('File type not allowed');
		}

		return true;
	}


    async function openFromHash(hash: string) {
        if ( hash != `#post-${id}` ) return;

        await tick();

        showModal();
    }
    
    onMount(() => {
        openFromHash(window.location.hash);

		window.addEventListener('hashchange', openFromHash);

		return () => {
			window.removeEventListener('hashchange', openFromHash);
		};
    })


</script>

<div id={`post-${id}`} class={`flex-none ${isFirst ? 'w-full' : 'w-96 2xl:w-[31.25%]'}`}>
	{#if !isFirst}
		<div class="card h-150 shadow-sm">
			<figure>
				{#if images && images.length > 0}
					<img
						src={images[0].path}
						alt="Foto da postage"
						class="h-80 w-full overflow-hidden object-cover object-top"
					/>
				{/if}
			</figure>
			<div class="card-body">
				<h2 class="card-title text-3xl">{title}</h2>
				<div class="flex flex-row items-center justify-between">
					<span class=" text-xl">{subtitle}</span>
					<div class="badge badge-xl" style={`background-color: ${color};`}>{typeLabel(type)}</div>
				</div>
				<p class="mb-4 text-lg py-16">
					{@html truncatedHTML()}
				</p>
				<div class="card-actions justify-between">
					<button class="btn btn-primary" onclick={showModal}>{m.see_more()}</button>
					<span class=" mt-4 text-sm">{dateString}</span>
				</div>
			</div>
		</div>
	{:else}
		<div class="hero shadow-sm">
			<div class="hero-content max-w-[95%] flex-col lg:flex-row">
				{#if images && images.length > 0}
					<!-- svelte-ignore a11y_img_redundant_alt -->
					<img
						src={images[0].path}
						alt="Post image"
						class="mr-10 h-96
                                w-5/10 overflow-hidden rounded-lg
                                object-cover object-top"
					/>
				{/if}
				<div class="relative h-160 w-80 sm:h-96 sm:w-xl lg:w-2xl xl:w-3xl 2xl:w-5xl">
					<div class="top-0">
						<h1 class="text-2xl sm:text-5xl">{title}</h1>
						<div class="flex flex-row justify-between">
							<span class=" sm:text-2xl">{subtitle}</span>
							<div class="badge badge-xl" style={`background-color: ${color};`}>
								{typeLabel(type)}
							</div>
						</div>
						<div class="truncate py-16 text-xl">
							{@html truncatedHTML(150)}
						</div>
					</div>
					<div class="card-actions absolute bottom-0 w-full justify-between">
						<button class="btn btn-primary" onclick={showModal}>{m.see_more()}</button>
						<span class=" mt-4 text-sm">{dateString}</span>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<dialog bind:this={modal} class="modal">
		<div
			class="modal-box absolute left-[2.5vw] h-[95vh] w-[95vw] max-w-[95vw] p-4 px-8 lg:static lg:w-3/4 lg:max-w-3/4"
		>
			<div class="flex justify-between">
				<div class="pt-6 pl-6">
					<h1 class="font-bold">{title}</h1>
					<span class="">{subtitle}</span>
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
				{#if images}
					{#if images.length == 1}
						<img
							src={images[0].path}
							alt="Foto da postagem"
							class="float-left
                                    m-5
                                    mr-10
                                    aspect-[4/3] w-3/5
                                    overflow-hidden"
						/>
					{:else if images.length > 1}
						<div
							class="carousel
                                    float-left
                                    m-5
                                    mr-10
                                    aspect-[4/3]
                                    w-3/5"
						>
							{#each images as image, i}
								<div
									id={'slide_' + i}
									class="carousel-item
                                            relative
                                            w-full scroll-mt-30
                                            justify-center"
								>
									<img src={image.path} alt={'Foto ' + i} class="max-h-full max-w-full" />
									{#if image.title || image.description}
										<div class="carousel-caption">
											<div class="mb-2 text-xl font-bold">{image.title}</div>
											<p>{image.description}</p>
										</div>
									{/if}
									<div
										class="absolute
                                                top-1/2
                                                right-5
                                                left-5
                                                flex
                                                -translate-y-1/2
                                                transform
                                                justify-between"
									>
										<a
											href={'#slide_' + (i == 0 ? images.length - 1 : i - 1)}
											class="btn btn-circle">❮</a
										>
										<a
											href={'#slide_' + (i == images.length - 1 ? 0 : i + 1)}
											class="btn btn-circle">❯</a
										>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				{/if}
				{@html text}
			</div>
			<div class="divider"></div>
			{#if documents && documents.length > 0}
				<h2>{m.download_files()}</h2>
				<div class="flex flex-row flex-wrap gap-12">
					{#each documents as document, d (d)}
						<div class="flex w-xs flex-col flex-wrap">
							<button
								aria-label={`Download ${document.title}`}
								onclick={() => downloadDocument(document.path)}
								class="btn btn-primary mt-6">{document.title}</button
							>
							<p class="mb-4 text-lg">{document.description}</p>
						</div>
					{/each}
				</div>
			{/if}
			<div class="mt-8">
				<h2>{m.leave_a_comment()}</h2>
				<BlogComments {blogComments} blogId={id!} {onSubmit} />
			</div>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button aria-label="Fechar">close</button>
		</form>
	</dialog>
</div>

<style>
	.card:hover {
		transition-property: all;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 0.15s;
	}

	.carousel-caption {
		background: rgba(0, 0, 0, 0.5);
		color: rgb(249, 250, 251);
		padding: 1rem;
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
	}
</style>
