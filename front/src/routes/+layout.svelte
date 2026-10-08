<script lang="ts">
	import { onMount } from 'svelte';
	import 'src/app.css';
	import Toaster from 'src/components/Toaster.svelte';
	import Toolbar from 'src/components/Toolbar.svelte';

	import { PUBLIC_API_ENDPOINT } from '$env/static/public';

	let { children } = $props();

	let isLoaded = $state<boolean>(false);

	onMount(() => {
		const handleLoad = () => {
			isLoaded = true;
		};

		if (document.readyState === 'complete') {
			isLoaded = true;
		} else {
			window.addEventListener('load', handleLoad);
			return () => window.removeEventListener('load', handleLoad);
		}
	});

	/**
	 *  Attempts to access an authrized Google account, redirecting
	 *  to the admin dashboard if successful.
	 */
	async function attemptAccess() {
		window.location.href = `${PUBLIC_API_ENDPOINT}auth/google`;
	}
</script>

{#if !isLoaded}
	<div class="hero bg-base-300 min-h-screen">
		<div class="hero-content text-center">
			<div class="max-w-md">
				<span class="loading loading-bars w-48 h-48"></span>
			</div>
		</div>
	</div>
{:else}
	<div class="app h-full">
		<Toolbar onAuthentication={attemptAccess} />
		{@render children()}
		<footer
			class="footer sm:footer-horizontal
						bg-base-300
						flex
						justify-center p-10"
		>
			© Copyright Nora Toth-Fekete - All rights reserved
		</footer>
		<Toaster />
	</div>
{/if}
