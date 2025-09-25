<!-- src/lib/components/Pagination.svelte -->
<script>
    export let currentPage = 1;
    export let totalPages = 1;
    export let onPageChange;
    
    // Generate page numbers to display
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show on each side of current page
        const range = [];
        const rangeWithDots = [];
        
        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }
        
        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }
        
        rangeWithDots.push(...range);
        
        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }
        
        return rangeWithDots;
    };
</script>

<nav class="flex items-center justify-center space-x-2">
    <!-- Previous Button -->
    <button
        on:click={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        class="px-3 py-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
    </button>
    
    <!-- Page Numbers -->
    {#each getPageNumbers() as page}
        {#if page === '...'}
            <span class="px-3 py-2 text-gray-500">...</span>
        {:else}
            <button
                on:click={() => onPageChange(page)}
                class={`px-4 py-2 rounded-md border font-medium ${
                    page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
            >
                {page}
            </button>
        {/if}
    {/each}
    
    <!-- Next Button -->
    <button
        on:click={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        class="px-3 py-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
    </button>
</nav>