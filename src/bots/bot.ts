import { Move } from '../Move';
import { Game } from '../Game';

export interface bot {
  update(game: Game): Move;
}
