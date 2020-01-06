<script>
export let sizeDetails;
export let buttonText;
export let buttonType;
export let dataTarget;

</script>

<div class="row ">
    <div class={sizeDetails}>
    
            <button on:click 
            type="button" 
            class="btn {buttonType} btn-block" 
            data-toggle="modal" 
            data-target={dataTarget}> 
            {buttonText} 
        </button>
    
    </div>
</div>