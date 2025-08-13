# Audio Assets

This directory contains ringtone audio files for the fake call feature.

## Required Files (Optional):
- `iphone-ringtone.mp3` - Default iPhone ringtone sound
- `android-ringtone.mp3` - Default Android ringtone sound

## Current Status:
The app works perfectly **without** these audio files. The fake call screen will display visually but run silently until you add the MP3 files.

## Usage:
Once you add the audio files, the app automatically selects the appropriate ringtone based on the platform:
- iOS devices use `iphone-ringtone.mp3`
- Android devices use `android-ringtone.mp3`

## File Requirements:
- Format: MP3
- Duration: 10-30 seconds (will loop)
- Quality: Optimized for mobile (128kbps recommended)
- Volume: Normalized to prevent distortion

## How to Add Audio Files:
1. Find authentic iPhone and Android ringtone MP3 files
2. Rename them to `iphone-ringtone.mp3` and `android-ringtone.mp3`
3. Place them in this directory
4. Restart the Expo development server
5. The fake call will now play realistic ringtone sounds!
