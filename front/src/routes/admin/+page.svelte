<script lang="ts">
	import * as m from 'src/paraglide/messages';

	import AboutAdmin from 'src/components/admin/AboutAdmin.svelte';
	import BlogAdmin from 'src/components/admin/BlogAdmin.svelte';
    import BlogPostTypesAdmin from 'src/components/admin/BlogPostTypesAdmin.svelte';
	import ContactsAdmin from 'src/components/admin/ContactsAdmin.svelte';
    import CoversAdmin from 'src/components/admin/CoversAdmin.svelte';
    import EmailAdmin from 'src/components/admin/EmailAdmin.svelte';
	import EventsAdmin from 'src/components/admin/EventsAdmin.svelte';
	import type { PageData } from 'src/types/PageData.types';
	import Schedule from 'src/components/admin/Schedule.svelte';
    import PeopleAdmin from 'src/components/admin/PeopleAdmin.svelte';

	const { data } = $props<{ data: PageData }>();
	const { apiData } = data;
</script>

<main class="bg-base-300 flex-1 px-4 md:px-12 2xl:px-36">
	<div class="divider mt-0"></div>
	<h2 id="blog" class="mb-8 text-4xl">ADMINISTRATION</h2>
	<div class="tabs tabs-lift">
		<input type="radio" name="my_tabs_3" class="tab" aria-label="SCHEDULE" checked />
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<Schedule events={apiData.events} />
		</div>

	    <input type="radio" name="my_tabs_3" class="tab" aria-label="COVER" />
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<CoversAdmin covers={apiData.covers} />
		</div>

		<input type="radio" name="my_tabs_3" class="tab" aria-label={m.about()} />
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<AboutAdmin aboutSections={apiData.about_sections} />
		</div>
		<input type="radio" name="my_tabs_3" class="tab" aria-label={m.people()} />
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<PeopleAdmin people={apiData.people} />
		</div>
		<input type="radio" name="my_tabs_3" class="tab" aria-label={m.events_menu()} />
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<EventsAdmin events={apiData.events} />
		</div>
		<input type="radio" name="my_tabs_3" class="tab" aria-label="BLOG" />
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<BlogAdmin blogPosts={apiData.blog_posts} />
		</div>
		<input type="radio" name="my_tabs_3" class="tab" aria-label="CONTACT" />
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<ContactsAdmin contacts={apiData.contacts} socialMedia={apiData.social_media} />
		</div>
		<input type="radio" name="my_tabs_3" class="tab" aria-label="E-MAIL" />
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<EmailAdmin />
		</div>
		<input type="radio" name="my_tabs_3" class="tab" aria-label="BLOG POST TYPES" />
		<div class="tab-content bg-base-100 border-base-300 p-6">
			<BlogPostTypesAdmin blogPostTypes={apiData.blog_post_types} />
		</div>
	</div>
</main>
