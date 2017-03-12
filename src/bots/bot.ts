import { Move } from '../Move';
import { Game } from '../Game';

export interface bot {
  [x: string]: any;
  update(game: Game): Move;

}
