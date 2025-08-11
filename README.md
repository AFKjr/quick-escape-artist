# Quick Escape Artist 📱

A React Native/Expo app designed to help users gracefully exit uncomfortable social situations using fake calls and text messages.

## Features

- **Fake Calls**: Receive authentic-looking incoming calls with customizable contact information
- **Fake Text Messages**: Get realistic text message notifications to excuse yourself
- **Scheduled Escapes**: Set delays from 30 seconds to 30 minutes for perfectly timed interruptions
- **Background Alarms**: Reliable notification system that works even when the app is closed
- **Customizable Contacts**: Personalize caller names and details for maximum authenticity
- **Silent Mode Support**: Audio experience uses device's native notification system for authentic behavior

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/AFKjr/quick-escape-artist.git
   cd quick-escape-artist
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npx expo start
   ```

4. Open the app in:
   - [development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go) app on your device

## How to Use

1. **App Launch**: Quick splash screen loads you directly into the main app
2. **Quick Escape**: Tap "Trigger Now" for an immediate fake call or text
3. **Scheduled Escape**: Set a delay timer and the app will notify you at the perfect moment
4. **Customize**: Visit Settings to personalize contact names and preferences
5. **Background Mode**: The app works reliably even when minimized or phone is locked

## Technical Architecture

- **Framework**: React Native with Expo SDK
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Audio**: Expo AV with system-like ringtone behavior
- **Notifications**: Expo Notifications for background alarms
- **Storage**: AsyncStorage for user preferences
- **State Management**: React hooks with persistent storage

## Project Structure

```
app/                    # Main application screens
├── (tabs)/            # Tab navigation screens
├── fake-call.tsx      # Incoming call simulation
├── call-in-progress.tsx # Active call interface
└── settings.tsx       # User preferences

components/            # Reusable UI components
├── DelayPicker.tsx    # Time delay selector
└── ui/               # Theme-aware components

utils/                # Business logic utilities
├── scheduler.ts      # Alarm scheduling system
├── notifications.ts  # Background notification handling
└── preferences.ts    # User settings management
```

## Development

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Open on Android emulator
- `npm run ios` - Open on iOS simulator
- `npm run web` - Open in web browser
- `npm run reset-project` - Reset to starter template

### Key Features Implementation

- **Background Alarms**: Hybrid system using JavaScript timers + native notifications
- **Authentic Audio**: Uses device's native sound system for realistic call experience
- **Persistent State**: User preferences and alarm schedules survive app restarts
- **Responsive Design**: Works across different screen sizes and orientations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Privacy & Safety

This app is designed for social comfort and should be used responsibly. It creates realistic fake communications to help users politely exit uncomfortable situations.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, questions, or feature requests, please open an issue on GitHub.

---

Built with ❤️ using React Native and Expo
