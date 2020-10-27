<script>
export let status = "unknown"
</script>

<style>
.indicator {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  display: inline-block;
  transition: background-color 0.5s linear;
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
<div class={"indicator connection-" + status}></div>