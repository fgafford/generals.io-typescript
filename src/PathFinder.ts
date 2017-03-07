import { TILE } from "./GameConstants";
import { Move } from './Move'
import { Game } from './Game'
import { Attacks } from './bots/Attacks' 


const color = require('colors');

export class PathFinder {
    // cache all the routes?
    private game: Game;
    private terrain: Array<number>;
    private paths: Array<Array<number>> = [];

    constructor(game: Game){
        this.game = game;
        this.terrain = game.terrain.slice(0);
    }

    public buildPath(from: number): void {
        let clock = new Date().getTime();

        if(this.paths[from] === undefined){
            this.paths[from] = [];
            this.paths[from][from] = 0;
        }
        let path = this.paths[from];

        let count = 0;
        while(true){
            let indexesAtCount = this.getIndexesAtMovesAway(path, count);
            if(!indexesAtCount.length) break;
            // itterate over spaces that need distance set
            for(let i = 0; i < indexesAtCount.length; i++){
                let ins = Attacks.getIndexesAtRange(indexesAtCount[i], 1, this.game);

                // itterate over sourrounding spaces (the ones that need updated)
                for(let j = 0; j < ins.length; j++){
                    // ins[j] = space to get new count (count+1)
                    if(path[ins[j]] === undefined && 
                       this.terrain[ins[j]] !== TILE.OBSTACLE)
                    {
                        path[ins[j]] = count + 1;
                    }
                } 
            }
            count++;
            // this.print(from);
        }
        
        console.log('PathFinder total: ', (new Date()).getTime() - clock ,'ms');
    }

    public getIndexesAtMovesAway(path: Array<number>, count: number): Array<number> {
        // could use reduce here...
        var indexes:Array<number> = [];
        for(let i = 0; i < this.terrain.length; i++){
            if(path[i] === count){ indexes.push(i); }
        }
        return indexes;
    }

    public setSurroundingTiles(): void {

    }

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