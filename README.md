# 🧘‍♀️ Lotus Yoga App Customer

A comprehensive React Native mobile application for yoga studio management, built with Expo and Firebase. This app provides a complete customer experience for browsing courses, booking classes, managing profiles, and handling transactions.

## 📱 App Overview

The Lotus Yoga App Customer is a modern, user-friendly mobile application that connects yoga enthusiasts with yoga studios. Users can browse available courses, purchase classes, manage their profiles, view transaction history, and interact with teachers.

### 🎯 Key Features

- **🔐 Authentication System**: Secure sign-up and login with email/password
- **🏠 Home Dashboard**: Browse courses and teachers with search functionality
- **📚 Course Management**: View available courses, purchase classes, and track learning progress
- **👤 User Profile**: Complete profile management with image upload support
- **💰 Transaction History**: View all purchases and add money to account balance
- **🎨 Modern UI/UX**: Beautiful, responsive design with smooth animations
- **📊 Real-time Data**: Firebase Firestore integration for live data updates

## 🏗️ Architecture

### 📁 Project Structure

```
Lotus-Yoga-App-Customer/
├── 📱 App.tsx                    # Main app entry point
├── 📦 package.json               # Dependencies and scripts
├── 🎨 app.json                   # Expo configuration
├── 📋 tsconfig.json              # TypeScript configuration
├── 🚀 index.js                   # App entry point
├── 📋 eslint.config.js           # ESLint configuration
├── 📋 .gitignore                 # Git ignore rules
│
├── 📂 screens/                   # Main application screens
│   ├── 🏠 HomeScreen.tsx         # Home dashboard with course/teacher browsing
│   ├── 📚 CoursesScreen.tsx      # Purchased courses with learning interface
│   ├── 👤 UserScreen.tsx         # User profile and account management
│   ├── 🛒 BuyScreen.tsx          # Course purchase flow
│   ├── 📊 TransactionScreen.tsx  # Transaction history and balance management
│   ├── ✏️ EditProfileScreen.tsx  # Profile editing and password management
│   ├── 🔐 LoginScreen.tsx        # User authentication
│   ├── 📝 SignUpScreen.tsx       # New user registration
│   ├── 🎯 WelcomeScreen.tsx      # App welcome and navigation
│   ├── 📖 CourseDetailScreen.tsx # Detailed course information
│   └── 🧪 TestFirestoreScreen.tsx # Development testing screen
│
├── 📂 components/                # Reusable UI components
│   ├── 🎴 CourseCard.tsx         # Course display component
│   ├── 👨‍🏫 TeacherCard.tsx       # Teacher display component
│   ├── 📝 ThemedText.tsx         # Themed text component
│   ├── 🎨 ThemedView.tsx         # Themed view component
│   ├── 📦 Collapsible.tsx        # Collapsible content component
│   ├── 🔥 FirestoreExample.tsx   # Firestore testing component
│   ├── 📱 HapticTab.tsx          # Haptic feedback tab component
│   ├── 👋 HelloWave.tsx          # Welcome wave component
│   ├── 📜 ParallaxScrollView.tsx # Parallax scroll component
│   │
│   ├── 📂 navigation/            # Navigation components
│   │   ├── 🗺️ RootStackNavigator.tsx # Main navigation stack
│   │   └── 📱 MainTabNavigator.tsx   # Bottom tab navigation
│   │
│   └── 📂 ui/                    # UI-specific components
│       ├── 🎯 IconSymbol.ios.tsx # iOS icon symbols
│       ├── 🎯 IconSymbol.tsx     # Cross-platform icon symbols
│       ├── 📱 TabBarBackground.ios.tsx # iOS tab bar background
│       └── 📱 TabBarBackground.tsx     # Cross-platform tab bar background
│
├── 📂 config/                    # Configuration files
│   └── 🔥 firebase.ts            # Firebase configuration and helpers
│
├── 📂 hooks/                     # Custom React hooks
│   ├── 🎨 useColorScheme.ts      # Color scheme management
│   ├── 🌐 useColorScheme.web.ts  # Web color scheme
│   ├── 🔥 useFirestore.ts        # Firestore data management
│   └── 🎨 useThemeColor.ts       # Theme color utilities
│
├── 📂 constants/                 # App constants
│   └── 🎨 Colors.ts              # Color definitions
│
├── 📂 scripts/                   # Utility scripts
│   ├── 🔧 reset-project.js       # Project reset utility
│   ├── 🌱 seedFirestore.js       # Database seeding
│   ├── 👤 createTestUser.js      # Test user creation
│   ├── 🔧 fixCustomerIds.js      # Customer ID fixing utility
│   └── 🧪 testFirestore.js       # Firestore testing
│
├── 📂 assets/                    # Static assets
│   ├── 📁 fonts/                 # Custom fonts
│   │   └── SpaceMono-Regular.ttf # Custom font file
│   └── 📁 images/                # App images and icons
│       ├── icon.png              # App icon
│       ├── adaptive-icon.png     # Android adaptive icon
│       ├── splash-icon.png       # Splash screen icon
│       ├── favicon.png           # Web favicon
│       └── react-logo*.png       # React logo variants
│
├── 📂 .expo/                     # Expo configuration
├── 📂 .git/                      # Git repository
├── 📂 .vscode/                   # VS Code settings
└── 📂 node_modules/              # Dependencies
```

