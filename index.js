const { Client, GatewayIntentBits } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require('@discordjs/voice');
const play = require('play-dl');

const TOKEN = 'MTM4NjAzNTgzNjk1NjQ0Njc1MA.GFkznN.9hYgaLvbeUWhVD-j7HS0gYdRNKpvFeNAM53E5A'; // <- Replace with your actual token
const PREFIX = '!';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.once('ready', () => {
  console.log(`🎵 Bot is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'play') {
    if (!args[0]) {
      return message.reply("❌ You forgot the link! Try `!play <YouTube URL>`");
    }

    const url = args[0];

    // Validate if it's a YouTube video
    if (play.yt_validate(url) !== 'video') {
      return message.reply("⚠️ That's not a valid YouTube video link.");
    }

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply("🎙️ You need to join a voice channel first.");
    }

    try {
      const stream = await play.stream(url);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
      });

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      player.play(resource);
      connection.subscribe(player);

      message.reply(`🎶 Now playing: <${url}>`);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
        console.log('🔌 Bot left the voice channel after playback.');
      });

      player.on('error', (err) => {
        console.error('⚠️ Player error:', err);
        message.reply("💥 Something broke while playing the audio.");
        connection.destroy();
      });

    } catch (err) {
      console.error("❌ Actual error:", err);
      message.reply("🔥 That link gave me a heart attack. Try another one?");
    }
  }
});

client.login(TOKEN);
