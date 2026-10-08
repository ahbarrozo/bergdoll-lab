<script lang="ts">
	import { type Image } from 'src/types/Image.types';
	import { XmarkSolid } from 'svelte-awesome-icons';

	let {
		id,
		title,
		description,
		path,
		locale,
		onDelete,
		onUpdate
	}: Image & { onDelete: Function; onUpdate: Function } = $props();

	let imageThumbnail = $state(path ?? '');
	let uploadedImage = $state();

	function handleFileChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];

		if (file) {
			path = file.name;
			uploadedImage = file;

			// Create a local URL for preview
			imageThumbnail = URL.createObjectURL(file);
			uploadToServer(file);
		}
	}

	/** Function to parse path to file. Checks if prefix
	 *  in file is correct (i.e. /images/)
	 */
	function parsePath(filePath: string) {
		return filePath.slice(0, 9) === '/images/' ? filePath : '/images/' + filePath;
	}

	// Function to upload file to server
	async function uploadToServer(file: File) {
		try {
			const formData = new FormData();
			formData.append('image', file);

			const response = await fetch('?/uploadImage', {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				// call parent function to update image array
				onUpdate({ title, path: parsePath(path), description, locale });
			} else {
				console.error('Upload failed');
			}
		} catch (error) {
			console.error('Error uploading file:', error);
		}
	}
</script>

<fieldset class="fieldset mb-8">
	<label for="title" class="input w-auto text-xl">
		<input
			type="input"
			class="input input-lg"
			placeholder="Title"
			onchange={() => onUpdate({ title, path, description, locale })}
			bind:value={title}
		/>
	</label>
	<label for="subtitle" class="input w-auto text-xl">
		<input
			type="input"
			class="input input-lg"
			placeholder="Description"
			onchange={() => onUpdate({ title, path, description, locale })}
			bind:value={description}
		/>
	</label>
	<div class="preview flex flex-row items-center justify-between">
		<div class="flex">
			{#if path && !imageThumbnail}
				<span class="badge badge-primary truncate">{path.replace('/images/', '')}</span>
			{/if}
			<input
				type="file"
				class="file-input file-input-ghost"
				accept="image/*"
				onchange={handleFileChange}
			/>
			{#if imageThumbnail}
				<img src={imageThumbnail} alt="Preview" class="max-h-36 object-scale-down" />
			{/if}
		</div>
		<button class="btn btn-xs btn-error text-white" onclick={() => onDelete()}>
			<XmarkSolid size="16" />
			Remove
		</button>
	</div>
</fieldset>
