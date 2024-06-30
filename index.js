#!/usr/env node 
import chalk from 'chalk';
import chalkAnimation from "chalk-animation";
import gradient from 'gradient-string';
import figlet from 'figlet';
import { createSpinner } from 'nanospinner';
import { google } from 'googleapis';
import readline from 'readline';


const sleep=(ms=2000)=>new Promise((r)=>setTimeout(r,ms));
const youtube = google.youtube({
    version: 'v3',
    auth: 'REPLACE_WITH_YOUR_OWN_API_KEY',
  });
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function searchChannelByUsername(channelUsername) {
    try {
      const response = await youtube.search.list({
        part: 'snippet',
        q: channelUsername,
        type: 'channel',
      });
      const spinner= createSpinner('finding channels...').start();
      await sleep();
      const channel = response.data.items.find(item => item.snippet.channelTitle.toLowerCase() === channelUsername.toLowerCase());
      if (channel) {
        spinner.success();
        return channel.snippet.channelId;
      } else {
        spinner.error()
        console.log('Channel not found.');
        return null;
      }
    } catch (error) {
      console.error('Error searching for channel:', error.message);
      return null;
    }
  }
  

  async function fetchChannelStats(channelUsername) {
    try {
      const channelId = await searchChannelByUsername(channelUsername);
      if (!channelId) return;
  
      const response = await youtube.channels.list({
        part: 'statistics',
        id: channelId,
      });
  
      const channel = response.data.items[0];
      if (channel) {
        const stats = channel.statistics;
        console.log(`Channel Statistics for ${channelUsername}:`);
        console.log(`- Subscribers: ${stats.subscriberCount}`);
        console.log(`- Views: ${stats.viewCount}`);
        console.log(`- Videos: ${stats.videoCount}`);
      } else {
        console.log('Channel not found.');
      }
    } catch (error) {
      console.error('Error fetching channel statistics:', error.message);
    }
  }
  
  async function YouTubeStats() {
    
    rl.question('Enter YouTube Channel Name: ', async (channelUsername) => {
      if (channelUsername) {
        await fetchChannelStats(channelUsername);
      } else {
        console.log('Invalid input. Please provide a valid YouTube Channel Username (handle).');
      }
      rl.close();
    });
  }
  
 YouTubeStats();
