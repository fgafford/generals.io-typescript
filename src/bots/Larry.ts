import { bot } from './bot';
import { Move } from '../Move'
import { Game } from '../Game'
import { Attacks } from './Attacks';
import { TILE } from '../GameConstants';
import { PathFinder } from '../PathFinder'

export default class Recruit implements bot {

  private pathFinder: PathFinder;
  private attacks: Attacks;
  private turn: number;
  private defense: number;
  private maxStrength: number;
  private enemyMaxStrength: number;
  private scout: number = -1;
  private game: Game;
  private started: number;

  constructor(){}

  areWeDefended(): boolean {
    if(this.defense > this.enemyMaxStrength){ return true; }
    
    // We have to make some progress at early
    if(this.turn < 90){ return true; }

    let minPercent = 1;
    // Assume 75% defence is safe in early game 
    if(this.maxTurnLandBonus() <= 2){
      minPercent = .9
    } else if(this.maxTurnLandBonus() < 5 ){ 
      minPercent = .75 
    } else {
      minPercent = .5
    }
    // Are we above the minimum defence?
    return ((this.defense / this.enemyMaxStrength) > minPercent);
  } 

  /**
   * The maximum number of bonus armies given for land own since game start
   */
  maxTurnLandBonus(): number { return Math.floor((this.turn+1)/ 50) }

  largestToBase(): Move {
      // regroup effors
      let regroupArmy = this.attacks.getArmiesWithMinSize(TILE.MINE,2, false, this.attacks.largestFirst)[0];
      let next = this.pathFinder.fastest(regroupArmy.index, this.game.BASE);
      return new Move(regroupArmy.index, next.index, (new Date().getTime()) - this.started);
  }


  /**
   * The meet of the bot
   */
  update(game: Game): Move {
      this.started = new Date().getTime();

      this.game = game;
      let move: Move = new Move(0,0,0);
      let odd: boolean = !!(game.turn % 2);
      this.defense = game.armies[game.BASE];
      this.maxStrength = game.scores[0].total - game.scores[0].tiles;
      this.enemyMaxStrength = game.scores[1].total - game.scores[1].tiles;

      if(!this.pathFinder){ this.setup(game); }

      
console.log('Defense:', this.defense);
console.log('Enemy:', this.enemyMaxStrength);
console.log('safe:', this.areWeDefended());

      if(game.turn < 100){ return this.attacks.expand(true); } //expand

      if(odd){
        // regroup effors
        return this.largestToBase();
      } else {
        // attack efforts
        let self = this;

        let largestMove = this.largestToBase();
        let filter = (army:{index: number}): boolean => {
          return army.index !== largestMove.from;
        }

        let move =  this.attacks.expand(this.areWeDefended(), 2, null, filter); // Expand
        return move ? move : largestMove;
      }



      // if(game.turn > 100 && game.turn < 150){ 
      //   let move =  this.attacks.regroup();
      //   if(move) { return move; }
      // }

      // let enemies = this.attacks.getArmiesWithMinSize(TILE.ANY_ENEMY, 0, false, this.attacks.nearestToBase);

      // if(enemies.length > 1){
      //   let army = this.attacks.getArmiesWithMinSize().sort(this.attacks.nearestToBase)[0]
      //   return this.attacks.regroup(enemies[0].index, 15);  
      // } else {
      //   return this.attacks.expand(game.turn < 90); // Expand
      // }
  }

  setup(game: Game): void {
    this.pathFinder = new PathFinder(game);
    this.attacks = new Attacks(game, this.pathFinder); 
  }

}