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
    let self = this;

    if(!this.PF){
      this.PF = new PathFinder(game);
    }

    game.print();

    if(game.turn > 15){
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

  
      let army = canAttack.sort((a,b) => b.armies - a.armies)[0]

console.log('army:', army);

      var next = self.PF.fastest(army.index, 0);
console.log('next:', next);

      let move =  new Move(army.index, next.index, (new Date()).getTime() - timer);
console.log('move:', move);

      return move;
    }

    return new Move(0,0,0);
  }

}
