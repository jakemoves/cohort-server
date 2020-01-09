<script>

export let modalID = "";

</script>

<div class="modal fade" id={modalID} tabindex="-1" role="dialog" aria-labelledby="{modalID}Label" aria-hidden="true">
  <div>
    <div class="modal-dialog modal-lg">
      <div class="modal-content">

        <div class="modal-header">
          <slot name ="modalHeader"/>
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