<script>
  let { name, active, handleFunc } = $props();
</script>

<button
  onclick={() => handleFunc()}
  aria-label={`Set the move to ${name}`}
  class={active ? "active" : ""}
>
  {name}
</button>

<style>
  button {
    outline: 2px solid transparent;
    border: 0;
    border-radius: 6px;
    padding: 0.5rem 1rem;
  }

  .active {
    outline: 2px solid black;
  }
</style>