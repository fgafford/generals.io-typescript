 // /// <reference path="../lib/node6.d.ts" />
import * as io from "socket.io-client";
import { TILE } from "./GameConstants";
import { bot } from "./bots/bot"
import { Move } from './Move'

let playerIndex: number;

const color = require('colors');
// import { GameSettings } from "../config/gameSettings";

/*
 * game.ts
 *
 * Object that represents a single game.
 *
 * It is assigned a bot on creation.
 */
export class Game {

  private user_id: string;
  private botName: string;
  private room: string;
  private bot: bot;

  private socket: SocketIOClient.Socket = io('http://botws.generals.io')

  // public playerIndex: number;
  public generals: Array<number>;
  public turn: number;
  public cities: Array<number>;
  public map: Array<number>;
  public terrain: Array<number>;
  public armies: Array<number>;
  public scores: { total: number, tiles: number, i: number, dead: boolean }[];

  // Constants ////////////////////////////////
  public BASE: number;
  public width: number;
  public height: number;
  public size: number;

  // private botConfig;

  constructor(user_id: string, room: string, bot: bot, testing = false){
    if(!testing){
      this.user_id = user_id;
      this.room = room;
      this.botName = bot.name; 
      this.bot = bot;

      // setup listening handlers
      this.setupListeners(this.socket);
    }
  }

  setupListeners = (socket: SocketIOClient.Socket): void => {
    this.socket.on('connect', () => {
      this.socket.emit('set_username', this.user_id, this.botName);
      console.log('Connected to server.');

      switch(this.room){
        case '1v1':
          this.socket.emit('join_1v1', this.user_id);
          console.log('joined 1v1 game room');
          
        // TODO: other game types here
        default:
          this.socket.emit('join_private', this.room, this.user_id);
          console.log('Joined custom game at http://bot.generals.io/games/' + encodeURIComponent(this.room));
      }

      this.socket.emit('set_force_start', this.room, true);
      
    });
    this.socket.on('game_start', this.game_start);
    this.socket.on('game_update', this.update);
    this.socket.on('disconnect', this.disconnect);
    this.socket.on('game_won', this.won)
    this.socket.on('game_lost', this.lost);

    this.socket.on('error_set_username', (err: string)  => {
      if(err.length){ console.log('Username issue:', err);}
    });
  }

  // Should really set the type here at some point
  game_start(data: any){    
    console.log('replay_url:','http://bot.generals.io/replays/' + encodeURIComponent(data.replay_id));
    playerIndex = data.playerIndex;
    console.log('PlayerIndex:', playerIndex);
    
  }

  /**
   * 
   */
  private update = (data: any): void => {
    let moveTimer = new Date().getTime();

    this.turn = data.turn;
    // Patch the city and map diffs into our local variables.
    this.cities = this.patch(this.cities, data.cities_diff);
    this.map = this.patch(this.map, data.map_diff);
    this.generals = data.generals;
    this.scores = data.scores;

    // The next |size| terms are army values.
    // armies[0] is the top-left corner of the map.
    this.armies = this.map.slice(2, this.size + 2);

    // The last |size| terms are terrain values.
    // terrain[0] is the top-left corner of the map.
    this.terrain = this.map.slice(this.size + 2, this.size + 2 + this.size);

    // display the game board
    this.print();   

    // save the location of our base
    if(data.turn === 1){
      this.BASE = data.generals[playerIndex];
      console.log("BASE:", this.BASE);
      // The first two terms in |map| are the dimensions.
      this.width = this.map[0];
      this.height = this.map[1];
      this.size = this.width * this.height;
      
    } else {
      try{
        let move = this.bot.update(this);
        console.log('Turn:', this.turn,'('+ Math.floor(this.turn/2) +')');
        if(move){
          this.socket.emit('attack',move.from, move.to, !!move.half)
          console.log('Move:', move);      
          console.log("Thinking: ", move.elapse, "ms");
        } else {
          console.log("Invalid move returned from Bot");
        }
        
        // log time elapse
        console.log("Total:", (new Date().getTime() - moveTimer), "ms");  
      } catch(err){
        console.log('Bot fail: ', err);
      }
    }

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
  patch = (old: Array<number>, diff: Array<number>) : Array<number> => {
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

  disconnect(){
    console.error('Disconnected from server.');
    process.exit(1);
  }

  won(data: any){
    console.log('Win! Defeted: ', data);
    process.exit(1);
  }

  lost(data: any){
    console.log('Lose. Defeated by: ', data);
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
  public print = (move?: Move): void => {
        let self = this;
        console.log('==========================================================================');
        let key = {
            [TILE.EMPTY]: ' ',
            [TILE.MINE]: color.yellow('+'),
            [TILE.FOG]: color.gray('~'),
            [TILE.MOUNTAIN]: color.gray('M'),
            [TILE.OBSTACLE]: color.cyan('?') 
        };

        function terrainColor(index: number, text: string): string{
          let terrain = self.terrain[index];

          if(terrain === -1){ return color.gray(text); }
          if(terrain === TILE.MINE){ return color.yellow(text); }
          if(terrain  > 0){ return color.red(text); }
          
          return color.gray(text);
        }

        for (var i = 0; i < this.terrain.length; i += this.width) {
            var out: string = '{';
            let row = this.terrain.slice(i, i + this.width);
            let armyRow = this.armies.slice(i, i + this.width);
            
            for (let j = 0; j < row.length; j++) {
                let printRow = color.gray('[');

                if(armyRow[j] > 0){
                    if(armyRow[j] === undefined){
                      printRow += '   ';
                    } else {
                      printRow += terrainColor(i+j, 
                                              (armyRow[j] > 99 ? 
                                                armyRow[j] + '' :
                                                armyRow[j] > 9 ? 
                                                  ' ' + armyRow[j] : 
                                                  ' ' + armyRow[j] + ' '));
                    }
                } else {
                    printRow += ' ' + key[row[j]] + ' ';
                }

                out += printRow + color.gray(']');
            }
            console.log(out + '}');
        }
    }

}
