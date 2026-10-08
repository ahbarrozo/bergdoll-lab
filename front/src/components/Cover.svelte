<script lang="ts">
    const { coverImg } = $props();
</script>

<div class="h-220 overflow-hidden">
<div class="relative flex justify-center opacity-40">
    {#if coverImg && coverImg.path}
            <img src={coverImg.path} 
                 alt="Website Cover"
                 class="h-300 object-cover mt-[-50px] w-[90%]" />
    {/if}
</div>

<div class="absolute top-[400px] 
            left-[-200px] md:left-[-250px] 
            lg:left-[-150px] xl:left-[-100px]
            2xl:left-[1500px]">
    <h2 class="text-[120px] text-nowrap">Bergdoll Lab</h2>
    <p class="subheading">Biochemistry and Biophysics of Mitochodrial membrane proteins</p>
</div>
</div>

