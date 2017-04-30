import { Game } from './Game';
// import { BotProcess } from './BotProcess'
import * as child from 'child_process'

/**
 * commander.js
 *
 * Controller for running multiple games in parallell
 */
let user_id = process.env.user_id || '';
let botName = process.env.botName || '';
// let room = process.env.room || ;
let fileName = process.env.file;
let rooms: string[] = null;
try{
    rooms = JSON.parse(process.env.room)
} catch (err) {
    console.log('error getting rooms config: defaulting to the DOJO');
    rooms = ['fgafford_DOJO']
}

// let botImpl = require(fileName)['default'];  
// let bot = new botImpl(botName);

const bot_process = child.fork(`${__dirname}/BotProcess.js`, [botName, fileName])
// console.log(bot_process);


new Game(user_id, rooms, bot_process);