## 🛠️ Tech Stack

### **Frontend Framework**
- **React Native** (v0.79.5) - Cross-platform mobile development
- **Expo** (v53.0.20) - Development platform and tools
- **TypeScript** (v5.8.3) - Type-safe JavaScript
- **React** (v19.0.0) - UI library
- **React DOM** (v19.0.0) - Web rendering

### **Navigation**
- **@react-navigation/native** (v7.1.17) - Navigation framework
- **@react-navigation/stack** (v7.4.5) - Stack navigation
- **@react-navigation/bottom-tabs** (v7.4.5) - Tab navigation

### **Backend & Database**
- **Firebase** (v12.0.0) - Backend-as-a-Service
- **Firestore** - NoSQL cloud database
- **Firebase Auth** - Authentication system

### **UI/UX Libraries**
- **@expo/vector-icons** (v14.1.0) - Icon library
- **expo-blur** (v14.1.5) - Blur effects
- **expo-haptics** (v14.1.4) - Haptic feedback
- **expo-image** (v2.4.0) - Image optimization
- **expo-constants** (v17.1.7) - App constants
- **expo-font** (v13.3.2) - Custom fonts
- **expo-linking** (v7.1.7) - Deep linking
- **expo-splash-screen** (v0.30.10) - Splash screen
- **expo-status-bar** (v2.2.3) - Status bar management
- **expo-symbols** (v0.4.5) - Symbol components
- **expo-system-ui** (v5.0.10) - System UI
- **expo-web-browser** (v14.2.0) - Web browser integration
- **react-native-reanimated** (v3.17.4) - Animations
- **react-native-gesture-handler** (v2.24.0) - Gesture handling
- **react-native-safe-area-context** (v5.4.0) - Safe area handling
- **react-native-screens** (v4.11.1) - Screen management
- **react-native-web** (v0.20.0) - Web support
- **react-native-webview** (v13.13.5) - WebView component

### **Storage & State Management**
- **@react-native-async-storage/async-storage** (v2.2.0) - Local storage
- **React Hooks** - State management

### **Development Tools**
- **ESLint** (v9.25.0) - Code linting
- **eslint-config-expo** (v9.2.0) - Expo ESLint configuration
- **@babel/core** (v7.25.2) - JavaScript compiler
- **@types/react** (v19.0.10) - React TypeScript definitions

## 🎯 Core Features & Functionality

### **🔐 Authentication System**
- **WelcomeScreen**: App entry point with sign-in/sign-up options
- **LoginScreen**: Email/password authentication with show/hide password
- **SignUpScreen**: New user registration with profile data collection
- **Auto-redirect**: Successful sign-up redirects to login screen

### **🏠 Home Dashboard (HomeScreen)**
- **Course/Teacher Toggle**: Switch between course browsing and teacher listings
- **Search Functionality**: Filter courses and teachers by name, description, or level
- **Unpurchased Courses**: Shows only courses the user hasn't bought yet
- **Teacher Cards**: Display teacher information with "Book Private Class" buttons
- **Real-time Updates**: Fetches latest data from Firestore

### **📚 Course Management (CoursesScreen)**
- **Purchased Courses**: Shows only courses the user has bought
- **Learn Button**: Purple "Learn" button for each purchased course
- **Public/Private Toggle**: Filter between public and private classes
- **Course Navigation**: Navigate to course details

### **👤 User Profile (UserScreen)**
- **Profile Display**: Shows user information with avatar (image or initials)
- **Account Balance**: Real-time balance display with transaction history button
- **Edit Profile**: Quick access to profile editing
- **Change Password**: Dedicated password management
- **Logout**: Secure session termination

### **💰 Transaction Management (TransactionScreen)**
- **Transaction History**: Complete list of all user transactions
- **Balance Updates**: Add money to account balance
- **Transaction Types**: 
  - Green (+) for balance additions
  - Red (-) for course purchases
- **Real-time Updates**: Immediate balance and transaction updates

### **✏️ Profile Editing (EditProfileScreen)**
- **Profile Fields**: Name, email, phone, date of birth, image URL
- **Password Management**: Current password verification, new password validation
- **Show/Hide Password**: Toggle password visibility
- **Dual Mode**: Profile editing or password-only mode
- **Auto-scroll**: Automatic focus on password section when needed

