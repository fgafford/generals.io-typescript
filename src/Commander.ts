import { Game } from './Game';

/**
 * commander.js
 *
 * Controller for running multiple games in parallell
 */
let user_id = process.env.user_id || '';
let botName = process.env.botName || '';
let room = process.env.room || 'fgafford_DOJO';
let fileName = process.env.file;

let botImpl = require(fileName)['default'];  
let bot = new botImpl();

new Game(user_id, room, bot, botName);

