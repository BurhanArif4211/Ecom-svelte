<script>
    import { onMount, tick } from 'svelte';

    let loading = true;
    let error = null;
    let statusText = '';

    let containerEl;
    let textEl;

    let shouldMarquee = false;
    let duration = '0s';

    const SPEED_PX_PER_SEC = 50; // tweak speed here

    async function calculateMarquee() {
        await tick(); // wait for DOM to update

        if (!containerEl || !textEl) return;

        const containerWidth = containerEl.clientWidth;
        const textWidth = textEl.scrollWidth;

        if (textWidth > containerWidth) {
            shouldMarquee = true;
            const distance = textWidth + containerWidth;
            duration = `${distance / SPEED_PX_PER_SEC}s`;
        } else {
            shouldMarquee = false;
            duration = '0s';
        }
    }

    onMount(async () => {
        try {
            const response = await fetch(`/wp/wp-json/acf/v1/options/statustext/`);
            if (!response.ok) throw new Error('Failed to fetch status data');

            const data = await response.json();
            statusText = data.data;

            loading = false;
            await calculateMarquee();

            // Optional: recalc on resize
            window.addEventListener('resize', calculateMarquee);
        } catch (err) {
            error = err.message;
            loading = false;
        }
    });
</script>

<div class="bg-gray-900 text-white text-[10px] py-1  flex items-center overflow-hidden z-60">
    {#if loading}
        <div class="flex-1 text-center">Loading status information...</div>
    {:else}
        <div class="flex-1 overflow-hidden" bind:this={containerEl}>
            <div
                bind:this={textEl}
                class="whitespace-nowrap"
                class:animate-marquee={shouldMarquee}
                style={shouldMarquee ? `--marquee-duration:${duration}` : ''}
            >
                {statusText}
            </div>
        </div>
    {/if}
</div>

<style>
    @keyframes marquee {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
    }

    .animate-marquee {
        display: inline-block;
        animation: marquee var(--marquee-duration) linear infinite;
    }
</style>
