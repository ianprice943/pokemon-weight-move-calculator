<script>
  import MoveButton from "$lib/components/MoveButton.svelte";
  import PokemonDropdown from "$lib/components/PokemonDropdown.svelte";

  const basePokeAPIURL = "https://pokeapi.co/api/v2/"

  let move = $state("")
  let user = $state("")
  let userWeight = $derived.by(async () => {
    const hexagrams = await getPokemonWeight(user)
    const [kg, lbs] = convertWeight(hexagrams)
    return kg
  })
  let userSprite = $derived.by(async () => {
    return await getPokemonSprite(user)
  })
  let target = $state("")
  let targetWeight = $derived.by(async () => {
    const hexagrams = await getPokemonWeight(target)
    const [kg, lbs] = convertWeight(hexagrams)
    return kg
  })
  let targetSprite = $derived.by(async () => {
    return await getPokemonSprite(target)
  })
  let allPokemon = $state([])

  function setMove(newMove) {
    move = newMove
  }

  function setUser(newUser) {
    user = newUser
  }

  function setTarget(newTarget) {
    target = newTarget
  }

  function checkLocalStorage(key) {
    const localStorageCheck = localStorage.getItem(key)
    if (!localStorageCheck) return null

    return JSON.parse(localStorageCheck)
  }

  async function pokeAPIRequest(url) {
    // check if the response has been cached already
    const cached = checkLocalStorage(url)
    if (cached) return cached

    try {
      const response = await fetch(url)
      if(!response.ok) {
        throw new Error(`Response status: ${response.status}`)
      }

      const result = await response.json()
      localStorage.setItem(url, JSON.stringify(result))

      return result
    } catch (error) {
      console.error(error)
      return null
    }
  }

  async function getAllPokemon() {
    const url = `${basePokeAPIURL}pokemon?limit=2000`
    const results = await pokeAPIRequest(url)
    return results
  }

  async function getPokemon(pokemon, providedURL) {
    let url
    if (!providedURL) {
      url = `${basePokeAPIURL}pokemon/${pokemon}`
    } else {
      url = providedURL
    }
    const result = await pokeAPIRequest(url)

    return result
  }

  async function getPokemonWeight(pokemon) {
    const pokemonRes = await getPokemon(pokemon)
    return pokemonRes.weight
  }

  function convertWeight(weight) {
    console.log('weight to convert: ', weight)
    // weight comes in hectograms from API
    const kg = weight / 10
    const lbs = weight * 0.2204623

    return [kg, lbs]
  }

  async function getPokemonSprite(pokemon) {
    const pokemonRes = await getPokemon(pokemon)
    return pokemonRes.sprites.front_default
  }

  function calculateLKGKBasePower(weight) {
    console.log('Target weight: ', weight)
    // assumes kg
    if (weight >= 200.0) return 120
    if (weight >= 0.1 && weight <= 9.9) return 20
    if (weight >= 10.0 && weight <= 24.9) return 40
    if (weight >= 25.0 && weight <= 49.9) return 60
    if (weight >= 50.0 && weight <= 99.9) return 80
    if (weight >= 100.0 && weight <= 199.9) return 100
  }

  function calculateHSHCBasePower(userWeight, targetWeight) {
    console.log('User weight: ', userWeight)
    console.log('Target weight: ', targetWeight)
    // assumes kg
    const ratio = userWeight / targetWeight
    console.log('Weight ratio: ', ratio)

    if (ratio < 2) return 40
    if (ratio >= 5) return 120
    if (ratio < 3 && ratio >= 2) return 60
    if (ratio < 4 && ratio >= 3) return 80
    if (ratio < 5 && ratio >= 4) return 100
  }

  function expandAPIName(name) {
    const nameSplit = name.split("-")
    const nameArrCapped = nameSplit.map(name => { 
      return name.charAt(0).toUpperCase() + name.slice(1)
    })

    return nameArrCapped.join(" ")
  }

  $effect(async () => {
    const results = await getAllPokemon()
    allPokemon = results.results
  })
</script>

