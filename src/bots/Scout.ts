import { bot } from './bot';
import { Move } from '../Move'
import { Game } from '../Game'
import { Attacks } from './Attacks';
import { PathFinder } from '../PathFinder'
import { TILE } from '../GameConstants'

export default class Scout implements bot {

  private PF: PathFinder;

  constructor(){}

  update(game: Game): Move {
    let timer = new Date().getTime();
    let bot = this;

    if(!this.PF){
      this.PF = new PathFinder(game);
    }

    game.print();

    if(game.turn > 5){
      var canAttack: Array<{index: number, armies: number}> = [];
      // find biggest army and move to 0
      for(let i = 0; i < game.terrain.length; i++){
          if(game.terrain[i] === TILE.MINE && 
            game.armies[i] > 1) 
          { 
            canAttack.push({ index:i, armies: game.armies[i]});
          }
      }
console.log('all:', canAttack);

  
      let army = canAttack.sort((a,b): number => {
        // Push the base to the back (last option)
        if(a.index === game.BASE) return 1;
        if(b.index === game.BASE) return -1;
        return bot.PF.distanceTo(a.index, game.BASE) - bot.PF.distanceTo(b.index, game.BASE)})[0]

console.log('army:', army);

      var next = bot.PF.fastest(army.index, 0);
console.log('next:', next);

      let move =  new Move(army.index, next.index, (new Date()).getTime() - timer);
console.log('move:', move);

      return move;
    }

    return new Move(0,0,0);
  }

}
