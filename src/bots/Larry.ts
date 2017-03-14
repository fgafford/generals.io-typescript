import { bot } from './bot';
import { Move } from '../Move'
import { Game } from '../Game'
import { Attacks } from './Attacks';
import { TILE } from '../GameConstants';
import { PathFinder } from '../PathFinder'

export default class Recruit implements bot {

  private pathFinder: PathFinder;

  constructor(){}

  update(game: Game): Move {
    let move: Move = new Move(0,0,0);  
    let seeEnemy: boolean = false;

    if(!this.pathFinder){ this.pathFinder = new PathFinder(game); }

    let timer = new Date().getTime();
    let bot = this;

    if(!this.pathFinder){
      this.pathFinder = new PathFinder(game);
    }

    if(game.turn > 3){
      var canAttack: Array<{index: number, armies: number}> = [];
      // find biggest army and move to 0
      for(let i = 0; i < game.terrain.length; i++){
          if(game.terrain[i] > 0){ seeEnemy = true; }
          if(game.terrain[i] === TILE.MINE && 
            game.armies[i] > 1) 
          { 
            canAttack.push({ index:i, armies: game.armies[i]});
          }
      }
      
      let army = canAttack.sort((a,b): number => {
          // Push the base to the back (last option)
          if(a.index === game.BASE) return 1;
          if(b.index === game.BASE) return -1;
          // return bot.pathFinder.distanceTo(a.index, game.BASE) - bot.pathFinder.distanceTo(b.index, game.BASE)
          return b.armies - a.armies;
      })[0]

      if(army){
        if(seeEnemy){
          console.log('should attack enemy');
          var enemy = bot.pathFinder.getNearest(army.index)[0];  
          let next = bot.pathFinder.fastest(army.index, enemy.index);
          return new Move(army.index, next.index, (new Date()).getTime() - timer);

        } else {
          // Expand
          var nearest = bot.pathFinder.getNearest(army.index, TILE.EMPTY)[0];  
          let next = bot.pathFinder.fastest(army.index, nearest.index);
          return new Move(army.index, next.index, (new Date()).getTime() - timer);
        }
      } else {
        return new Move(0,0, (new Date()).getTime() - timer)
      }


    } else {
      return new Move(0,0, (new Date()).getTime() - timer)
    }

  }

}
