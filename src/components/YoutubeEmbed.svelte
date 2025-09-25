<!-- src/lib/components/YouTubeEmbed.svelte -->
<script>
    export let url = '';
    
    // Convert YouTube URL to embed URL
    const getEmbedUrl = () => {
        if (!url) return '';
        
        // Handle different YouTube URL formats
        let videoId = '';
        
        // Regular YouTube watch URL
        const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
        if (watchMatch) videoId = watchMatch[1];
        
        // YouTube Shorts URL
        const shortsMatch = url.match(/youtube\.com\/shorts\/([^?]+)/);
        if (shortsMatch) videoId = shortsMatch[1];
        
        // youtu.be URL
        const youtuBeMatch = url.match(/youtu\.be\/([^?]+)/);
        if (youtuBeMatch) videoId = youtuBeMatch[1];
        
        // Already embed URL
        const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
        if (embedMatch) videoId = embedMatch[1];
        
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        
        return '';
    };
    
    const embedUrl = getEmbedUrl();
</script>

{#if embedUrl}
    <div class="relative pb-[56.25%] h-0 rounded-lg overflow-hidden shadow-md">
        <iframe
            src={embedUrl}
            class="absolute top-0 left-0 w-full h-full"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
        ></iframe>
    </div>
{:else}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-red-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p class="text-red-600">Unable to load video. Invalid YouTube URL.</p>
    </div>
{/if}
