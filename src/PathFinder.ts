
import { Move } from './Move'
import { Game } from './Game'



const color = require('colors');

export class PathFinder {
    private game: Game;
    private includeCities: boolean;
    private terrain: Array<number>;
    private paths: Array<Array<number>> = [];

    /**
     * @constructor
     * 
     * @param {Game} game - current game object
     * @param {boolean} [includeCities = false] - Should cities be included on paths?
     */
    constructor(game: Game, includeCities: boolean = false){
        this.game = game
        this.terrain = game.terrain.slice(0);
        this.includeCities = includeCities;
    }

// Broken in Typesctipt compiler
// Array["prototype"].randomItem = function(): any {
//     return this[Math.floor(Math.random()*this.length)];
// }
    public randomItem<T>(arr: T[]): T {
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
                            if(aOwner === self.game.TILE.MINE){ return -1 }
                            if(bOwner === self.game.TILE.MINE){ return 1 }
                        }
                        // if we own them 
                        let aArmies = self.game.armies[a.index]
                        let bArmies = self.game.armies[b.index]
                        if(aOwner === self.game.TILE.MINE && bOwner === self.game.TILE.MINE){
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

        let moves = this.getSurroundingIndexes(from)
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
                let ins = this.getSurroundingIndexes(indexesAtCount[i]);

                // itterate over sourrounding spaces (the ones that need updated)
                for(let j = 0; j < ins.length; j++){
                    // ins[j] = space to get new count (count+1)
                    let index = ins[j];
                    if((path[index] === undefined) && 
                       (this.terrain[index] !== this.game.TILE.OBSTACLE) && 
                       (this.terrain[index] !== this.game.TILE.MOUNTAIN) && 
                       // include cities if requested
                    //    (this.includeCities ? true : !this.isCity(index)) && 
                    //    (this.includeCities ? true : 
                       (!this.isCity(index) ? true :
                            (this.includeCities ? true : 
                                this.game.terrain[index] === this.game.TILE.MINE)) &&
                    //    && this.includeCities ? true : (this.game.terrain[index] === this.game.TILE.MINE)) && 
                       // if index is BASE and isBasePath then add
                       (index === this.game.BASE ? isBasePath : true))
                    {
                        path[index] = count + 1;
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
    public getNearest(from: number, terrain = this.game.TILE.ANY_ENEMY): {index: number, distance: number}{
        let indexes:Array<{index: number, distance: number}> = [];
        let i = 1;
        while(this.getIndexesAtMovesAway(from,i).length){
            // get indexes at distance
            let ins = this.getIndexesAtMovesAway(from,i);
            
            for(let j = 0; j < ins.length; j++){ 
                if((terrain === this.game.TILE.ANY_ENEMY &&
                    this.game.terrain[ins[j]] >= 0 &&
                    this.game.terrain[ins[j]] !== this.game.TILE.MINE) ||
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
    public getSurroundingIndexes(from: number): Array<number>{
        let indexes: Array<number> = [];

        if(from - this.game.width > -1){indexes.push(from - this.game.width)} // up
        if(from + this.game.width < this.game.terrain.length){indexes.push(from + this.game.width)} // down
        if(from % this.game.width > 0 ){indexes.push(from - 1)} // left
        if(from % this.game.width < this.game.width - 1){indexes.push(from + 1)} // right

        return indexes;
    }

    public isCity(index: number): boolean {
        return this.game.cities.indexOf(index) > -1;
    }

    /**
     * 
     */
    private getRandomInt = (min: number, max: number): number =>  {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // getArmiesWithMinSize

    /**
     * Loops through and gets all the indexes with armies at a given or larger size
     */
    public getArmiesWithMinSize(
            type: number = this.game.TILE.MINE,
            min: number = 2, 
            includeBase: boolean = false, 
            sort?:(a:{index: number, armies: number}, b:{index: number, armies: number}) => number): Array<{index: number, armies: number}> 
        {
        // get from closest to Base
        var matches: Array<{index: number, armies: number}> = [];

        // find biggest army and move to 0
        for(let i = 0; i < this.game.terrain.length; i++){
            if((type === this.game.TILE.ANY_ENEMY ? 
                (this.game.terrain[i] >= 0 && 
                    this.game.terrain[i] !== this.game.TILE.MINE) : 
                (this.game.terrain[i] === type)) && 
                
            this.game.armies[i] >= min && 
            (includeBase ? true : i !== this.game.BASE)) 
            { 
            matches.push({ index:i, armies: this.game.armies[i]});
            }
        }
        
        if(sort){
        return matches.sort(sort);
        } else {
        return matches;
        }
    }

    // Functional programming for the win... always
    nearestToIndex = (goal:number): (a:{index: number, armies: number}, b:{index: number, armies: number}) => number => {
        return (a:{index: number, armies: number}, b:{index: number, armies: number}): number => {
                                // Those closest to goal
                                return this.distanceTo(a.index, goal) - this.distanceTo(b.index, goal)
                                }
    }  
    
    nearestToBase = (a:{index: number, armies: number}, b:{index: number, armies: number}): number => {
                              // Push the base to the back (last option)
                              if(a.index === this.game.BASE) return 1;
                              if(b.index === this.game.BASE) return -1;
                              // Those closest to base
                              return this.distanceTo(a.index, this.game.BASE) - this.distanceTo(b.index, this.game.BASE)
    }

    furthestFromBase = (a:{index: number, armies: number}, b:{index: number, armies: number}): number => {
                                // Push the base to the back (last option)
                                if(a.index === this.game.BASE) return 1;
                                if(b.index === this.game.BASE) return -1;
                                // Furthest from base
                                return this.distanceTo(b.index, this.game.BASE) - this.distanceTo(a.index, this.game.BASE)
                                }

    largestFirst = (a:{index: number, armies: number}, b:{index: number, armies: number}): number => {
                                // Push the base to the back (last option)
                                if(a.index === this.game.BASE) return 1;
                                if(b.index === this.game.BASE) return -1;
                                // put largest armies at the front
                                return b.armies - a.armies;
                                }

    nearestToEmpty = (a:{index: number, armies: number}, b:{index: number, armies: number}): number => {
                                let aDist = this.getNearest(a.index, this.game.TILE.EMPTY).distance;
                                let bDist = this.getNearest(b.index, this.game.TILE.EMPTY).distance;
                                // put largest armies at the front
                                return aDist - bDist;
                            }

    nearestToEnemy = (a:{index: number, armies: number}, b:{index: number, armies: number}): number => {
                                let aDist = this.getNearest(a.index).distance;
                                let bDist = this.getNearest(b.index).distance;
                                // put largest armies at the front
                                return aDist - bDist;
                            }

    /**
     * Spead out and capture the nearest empty lands!
     * If unable to capture a new land then move way from specified location.
     * 
     * @method infest
     * @param {boolean} [useBase=false] - allow for moves from base (headquorters)
     * @param {number} [minArmies=2] - only attack from Tiles with at least X armies  
     * @param {function} [sort=largest] - Optional custom sort function for selecting army to move
     * @param {function} [sort=largest] - Optional custom sort function for selecting army to move
     * 
     * @return {Move} The expand move or NULL if not valid expand move exists
     */
    public expand(
        useBase: boolean = true, 
        minArmies: number = 2, 
        sort?:(a:{index: number, armies: number}, b:{index: number, armies: number}) => number, 
        filter?:(army:{index: number, armies: number}) => boolean)
    {
        let started = (new Date().getTime());
        
        let armies = this.getArmiesWithMinSize(this.game.TILE.MINE, minArmies, useBase);

        if(filter){ armies = armies.filter(filter); }
        let ordered = armies.sort(sort || this.nearestToEmpty);
        let choosen = ordered[0]

        if(choosen){
            let nearest = this.getNearest(choosen.index, this.game.TILE.EMPTY)
            // Regroup to base if not able to expand
            let next = this.fastest(choosen.index, (nearest ? nearest.index : this.game.BASE))
            // update the elapse timer
            return new Move(choosen.index, next.index, (new Date().getTime() - started))
        } 

        return null;
    }

    /**
     * Retuns all allied armies (at a given strength) to a common tile.
     * 
     * @method regroup
     * @param {number} [goal=BASE] - the end index to regroup to
     * @param {number} [distance=5] - the max distance to pull armies from 
     * @param {number} [minArmies=2] - the minimum armies required to be included in the regroup
     */
    public regroup(goal: number = this.game.BASE, distance:number = 5, minArmies: number = 2 ): Move {
        let start = new Date().getTime();

        for(let d = distance; d > 0; d--){
        let indexesAtDistance = this.getIndexesAtMovesAway(goal, d);

        for(let i of indexesAtDistance){
            if(this.game.terrain[i] === this.game.TILE.MINE && this.game.armies[i] >= minArmies){
            // get the move from that index to the goal
            return new Move(i, 
                    this.fastest(i, goal).index, 
                    (new Date().getTime() - start));
            }
        }
        }
        return null;
    }

    /**
     * print all the path count for a single goal
     * 
     * @param goal - the end goal we want to print the paths for
     */
    public print(goal: number): void {
        let key = {
            [this.game.TILE.EMPTY]: ' ',
            [this.game.TILE.MINE]: color.yellow('+'),
            [this.game.TILE.FOG]: color.gray('~'),
            [this.game.TILE.MOUNTAIN]: color.gray('M'),
            [this.game.TILE.OBSTACLE]: color.red('%') 
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