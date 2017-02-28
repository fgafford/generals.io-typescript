import { bot } from './bot';
import { Move } from '../Move'
import { Game } from '../Game'
import { Attacks } from './Attacks';

export default class Recruit implements bot {

  constructor(){}

  update(game: Game): Move {
    let move = Attacks.infest(game, true);
    console.log("move:", move);
    
    return move;
  }

}
