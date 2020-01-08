<script>
export let buttonText = "";
export let buttonType = 'btn-outline-primary';
export let dataTarget = undefined;
export let value = "";
export let disabled = undefined;
export let bsSizePosition = "col-md-12";
export let iconLeft = undefined;
export let iconRight = undefined;

</script>
<style>
  button {
	  margin-bottom:0.5rem;
  }
  span{
      vertical-align: middle;
  }
</style>


    <div class={bsSizePosition}>
    
            <button on:click 
            type="button" 
            class="btn {buttonType} btn-block" 
            data-toggle="modal" 
            data-target={dataTarget}
            value = {value}
            disabled = {disabled}>

            <span class={iconLeft}/>
            {buttonText} 
            <span class={iconRight}/>
        </button>
    
    </div>

