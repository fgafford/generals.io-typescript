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
    // TODO: Find furtest from base...

console.log(readyToMove);


    let army = readyToMove[Math.floor(Math.random()*readyToMove.length)] // random ready army
    let surroundings = Attacks.getSurroundings(army, game);
// console.log('-------------');
// console.log('army:', army);
// console.log( surroundings);


    // Prefer empty space
    for(let dir in surroundings){
// console.log('dir:', dir);
// console.log(surroundings[dir]);
// console.log('====');
      if(surroundings[dir].terrain === TILE.EMPTY){
        move.from = army
        move.to = surroundings[dir].index
        // update the elapse timer
        move.elapse = new Date().getTime() - move.elapse;
        return move
      }
    }

    // Move away from base if none empty
    let pref: Array<string> = [];

    let fromRow = Math.floor(from / game.width);
    let fromCol = from % game.width;

    let row = Math.floor(army / game.width);
    let col = army % game.width;

    if(row < fromRow){
      pref = ['down', 'left', 'right', 'up']
    } else if(row > fromRow){ 
      pref = ['up', 'left', 'right', 'down']
    } else if(col < fromCol){
      pref = ['left', 'up', 'down', 'right']
    } else if(col > fromCol){
      pref = ['right', 'down', 'up', 'left']
    } else {
      // TODO: this should be smarter
      pref = ['right', 'left', 'up', 'down']
    }

    // for(let dir in pref){
    //   if(surroundings[dir].terrain === TILE.EMPTY){
    //     move.from = army
    //     move.to = surroundings[dir].index
    //     // update the elapse timer
    //     move.elapse = new Date().getTime() - move.elapse;
    //     return move
    //   }
    // }
    for(let dir in pref){
    
      if(surroundings[pref[dir]].terrain === TILE.MINE){
        move.from = army
        move.to = surroundings[pref[dir]].index
        // update the elapse timer
        move.elapse = new Date().getTime() - move.elapse;
        return move
      }
    }

    // throw('FAIL')

    // update the elapse timer
    move.elapse = new Date().getTime() - move.elapse;
    return move
  }
}
