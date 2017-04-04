import { bot } from './bot';
import { Move } from '../Move'
import { Game } from '../Game'

const fs = require('fs')

export default class MapSaver implements bot {

  name: string = "MapSaver";
  constructor(){}

  update(game: Game): Move {

    let NAME = 'map4.json';

    var gameData = {
      BASE: game.BASE,
      width: game.width,
      terrain: game.terrain
    }
    
    fs.writeFile(NAME, JSON.stringify(gameData), () => { throw 'error'; });

    return new Move(0,0,0);
  }

}
