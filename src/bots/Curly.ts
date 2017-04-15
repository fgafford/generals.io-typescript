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
      // regroup effors
      let self = this;
      let army = this.pathFinder.getArmiesWithMinSize(this.game.TILE.MINE, 1, false, this.pathFinder.largestFirst)[0];
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
  update(game: Game, updateDate: any): Move {
      if(!this.pathFinder){ this.setup(game); }
      this.started = new Date().getTime();

      this.game = game;
      let odd: boolean = !!(game.turn % 2);
      // this.maxStrength = game.scores[0].total - game.scores[0].tiles;
      // this.enemyMaxStrength = game.scores[1].total - game.scores[1].tiles;


      // console.log('Defense:', this.defense);
      // console.log('Enemy:', this.enemyMaxStrength);
      // console.log('Safe:', this.areWeDefended());
      console.log('Ratio:', this.landRatio());
      // console.log('Vanguard: ', this.vanguard);
      // console.log('maxTurnBonus: ', this.maxTurnLandBonus());
      console.log('cities diff:', updateDate.cities_diff);

      if(this.maxTurnLandBonus() < 2){
        let move = this.pathFinder.expand(true, 2, this.pathFinder.nearestToBase);
        if(move){ return move; }
      } 

      let generals = game.generals.slice(0) // Copy the array
      generals.splice(game.playerIndex,1) // remove us from it
      generals = generals.filter(c => c > -1)

      if(generals.length){ return this.moveLargestArmyTo(generals[0]); }
      
      let maxDist = 1;
      let closeToEmpty = this.pathFinder.getArmiesWithMinSize(game.TILE.MINE,2)
                                        .filter(a => { 
                                          let nearest = this.pathFinder.getNearest(a.index, game.TILE.EMPTY)
                                          return nearest ?
                                                    nearest.distance <= maxDist :
                                                    false;
                                        });
      if(closeToEmpty.length){
        let largest = this.pathFinder.getArmiesWithMinSize(this.game.TILE.MINE, 1, false, this.pathFinder.largestFirst)[0];
        let army:{index: number, armies: number};
        do {
          army = this.pathFinder.randomItem(closeToEmpty);
          var move = new Move(army.index, 
                              this.pathFinder.getNearest(army.index, game.TILE.EMPTY).index, 
                              (new Date().getTime() - this.started))
        } while(army.index !== largest.index && !move)
        
        return move;
      }

      let enemies = this.pathFinder.getArmiesWithMinSize(this.game.TILE.ANY_ENEMY, 1, false, this.pathFinder.furthestFromBase);
      if(enemies.length){
        // Attack nearest enemy
        return this.pathFinder.expand(false, 2, this.pathFinder.largestFirst, null, true);
      }

      // Keep expanding if no enemies found
      return this.pathFinder.expand(true, 2, this.pathFinder.nearestToEmpty);
  }

  setup(game: Game): void {
    this.pathFinder = new PathFinder(game);
  }

}
