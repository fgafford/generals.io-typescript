import { bot } from './bot';
import { Move } from '../Move'
import { Game } from '../Game'
import { TILE } from '../GameConstants';
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
      // regroup effors
      let self = this;
      let army = this.pathFinder.getArmiesWithMinSize(TILE.MINE, 1, false, this.pathFinder.largestFirst)[0];
      // let regroupArmy = (armies[0].index === self.vanguard.index) ? armies[1] :armies[0];
      let next = this.pathFinder.fastest(army.index, index);
      return new Move(army.index, next.index, (new Date().getTime()) - this.started);
  }

  /**
   * Get one of the largest army at random. A randomly selected army should
   * eventually pull a greater percentage of armies back to base.
   * 
   * @param index - end goal
   *
  furthestLargestArmy(index: number): Move {
     // regroup effors
      let self = this;
      let regroupArmy = this.attacks.getArmiesWithMinSize(TILE.MINE, 1, false, this.attacks.largestFirst)
                                  .filter((army, i, arr) => {
                                    return army.armies >= arr[1].armies && // Vanguard is likey first in list
                                            army.index !== self.vanguard.index
                                  })
                                  .sort(this.attacks.furthestFromBase)[0];
      // let regroupArmy = this.pathFinder.randomItem(canidates);
      let next = this.pathFinder.fastest(regroupArmy.index, index);
      return new Move(regroupArmy.index, next.index, (new Date().getTime()) - this.started);
  }
  */

  /**
   * The ratio of allied lands to enemy lands
   */
  landRatio(): number {
    return this.game.scores[0].tiles / this.game.scores[1].tiles
  }

  /**
   * Move the vanguard towards the given goal
   * 
   * @param goal - index where Vanguard is headed
   *
  moveVanguardTowards(goal: number): Move {
    let next = this.pathFinder.fastest(this.vanguard.index, goal);
    let move = new Move(this.vanguard.index, next.index, (new Date().getTime()) - this.started);
    this.vanguard.index = next.index;
    return move;
  }
  */

  /**
   * The meet of the bot
   */
  update(game: Game): Move {
      if(!this.pathFinder){ this.setup(game); }
      this.started = new Date().getTime();

      this.game = game;
      let move: Move = new Move(0,0,0);
      let odd: boolean = !!(game.turn % 2);
      // this.maxStrength = game.scores[0].total - game.scores[0].tiles;
      // this.enemyMaxStrength = game.scores[1].total - game.scores[1].tiles;


      // console.log('Defense:', this.defense);
      // console.log('Enemy:', this.enemyMaxStrength);
      // console.log('Safe:', this.areWeDefended());
      console.log('Ratio:', this.landRatio());
      // console.log('Vanguard: ', this.vanguard);
      // console.log('maxTurnBonus: ', this.maxTurnLandBonus());


      if(this.maxTurnLandBonus() < 2){
        return this.pathFinder.expand(true, 2, this.pathFinder.nearestToBase);
      } 

      let generals = game.generals
                          .slice() // Copy the array
                          .splice(game.playerIndex,1) // remove us from it
                          .filter(c => c > -1)

      if(generals.length){
        return this.moveLargestArmyTo(generals[0]);
      }
      
      if(this.landRatio() < 1){
        let move = this.pathFinder.expand(false, 2, this.pathFinder.nearestToEmpty)
        if(move){ return move; }
      }

      let ememies = this.pathFinder.getArmiesWithMinSize(TILE.ANY_ENEMY, 1, false).length;
      if(!!ememies){
        return this.pathFinder.expand(false, 2, this.pathFinder.largestFirst, null, true);
      }
     
      // Fallback -- keep expanding
      return this.pathFinder.expand(false, 2, this.pathFinder.nearestToEmpty)
  }

  setup(game: Game): void {
    this.pathFinder = new PathFinder(game);
  }

}
