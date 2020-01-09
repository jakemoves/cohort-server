<script>
export let buttonText = "";
export let buttonType = 'btn-outline-primary btn-block';
export let dataTarget = undefined;
export let value = "";
export let disabled = undefined;
export let bsSizePosition = "col-md-12";
export let iconLeft = undefined;
export let iconRight = undefined;
//for modal close
export let dataDismiss = undefined;
export let ariaLabel = undefined;

</script>
<style>
  button {
	  margin-bottom:0.5rem;
  }
  span{
      vertical-align: middle;
  }
  .abs-left { 
    position: absolute;
    left: 0.5rem;
  }
</style>


    <div class={bsSizePosition}>
    
            <button on:click 
                type="button" 
                class="btn {buttonType}" 
                data-toggle="modal" 
                data-target={dataTarget}
                data-dismiss = {dataDismiss}
                aria-label = {ariaLabel}
                value = {value}
                disabled = {disabled}>

            <span class={iconLeft}/>
            {buttonText} 
            <span class={iconRight}/>
        </button>
    
    </div>

