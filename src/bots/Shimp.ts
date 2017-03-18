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
      if(move.from !== 0) {return move}
    }

    if(~game.terrain.indexOf(TILE.ANY_ENEMY)){
      let army = this.attacks.getArmiesWithMinSize().sort(this.attacks.nearestToBase)[0]
      var enemy = bot.pathFinder.getNearest(army.index,TILE.ANY_ENEMY);
      return this.attacks.regroup(enemy.index, 15);  
    } else {
      return this.attacks.expand(game.turn < 90); // Expand
  }
}
}
