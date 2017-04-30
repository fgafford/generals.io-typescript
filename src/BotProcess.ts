import { bot } from './bots/bot';
import { Move } from './Move'
import { Game } from './Game'

  console.log('Made it here');
/**
 * This small script provides an interface for running a bot
 * as an independent process.
 * 
 * Responsible for being a stand between for the Commander and the bot.
 */
let fileName: string = null;
let botName: string = null;
let bot: bot = null;

/**
 * Responsible for accepting message form Game passing them to the bot
 * and sending the result from the bot back to the game process.
 */
process.on('message', (gameData: {game: Game, update: any}) => {
  let move: Move = null;
  try{
    move = bot.update(gameData.game, gameData.update)
  } catch (err) {
    console.log(`Bot Error :  ${err}`);
  } finally {
    process.send(move)
  }
})

/**
 * Exoprt setup function
 * @param botNameArg 
 * @param fileNameArg 
 */
export function BotProcess(){
   botName = process.argv[2];
   fileName = process.argv[3];

   let botImpl = require(fileName)['default'];  
   bot = new botImpl(botName);
}