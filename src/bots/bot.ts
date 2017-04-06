import { Move } from '../Move';
import { Game } from '../Game';

export interface bot {
  [x: string]: any;
  // new(name: string): void;
  name: string;
  update(game: Game, updateData: any): Move;

}
