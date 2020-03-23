const {
  Client,
  Attachment,

} = require("discord.js");

const dotenv = require("dotenv")
dotenv.config()

const bot = new Client();

const token = process.env.BOT_TOKEN;

const PREFIX = "!"

var servers = {}

bot.on("ready", () => {
  console.log("KylizzlBot is online!");
});

bot.on("message", message => {
  let args = message.content.substring(PREFIX.length).split("");

  switch (args[0]){
    case 'play':
      if(!args[1]){
        message.channel.send("provide a link stupid");
        return;
      }
      if(!message.member.voiceChannel){
        message.channel.send("Must be in channel to use bot");
        return;
      }
  }
});

bot.login(token);
