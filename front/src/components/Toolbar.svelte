<script lang="ts">
	import { goto } from '$app/navigation';
	import { m } from 'src/paraglide/messages.js';
	import { setLocale } from 'src/paraglide/runtime';
	import { LockSolid } from 'svelte-awesome-icons';

	let { onAuthentication } = $props();

	function scrollToSection(sectionId: string) {
		if (window.location.href.includes('admin')) goto('/');
		const element = document.getElementById(sectionId);

		if (element) {
			element.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}
	}
</script>

<div class="navbar bg-base-300 sticky top-0 z-10 p-6 text-xl font-bold">
	<div class="navbar-start">
		<div class="dropdown">
			<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h8m-8 6h16"
					/>
				</svg>
			</div>
			<ul class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
				<li>
					<button
						onclick={() => scrollToSection('bio')}
						class="anchor font-questrial tracking-widest"
					>
						{m.about()}
					</button>
				</li>
				<li>
					<button
						onclick={() => scrollToSection('people')}
						class="anchor font-questrial tracking-widest"
					>
						{m.people()}
					</button>
				</li>
				<li>
					<button
						onclick={() => scrollToSection('blog')}
						class="anchor font-questrial tracking-widest"
					>
						BLOG
					</button>
				</li>
				<li>
					<button
						onclick={() => scrollToSection('events')}
						class="anchor font-questrial tracking-widest"
					>
						{m.events_menu()}
					</button>
				</li>
				<li>
					<button
						onclick={() => scrollToSection('contact')}
						class="anchor font-questrial tracking-widest"
					>
						CONTACT
					</button>
				</li>
			</ul>
		</div>
		<a href="/" class="flex items-center gap-12">
			<span class="text-4xl font-bold">LB</span>
		</a>
	</div>

	<div class="navbar-center hidden lg:flex lg:justify-center lg:gap-12">
		<button onclick={() => scrollToSection('bio')} class="anchor font-questrial tracking-widest text-2xl"
			>{m.about()}</button
		>
		<button onclick={() => scrollToSection('people')} class="anchor font-questrial tracking-widest text-2xl"
			>{m.people()}</button
		>
		<button onclick={() => scrollToSection('events')} class="anchor font-questrial tracking-widest text-2xl"
			>{m.events_menu()}</button
		>
		<button onclick={() => scrollToSection('blog')} class="anchor font-questrial tracking-widest text-2xl"
			>BLOG</button
		>
		<button onclick={() => scrollToSection('contact')} class="anchor font-questrial tracking-widest text-2xl"
			>CONTACT</button
		>
	</div>

	<div class="navbar-end">
		<div class="flex items-center gap-4">
			<!--div class="flex items-center gap-2">
				<button class="anchor font-questrial text-sm" onclick={() => setLocale('en')}>EN</button>
				<span>|</span>
				<button class="anchor font-questrial text-sm" onclick={() => setLocale('fr')}>FR</button>
			</div-->
			<button class="btn-icon variant-filled ml-4" onclick={onAuthentication}>
				<LockSolid size="14" />
			</button>
		</div>
	</div>
</div>
