 // /// <reference path="../lib/node6.d.ts" />

import * as io from "socket.io-client";
import { TILE } from "./GameConstants";
// import { GameSettings } from "../config/gameSettings";

/*
 * game.ts
 *
 * Object that represents a single game.
 *
 * It is assigned a bot on creation.
 */
export class Game {

  private playerSettings: any;

  private socket: SocketIOClient.Socket = io('http://botws.generals.io');

  public playerIndex: number;
  public generals: Array<number>;
  public turn: number;
  public cities: Array<number>;
  public map: Array<number>;
  public terrain: Array<number>;
  public armies: Array<number>;

  // Constants ////////////////////////////////
  public BASE: number;
  public width: number;
  public height: number;
  public size: number;

  // private botConfig;

  constructor(gameSettings: any, player: any){
    // TODO: Load and save the bot here
    gameSettings.botNamas

    // setup listening handlers
    this.socket.on('connect', () => {
      this.socket.emit('set_username', player.user_id, gameSettings.botName);
      console.log('Connected to server.');

      this.socket.emit('join_private', gameSettings.gameName, player.user_id);
      this.socket.emit('set_force_start', gameSettings.gameName, true);
      console.log('Joined custom game at http://bot.generals.io/games/' + encodeURIComponent(gameSettings.gameName));
    });
    this.socket.on('game_start', this.game_start);
    this.socket.on('update', this.update);
    this.socket.on('disconnect', this.disconnect);
  }

  public up(tile: number) {
    let row = Math.floor(tile / this.width);
    return {
      terrain: row === 1 ? TILE.MOUNTAIN : this.terrain[tile - this.width],
      armies: row === 1 ? TILE.MOUNTAIN : this.armies[tile - this.width],
      index: tile - this.width
    };
  }

  public left(tile: number) {
    let col = tile % this.width;
    return {
      terrain: col === 1 ? TILE.MOUNTAIN : this.terrain[tile-1],
      armies: col === 1 ? TILE.MOUNTAIN : this.armies[tile-1],
      index: tile-1
    };
  }

  public right(tile: number) {
    let col = tile % this.width;
    return {
      terrain: col === this.width ? TILE.MOUNTAIN : this.terrain[tile+1],
      armies: col === this.width ? TILE.MOUNTAIN : this.armies[tile+1],
      index: tile+1
    };
  }

  public down(tile: number) {
    let row = Math.floor(tile / this.width);
    return {
      terrain: row > this.height ? TILE.MOUNTAIN : this.terrain[tile + this.width],
      armies: row > this.height ? TILE.MOUNTAIN : this.armies[tile + this.width],
      index: tile+1
    };
  }

  /*
   * Returns a new array created by patching the diff into the old array.
   * The diff formatted with alternating matching and mismatching segments:
   * <Number of matching elements>
   * <Number of mismatching elements>
   * <The mismatching elements>
   * ... repeated until the end of diff.
   * Example 1: patching a diff of [1, 1, 3] onto [0, 0] yields [0, 3].
   * Example 2: patching a diff of [0, 1, 2, 1] onto [0, 0] yields [2, 0].
   *
   * From: http://dev.generals.io/api#tutorial
   */
  private patch(old: Array<number>, diff: Array<number>) {
    var out: Array<number> = [];
    var i = 0;
    while (i < diff.length) {
      if (diff[i]) {  // matching
        Array.prototype.push.apply(out, old.slice(out.length, out.length + diff[i]));
      }
      i++;
      if (i < diff.length && diff[i]) {  // mismatching
        Array.prototype.push.apply(out, diff.slice(i + 1, i + 1 + diff[i]));
        i += diff[i];
      }
      i++;
    }
    return out;
  }

  private update(data: any){
    this.turn = data.turn;
    // Patch the city and map diffs into our local variables.
    this.cities = this.patch(this.cities, data.cities_diff);
    this.map = this.patch(this.map, data.map_diff);
    this.generals = data.generals;

    // The next |size| terms are army values.
    // armies[0] is the top-left corner of the map.
    this.armies = this.map.slice(2, this.size + 2);

    // The last |size| terms are terrain values.
    // terrain[0] is the top-left corner of the map.
    this.terrain = this.map.slice(this.size + 2, this.size + 2 + this.size);

    // save the location of our base
    if(data.turn === 1){
      this.BASE = this.generals.filter( c => c > 0)[0];
      // The first two terms in |map| are the dimensions.
      this.width = this.map[0];
      this.height = this.map[1];
      this.size = this.width * this.height;
    } else {
      // TODO: send to the bot here
    }

  }

  // Should really set the type here at some point
  private game_start(data: any){
    this.playerIndex = data.playerIndex;
    console.log('replay_url:','http://bot.generals.io/replays/' + encodeURIComponent(data.replay_id));
  }

  private disconnect(){
    console.error('Disconnected from server.');
    process.exit(1);
  }

  /**
   * Pretty print either the armies or terrain array
   *
   * @method print
   * @param  {number} width [description]
   * @param  {number} map   [description]
   * @return {[type]}       [description]
   */
  public print(width: number, map: Array<number> ) {
    for (var i = 0; i < map.length; i += width) {
      var out: string = '[';
      let row = map.slice(i, i + width);
      for (let j = 0; j < row.length; j++) {
        out += row[j] + ',';
      }
      console.log(out + ']');
    }
    console.log('===================================');
  }

}
