import { Game } from '../Game'
import { PathFinder } from '../PathFinder'
import { Move } from '../Move'
import { TILE } from '../GameConstants'

export class Attacks {

  private game: Game;
  private pathFinder: PathFinder;

  constructor(game: Game, pathFinder: PathFinder){
    this.game = game;
    this.pathFinder = pathFinder;
  }

  private getRandomInt = (min: number, max: number): number =>  {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Loops through and gets all the indexes with armies at a given or larger size
   * 
   * 
   */
  public getArmiesWithMinSize(min: number = 2, useBase: boolean = false): Array<{index: number, armies: number}> {
    // get from closest to Base
    var matches: Array<{index: number, armies: number}> = [];

    // find biggest army and move to 0
    for(let i = 0; i < this.game.terrain.length; i++){
        if(this.game.terrain[i] === TILE.MINE && 
          this.game.armies[i] >= min && 
          (useBase ? true : i !== this.game.BASE)) 
        { 
          matches.push({ index:i, armies: this.game.armies[i]});
        }
    }
    
    return matches;
  }


  nearestToBase = (a:{index: number, armies: number}, b:{index: number, armies: number}): number => {
                              // Push the base to the back (last option)
                              if(a.index === this.game.BASE) return 1;
                              if(b.index === this.game.BASE) return -1;
                              // Those closest to base
                              return this.pathFinder.distanceTo(a.index, this.game.BASE) - this.pathFinder.distanceTo(b.index, this.game.BASE)
                            }

  furthestFromBase = (a:{index: number, armies: number}, b:{index: number, armies: number}): number => {
                              // Push the base to the back (last option)
                              if(a.index === this.game.BASE) return 1;
                              if(b.index === this.game.BASE) return -1;
                              // Furthest from base
                              return this.pathFinder.distanceTo(b.index, this.game.BASE) - this.pathFinder.distanceTo(a.index, this.game.BASE)
                            }

  largestFirst = (a:{index: number, armies: number}, b:{index: number, armies: number}): number => {
                              // Push the base to the back (last option)
                              if(a.index === this.game.BASE) return 1;
                              if(b.index === this.game.BASE) return -1;
                              // put largest armies at the front
                              return b.armies - a.armies;
                            }

  nearestToEmpty = (a:{index: number, armies: number}, b:{index: number, armies: number}): number => {
                            let aDist = this.pathFinder.getNearest(a.index, TILE.EMPTY).distance;
                            let bDist = this.pathFinder.getNearest(b.index, TILE.EMPTY).distance;
                            // put largest armies at the front
                            return aDist - bDist;
                          }

  nearestToEnemy = (a:{index: number, armies: number}, b:{index: number, armies: number}): number => {
                            let aDist = this.pathFinder.getNearest(a.index).distance;
                            let bDist = this.pathFinder.getNearest(b.index).distance;
                            // put largest armies at the front
                            return aDist - bDist;
                          }

  /**
   * Spead out and capture the nearest empty lands!
   * If unable to capture a new land then move way from specified location.
   * 
   * @method infest
   * @param {boolean} [useBase=false] - allow for moves from base (headquorters)
   * @param {number} [minArmies=2] - only attack from Tiles with at least X armies  
   * @param {function} [sort=largest] - Optional custom sort function for selecting army to move
   */
  public expand(useBase: boolean = true, minArmies: number = 2, sort?:(a:{index: number, armies: number}, b:{index: number, armies: number}) => number): Move {
    let started = (new Date().getTime());
    
    let armies = this.getArmiesWithMinSize(minArmies, useBase);

    let ordered = armies.sort(sort || this.nearestToEmpty);
    let choosen = ordered[0]

    if(choosen){
      let nearest = this.pathFinder.getNearest(choosen.index, TILE.EMPTY)
      let next = this.pathFinder.fastest(choosen.index, nearest.index)
      // update the elapse timer
      return new Move(choosen.index,next.index,(new Date().getTime() - started))
    }

    return new Move(0,0,(new Date().getTime() - started))
  }

  /**
   * Retuns all allied armies (at a given strength) to a common tile.
   * 
   * @method regroup
   * @param {number} [goal=BASE] - the end index to regroup to
   * @param {number} [distance=5] - the max distance to pull armies from 
   * @param {number} [minArmies=2] - the minimum armies required to be included in the regroup
   */
  public regroup(goal: number = this.game.BASE, distance:number = 5, minArmies: number = 2 ): Move {
    let start = new Date().getTime();

    for(let d = distance; d > 0; d--){
      let indexesAtDistance = this.pathFinder.getIndexesAtMovesAway(goal, d);

      for(let i of indexesAtDistance){
        if(this.game.terrain[i] === TILE.MINE && this.game.armies[i] >= minArmies){
          // get the move from that index to the goal
          return new Move(i, 
                this.pathFinder.fastest(i, goal).index, 
                (new Date().getTime() - start));
        }
      }
    }
    return null;
  }


}
