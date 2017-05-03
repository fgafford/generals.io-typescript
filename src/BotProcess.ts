import { bot } from './bots/bot';
import { Move } from './Move'
import { Game } from './Game'

/**
 * This small script provides an interface for running a bot
 * as an independent process.
 * 
 * Responsible for being a stand between for the Commander and the bot.
 */
let botName = process.argv[2]; // 1st passed arg
let fileName = process.argv[3]; // 2nd passed arg

let botImpl = require(__dirname + fileName).default;  
const theBot: bot = new botImpl(botName);

/**
 * Responsible for accepting message form Game passing them to the bot
 * and sending the result from the bot back to the game process.
 */
process.on('message', (gameData: {game: Game, update: any}) => {
  let move: Move = null;
  try{
      move = theBot.update(gameData.game, gameData.update)
  } catch (err) {
      console.log(`Bot Error :`, err);
  } finally {
      process.send(move)
  }
})

/**
 * Exoprt setup function
 * @param botNameArg 
 * @param fileNameArg 
 */
// export {}