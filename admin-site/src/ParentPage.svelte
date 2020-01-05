<script>
 
 export let headerSize;
 export let headingText;
 export let pageID;
</script>
<style>
.page{
    display:none
}
</style>
<div id={pageID} class="page">
    <div class="container-fluid">
        <div class="row">
            <div class="col-12 mt-2">
                {#if headerSize == 1}
                    <h1 class="text-center">
                        {headingText}
                    </h1>
                {:else if headerSize == 2}
                    <h2 class="text-center">
                        {headingText}
                    </h2>
                {:else if headerSize == 3}
                    <h3 class="text-center">
                        {headingText}
                    </h3>
                {/if}
            </div>
        </div>
        <hr/>
        <slot></slot>
    </div>
</div>