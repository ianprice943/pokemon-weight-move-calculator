<script>
  import { expandAPIName } from "$lib/utils";
  import Svelecte from "svelecte"

  let { allPokemon, value = $bindable() } = $props();

  let pokemon = $derived.by(() => {
    return allPokemon.map((pokemon) => {
      return {
        value: pokemon.name,
        text: expandAPIName(pokemon.name)
      }
    })
  })
</script>

<div>
  <Svelecte
    options={pokemon}
    bind:value={value}
  />
</div>

<style>
  div {
    padding: 2rem 0;
    width: 70%;
  }

  @media (max-width: 440px) {
    div {
      padding: 0.5rem 0;
      width: 100%;
    }
  }
</style>