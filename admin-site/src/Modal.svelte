<!-- 
  Copyright Luke Garwood & Jacob Niedzwiecki, 2019
  Released under the MIT License (see /LICENSE)
-->

<!-- Component for creating modals -->
<script>

export let modalID = "";
export let modalTitle = ""
</script>


<div class="modal fade" id={modalID} tabindex="-1" role="dialog" aria-labelledby="{modalID}Label" aria-hidden="true" data-backdrop="false">
  <div>
    <div class="modal-dialog modal-lg">
      <div class="modal-content">

        <div class="modal-header">
          <slot name="closeButton"></slot> 
          
          <h5 class="modal-title">
            {modalTitle}
          </h5>
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
</div>