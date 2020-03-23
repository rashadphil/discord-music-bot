const {
  Client,
  Attachment,

} = require("discord.js");
const bot = new Client();

const token = "NjkxNDY5NTc4MTk0MjU1OTM0.Xngchw.xGpNNdUq0u0s-atjlFNvSUoeDgU";

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
