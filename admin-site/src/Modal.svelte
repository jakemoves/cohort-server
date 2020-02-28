<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->

<!-- Component for creating modals -->
<script>
import Button from './Button.svelte';

export let modalID = "";
export let modalTitle = "";
export let showCloseButton = false;
</script>


<div class="modal fade" id={modalID} tabindex="-1" role="dialog" aria-labelledby="{modalID}Label" aria-hidden="true" data-backdrop="false">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <div class="container-fluid">

          <div class = "row">
            <div class = "col-12">
              {#if showCloseButton}
                <Button
                  buttonStyle="close"
                  gridStyle = ""
                  dataDismiss="modal"
                  ariaLabel="Close"
                  iconRight = "fas fa-times"/>
              {/if}
              <slot name="header"></slot> 
            </div>
          </div>
        
          <div class = "row">
            <div class = "col-12">
              <h5 class="modal-title">
                {modalTitle}
              </h5>
            </div>
          </div>

        </div>
      </div>

      <div class="modal-body">
        <slot name ="modalBody">Sorry, an error has occured</slot>
      </div>

      <div class="modal-footer">
        <slot name ="modalFooter"/>
      </div>
      
    </div>
  </div>
  
</div>