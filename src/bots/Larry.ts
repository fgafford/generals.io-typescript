import { bot } from './bot';
import { Move } from '../Move'
import { Game } from '../Game'
import { Attacks } from './Attacks';
import { TILE } from '../GameConstants';
import { PathFinder } from '../PathFinder'

export default class Recruit implements bot {

  // if enemy inside this range make attacking them top priority
  private intruderRange = 7;
  // minimum lands before we expand no further
  private minLands = 25; // update later
  // minimun ours to their ratio (exand more if we are below a ratio)
  private minLandRatio = 1.15;

  // index of our attacking front (vanguard)
  private vanguard:{index:number, armies:number} = {index:-1, armies: 0};
  // are we in the process of moving troops off base to attack?
  private deploying:boolean = false;


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
    if(this.turn < 75){ return true; }

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

  /**
   * Move the largest army on the board towards a given index
   * 
   * @param index - end goal
   */
  moveLargestArmyTo(index: number): Move {
      // regroup effors
      let armies = this.attacks.getArmiesWithMinSize(TILE.MINE, 1, false, this.attacks.largestFirst);
      let regroupArmy = (armies[0].index === this.vanguard.index) ? armies[1] :armies[0];
      let next = this.pathFinder.fastest(regroupArmy.index, index);
      return new Move(regroupArmy.index, next.index, (new Date().getTime()) - this.started);
  }

  /**
   * The ratio of allied lands to enemy lands
   */
  landRatio(): number {
    return this.game.scores[0].tiles / this.game.scores[1].tiles
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

      // It was a rout... prepair again
      if(this.vanguard.armies <= 1 || game.terrain[this.vanguard.index] !== TILE.MINE){
        this.vanguard.index = -1
        this.vanguard.armies = 0
      } else {
        this.vanguard.armies = game.armies[this.vanguard.index];
      }


console.log('Defense:', this.defense);
console.log('Enemy:', this.enemyMaxStrength);
console.log('Safe:', this.areWeDefended());
console.log('Ratio:', this.landRatio());
console.log('Vanguard: ', this.vanguard);


      // emergency defend if nessesary
      let enemyNearestBase = this.attacks.getArmiesWithMinSize(TILE.ANY_ENEMY, 1, false, this.attacks.nearestToBase)[0];
      if(enemyNearestBase && this.pathFinder.distanceTo(enemyNearestBase.index, game.BASE) <= this.intruderRange){
        return this.moveLargestArmyTo(enemyNearestBase.index);
      }
      // Expand early game
      if(game.turn < 100){ return this.attacks.expand(true); } //expand
      // Defense as top priority?
      if(game.turn > 150 && !this.areWeDefended()){
        return this.moveLargestArmyTo(game.BASE);
      }
      // Complete deployment before assuming normal movement
      if(this.deploying){
        // send 1/2 back if needed... 
        if(!this.areWeDefended()){
          return new Move(this.vanguard.index, game.BASE, (new Date().getTime()) - this.started, true) // Final true required
        } else {
          this.deploying = false;
        }
      }


      // Regular moves 
      if(odd){
        // regroup effors
        return this.moveLargestArmyTo(game.BASE);
      } else {
  
        // attack efforts
        if(this.game.scores[0].tiles < this.minLands ||
          this.landRatio() < this.minLandRatio)
        {
    
          let self = this;
          let largestMove = this.moveLargestArmyTo(game.BASE);
          let filter = (army:{index: number}): boolean => {
            return army.index !== largestMove.from && army.index !== self.vanguard.index;
          }

          let move =  this.attacks.expand(this.areWeDefended(), 2, null, filter); // Expand
          return move ? move : largestMove;
        }

        // Deploy the Vanguard
        if(this.vanguard.index === -1 && this.areWeDefended() && enemyNearestBase){
          this.deploying = true;
          let next = this.pathFinder.fastest(game.BASE, enemyNearestBase.index);
          this.vanguard.index = next.index;
          this.vanguard.armies = game.armies[game.BASE]/2
          return new Move(game.BASE, next.index, (new Date().getTime()) - this.started, true); // Final boolean essential here
        }

        // Advance the Vanguard
        if(this.vanguard.armies > 1){
          let nearest = this.attacks.getArmiesWithMinSize(TILE.ANY_ENEMY, 1, false, this.attacks.nearestToIndex(this.vanguard.index))[0];
          let next = this.pathFinder.fastest(this.vanguard.index, nearest.index)
          this.vanguard.index = next.index;
          return new Move(this.vanguard.index, next.index, (new Date().getTime()) - this.started);
        }

        // Final fallback (regroup)
        return this.moveLargestArmyTo(game.BASE);
      }
  }

  setup(game: Game): void {
    this.pathFinder = new PathFinder(game);
    this.attacks = new Attacks(game, this.pathFinder); 
  }

}