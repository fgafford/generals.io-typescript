import { bot } from './bot';
import { Move } from '../Move'
import { Game } from '../Game'
import { Attacks } from './Attacks';

export class Recruit implements bot {
  update(game: Game): Move {
    return Attacks.infest(game, game.turn < 50);
  }
}
