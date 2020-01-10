<script>
import moment from "moment";
import Button from "./Button.svelte";

export let items;
export let buttonAction = "";
export let action= "";
</script>

{#each items as item (item.id)}
    <Button 
        buttonHtml = '<h3 class="m-0">{item.label}  - {item.label} </h3> <h5>{item.locationCity} - {moment(item.startDateTime).format("LL")} - id:{item.id}</h5>'
        value = {item.id}/>
    <!-- <div class="row">
                  <div class="col">
                    <button
                      alt="click here for details"
                      type="button"
                      id={item.id}
                      class="btn btn-outline-primary btn-block"
                      value={item.id}>
                      <h3 class="m-0">{item.label}  - {item.label} </h3>
                      <h5>{item.locationCity} - {moment(item.startDateTime).format("LL")} - id:{item.id}</h5>	
                    </button>
                  </div>
                </div> -->
    
{/each}