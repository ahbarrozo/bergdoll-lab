<script lang="ts">
	import { type Document } from 'src/types/Document.types';
	import { XmarkSolid } from 'svelte-awesome-icons';

	let {
		id,
		title,
		description,
		path,
		locale,
		onDelete,
		onUpdate
	}: Document & { onDelete: Function; onUpdate: Function } = $props();

	let uploadedDocument = $state();

	function handleFileChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];

		if (file) {
			path = file.name;
			uploadedDocument = file;
			uploadToServer(file);
		}
	}

	/** Function to parse path to file. Checks if prefix
	 *  in file is correct (i.e. /images/)
	 */
	function parsePath(filePath: string) {
		return filePath.slice(0, 9) === '/documents/' ? filePath : '/documents/' + filePath;
	}

	// Function to upload file to server
	async function uploadToServer(file: File) {
		try {
			const formData = new FormData();
			formData.append('document', file);

			const response = await fetch('?/uploadDocument', {
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
		{#if path}
			<span class="badge badge-primary truncate">{path.replace('/documents/', '')}</span>
		{/if}
		<input
			type="file"
			class="file-input file-input-ghost"
			accept=".pdf, .pptx, .docx, .xslx"
			onchange={handleFileChange}
		/>
		<button class="btn btn-xs btn-error text-white" onclick={() => onDelete()}>
			<XmarkSolid size="16" />
			Remove
		</button>
	</div>
</fieldset>
