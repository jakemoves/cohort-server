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
  <div class="container">
    <form id="formContent">
      <div class="row"> 
        <div class= "col-md-12 text-center mt-4 mb-2">  
          <h4>Welcome Administrator</h4>
        </div>
      </div>

      <div class="form-group">
          <input type="text" id="login" class="form-control" name="login" placeholder="username"> 
      </div>

      <div class="form-group"> 
        <input type="text" id="password" class="form-control" name="login" placeholder="password">     
      </div>

      <button type="button" class="btn btn-primary" on:click={verifyPassword}> Log In </button>
                
       
    </form>
  </div>

{/if}



