<!-- src/lib/components/ImageCarousel.svelte -->
<script>
    export let images = [];
    export let selectedIndex = 0;
    
    let mainImageRef ;
    let isZoomed = false;
    let zoomPosition = { x: 0, y: 0 };
    
    // Handle image click to zoom
    const handleImageClick = (index) => {
        selectedIndex = index;
    };
    
    // Handle mouse move for zoom effect
    const handleMouseMove = (event) => {
        if (!mainImageRef || !isZoomed) return;
        
        const rect = mainImageRef.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        
        zoomPosition = { x, y };
    };
</script>

<div class="space-y-4">
    <!-- Main Image with Zoom -->
    <div class="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        {#if images && images.length > 0}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <img bind:this={mainImageRef}
                src={images[selectedIndex].src}
                alt={images[selectedIndex].alt || images[selectedIndex].name}
                class={`w-full h-full object-contain cursor-zoom-in transition-transform duration-200 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={isZoomed ? `transform-origin: ${zoomPosition.x}% ${zoomPosition.y}%` : ''}
                on:click={() => isZoomed = !isZoomed}
                on:mousemove={handleMouseMove}
                on:mouseenter={() => isZoomed = true}
                on:mouseleave={() => isZoomed = false}
            />
            
            <!-- Zoom Indicator -->
            <div class="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {isZoomed ? 'Click to zoom out' : 'Hover to zoom'}
            </div>
            
            <!-- Image Counter -->
            <div class="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {selectedIndex + 1} / {images.length}
            </div>
        {:else}
            <div class="w-full h-full flex items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        {/if}
    </div>
    
    <!-- Thumbnail Strip -->
    {#if images && images.length > 1}
        <div class="flex space-x-2 overflow-x-auto py-2">
            {#each images as image, index}
                <button
                    on:click={() => handleImageClick(index)}
                    class={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                        index === selectedIndex 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                    <img
                        src={image.thumbnail || image.src}
                        alt={image.alt || image.name}
                        class="w-full h-full object-cover"
                    />
                </button>
            {/each}
        </div>
    {/if}
</div>

<style>
    /* Custom scrollbar for thumbnails */
    .overflow-x-auto::-webkit-scrollbar {
        height: 6px;
    }
    
    .overflow-x-auto::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }
    
    .overflow-x-auto::-webkit-scrollbar-thumb {
        background: #c5c5c5;
        border-radius: 10px;
    }
    
    .overflow-x-auto::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
    }
</style>
