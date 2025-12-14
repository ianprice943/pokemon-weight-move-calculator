<script>
  const basePokeAPIURL = "https://pokeapi.co/api/v2/"

  let move = $state("")
  let user = $state("")
  let userWeight = $derived.by(async () => {
    const hexagrams = await getPokemonWeight(user)
    const [kg, lbs] = convertWeight(hexagrams)
    return kg
  })
  let target = $state("")
  let targetWeight = $derived.by(async () => {
    const hexagrams = await getPokemonWeight(target)
    const [kg, lbs] = convertWeight(hexagrams)
    return kg
  })
  let allPokemon = $state([])

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

  // async function getAllMoveUsers(move) {
  //   const url = `${basePokeAPIURL}move/${move}`
  //   const results = await pokeAPIRequest(url)

  //   return results.learned_by_pokemon
  // }

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
  <h1>Welcome to The Weight Based Moves Calculator!</h1>
</header>
<main>
  <section>
    <h2>Select a move to get started</h2>
    <form id="moveForm">
      <select bind:value={move}>
        <option value="low-kick">Low Kick</option>
        <option value="grass-knot">Grass Knot</option>
        <option value="heat-crash">Heat Crash</option>
        <option value="heavy-slam">Heavy Slam</option>
      </select>

      {#if move === "low-kick" || move === "grass-knot"}
        <label for="lkgk-target">Target: </label>
        <select id="lkgk-target" bind:value={target}>
          {#each allPokemon as pokemon}
            <option value={pokemon.name}>{expandAPIName(pokemon.name)}</option>
          {/each}
        </select>
        
        {#await targetWeight then targetWeight}
          {#if target && targetWeight}
            <p>Using {expandAPIName(move)} on {expandAPIName(target)} ({targetWeight}kg):</p>
            <p>{expandAPIName(move)}'s base power will be {calculateLKGKBasePower(targetWeight)}</p>
          {/if}
        {/await}
      {/if}

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
    </form>
  </section>
</main>
<footer>

</footer>