<header>
  <h1>Welcome to The Pokémon Weight Based Moves Calculator!</h1>
</header>
<main>
  <h2
    class={move ? "hidden" : ""}
  >
    Select a move to get started
  </h2>
  <div id="move-container">
    <div class="move-buttons">
      <MoveButton 
        name="Low Kick"
        active={move === "low-kick"}
        handleFunc={() => setMove("low-kick")}
      />
      <MoveButton 
        name="Grass Knot"
        active={move === "grass-knot"}
        handleFunc={() => setMove("grass-knot")}
      />
      <MoveButton 
        name="Heat Crash"
        active={move === "heat-crash"}
        handleFunc={() => setMove("heat-crash")}
      />
      <MoveButton 
        name="Heavy Slam"
        active={move === "heavy-slam"}
        handleFunc={() => setMove("heavy-slam")}
      />
    </div>

    <div class="lkgk-container">
      {#if move === "low-kick" || move === "grass-knot"}
        <!-- <label for="lkgk-target">Target: </label>
        <select id="lkgk-target" bind:value={target}>
          {#each allPokemon as pokemon}
            <option value={pokemon.name}>{expandAPIName(pokemon.name)}</option>
          {/each}
        </select> -->
        <PokemonDropdown
          allPokemon={allPokemon}
          value={target}
        />
        <img src={targetSprite} alt={expandAPIName(target)} />
        
        {#await targetWeight then targetWeight}
          {#if target && targetWeight}
            <p>Using {expandAPIName(move)} on {expandAPIName(target)} ({targetWeight}kg):</p>
            <p>{expandAPIName(move)}'s base power will be {calculateLKGKBasePower(targetWeight)}</p>
          {/if}
        {/await}
      {/if}
    </div>

    <div class="hchs-container">
      {#if move === "heat-crash" || move === "heavy-slam"}
        <label for="hchs-user">User: </label>
        <select id="hchs-user" bind:value={user}>
          {#each allPokemon as pokemon}
            <option value={pokemon.name}>{expandAPIName(pokemon.name)}</option>
          {/each}
        </select>
  
        <label for="hchs-target">Target: </label>
        <select id="hchs-target" bind:value={target}>
          {#each allPokemon as pokemon}
            <option value={pokemon.name}>{expandAPIName(pokemon.name)}</option>
          {/each}
        </select>
  
        {#await userWeight then userWeight}
          {#await targetWeight then targetWeight}
            {#if userWeight && targetWeight}
              <p>If {expandAPIName(user)} ({userWeight}kg) uses {expandAPIName(move)} on {expandAPIName(target)} ({targetWeight}kg):</p>
              <p>{expandAPIName(move)}'s base power will be {calculateHSHCBasePower(userWeight, targetWeight)}</p>
            {/if}
          {/await}
        {/await}
      {/if}
    </div>
  </div>
</main>
<footer>
  <p>Data provided by <a href="https://pokeapi.co/">PokéAPI</a></p>
  <p>Pokémon and Pokémon character names are trademarks of Nintendo. This site is not affiliated with nor endorsed by Nintendo, The Pokémon Company, or Game Freak.</p>
</footer>

<style>
  header,
  h2 {
    text-align: center;
  }

  main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  .hidden {
    visibility: hidden;
  }

  #move-container {
    padding: 1rem;
    display: flex;
    flex-direction: column;
  }

  .move-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .lkgk-container {
    max-width: 80%;
    padding: 1rem 0 0 0;
    margin: 0 auto;
    display: flex;
    justify-content: center;
  }

  @media (max-width: 768px) {
    .lkgk-container {
      max-width: unset;
    }
  }

  .hchs-container {
    max-width: 80%;
    padding: 1rem 0 0 0;
    margin: 0 auto;
    display: flex;
    justify-content: center;
  }

  footer {
    margin: 0.5rem 0 0 0;
  }
  footer p {
    text-align: center;
    margin: 0 0 0.5rem;
  }
  footer p a,
  footer p a:visited {
    color: #000;
  }
</style>