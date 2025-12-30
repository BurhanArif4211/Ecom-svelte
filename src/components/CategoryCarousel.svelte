
<style>
    /* Hide scrollbar for Chrome, Safari and Opera */
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    
    /* Smooth scrolling */
    .scroll-smooth {
        scroll-behavior: smooth;
    }
    
    /* Snap scrolling for mobile */
    .snap-x {
        scroll-snap-type: x mandatory;
    }
    
    .snap-start {
        scroll-snap-align: start;
    }
    
    /* Line clamp for text */
    .line-clamp-1 {
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>

<script>
    import { onMount } from "svelte";
    import { router } from "../router";

    // Add these variables and functions to your existing script section
    
    export let productCategories;
    let categoriesContainer;
    let currentCategoryIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Scroll functions
    const scrollLeft = () => {
        if (categoriesContainer) {
            categoriesContainer.scrollBy({
                left: -categoriesContainer.clientWidth * 0.8,
                behavior: 'smooth'
            });
        }
    };
    
    const scrollRight = () => {
        if (categoriesContainer) {
            categoriesContainer.scrollBy({
                left: categoriesContainer.clientWidth * 0.8,
                behavior: 'smooth'
            });
        }
    };
    
    const scrollToCategory = (index) => {
        if (categoriesContainer) {
            const item = categoriesContainer.querySelector(`[data-index="${index}"]`);
            if (item) {
                item.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'start'
                });
            }
        }
    };
    
    // Touch swipe handling
    const handleTouchStart = (e) => {
        touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchMove = (e) => {
        if (!touchStartX) return;
        touchEndX = e.touches[0].clientX;
    };
    
    const handleTouchEnd = () => {
        if (!touchStartX || !touchEndX) return;
        
        const diff = touchStartX - touchEndX;
        
        // Minimum swipe distance
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // Swipe left - scroll right
                scrollRight();
            } else {
                // Swipe right - scroll left
                scrollLeft();
            }
        }
        
        touchStartX = 0;
        touchEndX = 0;
    };
    
    // Update current index on scroll
    const handleScroll = () => {
        if (categoriesContainer) {
            const containerRect = categoriesContainer.getBoundingClientRect();
            const items = categoriesContainer.querySelectorAll('[data-index]');
            
            let closestIndex = 0;
            let closestDistance = Infinity;
            
            items.forEach((item, index) => {
                const itemRect = item.getBoundingClientRect();
                const distance = Math.abs(containerRect.left - itemRect.left);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });
            
            currentCategoryIndex = closestIndex;
        }
    };
    
    // Initialize after mount
    onMount(() => {
        categoriesContainer = document.getElementById('categories-container');
        if (categoriesContainer) {
            categoriesContainer.addEventListener('scroll', handleScroll);
            categoriesContainer.addEventListener('touchstart', handleTouchStart);
            categoriesContainer.addEventListener('touchmove', handleTouchMove);
            categoriesContainer.addEventListener('touchend', handleTouchEnd);
        }
        
        return () => {
            if (categoriesContainer) {
                categoriesContainer.removeEventListener('scroll', handleScroll);
                categoriesContainer.removeEventListener('touchstart', handleTouchStart);
                categoriesContainer.removeEventListener('touchmove', handleTouchMove);
                categoriesContainer.removeEventListener('touchend', handleTouchEnd);
            }
        };
    });
</script>
<!-- Categories Carousel -->
<section class="container mx-auto px-4 mb-10">
    <h2 class="text-2xl text-center font-bold text-white mb-6">Shop By Category</h2>
    
    <div class="relative">
        <!-- Scrollable Container -->
        <div 
            class="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth gap-4 pb-4 -mx-4 px-4"
            style="scrollbar-width: none; -ms-overflow-style: none;"
            id="categories-container"
        >
            {#each productCategories as item, index}
                <!-- Category Item -->
                <div 
                    class="flex-shrink-0 w-40 md:w-48 lg:w-56 snap-start"
                    data-index={index}
                >
                    <div 
                        on:click={() => router.navigateToCategory(item.slug)}
                        on:keydown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                router.navigateToCategory(item.slug);
                            }
                        }}
                        tabindex="0"
                        role="button"
                        aria-label={`Browse ${item.name} category`}
                        class="block group text-center p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-blue-600 hover:bg-gray-800 transition-all duration-300 cursor-pointer h-full"
                    >
                        {#if item.image && item.image.src}
                            <div class="relative w-20 h-20 mx-auto mb-4">
                                <img 
                                    alt={item.name} 
                                    src={item.image.src} 
                                    class="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                                    loading="lazy"
                                />
                                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
                            </div>
                        {:else}
                            <div class="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                            </div>
                        {/if}
                        <h3 class="text-s font-semibold text-white group-hover:text-blue-400 transition-colors mb-2 ">
                            {item.name}
                        </h3>
                        <p class="text-gray-400 text-sm">({item.count} items)</p>
                    </div>
                </div>
            {/each}
        </div>
        
        <!-- Scroll Indicators (Mobile) -->
        <div class="flex justify-center gap-2 mt-4 md:hidden">
            {#each productCategories as _, index}
                <!-- svelte-ignore element_invalid_self_closing_tag -->
                <button 
                    on:click={() => scrollToCategory(index)}
                    class={`w-2 h-2 rounded-full transition-all duration-300 ${
                        currentCategoryIndex === index 
                            ? 'bg-blue-500 w-6' 
                            : 'bg-gray-600'
                    }`}
                    aria-label={`Go to category ${index + 1}`}
                />
            {/each}
        </div>
        
        <!-- Scroll Buttons (Desktop) -->
        <div class="hidden md:block">
            <button 
                on:click={scrollLeft}
                class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-full shadow-lg border border-gray-700 transition-all duration-300"
                aria-label="Scroll left"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            
            <button 
                on:click={scrollRight}
                class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-full shadow-lg border border-gray-700 transition-all duration-300"
                aria-label="Scroll right"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    </div>
</section>
