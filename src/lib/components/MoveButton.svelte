<script>
  let { name, active, handleFunc } = $props();

  let bgColor = $derived.by(() => {
    if(name === "Low Kick") {
      return "bg-orange"
    } else if(name === "Heat Crash") {
      return "bg-red"
    } else if(name === "Grass Knot") {
      return "bg-green"
    } else if(name === "Heavy Slam") {
      return "bg-gray"
    }
  })
</script>

<button
  onclick={() => handleFunc()}
  aria-label={`Set the move to ${name}`}
  class={[
    active ? "active" : "",
    bgColor
  ]}
>
  {name}
</button>

<style>
  button {
    font-size: 1.5em;
    outline: 2px solid transparent;
    border: 0;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }
  button:hover {
    opacity: 0.75;
  }

  .active {
    outline: 2px solid black;
  }

  @media (max-width: 440px) {
    button {
      font-size: 1rem;
      width: calc(50% - 0.5rem);
    }
  }
</style>