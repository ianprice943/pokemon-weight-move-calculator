# The Pokemon Weight Move Calculator

This is a base power calculator for weight based moves in the Pokémon franchise. These moves are:

* Low Kick
* Grass Knot
* Heat Crash
* Heavy Slam

This project is built with SvelteKit 2 in CSR mode, and consumes data from [PokéAPI](https://pokeapi.co/) for Pokémon names, sprites, and weights. All results returned form the API are cached in the browser's localStorage to comply with PokéAPI's [fair use policy](https://pokeapi.co/docs/v2#fairuse) and save on bandwidth.