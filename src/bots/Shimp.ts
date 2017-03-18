import { bot } from './bot';
import { Move } from '../Move'
import { Game } from '../Game'
import { Attacks } from './Attacks';
import { TILE } from '../GameConstants';
import { PathFinder } from '../PathFinder'

export default class Recruit implements bot {

  private pathFinder: PathFinder;
  private attacks: Attacks;

  constructor(){}

  update(game: Game): Move {
    let move: Move = new Move(0,0,0);  
    let seeEnemy: boolean = false;

    if(!this.pathFinder){ this.pathFinder = new PathFinder(game); }
    if(!this.attacks){ this.attacks = new Attacks(game, this.pathFinder); }

    let timer = new Date().getTime();
    let bot = this;

    if(!this.pathFinder){ this.pathFinder = new PathFinder(game); }

    // Delay before starting the attack
    if(game.turn < 1) { return new Move(0,0, (new Date()).getTime() - timer) }
    if(game.turn > 100 && game.turn < 150){ 
      let move =  this.attacks.regroup();
      if(move) {return move}
    }

    let enemies = this.attacks.getArmiesWithMinSize(TILE.ANY_ENEMY, 1, false, this.attacks.nearestToBase);
console.log('enemies', enemies);


    if(enemies.length > 1){
      let army = this.attacks.getArmiesWithMinSize().sort(this.attacks.nearestToBase)[0]
      return this.attacks.regroup(enemies[0].index, 15);  
    } else {
      return this.attacks.expand(game.turn < 90); // Expand
  }
}
}
