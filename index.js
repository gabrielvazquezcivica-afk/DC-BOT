import { Client, GatewayIntentBits } from 'discord.js'
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior
} from '@discordjs/voice'
import play from 'play-dl'
import 'dotenv/config'

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
})

const player = createAudioPlayer({
  behaviors: { noSubscriber: NoSubscriberBehavior.Pause }
})

client.once('ready', () => {
  console.log(`🎵 Bot conectado como ${client.user.tag}`)
})

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return
  if (!msg.content.startsWith('!')) return

  const args = msg.content.slice(1).trim().split(/ +/)
  const cmd = args.shift().toLowerCase()

  if (cmd === 'play') {
    const vc = msg.member.voice.channel
    if (!vc) return msg.reply('❌ Entra a un canal de voz')

    const url = args[0]
    if (!url) return msg.reply('🎶 Pon un link de YouTube')

    const stream = await play.stream(url)
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    })

    const connection = joinVoiceChannel({
      channelId: vc.id,
      guildId: vc.guild.id,
      adapterCreator: vc.guild.voiceAdapterCreator
    })

    player.play(resource)
    connection.subscribe(player)

    msg.reply('▶️ Reproduciendo música')
  }

  if (cmd === 'stop') {
    player.stop()
    msg.reply('⏹️ Música detenida')
  }
})

client.login(process.env.TOKEN)
