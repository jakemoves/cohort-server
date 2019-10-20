<style>

button{
      font:inherit;
      padding:0.15rem, 0.5rem;
      background: #8d094bdc;
      border: 1px solid #8d094bdc;
      color: white;
      cursor:pointer; 
  }
  button:hover,
  button:active{
      box-shadow: 1px 1px 6px rgba(0,0,0,0.26);
  }

</style>


<button on:click>
<slot />
</button>