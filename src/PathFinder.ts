import { TILE } from "./GameConstants";
import { Move } from './Move'
import { Game } from './Game'
import { Attacks } from './bots/Attacks' 


const color = require('colors');

export class PathFinder {
    private game: Game;
    private terrain: Array<number>;
    private paths: Array<Array<number>> = [];

    /**
     * @constructor
     * @param game - current game object
     */
    constructor(game: Game){
        this.game = game;
        this.terrain = game.terrain.slice(0);
    }

    /**
     * Get the next move on the fastest route where we are going
     * 
     * @param from - index starting from
     * @param to - index of goal
     */
    public fastest(from: number, to: number):{index: number, distance: number} {
        var moves =  this.allMoves(from, to)
                    .sort((a,b) => a.distance - b.distance);
        console.log('Fastet:', moves);
        
        return moves[0]
    }

    /**
     * Get the next move along the way to a given location
     * 
     * @param from - index starting from
     * @param to - index of goal
     * @param agress - NOT currently implemented
     */
    public allMoves(from: number, to: number, aggress?: boolean): Array<{index: number, distance: number}> {
        if(!this.paths[to]){ this.buildPath(to) }
        let path = this.paths[to];

        let moves = this.getSurroundingIndexes(from, this.game)
                            .map(i => ({ index: i, distance: path[i]}))
                            .filter(i => !!i.distance)

        return moves;
    }

    /**
     * 
     * @param from 
     * @param to 
     */
    public distanceTo(from: number, to: number): number {
        if(!this.paths[to]){ this.buildPath(to) }
        return this.paths[to][from];
    }

    /**
     * Builds all paths for the maps.
     * These paths do NOT take into account cities (allied, enemy, or neutral)
     * and does not take into account enemy or allied armies.
     */
    public buildAllPaths(){
        let clock = new Date().getTime();

        for(let i = 0; i < this.terrain.length; i++){
            if(this.terrain[i] !== -4 /* Or some other ones*/){
                this.buildPath(i);
            }
        }

        console.log('PathFinder All-Paths total: ', (new Date()).getTime() - clock ,'ms');
    }

    /**
     * Builds and stores all paths to the specified location
     * 
     * @param goal - the end location we want to build paths to 
     */
    public buildPath(goal: number): void {
        let clock = new Date().getTime();

        if(this.paths[goal] === undefined){
            this.paths[goal] = [];
            this.paths[goal][goal] = 0;
        }
        let path = this.paths[goal];

        let count = 0;
        while(true){
            let indexesAtCount = this.getIndexesAtMovesAway(path, count);
            if(!indexesAtCount.length) break;
            // itterate over spaces that need distance set
            for(let i = 0; i < indexesAtCount.length; i++){
                let ins = this.getSurroundingIndexes(indexesAtCount[i], this.game);

                // itterate over sourrounding spaces (the ones that need updated)
                for(let j = 0; j < ins.length; j++){
                    // ins[j] = space to get new count (count+1)
                    if(path[ins[j]] === undefined && 
                       this.terrain[ins[j]] !== TILE.OBSTACLE && 
                       this.terrain[ins[j]] !== TILE.MOUNTAIN)
                    {
                        path[ins[j]] = count + 1;
                    }
                } 
            }
            count++;
            // this.print(goal);
        }
        
        console.log('PathFinder total: ', (new Date()).getTime() - clock ,'ms');
        // this.print(goal);
    }

    /**
     * Retuns an array of all the indexes that are X number of moves from the goal
     * 
     * @param path - the index of the goal we are building paths to
     * @param count - the move count we want to find indexes at
     */
    private getIndexesAtMovesAway(path: Array<number>, count: number): Array<number> {
        // could use reduce here...
        var indexes:Array<number> = [];
        for(let i = 0; i < this.terrain.length; i++){
            if(path[i] === count){ indexes.push(i); }
        }
        return indexes;
    }

    /**
     * 
     * @param from 
     * @param range 
     * @param game 
     */
    private getSurroundingIndexes(from: number, game: Game): Array<number>{
        let indexes: Array<number> = [];

        if(from - game.width > -1){indexes.push(from - game.width)} // up
        if(from + game.width < game.terrain.length){indexes.push(from + game.width)} // down
        if(from % game.width > 0 ){indexes.push(from - 1)} // left
        if(from % game.width < game.width){indexes.push(from + 1)} // right

        return indexes;
    }

    /**
     * print all the path count for a single goal
     * 
     * @param goal - the end goal we want to print the paths for
     */
    public print(goal: number): void {
        let key = {
            [TILE.EMPTY]: ' ',
            [TILE.MINE]: color.yellow('+'),
            [TILE.FOG]: color.gray('~'),
            [TILE.MOUNTAIN]: color.gray('M'),
            [TILE.OBSTACLE]: color.red('%') 
        };
        for (var i = 0; i < this.game.terrain.length; i += this.game.width) {
            var out: string = '{';
            let row = this.game.terrain.slice(i, i + this.game.width);
            let pathRow = this.paths[goal].slice(i, i + this.game.width);
            
            for (let j = 0; j < row.length; j++) {
                let printRow = color.gray('[');

                if(pathRow[j] !== undefined){
                    printRow += pathRow[j] < 10 ? ' ' + color.green(pathRow[j]) : color.green(pathRow[j]);
                } else {
                    printRow += ' ' + key[row[j]];
                }

                // print indexes
                // let pad = '   '
                // let num = (i+j).toString();
                // printRow += pad.substring(0, pad.length - num.length) + num 

                out += printRow + color.gray(']');

            }
            console.log(out + '}');
        }
        console.log('==========================================================================');
    }
}