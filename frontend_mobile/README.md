# IntelliBrief Mobile App

A Flutter mobile application for IntelliBrief - your personalized daily news briefing service.

## Features

- 📧 **Email-based Authentication** with OTP verification
- 🎯 **Personalized Onboarding** - Customize topics, interests, industry, and reading preferences
- 📰 **AI-Generated Briefings** - Get personalized news summaries based on your preferences
- 🎨 **Warm Newspaper Design** - Elegant, readable interface with Georgia serif typography
- 📱 **Cross-Platform** - Runs on both iOS and Android

## Prerequisites

Before you begin, ensure you have the following installed:

- **Flutter SDK** (3.35.7 or later)
  - Download from: https://docs.flutter.dev/get-started/install
- **Dart SDK** (3.9.2 or later) - Included with Flutter
- **iOS Development** (macOS only):
  - Xcode 26.0.1 or later
  - CocoaPods 1.15.2 or later
- **Android Development**:
  - Android Studio
  - Android SDK
  - Java Development Kit (JDK)

## Installation

### 1. Clone the Repository

```bash
cd POOSD-LargeProject_Team12/frontend_mobile
```

### 2. Install Dependencies

```bash
flutter pub get
```

### 3. Configure Backend URL

`ApiService` automatically picks a base URL:

- `flutter run --dart-define API_BASE_URL=http://192.168.x.x:3002` – Override for any environment.
- Default dev targets:
  - Android emulator → `http://10.0.2.2:3001`
  - iOS simulator → `http://127.0.0.1:3001`
- Release builds fall back to the hosted API: `https://poosdproj.xyz`

If your backend runs on `3002` (the `.env.example` default), either set `PORT=3001` when starting the API **or** pass a matching `API_BASE_URL` via `--dart-define`.

### 4. Platform-Specific Setup

#### iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

If you encounter CocoaPods issues:
```bash
sudo gem install cocoapods
pod repo update
```

#### Android Setup

1. Accept Android SDK licenses:
```bash
flutter doctor --android-licenses
```

2. Ensure Android SDK is installed:
```bash
flutter doctor
```

## Running the App

### iOS Simulator

```bash
flutter run -d iPhone
```

Or specify a device:
```bash
# List available devices
flutter devices

# Run on specific device
flutter run -d "iPhone 16 Pro"
```

### Android Emulator

1. Start an Android emulator from Android Studio, or:
```bash
flutter emulators
flutter emulators --launch <emulator_id>
```

2. Run the app:
```bash
flutter run -d <device_id>
```

### Physical Device

1. **iOS**: Connect device and trust computer. Ensure device is registered in Xcode.
2. **Android**: Enable Developer Mode and USB Debugging.

```bash
flutter devices  # Find your device ID
flutter run -d <device_id>
```

## Development

### Hot Reload

While the app is running, press:
- `r` - Hot reload (preserves state)
- `R` - Hot restart (resets state)
- `q` - Quit

### Debug Mode

The app includes extensive debug logging. Watch the console for:
- `DEBUG API:` - API request/response details
- `DEBUG:` - General application flow

### Project Structure

```
lib/
├── main.dart                 # App entry point
├── providers/
│   └── auth_provider.dart    # Authentication state management
├── screens/
│   ├── auth_screen.dart      # Unified login/register screen
│   ├── onboarding_screen.dart # User preference setup
│   └── landing_page.dart     # Main dashboard & briefing display
├── services/
│   ├── api_service.dart      # Backend API integration
│   └── storage_service.dart  # Secure local storage (JWT tokens)
└── theme/
    └── app_theme.dart        # App-wide styling & colors
```

## Building for Production

### iOS

```bash
# Build IPA (requires Apple Developer account)
flutter build ios --release

# Build without code signing (for testing)
flutter build ios --release --no-codesign
```

### Android

```bash
# Build APK
flutter build apk --release

# Build App Bundle (for Play Store)
flutter build appbundle --release
```

## Troubleshooting

### Common Issues

**1. "No authentication token found" error**
- Ensure you've successfully completed OTP verification
- Check that backend URL is correct and server is running
- Clear app data and re-register

**2. iOS build fails**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
flutter clean
flutter pub get
```

**3. Android build fails**
```bash
flutter clean
flutter pub get
cd android
./gradlew clean
cd ..
```

**4. "User not found" after registration**
- Ensure backend is running and accessible
- Check network connectivity
- Verify backend URL in `api_service.dart`

**5. Flutter Doctor issues**
```bash
flutter doctor -v  # Verbose output
flutter doctor --android-licenses  # Accept Android licenses
```

## Backend Setup

The mobile app requires the IntelliBrief backend to be running. See `../backend/README.md` for setup instructions.

**Quick Start:**
```bash
cd ../backend
npm install
cp .env.example .env
# Set PORT=3001 (to match the default mobile proxy) or update API_BASE_URL when running Flutter
npm run dev
```

Default backend port is `3002` unless `PORT` is set. The mobile app expects `3001`, so either align the backend port or pass `--dart-define API_BASE_URL=http://10.0.2.2:3002`.

## Testing

### Run Tests

```bash
flutter test
```

### Analyze Code

```bash
flutter analyze
```

### Check Code Format

```bash
flutter format lib/
```

## Dependencies

Main dependencies (see `pubspec.yaml` for full list):

- `flutter` - Flutter SDK
- `provider ^6.1.1` - State management
- `http ^1.2.0` - HTTP requests
- `flutter_secure_storage ^9.0.0` - Secure JWT storage

## Authentication Flow

1. **New User:**
   - Enter email → Detects "User not found"
   - Navigate to onboarding → Answer personalization questions + optional password
   - OTP sent via email (Mailtrap/Gmail/SMTP provider). Console logs include fallback only if email delivery fails.
   - Enter OTP → Authenticated → Landing page

2. **Existing User:**
   - Enter email (and password if prompted) → OTP emailed automatically
   - Enter OTP → Authenticated → Landing page

3. **Generate Briefing:**
   - Tap "Generate Briefing" button
   - Backend fetches & summarizes news based on preferences
   - Real-time status updates (Queued → Fetching → Summarizing)
   - Display personalized briefing

## Environment Variables

No environment variables required. Configuration is in:
- `lib/services/api_service.dart` - Backend URL

## Contributing

1. Create a feature branch
2. Make changes
3. Run `flutter analyze` and `flutter test`
4. Submit pull request

## Design System

### Colors
- **Warm Beige** (#F4F1EA) - Cards & backgrounds
- **Dark Gray** (#4B4B4B) - Buttons & primary actions
- **Off White** (#FFFDFА) - Content backgrounds
- **Dark Text** (#1A1A1A) - Primary text

### Typography
- **Font Family:** Georgia (serif)
- **Headlines:** 22-28px, semi-bold
- **Body:** 16px, regular
- **Small:** 14px, regular

### Spacing
- XSmall: 8px
- Small: 12px
- Medium: 16px
- Large: 24px
- XLarge: 32px

## License

[Add your license here]

## Support

For issues or questions:
- Create an issue in the GitHub repository
- Contact the development team

## Version History

### v1.0.0 (Current)
- Initial release
- Email/OTP authentication
- Personalized onboarding
- AI-powered briefing generation
- iOS and Android support
