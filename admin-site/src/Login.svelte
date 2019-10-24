<!-- Login component with a simple password verification -->

 <script>
    export let authenticated = false;

    function verifyPassword(){
      // verifying password logic 
      var passwordCheck = document.getElementById('password').value;
      if (passwordCheck == "5555"){
        authenticated = true;
        document.getElementById("eventsList").style.display="block";
      }
    }

</script> 

<style>
</style>

{#if !authenticated}
 
      <div id="formContent">
          <div class="modal-dialog" role="document">

              <div class="modal-content">
                <div class="modal-header text-center">
                  <h4 class="modal-title w-100 font-weight-bold">Welcome Administrator</h4>
                </div>

                <div class="modal-body mx-3">
                  <div class="md-form mb-2">
                    <input type="text" id="login" class="fadeIn second" name="login" placeholder="login">
                  </div>
                  <div class="md-form mb-2">
                    <input type="text" id="password" class="fadeIn third" name="login" placeholder="password">
                  </div>
                </div>
                
                <div class="modal-footer d-flex justify-content-center cl-md">
                    <button type="button" class="btn btn-primary" on:click={verifyPassword}> Log In </button>
                </div>
              </div>

          </div>    
      </div>
{/if}



