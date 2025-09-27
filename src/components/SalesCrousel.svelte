<!-- src/components/SalesCarousel.svelte -->
<script>
    import { router } from "../router";

    
    export let slides = [];
    
    let currentSlide = 0;
    
    const nextSlide = () => {
        currentSlide = (currentSlide + 1) % slides.length;
    };
    
    const prevSlide = () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    };
</script>

<div class="relative  rounded-2xl overflow-hidden border-2 shadow-2xl">
    <div class="text-4xl font-black mb-8 text-gray-100">Products on Sale</div>
    <div class="relative h-64 md:h-80 lg:h-96">
        {#each slides as slide, index}
            <div 
                class={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div class="relative items-center h-full">
                    <!-- Image -->
                    
                        <!-- svelte-ignore a11y_click_events_have_key_events -->
                        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                        <img on:click={() =>router.navigate(slide.link)}
                            src={slide.image.id}
                            alt="Sale Banner" 
                            class="w-full h-full opacity-80 object-cover"
                        />
                </div>
            </div>
        {/each}
        
        <!-- Navigation -->
        {#if slides.length > 1}
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button 
                on:click={prevSlide}
                class="absolute left-4 top-1/2 -translate-y-1/2 bg-[#ffffff62] bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button 
                on:click={nextSlide}
                class="absolute right-4 top-1/2 -translate-y-1/2 bg-[#ffffff62] bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        {/if}
    </div>
</div>