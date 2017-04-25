import { bot } from './bot';
import { Move } from '../Move'
import { Game } from '../Game'
import { PathFinder } from '../PathFinder'

export default class Curly implements bot {

  // How close is too close
  private intruderRange = 2;
  // minimum lands before we expand no further
  private minLands = 50; // update later
  // minimun ours to their ratio (exand more if we are below a ratio)
  private minLandRatio = 1.5;

  // index of our attacking front (vanguard)
  private vanguard:{index:number, armies:number, deploying: boolean} = {index:-1, armies: 0, deploying: false};
  // How far out is the vanguard before we pull it back
  private varguardHelpDistance = 10;

  private pathFinder: PathFinder;
  private maxStrength: number;
  private enemyMaxStrength: number;
  private game: Game;
  private started: number;
  public name: string;

  constructor(name: string){
    this.name = name;
  }

  /**
   * The maximum number of bonus armies given for land own since game start
   */
  maxTurnLandBonus(): number { return Math.floor((this.game.turn+1)/50) }

  /**
   * Move the largest army on the board towards a given index
   * 
   * @param index - end goal
   */
  moveLargestArmyTo(index: number): Move {
      let self = this;
      let army = this.pathFinder.getArmiesWithMinSize(this.game.TILE.MINE, 1, false, this.pathFinder.largestFirst)[0];
      // let regroupArmy = (armies[0].index === self.vanguard.index) ? armies[1] :armies[0];
      let next = this.pathFinder.fastest(army.index, index);
      return next ? 
              new Move(army.index, next.index, (new Date().getTime()) - this.started) :
              null;
  }

  /**
   * Gathers nearby surrouning armies to the largest
   * army then moves it towards the goal
   * 
   * @param {number} [range=2] furthest distance to regroup from 
   * @param {number} [minStrength=2] minimum strength armies to include in regroup
   * @param {number} [goal=ANY_ENEMY] index to attack (default to nearest enemy)
   */
  gatherAndMoveLargest(range = 2, minStrength  = 2, goal: number = null): Move {
      let largest = this.pathFinder.getArmiesWithMinSize(this.game.TILE.MINE, 1, false, this.pathFinder.largestFirst)[0];
      let move = this.pathFinder.regroup(largest.index, range, minStrength);
      
      if(!goal){ goal = this.pathFinder.getNearest(largest.index, this.game.TILE.ANY_ENEMY).index }
      let next = this.pathFinder.fastest(largest.index, goal);

      // Dont regroup to the next spot we will move to anyway
      if(move && next && (move.from !== next.index)){ 
        return move 
      } else {
        // no valid regroup - move twoards goal
        return next ? 
                new Move(largest.index, next.index, (new Date().getTime()) - this.started) :
                null;
      }
  }

  /**
   * The ratio of allied lands to enemy lands
   */
  landRatio(): number {
    const self = this;
    const myForces = this.game.scores[this.game.playerIndex];
    const largestEnemy = this.game.scores
                          .filter(s => s.i !== self.game.playerIndex)
                          .sort((a,b) => b.tiles - a.tiles)[0]
    return  myForces.tiles / largestEnemy.tiles
  }

  /**
   * The meet of the bot
   */
  update(game: Game, updateDate: any): Move {
      let self = this; // its still JavaScript

      if(!this.pathFinder){ this.setup(game); }
      this.started = new Date().getTime();

      this.game = game;
      let odd: boolean = !!(game.turn % 2);
      // this.maxStrength = game.scores[0].total - game.scores[0].tiles;
      // this.enemyMaxStrength = game.scores[1].total - game.scores[1].tiles;

      if(this.maxTurnLandBonus() < 2){
        let move = this.pathFinder.expand(true, 2, this.pathFinder.nearestToBase);
      } 

      let generals = game.generals.slice(0) // Copy the array
      generals.splice(game.playerIndex,1) // remove us from it
      generals = generals.filter(c => c > -1)

      // get desperate and pull from base if they have lots more land
      if(this.landRatio() < .75){
        let next = this.pathFinder.getNearest(this.game.BASE)
        return new Move(this.game.BASE, next.index, (new Date().getTime() - this.started), true) // only take 1/2 of them
      }


      // Largest Army
      let largest = this.pathFinder.getArmiesWithMinSize(this.game.TILE.MINE, 1, false, this.pathFinder.largestFirst)[0];


      // Attack General if location is known
      if(generals.length){ 
        // let move =  this.moveLargestArmyTo(generals[0]);
        let min = Math.floor(largest.armies / 5)
        let move = this.gatherAndMoveLargest(5, (min > 1 ? min : 2), generals[0])
        return move ? move :
                      this.moveLargestArmyTo(game.BASE);
      }
      

      // Expand
      let maxDist = 1; // Need to test ballance on this (maybe 2 early game....)
      let closeToEmpty = this.pathFinder.getArmiesWithMinSize(game.TILE.MINE,2)
                                        .map(a => {
                                          return {
                                            index: a.index,
                                            armies: a.armies, 
                                            nearest: this.pathFinder.getNearest(a.index, game.TILE.EMPTY)
                                          };
                                        })
                                        .filter(a => (a.nearest && (a.nearest.distance <= maxDist)) && (a.index !== largest.index))
                                        .sort((a,b) => b.nearest.distance - a.nearest.distance)
      if(closeToEmpty.length > 0){
        let army = closeToEmpty[0]
        let next = this.pathFinder.fastest(army.index, army.nearest.index)
        return new Move(army.index, next.index, (new Date().getTime() - this.started));
      }


      // Attack Enamy
      let enemies = this.pathFinder.getArmiesWithMinSize(this.game.TILE.ANY_ENEMY, 1, false, this.pathFinder.nearestToBase);
      if(enemies.length > 0){
        let nearestToBase = enemies[0]
        // let move =  this.pathFinder.expand(false, 2, this.pathFinder.largestFirst, null, true);
        let min = Math.floor(largest.armies / 4)
        let move = this.gatherAndMoveLargest(2, (min > 1 ? min : 2))
        return move ? 
                  move : 
                  this.moveLargestArmyTo(game.BASE);
      }


      // Keep expanding if no enemies found
      let toEmpty = this.pathFinder.expand(true, 2, this.pathFinder.nearestToBase);
      return toEmpty // Not sure what else to do if no empty and no enemy around...
  }

  setup(game: Game): void {
    this.pathFinder = new PathFinder(game);
  }

}
