<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->
<!-- Button component -->

<script>
export let buttonText = "";
export let buttonStyle = 'btn-outline-primary btn-block';
export let dataTarget = undefined;
export let value = "";
export let disabled = undefined;
export let gridStyle = "col-md-12 p-0";
export let iconLeft = undefined;
export let iconRight = undefined;
export let buttonType = "button"
//for modal close
export let dataDismiss = undefined;
export let ariaLabel = undefined;
export let buttonHtml = "";


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
  .backButton{
      vertical-align: text-bottom;
  }
  
</style>


<div class={gridStyle}>
  <button on:click
    type={buttonType}
    class="btn {buttonStyle}" 
    data-toggle="modal" 
    data-target={dataTarget}
    data-dismiss = {dataDismiss}
    aria-label = {ariaLabel}
    value = {value}
    disabled = {disabled}>

    <span class={iconLeft}/>
    {@html buttonHtml}
    {buttonText}
    <span class={iconRight}/>
    
  </button>

</div>

