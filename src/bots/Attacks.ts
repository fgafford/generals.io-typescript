import { Game } from '../Game'
import { Move } from '../Move'
import { TILE } from '../GameConstants'

export class Attacks {

  private game: Game;

  constructor(game: Game){
    this.game = game;
  }

  private getRandomInt = (min: number, max: number): number =>  {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public getArmiesWithMinSize(game: Game, min: number = 2, useBase: boolean = false): Array<{index: number, armies: number}> {
    // get from closest to Base
    var matches: Array<{index: number, armies: number}> = [];

    // find biggest army and move to 0
    for(let i = 0; i < game.terrain.length; i++){
        if(game.terrain[i] === TILE.MINE && 
          game.armies[i] > 1) 
        { 
          matches.push({ index:i, armies: game.armies[i]});
        }
    }
    
    return matches;
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
  public expand(game: Game, useBase: boolean = false, from: number = game.BASE, minArmies: number = 2): Move {
    let move = new Move(0,0, new Date().getTime());
    
    let armies = this.getArmiesWithMinSize(game, 2, useBase);



    // update the elapse timer
    move.elapse = new Date().getTime() - move.elapse;
    return move
  }

  /**
   * Get the indexes of tiles a specified number of moves away from a given point
   * This does not take into account obsticles or enemy armies.
   * 
   *
  static getIndexesAtRange(from: number, range: number, game: Game): Array<number> {
      let indexes: Array<number> = [];

      function minX(index: number): number{
        return index - game.col(index)
      }

      function maxX(index: number): number{
        return index - game.col(index) + game.width - 1;
      }

      let minY = 0; // below index
      let maxY = game.terrain.length; // out of range

      for(let i = 0; i <= range; i++){
        let x = range - i;
        let y = i * game.width;

        if(from + x - y <= maxX(from - y) && from - y >= minY){ indexes.push(from + x - y);} // +x, -y 
        if(from - x + y >= minX(from + y) && from + y <= maxY){ indexes.push(from - x + y);} // -x, +y
        if(i === 0 || i === range) continue; // prevent dups of X or Y at extreams
        if(from + x + y <= maxX(from + y) && from + y <= maxY){ indexes.push(from + x + y);} // +x, +y
        if(from - x - y >= minX(from - y) && from - y >= minY){ indexes.push(from - x - y);} // -x, -y
      }

      return indexes;
    }
    */

  /**
   * 
   */
  public regroup(): Move {
    let move = new Move(0,0, new Date().getTime())

    // update the elapse timer
    move.elapse = new Date().getTime() - move.elapse;
    return move;
  }
}
