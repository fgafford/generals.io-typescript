import { bot } from './bot';
import { Move } from '../Move'
import { Game } from '../Game'
import { Attacks } from './Attacks';
import { TILE } from '../GameConstants';
import { PathFinder } from '../PathFinder'

export default class Recruit implements bot {

  // if enemy inside this range make attacking them top priority
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
  private attacks: Attacks;
  private defense: number;
  private maxStrength: number;
  private enemyMaxStrength: number;
  private scout: number = -1;
  private game: Game;
  private started: number;

  constructor(){}

  /**
   * Return true or false as to if 
   * BASE id defended given the 
   * maxEnemyStrength
   */
  areWeDefended(): boolean {
    if(this.maxStrength < this.enemyMaxStrength){ return true; }
    if(this.defense > this.enemyMaxStrength){ return true; }

    let minPercent = 1;
    if((this.maxStrength/this.enemyMaxStrength) > 1){
      minPercent = 1.01;
    }
    // Assume lower defence near game start 
    if(this.maxTurnLandBonus() < 3){
      return true;
    } else if(this.maxTurnLandBonus() < 5 ){ 
      minPercent = .8
    } else {
      minPercent = .95
    }
    // Are we above the minimum defence?
    return ((this.defense / this.enemyMaxStrength) > minPercent);
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
      let regroupArmy = this.attacks.getArmiesWithMinSize(TILE.MINE, 1, false, this.attacks.largestFirst)
                                  .filter(army => army.index !== self.vanguard.index)[0];
      // let regroupArmy = (armies[0].index === self.vanguard.index) ? armies[1] :armies[0];
      let next = this.pathFinder.fastest(regroupArmy.index, index);
      return new Move(regroupArmy.index, next.index, (new Date().getTime()) - this.started);
  }

  /**
   * Get one of the largest army at random. A randomly selected army should
   * eventually pull a greater percentage of armies back to base.
   * 
   * @param index - end goal
   */
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
   */
  moveVanguardTowards(goal: number): Move {
    let next = this.pathFinder.fastest(this.vanguard.index, goal);
    let move = new Move(this.vanguard.index, next.index, (new Date().getTime()) - this.started);
    this.vanguard.index = next.index;
    return move;
  }

  /**
   * Defend base with the largest possible support
   */
  defendWithLargest() :Move {
    if(this.vanguard.index > -1 && 
      this.pathFinder.distanceTo(this.vanguard.index, this.game.BASE) <= this.varguardHelpDistance)
    {
      return this.moveVanguardTowards(this.game.BASE);
    } else {
      return this.moveLargestArmyTo(this.game.BASE);
    }
  }

  /**
   * The meet of the bot
   */
  update(game: Game): Move {
      if(!this.pathFinder){ this.setup(game); }
      this.started = new Date().getTime();

      this.game = game;
      let move: Move = new Move(0,0,0);
      let odd: boolean = !!(game.turn % 2);
      this.defense = game.armies[game.BASE];
      this.maxStrength = game.scores[0].total - game.scores[0].tiles;
      this.enemyMaxStrength = game.scores[1].total - game.scores[1].tiles;
 
      // It was a rout... prepair again
      this.vanguard.armies = game.armies[this.vanguard.index] || 0;
      if(this.vanguard.index !== -1 && (this.vanguard.armies <= 2 || game.terrain[this.vanguard.index] !== TILE.MINE)){
        this.vanguard = {index: -1, armies: 0, deploying: false};
      }

      // console.log('Defense:', this.defense);
      // console.log('Enemy:', this.enemyMaxStrength);
      // console.log('Safe:', this.areWeDefended());
      // console.log('Ratio:', this.landRatio());
      // console.log('Vanguard: ', this.vanguard);
      // console.log('maxTurnBonus: ', this.maxTurnLandBonus());
      
      // Complete Vanguard deployment before assuming normal movement
      if(this.vanguard.deploying){
        // send 1/2 back if needed... 
        if(!this.areWeDefended()){
          console.log('vanguard go base');
          return new Move(this.vanguard.index, game.BASE, (new Date().getTime()) - this.started, true) // Final true required
        } else {
          this.vanguard.deploying = false;
        }
      }

      // Defense as top priority?
      if(!this.areWeDefended()){ this.defendWithLargest(); }
      // emergency defend if nessesary
      let enemyNearestBase = this.attacks.getArmiesWithMinSize(TILE.ANY_ENEMY, 1, false, this.attacks.nearestToBase)[0];
      if(enemyNearestBase && this.pathFinder.distanceTo(enemyNearestBase.index, game.BASE) <= this.intruderRange){
        return this.moveLargestArmyTo(enemyNearestBase.index);
      }
      // Expand early game
      if(game.turn < 100){ return this.attacks.expand(true,2, this.attacks.nearestToBase); } //expand

      // Regular moves 
      if(odd){
        // regroup effors
        return this.furthestLargestArmy(game.BASE);
      } else {
  
        // attack efforts
        if(this.game.scores[0].tiles < this.minLands ||
          this.landRatio() < this.minLandRatio)
        {
    
          let self = this;
          let largestMove = this.furthestLargestArmy(game.BASE)
          let filter = (army:{index: number}): boolean => {
            return army.index !== largestMove.from && army.index !== self.vanguard.index;
          }

          let move =  this.attacks.expand(this.areWeDefended(), 2, null, filter); // Expand
          if(this.maxTurnLandBonus() > 1){ move.half = true; }
          return move ? move : largestMove;
        }

        // Deploy the Vanguard
        if(this.vanguard.index === -1 && this.areWeDefended() && enemyNearestBase){  
          this.vanguard.deploying = true;
          let next = this.pathFinder.fastest(game.BASE, enemyNearestBase.index);
          this.vanguard.index = next.index;
          this.vanguard.armies = game.armies[game.BASE]/2
  
          return new Move(game.BASE, next.index, (new Date().getTime()) - this.started, true); // Final boolean essential here
        }

        // Advance the Vanguard
        if(this.vanguard.armies > 2){
          let nearest = this.attacks.getArmiesWithMinSize(TILE.ANY_ENEMY, 1, false, this.attacks.nearestToIndex(this.vanguard.index))[0];
          return this.moveVanguardTowards(nearest.index);
        }

        // Final fallback (regroup)
        return this.furthestLargestArmy(game.BASE);
      }
  }

  setup(game: Game): void {
    this.pathFinder = new PathFinder(game);
    this.attacks = new Attacks(game, this.pathFinder); 
  }

}
