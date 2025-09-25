<!-- /components/Carousel.svelte -->
<script>
    export let items = [];
    export let itemsPerView = { mobile: 1, tablet: 3, desktop: 4 };
    export let showControls = true;
    
    import { onMount, afterUpdate } from 'svelte';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    
    let currentIndex = 0;
    let container;
    let itemWidth = 0;
    const position = tweened(0, { duration: 500, easing: cubicOut });
    
    // Responsive item count
    const getItemsPerView = () => {
        if (window.innerWidth < 640) return itemsPerView.mobile;
        if (window.innerWidth < 1024) return itemsPerView.tablet;
        return itemsPerView.desktop;
    };
    
    // Navigation functions
    const next = () => {
        if (currentIndex < items.length - getItemsPerView()) {
            currentIndex++;
            position.set(-currentIndex * itemWidth);
        }
    };
    
    const prev = () => {
        if (currentIndex > 0) {
            currentIndex--;
            position.set(-currentIndex * itemWidth);
        }
    };
    
    // Calculate item width on resize
    const updateDimensions = () => {
        if (!container) return;
        const itemsToShow = getItemsPerView();
        itemWidth = container.offsetWidth / itemsToShow;
    };
    
    onMount(() => {
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
    });
    
    afterUpdate(updateDimensions);
</script>

<div class="relative overflow-hidden">
    <div 
        bind:this={container}
        class="flex transition-transform duration-500"
        style="transform: translateX({$position}px);"
    >
        {#each items as item}
            <div class="flex-shrink-0" style="width: {itemWidth}px;">
                <slot {item} />
            </div>
        {/each}
    </div>
    
    {#if showControls && items.length > getItemsPerView()}
        <button 
            on:click={prev}
            class="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-300 hover:bg-white text-gray-200 rounded-full p-2 shadow-md transition-all"
            aria-label="Previous"
        >
            ❮
        </button>
        <button 
            on:click={next}
            class="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-300 hover:bg-white text-gray-200 rounded-full p-2 shadow-md transition-all"
            aria-label="Next"
        >
            ❯
        </button>
    {/if}
</div>
