import { bot } from './bot';
import { Move } from '../Move'
import { Game } from '../Game'

const fs = require('fs')

export class MockBot implements bot {

  name: string = "MockBot";
  constructor(){}

  update(game: Game): Move {
    return new Move(0,0,0);
  }

}
