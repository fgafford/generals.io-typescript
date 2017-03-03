import { bot } from './bot';
import { Move } from '../Move'
import { Game } from '../Game'
import { Attacks } from './Attacks';

export default class Recruit implements bot {

  constructor(){}

  update(game: Game): Move {
    let move: Move = Attacks.expand(game, true);   
    game.print(move);

    return move;
  }

}
