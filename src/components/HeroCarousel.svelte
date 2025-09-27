<!-- src/components/HeroCarousel.svelte -->
<script>
    import { onMount, onDestroy } from 'svelte';
    import { router } from '../router';
  
    export let slides = [];
  
    let currentSlide = 0;
    let autoplayInterval = null;
  
    const startAutoplay = () => {
      stopAutoplay();
      if (slides.length > 1) {
        autoplayInterval = setInterval(() => {
          currentSlide = (currentSlide + 1) % slides.length;
        }, 5000);
      }
    };
  
    const stopAutoplay = () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        autoplayInterval = null;
      }
    };
  
    const nextSlide = () => {
      currentSlide = (currentSlide + 1) % slides.length;
      startAutoplay(); // restart timer
    };
  
    const prevSlide = () => {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      startAutoplay(); // restart timer
    };
  
    const goToSlide = (index) => {
      currentSlide = index;
      startAutoplay(); // restart timer
    };
  
    function handleKey(e) {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    }
  
    onMount(() => {
      startAutoplay();
      window.addEventListener('keydown', handleKey);
    });
  
    onDestroy(() => {
      stopAutoplay();
      window.removeEventListener('keydown', handleKey);
    });
  </script>
  
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="relative w-full group"
    on:mouseenter={stopAutoplay}
    on:mouseleave={startAutoplay}
    aria-roledescription="carousel"
  >
    <!-- Main Carousel: note min-height so absolute slides have space -->
    <div class="relative overflow-hidden min-h-[40vh] md:min-h-[70vh]">
      {#each slides as slide, index}
        <div
          class={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentSlide
              ? 'opacity-100 z-20'
              : 'opacity-0 z-10 pointer-events-none'
          }`}
          aria-hidden={index === currentSlide ? "false" : "true"}
        >
          <!-- Responsive image using <picture> (keeps DOM simpler than multiple img elements) -->
          <picture class="w-full h-full block">
            <!-- if your slide objects provide different sizes you can use them; fall back to slide.image.id -->
            <source srcset={slide.image.desktop ?? slide.image.id} media="(min-width: 768px)" />
            <img
              src={slide.image.mobile ?? slide.image.id}
              alt={slide.title}
              class="w-full h-full object-cover block"
              draggable="false"
            />
          </picture>
  
          <!-- Overlay (gradient + content) -->
          <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
            <div class="container mx-auto px-4">
              <div class="max-w-2xl">
                <h2 class="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-3 drop-shadow-lg animate-fade-in-up">
                  {slide.title}
                </h2>
  
                {#if slide.subtext}
                  <p class="text-lg md:text-xl text-gray-100 mb-5 animate-fade-in-up delay-200">
                    {slide.subtext}
                  </p>
                {/if}
  
                {#if slide.link}
                  <button
                    on:click={() => router.navigate(slide.link)}
                    class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    Shop Now
                  </button>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  
    <!-- Navigation Arrows (visible & accessible) -->
    <button
      on:click={prevSlide}
      aria-label="Previous slide"
      class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 z-30 focus:outline-none focus:ring-2 focus:ring-white"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  
    <button
      on:click={nextSlide}
      aria-label="Next slide"
      class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 z-30 focus:outline-none focus:ring-2 focus:ring-white"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  
    <!-- Dots Indicator -->
    {#if slides.length > 1}
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
        {#each slides as _, i}
          <button
            on:click={() => goToSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
            class={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white ${
              i === currentSlide ? 'bg-white' : 'bg-white/60 hover:bg-white/90'
            }`}
          />
        {/each}
      </div>
    {/if}
  </div>
  
  <style>
    .animate-fade-in-up {
      animation: fadeInUp 0.7s ease-out both;
    }
    .delay-200 {
      animation-delay: 0.2s;
    }
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  </style>
  