### **🛒 Purchase Flow (BuyScreen)**
- **Course Details**: Complete course information display
- **Payment Methods**: Multiple payment options (Credit Card, Apple Pay, PayPal, etc.)
- **Balance Check**: Validates user has sufficient funds
- **Transaction Recording**: Creates purchase records with integer IDs
- **Success Modal**: Purchase confirmation with details
- **Cross-reference**: Links customer to course with custom document IDs

## 🗄️ Database Schema

### **Firestore Collections**

#### **`customers` Collection**
```typescript
{
  Id: number,              // Integer customer ID (1, 2, 3...)
  Email: string,           // User email
  Password: string,        // Encrypted password
  Name: string,            // Full name
  PhoneNumber: string,     // Contact number
  DateOfBirth: string,     // Birth date (YYYY-MM-DD)
  DateCreated: string,     // Account creation date
  ImageUrl: string | null, // Profile image URL
  Balance: number          // Account balance
}
```

#### **`courses` Collection**
```typescript
{
  id: string,              // Course ID
  title: string,           // Course title
  instructor: string,      // Instructor name
  duration: string,        // Course duration
  level: string,           // Difficulty level
  price: number,           // Course price
  description: string,     // Course description
  imageUrl?: string        // Course image URL
}
```

#### **`teachers` Collection**
```typescript
{
  Id: number,              // Teacher ID
  Name: string,            // Teacher name
  Experience: string,      // Years of experience
  StartDate: string,       // Start date
  ImageUrl?: string        // Teacher image URL
}
```

#### **`transactions` Collection**
```typescript
{
  Id: number,              // Transaction ID (integer)
  CustomerId: number,      // Customer ID
  Amount: string,          // Transaction amount
  DateTime: string,        // Transaction date/time
  PaymentMethod: string,   // Payment method used
  Status: boolean          // Transaction status
}
```

#### **`course_customer_crossrefs` Collection**
```typescript
{
  customerId: number,      // Customer ID
  courseId: number         // Course ID
}
// Document ID format: "customerId_courseId" (e.g., "1_17", "2_20")
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Lotus-Yoga-App-Customer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Enable Firestore and Authentication
   - Update `config/firebase.ts` with your Firebase config

4. **Seed the database**
   ```bash
   npm run seed-firestore
   ```

5. **Create test user**
   ```bash
   npm run create-test-user
   ```

6. **Start the development server**
   ```bash
   npm start
   ```

### **Available Scripts**

```bash
npm start                    # Start Expo development server
npm run android             # Run on Android device/emulator
npm run ios                 # Run on iOS simulator
npm run web                 # Run on web browser
npm run reset-project       # Reset project to initial state
npm run seed-firestore      # Seed Firestore with sample data
npm run create-test-user    # Create a test user account
npm run fix-customer-ids    # Fix customer document IDs
npm run lint                # Run ESLint
```

## 🎨 Design System

### **Color Palette**
- **Primary Purple**: `#8b5cf6` - Main brand color
- **Success Green**: `#27ae60` - Positive actions
- **Warning Red**: `#e74c3c` - Errors and negative amounts
- **Neutral Gray**: `#7f8c8d` - Secondary text
- **Background**: `#f8fafc` - Light background
- **Card Background**: `#ffffff` - Card backgrounds

### **Typography**
- **Headers**: 32px, bold, dark gray
- **Titles**: 18px, bold, dark gray
- **Body Text**: 14px, regular, medium gray
- **Button Text**: 16px, semibold, white/purple

### **Components**
- **Cards**: Rounded corners (16px), subtle shadows
- **Buttons**: Rounded corners (12px), purple background
- **Input Fields**: Rounded corners (8px), light borders
- **Avatars**: Circular design with fallback initials

## 🔧 Key Components

### **Navigation System**
- **RootStackNavigator**: Main navigation stack with screen transitions
- **MainTabNavigator**: Bottom tab navigation for main app sections
- **Screen Transitions**: Smooth slide animations between screens

### **Firebase Integration**
- **firestoreHelpers**: CRUD operations for Firestore
- **authHelpers**: Custom authentication system
- **useFirestore Hook**: React hook for Firestore operations
- **useAuth Hook**: React hook for authentication state

### **Data Management**
- **Integer IDs**: All documents use sequential integer IDs (1, 2, 3...)
- **Custom Document IDs**: Cross-references use `customerId_courseId` format
- **Real-time Updates**: Immediate UI updates on data changes
- **Error Handling**: Comprehensive error handling and user feedback

## 🚀 Deployment

### **Expo Build**
```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Build for web
expo build:web
```

### **Firebase Deployment**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy hosting (if applicable)
firebase deploy --only hosting
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using React Native, Expo, and Firebase**
