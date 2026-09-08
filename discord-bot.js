import { Client, GatewayIntentBits } from 'discord.js';
import { GoogleGenAI } from '@google/genai';
import { logger } from './lib/logger.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.on('ready', () => {
  logger.info(`Discord Bot logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Voice channel commands (.v lock / .v unlock)
  if (message.content.startsWith('.v')) {
    const args = message.content.slice(2).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();
    const voiceChannel = message.member?.voice?.channel;

    if (!voiceChannel) return message.reply('Khassk tkoon f voice channel be3da!');

    if (command === 'lock') {
      await voiceChannel.permissionOverwrites.edit(message.guild.roles.everyone, { Connect: false });
      return message.reply('🔒 Room tsaddat!');
    }
    if (command === 'unlock') {
      await voiceChannel.permissionOverwrites.edit(message.guild.roles.everyone, { Connect: true });
      return message.reply('🔓 Room thallat!');
    }
    return;
  }

  // Gemini AI Response
  const isMentioned = message.mentions.has(client.user);
  const isReplyToBot = message.reference && message.referencedMessage?.author.id === client.user.id;

  if (!isMentioned && !isReplyToBot) return;

  try {
    await message.channel.sendTyping();
    const prompt = message.content.replace(/<@!?\d+>/g, '').trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Jawb dima b Darija marocaine maktouba b hrouf latine (Arabizi / Chat). Koun fhal wahed saheb/sahba f Discord, jawb b tariqa tabiiya, qsiira, w bla l3arbiya d hrouf.'
      }
    });

    if (response.text) await message.reply(response.text);
  } catch (error) {
    logger.error({ err: error }, 'Error generating AI response');
  }
});

export async function startDiscordBot() {
  if (!process.env.DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is missing in environment variables.');
  }
  await client.login(process.env.DISCORD_TOKEN);
}
