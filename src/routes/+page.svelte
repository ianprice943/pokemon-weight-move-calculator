<script>
  import MoveButton from "$lib/components/MoveButton.svelte";
  import PokemonDropdown from "$lib/components/PokemonDropdown.svelte";
  import { convertWeight, calculateLKGKBasePower, calculateHSHCBasePower, expandAPIName } from "$lib/utils";

  const basePokeAPIURL = "https://pokeapi.co/api/v2/"

  let move = $state("")
  let user = $state("")
  let userWeight = $derived.by(async () => {
    if (!user) return 0
    const hexagrams = await getPokemonWeight(user)
    const [kg, lbs] = convertWeight(hexagrams)
    return kg
  })
  let userSprite = $derived.by(async () => {
    if (!user) return ""
    return await getPokemonSprite(user)
  })
  let target = $state("")
  let targetWeight = $derived.by(async () => {
    if (!target) return 0
    const hexagrams = await getPokemonWeight(target)
    const [kg, lbs] = convertWeight(hexagrams)
    return kg
  })
  let targetSprite = $derived.by(async () => {
    if (!target) return ""
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
    if (!pokemon) return 0
    const pokemonRes = await getPokemon(pokemon)
    return pokemonRes.weight
  }

  async function getPokemonSprite(pokemon) {
    if (!pokemon) return ""
    const pokemonRes = await getPokemon(pokemon)
    return pokemonRes.sprites.front_default
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
      <div class="lkgk-selection">
        <PokemonDropdown
          allPokemon={allPokemon}
          bind:value={target}
        />
        {#await targetSprite then targetSprite}
          {#if target && targetSprite}
            <img src={targetSprite} alt={expandAPIName(target)} />
          {:else}
            <div class="sprite-placeholder" aria-hidden="true"></div>
          {/if}
        {/await}
      </div>
        
        {#await targetWeight then targetWeight}
          {#if target && targetWeight}
            <p>Using {expandAPIName(move)} on {expandAPIName(target)} ({targetWeight}kg):</p>
            <p>{expandAPIName(move)}'s base power will be <span style="text-decoration: underline;">{calculateLKGKBasePower(targetWeight)}</span></p>
          {/if}
        {/await}
      {/if}
    </div>

    <div class="hchs-container">
      {#if move === "heat-crash" || move === "heavy-slam"}
        <div class="hchs-selection-container">
          <div class="hchs-selection">
            <PokemonDropdown
              allPokemon={allPokemon}
              bind:value={user}
            />
            {#await userSprite then userSprite}
              {#if user && userSprite}
                <img src={userSprite} alt={expandAPIName(user)} />
              {:else if user}
                <div class="sprite-placeholder-missing">Sprite Data Missing</div>
              {:else}
                <div class="sprite-placeholder" aria-hidden="true"></div>
              {/if}
            {/await}
          </div>
          <div class="hchs-selection">
            <PokemonDropdown
              allPokemon={allPokemon}
              bind:value={target}
            />
            {#await targetSprite then targetSprite}
              {#if target && targetSprite}
                <img src={targetSprite} alt={expandAPIName(target)} />
              {:else if target}
                <div class="sprite-placeholder-missing">Sprite Data Missing</div>
              {:else}
                <div class="sprite-placeholder" aria-hidden="true"></div>
              {/if}
            {/await}
          </div>
        </div>
  
        {#await userWeight then userWeight}
          {#await targetWeight then targetWeight}
            {#if userWeight && targetWeight && user && target}
              <p>If {expandAPIName(user)} ({userWeight}kg) uses {expandAPIName(move)} on {expandAPIName(target)} ({targetWeight}kg):</p>
              <p>{expandAPIName(move)}'s base power will be <span style="text-decoration: underline;">{calculateHSHCBasePower(userWeight, targetWeight)}</span></p>
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
    margin: 0;
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
    width: 400px;
    padding: 1rem 0 0 0;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .lkgk-container p {
    padding: 0;
    margin: 0.25rem 0;
    text-align: center;
  }

  .lkgk-selection {
    display: flex;
    gap: 5%;
  }

  .hchs-container {
    width: 400px;
    padding: 1rem 0 0 0;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .hchs-selection-container {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .hchs-selection {
    display: flex;
    gap: 5%;
  }

  .hchs-container p {
    padding: 0;
    margin: 0.25rem 0;
    text-align: center;
  }

  .sprite-placeholder,
  .sprite-placeholder-missing {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    aspect-ratio: 1/1;
    width: 96px;
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

  @media (max-width: 440px) {
    h1 {
      font-size: 1.5rem;
      margin: 0;
      padding: 0.5rem;
    }

    h2 {
      font-size: 1rem;
      margin: 0;
    }

    .move-buttons {
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .lkgk-container {
      width: 100%;
    }

    .lkgk-selection {
      flex-direction: column-reverse;
      gap: 1rem;
      align-items: center;
    }

    .hchs-container {
      width: 100%;
      padding: 0 0 1rem 0;
    }

    .hchs-selection {
      flex-direction: column-reverse;
      gap: 1rem;
      align-items: center;
      padding: 0.5rem 0 0 0;
    }

    .sprite-placeholder {
      width: 50%;
    }

    .sprite-placeholder-missing {
      width: 100%;
      aspect-ratio: unset;
      padding: 0.5rem 0 0 0;
    }

    img {
      width: 50%;
    }
  }
</style>