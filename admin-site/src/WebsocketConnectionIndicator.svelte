<script>
export let status = "unknown"
export let label = ""
</script>

<style>
.indicator {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  display: inline-block;
}

.indicator.connection-active {
  background-color: green;
}

.indicator.connection-unknown {
  background-color: orange;
}

.indicator.connection-inactive {
  background-color: red;
}

</style>
<div><span class={"indicator connection-" + status}></span><span>{label}</span></div>