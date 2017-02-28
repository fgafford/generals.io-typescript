import { Game } from '../Game'
import { Move } from '../Move'
import { TILE } from '../GameConstants'

export class Attacks {

  /**
   * Get information on the tiles immediatly surrounding a given tile.
   * Each tile will come with Army and terrain information as well as the
   * index of the tile.
   * 
   * @method getSurroundings
   */
  static getSurroundings(tile: number, game: Game): any{
      return {
        up: game.up(tile),
        left: game.left(tile),
        right: game.right(tile),
        down: game.down(tile)
      };
  }

  /**
   * Spead out and capture the nearest empty lands!
   * If unable to capture a new land then move way from specified location.
   * 
   * @method infest
   * @param {Game} game - the game object
   * @param {boolean} useBase - allow for moves from base (headquorters)
   * @param {number} [from=game.Base] - tile to spread furthest from [optional]
   * @param {number} [minArmies=2] - only attack from Tiles with at least X armies  
   */
  static infest(game: Game, useBase: boolean, from = game.BASE, minArmies = 2) {
    let move = new Move(0,0, new Date().getTime());
    let readyToMove:Array<number> = [];

    for(let i = 0; i < game.terrain.length; i++){
      if(game.terrain[i] === TILE.MINE && 
        game.armies[i] >= minArmies &&
        (useBase ? true : game.BASE === i)) // Should be useCities at some point
      { 
        readyToMove.push(i);
      }
    }

    let sorted = readyToMove.sort((a,b): number => {
      // Push the base to the back (last option)
      if(a === game.BASE) return 1;
      if(b === game.BASE) return -1;
      return game.armies[a] - game.armies[b];
    });

    //[Math.floor(Math.random()*readyToMove.length)] // random ready army
    // TODO: get first army with a surrounding empty space...
    for(var i in sorted){
      let surroundings = Attacks.getSurroundings(sorted[i], game);  

      // Prefer empty space
      for(let dir in surroundings){
        if(surroundings[dir].terrain === TILE.EMPTY && 
          game.cities.indexOf(surroundings[dir].index) < 0)
        {
          move.from = sorted[i];
          move.to = surroundings[dir].index
          // update the elapse timer
          move.elapse = new Date().getTime() - move.elapse;
          return move
        }
      }
    }

    // Move away from base if none empty
    let fromRow = Math.floor(from / game.width);
    let fromCol = from % game.width;

    for(var i in sorted){
      let pref: Array<string> = [];

      let row = Math.floor(sorted[i] / game.width);
      let col = sorted[i] % game.width;
      let surroundings = Attacks.getSurroundings(sorted[i], game);

      if(row > fromRow){
        pref = ['down', 'left', 'right', 'up']
      } else if(row < fromRow){ 
        pref = ['up', 'left', 'right', 'down']
      } else if(col < fromCol){
        pref = ['left', 'up', 'down', 'right']
      } else if(col > fromCol){
        pref = ['right', 'down', 'up', 'left']
      } else {
        // TODO: this should be smarter
        pref = ['right', 'left', 'up', 'down']
      }

      for(let dir in pref){   
        // TODO: dont attack cities
        if(surroundings[pref[dir]].terrain === TILE.MINE && 
          game.cities.indexOf(surroundings[pref[dir]].index) < 0)
        {
          move.from = sorted[i];
          move.to = surroundings[pref[dir]].index
          // update the elapse timer
          move.elapse = new Date().getTime() - move.elapse;
          return move
        }
      }
    }

    // update the elapse timer
    move.elapse = new Date().getTime() - move.elapse;
    return move
  }
}
