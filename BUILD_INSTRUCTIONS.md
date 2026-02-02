# HolyVerse Mobile App Build Instructions

## ✅ Setup Complete!

Capacitor has been successfully installed and configured for your project.

## 📱 Building the Android App

### Prerequisites
- Install [Android Studio](https://developer.android.com/studio)
- Install Java JDK 17 or higher

### Build Steps

1. **Sync your web files to the native project:**
   ```bash
   npx cap sync
   ```

2. **Open the project in Android Studio:**
   ```bash
   npx cap open android
   ```

3. **In Android Studio:**
   - Wait for Gradle sync to complete
   - Connect an Android device or start an emulator
   - Click the green "Run" button (▶️)

### Building APK for Distribution

1. In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Find the APK in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Building Release APK (for Google Play Store)

1. Generate a signing key:
   ```bash
   keytool -genkey -v -keystore holyverse-release.keystore -alias holyverse -keyalg RSA -keysize 2048 -validity 10000
   ```

2. In Android Studio: **Build → Generate Signed Bundle/APK**
3. Follow the wizard to create a signed release APK

## 🍎 Building the iOS App

### Prerequisites
- macOS required
- Install [Xcode](https://apps.apple.com/us/app/xcode/id497799835)
- Apple Developer Account ($99/year)

### Build Steps

1. **Add iOS platform:**
   ```bash
   npx cap add ios
   ```

2. **Sync and open:**
   ```bash
   npx cap sync
   npx cap open ios
   ```

3. **In Xcode:**
   - Select your development team
   - Connect an iPhone or use simulator
   - Click the "Run" button (▶️)

## 🔄 Making Changes

After updating your web files (HTML/CSS/JS):

```bash
npx cap sync
```

This copies your frontend files to the native projects.

## 🔧 Configuration

Edit `capacitor.config.json` to customize:
- App name
- Bundle ID
- Server URL (for API calls)
- Plugins

## 📦 Useful Capacitor Plugins

Already included:
- `@capacitor/core` - Core functionality

Recommended to add:
```bash
npm install @capacitor/app @capacitor/splash-screen @capacitor/status-bar @capacitor/share @capacitor/push-notifications
```

## 🐛 Troubleshooting

**"Command not found" error:**
- Make sure you're in the project directory
- Run `npm install` first

**Android build fails:**
- Check Android Studio SDK is updated
- File → Sync Project with Gradle Files

**Changes not showing:**
- Run `npx cap sync` after any frontend changes
- Rebuild the app in Android Studio/Xcode

## 📱 Testing

- **Android Emulator:** Tools → Device Manager in Android Studio
- **Physical Device:** Enable USB Debugging in Developer Options

## 🚀 Distribution

**Google Play Store:**
1. Create Google Play Console account ($25 one-time)
2. Build signed release AAB: `Build → Generate Signed Bundle`
3. Upload to Play Console

**Apple App Store:**
1. Create App Store Connect account
2. Archive in Xcode: Product → Archive
3. Submit through Xcode Organizer

---

**Need help?** Check [Capacitor Docs](https://capacitorjs.com/docs)
