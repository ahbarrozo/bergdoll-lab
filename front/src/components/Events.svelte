<script lang="ts">
	import { PUBLIC_LOCALE } from '$env/static/public';
	import { m } from 'src/paraglide/messages';
	import { getLocale } from 'src/paraglide/runtime';
	import type { EventProps, EventsProps } from 'src/types/Event.types';

	const { events }: EventsProps = $props();
	const listEvents = events.reduce(
		(acc, event) => {
			event.dates.forEach((d) => {
				const date = new Date(d.start);
				let locale = getLocale();
				locale += locale === 'en' ? '-US' : '-FR';
				const dateString = date.toLocaleDateString(locale, {
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				});
				let day, month, year;

				if (locale === 'en-US') {
					day = dateString.split(',')[0].split(' ')[1];
					day = parseInt(day) < 10 ? '0' + day : day;
					month = dateString.split(',')[0].split(' ')[0].slice(0, 3).toUpperCase();
					year = dateString.slice(-4);
				} else {
					day = dateString.slice(0, 2);
					day = parseInt(day) < 10 ? '0' + day : day;
					month = dateString.split(' ')[1].slice(0, 4).toUpperCase();
					month += month.length > 4 ? '.' : '';
					year = dateString.slice(-4);
				}

				acc.push({
					day,
					month,
					year,
					location: event.location,
					name: event.name,
					link: event.link
				});
			});
			return acc;
		},
		[] as Array<{
			day: string;
			month: string;
			year: string;
			name: string;
			location: string;
			link?: string;
		}>
	);

	function openLink(link: string | undefined) {
		window.open(link, '_blank');
	}
</script>

<ul class=" list bg-base-100 rounded-box p-6 shadow-md">
	{#each listEvents as event}
		<li class="list-row">
			<div>
				<div class="text-4xl font-thin tabular-nums opacity-30">{event.day}</div>
				<div class="text-xl font-thin tabular-nums opacity-30">{event.month}</div>
			</div>
			<div class="list-col-grow ml-4 pt-2">
				<div class="text-xl">{event.name}</div>
				<div class="font-semibold uppercase opacity-60">{event.location}</div>
			</div>

			{#if event.link}
				<button class="btn btn-primary mt-4 mr-4" onclick={() => openLink(event.link)}
					>{m.see_more()}</button
				>
			{/if}
		</li>
	{/each}
</ul>
