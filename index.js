const Discord = require("discord.js");
const dotenv = require("dotenv")
dotenv.config()

const { YTSearcher } = require('ytsearcher');
const searcher = new YTSearcher(process.env.YOUTUBE_API);

const bot = new Discord.Client();

const ytdl = require("ytdl-core");

const PREFIX = "!"

const queue = new Map();

bot.on("ready", () => {
  console.log("KylizzlBot is online!");
});

bot.on("message", message => {
  let args = message.content.substring(PREFIX.length).split(" ");
  const serverQueue = queue.get(message.guild.id);
  switch (args[0]){
    case 'play':
        if (args.length > 2 || !args.includes(".")){
          executeQuery(message, serverQueue, args);
        }else{
          executeLink(message, serverQueue, args[1]);
        }
        return;
    case 'skip':
      skip(message, serverQueue)
      return;
    case 'stop':
      stop(message, serverQueue)
      return;
    case 'shuffle':
      shuffleQueue(message, serverQueue)
      return;
    case 'queue':
    case 'q':
      message.channel.send(printQueue(message, serverQueue));
      return;
  }

});

async function executeQuery(message, serverQueue, args){
  var temp;
  args.shift(); //removes play from args
  search_terms = args.join(" ");
  let result = await searcher.search(search_terms, { type: 'video' });
  url = result.first.url;
  executeLink(message, serverQueue, url);
    
}

async function executeLink(message, serverQueue, arg){
  const voiceChannel = message.member.voice.channel;
  if(!arg){
    message.channel.send("**provide a link stupid!**");
    return;
  }

  if(!voiceChannel){
    message.channel.send("**Must be in channel to use bot!**");
    return;
  }

  const songInfo = await ytdl.getInfo(arg);
  const song = {
    title: songInfo.title,
    url: songInfo.video_url
  };

  // if no server queue, make one
  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 10,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);
    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err){
      console.log(err);
    }
  }else{ //there is already a queue
    serverQueue.songs.push(song);
    return message.channel.send(`**${song.title}** has been added to the queue!`);
  }

}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  stream = ytdl(song.url);
  const dispatcher = serverQueue.connection
    .play(stream, {filter: 'audioonly'})
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  // dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Now playing: **${song.title}**`);
}

function skip(message, serverQueue){
  if (!message.member.voice.channel){ //not in voice channel
    message.channel.send("**You can't skip if you're not in the channel!**")
    return;
  }
  if (!serverQueue) { //no songs in queue
    message.channel.send("**There are no songs in the queue!**")
    return;
  }
  serverQueue.connection.dispatcher.end(); //skips to next song
}

function stop(message, serverQueue){
  if (!message.member.voice.channel){ //not in voice channel
    message.channel.send("**You can't stop the music if you're not in the channel!**")
    return;
  }
  serverQueue.songs = []; //removes all songs from queue
  message.channel.send("**Music has been stopped!**")
  serverQueue.connection.dispatcher.end(); //stops bot
}

function shuffleQueue(message, serverQueue){
  if (!message.member.voice.channel){ //not in voice channel
    message.channel.send("**You can't shuffle the music if you're not in the channel!**")
    return;
  }

  current_queue = serverQueue.songs;
  current_song = current_queue.shift();

  shuffled_queue = shuffle(current_queue); //shuffle everything but first song
  shuffled_queue.unshift(current_song);//places first song back at start

  serverQueue.songs = shuffled_queue; 
  message.channel.send(`**Music has been shuffled!** \n **New Queue:** \n ${printQueue(message, serverQueue)}`)
}

function shuffle(array) { //shuffles array
  let counter = array.length;
  // While there are elements in the array
  while (counter > 0) {
      // Pick a random index
      let index = Math.floor(Math.random() * counter);
      // Decrease counter by 1
      counter--;
      // And swap the last element with it
      let temp = array[counter];
      array[counter] = array[index];
      array[index] = temp;
  }

  return array;
}

function printQueue(message, serverQueue){
  songs = serverQueue.songs;
  queue_str = "";
  for (i = 0; i < songs.length; i++){
    song = songs[i];
    queue_str += `${i + 1}. **${song.title}**\n`;
  }
  
  return queue_str;
}
bot.login(process.env.BOT_TOKEN);
