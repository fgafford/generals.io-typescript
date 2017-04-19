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
      return next ? 
              new Move(army.index, next.index, (new Date().getTime()) - this.started) :
              null;
  }

  /**
   * The ratio of allied lands to enemy lands
   */
  landRatio(): number {
    // BROKEN: playerIndex!
    return this.game.scores[0].tiles / this.game.scores[1].tiles
  }

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

      if(this.maxTurnLandBonus() < 2){
        let move = this.pathFinder.expand(true, 2, this.pathFinder.nearestToBase);
        if(move){ return move; }
      } 

      let generals = game.generals.slice(0) // Copy the array
      generals.splice(game.playerIndex,1) // remove us from it
      generals = generals.filter(c => c > -1)

      if(generals.length){ 
        let move =  this.moveLargestArmyTo(generals[0]);
        return move ? move :
                      this.moveLargestArmyTo(game.BASE);
      }
      
      // Largest Army
      let largest = this.pathFinder.getArmiesWithMinSize(this.game.TILE.MINE, 1, false, this.pathFinder.largestFirst)[0];

      let maxDist = 1;
      let closeToEmpty = this.pathFinder.getArmiesWithMinSize(game.TILE.MINE,2)
                                        .filter(a => { 
                                          let nearest = this.pathFinder.getNearest(a.index, game.TILE.EMPTY)
                                          return (nearest && (nearest.distance <= maxDist)) && (a.index !== largest.index)
                                        });
      if(closeToEmpty.length > 0){
        let army = this.pathFinder.randomItem(closeToEmpty);
        let nearest = this.pathFinder.getNearest(army.index, game.TILE.EMPTY)
        let next = this.pathFinder.fastest(nearest.index, game.BASE)
 
        return new Move(army.index, nearest.index, (new Date().getTime() - this.started));
      }

      let enemies = this.pathFinder.getArmiesWithMinSize(this.game.TILE.ANY_ENEMY, 1, false, this.pathFinder.nearestToBase);
      if(enemies.length > 0){
        let move =  this.pathFinder.expand(false, 2, this.pathFinder.largestFirst, null, true);
        return move ? 
                  move : 
                  this.moveLargestArmyTo(game.BASE);
      }

      // Keep expanding if no enemies found
      let toEmpty = this.pathFinder.expand(true, 2, this.pathFinder.nearestToEmpty);
      return toEmpty // Not sure what else to do if no empty and no enemy around...
  }

  setup(game: Game): void {
    this.pathFinder = new PathFinder(game);
  }

}
