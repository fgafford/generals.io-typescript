import { Game } from '../Game'
import { Move } from '../Move'

export class Attacks {

  static  getSurroundings(tile: number, game: Game){
      return {
        up: game.up(tile),
        left: game.left(tile),
        right: game.right(tile),
        down: game.down(tile)
      };
  }


  static infest(game: Game, useBase: boolean) {
    let move = new Move(0,0, new Date().getTime());

    // Find closest to base...
    if(useBase){

    } else {

    }

    // Move away from base

    // Prefer empty space to MINE (us owned space)


    var army: number;
    for (var i = 0; i < game.terrain.length; i++) {
      if(game.terrain[i] === 0 && game.armies[i] > 1){
        army = i;
        break;
      }
    }

    console.log('army:',army);

    let around = Attacks.getSurroundings(army, game);

    console.log('around:\n',around);

    if(around.up.terrain === -1){ move.to = around.up.index; }
    else if(around.left.terrain === -1){ move.to = around.left.index; }
    else if(around.right.terrain === -1){ move.to = around.right.index}
    else if(around.down.terrain === -1){ move.to = around.down.index; }

    move.elapse = new Date().getTime() - move.elapse;
    return move
  }
}
