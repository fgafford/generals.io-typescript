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

// Broken in Typesctipt compiler
// Array["prototype"].randomItem = function(): any {
//     return this[Math.floor(Math.random()*this.length)];
// }
    private randomItem<T>(arr: T[]): T {
        return arr[Math.floor(Math.random()*arr.length)];
    }

    /**
     * Get the path to a given tile. 
     * If path is not stored then generate and save it
     */
    private getPath(to: number): number[]{
        if(!this.paths[to]){ this.buildPath(to) }
        return this.paths[to];
    }

    /**
     * Get the next move on the fastest route where we are going
     * 
     * @param from - index starting from
     * @param to - index of goal
     */
    public fastest(from: number, to: number):{index: number, distance: number} {
        var self = this;
        return this.allMoves(from, to)
                    .sort((a,b) => {
                        // Go by distance first
                        let distDiff = a.distance - b.distance;
                        if(distDiff !== 0){
                            return distDiff;
                        }
                        // Go by owner then
                        let aOwner = self.game.terrain[a.index]
                        let bOwner = self.game.terrain[b.index]
                        if(aOwner !== bOwner){
                            return aOwner - bOwner
                        }
                        // if we own them 
                        let aArmies = self.game.armies[a.index]
                        let bArmies = self.game.armies[b.index]
                        if(aOwner === TILE.MINE && bOwner === TILE.MINE){
                            return bArmies - aArmies // return the highest
                        } else {
                            return aArmies - bArmies; // return the lowest
                        }
                    })[0];
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
                            .filter(i => !isNaN(i.distance))

        return moves;
    }

    /**
     * Gets the number of moves (fastest route) to another tile
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

        // console.log('PathFinder All-Paths total: ', (new Date()).getTime() - clock ,'ms');
    }

    /**
     * Builds and stores all paths to the specified location
     * 
     * @param goal - the end location we want to build paths to 
     */
    public buildPath(goal: number): void {
        let clock = new Date().getTime();
        let isBasePath = goal === this.game.BASE;

        if(this.paths[goal] === undefined){
            this.paths[goal] = [];
            this.paths[goal][goal] = 0;
        }
        let path = this.paths[goal];

        let count = 0;
        while(true){
            let indexesAtCount = this.getIndexesAtMovesAway(goal, count);
            if(!indexesAtCount.length) break;
            // itterate over spaces that need distance set
            for(let i = 0; i < indexesAtCount.length; i++){
                let ins = this.getSurroundingIndexes(indexesAtCount[i], this.game);

                // itterate over sourrounding spaces (the ones that need updated)
                for(let j = 0; j < ins.length; j++){
                    // ins[j] = space to get new count (count+1)
                    let index = ins[j];
                    if(path[index] === undefined && 
                       this.terrain[index] !== TILE.OBSTACLE && 
                       this.terrain[index] !== TILE.MOUNTAIN && 
                       !~this.game.cities.indexOf(index) && 
                       // if index is BASE and isBasePath then add
                       (index === this.game.BASE ? isBasePath : true))
                    {
                        path[ins[j]] = count + 1;
                    }
                } 
            }
            count++;
            // this.print(goal);
        }
        
        // console.log('PathFinder total: ', (new Date()).getTime() - clock ,'ms');
        // this.print(goal);
    }

    /**
     * Retuns an array of all the indexes that are X number of moves from the goal
     * 
     * @param path - the index of the goal we are building paths to
     * @param count - the move count we want to find indexes at
     */
    public getIndexesAtMovesAway(from: number, count: number): number[] {
        let path = this.getPath(from);
        
        var indexes:Array<number> = [];
        for(let i = 0; i < this.terrain.length; i++){
            if(path[i] === count){ indexes.push(i); }
        }

        return indexes;
    }

    /**
     * get the index of the nearest tile with the matching terrain type
     */
    public getNearest(from: number, terrain = TILE.ANY_ENEMY): {index: number, distance: number}{
        let indexes:Array<{index: number, distance: number}> = [];
        let i = 1;
        while(this.getIndexesAtMovesAway(from,i).length){
            // get indexes at distance
            let ins = this.getIndexesAtMovesAway(from,i);
            
            for(let j = 0; j < ins.length; j++){ 
                if((terrain === TILE.ANY_ENEMY &&
                    this.game.terrain[ins[j]] > 0) ||
                    this.game.terrain[ins[j]] === terrain)
                { 
                    indexes.push({
                        index: ins[j],
                        distance: i
                    });
                       
                }
            }
            
            if(indexes.length > 0){ return this.randomItem(indexes); }
            ++i;
        }

        return this.randomItem(indexes);
    }

    /**
     * Gets the immediate indexes surrounding an index (up, down, left, right)
     * The function will only return valud indexes onces that are outside the bounds
     * of the grid will not be included
     * 
     * @param from - the index to get surrounding indexes for
     * @param game - the current game object
     */
    public getSurroundingIndexes(from: number, game: Game): Array<number>{
        let indexes: Array<number> = [];

        if(from - game.width > -1){indexes.push(from - game.width)} // up
        if(from + game.width < game.terrain.length){indexes.push(from + game.width)} // down
        if(from % game.width > 0 ){indexes.push(from - 1)} // left
        if(from % game.width < game.width - 1){indexes.push(from + 1)} // right

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