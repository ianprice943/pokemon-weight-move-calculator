<script>
  import Svelecte from "svelecte"

  let { allPokemon, value } = $props();

  let pokemon = $derived.by(() => {
    return allPokemon.map((pokemon) => {
      return pokemon.name
    })
  })
</script>

<Svelecte
  options={pokemon}
  bind:value
/>