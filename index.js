const Discord = require("discord.js");

const dotenv = require("dotenv")
dotenv.config()

const bot = new Discord.Client();

const ytdl = require("ytdl-core");

const token = process.env.BOT_TOKEN;

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
        execute(message, serverQueue, args[1])
        return;
    case 'skip':
      skip(message, serverQueue)
      return;
  }

});

async function execute(message, serverQueue, arg){
  const voiceChannel = message.member.voice.channel;

  if(!arg){
    message.channel.send("provide a link stupid!");
    return;
  }
  if(!voiceChannel){
    message.channel.send("Must be in channel to use bot!");
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
    return message.channel.send(`${song.title} has been added to the queue!`);
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

bot.login(token);
