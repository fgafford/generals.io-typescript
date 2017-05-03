 // /// <reference path="../lib/node6.d.ts" />
import * as io from "socket.io-client";
import { bot } from "./bots/bot"
import { Move } from './Move'
import * as child from 'child_process'
import * as util from 'util';


const color = require('colors');
let botProcess: child.ChildProcess = null;

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
  private rooms: string[];
  // private bot: bot;
  private botProcess: child.ChildProcess;
  private gameId: string;
  private awaitingMove = false;

  private socket: SocketIOClient.Socket = io('http://botws.generals.io')

  private requireCoolDown: boolean = false;
  public playerIndex: number;
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

  public TILE = {
    MINE: -1, // Set on game start 
    EMPTY: -1,
    MOUNTAIN: -2,
    FOG: -3,
    OBSTACLE: -4,
    ANY_ENEMY: 100
  };

  // private botConfig;

  constructor(user_id: string, rooms: string[], botName: string, bot_process: child.ChildProcess, testing = false){
    if(!testing){
      this.user_id = user_id;
      this.rooms = rooms;
      this.botName = botName;
      botProcess = bot_process;
      // setup listening handlers
      this.setupListeners(this.socket);
    }
  }

  setupListeners = (socket: SocketIOClient.Socket): void => {
    this.socket.on('connect', () => {
      this.socket.emit('set_username', this.user_id, this.botName);
      console.log('Connected to server.');

      const room = this.rooms[Math.floor(Math.random()*this.rooms.length)]

      switch(room){
        // 1v1 (One on One) room
        case '1v1':
          this.requireCoolDown = true;
          this.socket.emit('join_1v1', this.user_id);
          console.log('joined 1v1 game room');
          break;

        // FFA (8v8) game
        case 'FFA':
          this.socket.emit('play', this.user_id);
          console.log('joined FFA!');
          setTimeout(() => { this.socket.emit('set_force_start', true) }, 60*1000) // 1 minute
          break;
        
        // Private game 
        default:
          this.socket.emit('join_private', room, this.user_id);
          this.socket.emit('set_force_start', room, true); // Force start
          console.log('Joined custom game at http://bot.generals.io/games/' + encodeURIComponent(room));
      }

      
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
    console.log('=== Start game data ===');
    console.log(data);

    console.log('replay_url:','http://bot.generals.io/replays/' + encodeURIComponent(data.replay_id));
    this.gameId = data.replay_id;
    this.playerIndex = data.playerIndex;
    console.log('PlayerIndex:', this.playerIndex);
  }

  /**
   * The game loop
   * 
   * Here is where the real work happens
   */
  private update = (data: any): void => {
    console.log('Update Recieved: ', (new Date()));
    
    let moveTimer = new Date().getTime();

    this.turn = data.turn;
    // Patch the city and map diffs into our local variables.
    this.cities = this.patch(this.cities, data.cities_diff);
    this.map = this.patch(this.map, data.map_diff);
    this.scores = data.scores;


    // The next |size| terms are army values.
    // armies[0] is the top-left corner of the map.
    this.armies = this.map.slice(2, this.size + 2);

    // The last |size| terms are terrain values.
    // terrain[0] is the top-left corner of the map.
    this.terrain = this.map.slice(this.size + 2, this.size + 2 + this.size);
    

    // save the location of our base
    if(data.turn === 1){
      if(this.playerIndex === undefined){
        for(let i = 0; i< data.generals.length ; i++){
          if(data.generals[i] > -1 ){ this.playerIndex = i; }
        }
      }
      // Set our tiles
      this.TILE.MINE = this.playerIndex;
      this.generals = data.generals;
      this.BASE = data.generals[this.playerIndex];
      console.log("BASE:", this.BASE);

      // The first two terms in |map| are the dimensions.
      this.width = this.map[0];
      this.height = this.map[1];
      this.size = this.width * this.height;
      
    } else {
      // Update generals here
      let game = this;
      this.generals = this.generals.map((location, i) => {
        let tileCount = game.scores.filter(s => s.i === i)
                                   .map(s => s.tiles)[0]
        if(tileCount < 1){ 
          // their memory fades into the abyss
          return -1; 
        } else {
          // Keep record of already found generals
          return data.generals[i] === -1 ?
                location :
                data.generals[i];
        }
      });

      // Request and send move from Bot
      this.requestMoveFromBot(data, moveTimer);
    }

  }

  /**
   * Request move from Bot and send the move back to the server
   * 
   * @method requestMoveFromBot
   * @param {any} data - update data recieved from gernerals.io server
   * @param {number} timer - the full turn counter
   */
  requestMoveFromBot = (data: any, moveTimer: number): void => {
      if(!this.awaitingMove){
        // lock to prevent parallel Bot calculations
        this.awaitingMove = true;     
        botProcess.send({game: this.asSafeObject(), update: data}) //util.inspect(this)

      } else {
        console.error(`[Game: ${this.gameId}- Turn: ${this.turn + '('+ Math.floor(this.turn/2) +')'}] Bot Lag... turn missed` )
      }
  } 

  asSafeObject = () => {
    return {
      playerIndex: this.playerIndex,
      generals: this.generals,
      turn: this.turn, 
      cities: this.cities,
      map: this.map,
      terrain: this.terrain,
      armies: this.armies,
      scores: this.scores,

      BASE: this.BASE,
      width: this.width, 
      height: this.height, 
      size: this.size,

      TILE: this.TILE
    }
  } 

  /**
   * Handels responses from Bot and sends move to the generais.io server
   */
  botResponseHandler = (move: Move): void => {
      console.log('Turn:', this.turn,'('+ Math.floor(this.turn/2) +')');
      if(move){
        this.socket.emit('attack',move.from, move.to, !!move.half)
        console.log('Move:', move);      
        console.log("Thinking: ", move.elapse, "ms");
        
        // display the game board
        this.print(move);   

      } else {
        console.error("Invalid move:", move);
        this.debug();
      }

      // log time elapse
      // console.log("Total:", (new Date().getTime() - moveTimer), "ms"); 
      console.log('Ended at: ', (new Date())); 
      console.log("==========================");


      // Release the lock
      this.awaitingMove = false

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

  disconnect(err: string){
    console.error(`[${this.gameId}] Disconnected from server:`, err);
    this.requireCoolDown ? this.coolDown() : process.exit(1);
  }

  won(data: any){
    console.log('Win! Defeted: ', data);
    this.socket.emit('leave_game')
    this.requireCoolDown ? this.coolDown() : process.exit(1);
  }

  lost(data: any){
    console.log('Lose. Defeated by: ', data);
    this.socket.emit('leave_game')
    this.requireCoolDown ? this.coolDown() : process.exit(1);
  }

  /**
   * Pretty print either the armies or terrain array
   *
   * @method print
   * @param  {Move} move - Optional move to show with -/+ on map
   */
  public print = (move?: Move): void => {
        let self = this;
        let key = {
            [this.TILE.EMPTY]: ' ',
            [this.TILE.MINE]: color.yellow('-'),
            [this.TILE.FOG]: color.gray('~'),
            [this.TILE.MOUNTAIN]: color.gray('M'),
            [this.TILE.OBSTACLE]: color.cyan('?') 
        };

        function terrainColor(index: number, text: string): string{
          let terrain = self.terrain[index];

          if(terrain === -1){ return color.gray(text); }
          if(terrain === self.TILE.MINE){ return color.yellow(text); }
          if(terrain  > 0){ return color.red(text); }
          
          return color.gray(text);
        }

        for (var i = 0; i < this.terrain.length; i += this.width) {
            var out: string = '{';
            let row = this.terrain.slice(i, i + this.width);
            let armyRow = this.armies.slice(i, i + this.width);
            
            for (let j = 0; j < row.length; j++) {
                let printRow = color.gray('[');

                if(move && i+j === move.from){
                      printRow += color.red(' - ');
                } else if(move && i+j === move.to){
                      printRow += color.green(' + ');

                } else if(armyRow[j] > 0){
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

    public debug(){
      console.error('playerIndex:', this.playerIndex);
      console.error('BASE:', this.BASE)
      console.error('generals:', JSON.stringify(this.generals));
      console.error('armies:', JSON.stringify(this.armies));
      console.error('terrain:', JSON.stringify(this.terrain));
      // console.dir(this, {depth: null, colors: true });
    }

    private getRandomInt = (min: number, max: number): number =>  {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private coolDown = (): void => {
//      var mins = this.getRandomInt(2,10) * 1000 /*seconds*/ * 60 /*minutes*/ 
//      setTimeout(() => process.exit(1), mins);
        process.exit(1);
    }

}
