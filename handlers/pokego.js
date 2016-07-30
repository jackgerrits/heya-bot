var PokemonGO = require('pokemon-go-node-api')
var registry = require("../intentHandler.js");

var goInstance = new PokemonGO.Pokeio();

var pUsername = process.env.POKE_USER
var pPassword = process.env.POKE_PASS
var pLat = -37.8003569
var pLong = 144.963433
var pElev = 18.25

var pLocation = {
  type: 'coords',
  coords: {
    latitude: pLat,
    longitude: pLong,
    altitude: pElev
  }
}

module.exports = function(context, entities, callback){
  var returnObject = {execStatus : "CANT_HANDLE", context : context};

  goInstance.init(pUsername, pPassword, pLocation, 'google', function(err){
  if (err) throw err;
    goInstance.GetProfile(function(err, profile) {
      if (err) throw err;
      goInstance.Heartbeat(function(err,hb) {
        if (err) throw err;

        var pokemonArray = [];
        var outputMessage = ["The nearby pokemon are: "];

        for (var i = hb.cells.length - 1; i >= 0; i--) {
          if(hb.cells[i].NearbyPokemon[0]) {
            var pokemonCell = hb.cells[i];
            for(var j = 0; j < pokemonCell.NearbyPokemon.length; j++) {
              var pokemon = goInstance.pokemonlist[parseInt(pokemonCell.
                                       NearbyPokemon[j].PokedexNumber)-1];
              pokemonArray.push(" " + pokemon.name);
            }
          }
        }

        returnObject.context.result = "Some nearby pokemon are: " + pokemonArray.join();
        returnObject.execStatus = "SUCCESS";

        callback(returnObject);
      });
    });
    });
};
