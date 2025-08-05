# 🧘‍♀️ Yoga Customer App

A comprehensive React Native yoga platform built with Expo and Firebase Firestore, featuring user authentication, course management, teacher booking, and transaction tracking.

## ✨ Features

### 🔐 Authentication & User Management
- **User Registration**: Complete sign-up with profile information
- **User Login**: Secure email/password authentication
- **Profile Management**: Edit profile, change password, update profile picture
- **Account Balance**: Track and manage user account funds
- **Transaction History**: View all purchase and balance update history

### 📚 Course Management
- **Course Discovery**: Browse available yoga courses
- **Course Filtering**: Search by title, instructor, description, or level
- **Course Types**: Public classes and private sessions
- **Purchase System**: Buy courses with account balance
- **Learning Interface**: Access purchased courses for learning

### 👨‍🏫 Teacher Management
- **Teacher Directory**: Browse available yoga teachers
- **Teacher Profiles**: View teacher information and experience
- **Private Booking**: Book private sessions with teachers
- **Teacher Search**: Filter teachers by name or experience

### 💰 Financial Features
- **Account Balance**: Add funds to your account
- **Purchase Tracking**: Complete transaction history
- **Payment Methods**: Multiple payment options for purchases
- **Balance Updates**: Add money to account with transaction records

### 🎨 Modern UI/UX
- **Purple Theme**: Consistent purple and white color scheme
- **Responsive Design**: Works on iOS, Android, and Web
- **Smooth Navigation**: Stack and tab navigation
- **Loading States**: Proper loading indicators and error handling
- **Modern Components**: Reusable card components and clean layouts

## 🏗️ Architecture

### Tech Stack
- **React Native** with Expo
- **TypeScript** for type safety
- **Firebase Firestore** for backend database
- **React Navigation** for navigation
- **AsyncStorage** for local persistence

### Project Structure
```
yogacustomerapp/
├── App.tsx                          # Main app component
├── screens/                         # Screen components
│   ├── WelcomeScreen.tsx           # Welcome/introduction
│   ├── LoginScreen.tsx             # User authentication
│   ├── SignUpScreen.tsx            # User registration
│   ├── HomeScreen.tsx              # Course/Teacher discovery
│   ├── CoursesScreen.tsx           # Purchased courses
│   ├── BuyScreen.tsx               # Purchase interface
│   ├── UserScreen.tsx              # User profile
│   ├── EditProfileScreen.tsx       # Profile editing
│   ├── TransactionScreen.tsx       # Transaction history
│   ├── CourseDetailScreen.tsx      # Course details
│   └── TestFirestoreScreen.tsx     # Development testing
├── components/                      # Reusable components
│   ├── CourseCard.tsx              # Course display
│   ├── TeacherCard.tsx             # Teacher display
│   └── navigation/                 # Navigation
│       ├── RootStackNavigator.tsx  # Main stack
│       └── MainTabNavigator.tsx    # Bottom tabs
├── config/
│   └── firebase.ts                 # Firebase configuration
├── hooks/
│   ├── useFirestore.ts             # Firestore operations
│   └── useAuth.ts                  # Authentication
├── scripts/                        # Database scripts
│   ├── createTestUser.js           # Create test users
│   ├── seedFirestore.js            # Seed database
│   └── reset-project.js            # Reset project
└── constants/
    └── Colors.ts                   # Color definitions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yoyacustomerapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project
   - Enable Firestore Database
   - Update `config/firebase.ts` with your Firebase config

4. **Seed the database**
   ```bash
   npm run seed-firestore
   npm run create-test-user
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on your preferred platform**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 📊 Database Structure

### Collections

#### `customers`
User account information:
```typescript
{
  Id: number;
  Email: string;
  Password: string;
  Name: string;
  PhoneNumber: string;
  DateOfBirth: string;
  DateCreated: string;
  ImageUrl: string | null;
  Balance: number;
}
```

#### `courses`
Yoga course information:
```typescript
{
  Id: number;
  Name: string;
  Description: string;
  Price: string;
  Duration: number;
  Category: string;
  TeacherId: number;
}
```

#### `teachers`
Teacher information:
```typescript
{
  Id: number;
  Name: string;
  Experience: string;
  Specialization: string;
  ImageUrl: string;
}
```

#### `transactions`
Purchase and balance update records:
```typescript
{
  Id: string;
  CustomerId: number;
  Amount: number;
  DateTime: string;
  PaymentMethod: string;
  Status: string;
}
```

#### `course_customer_crossrefs`
Course purchase relationships:
```typescript
{
  customerId: number;
  courseId: number;
}
```

## 🎯 Key Features Explained

### Authentication Flow
1. **Welcome Screen** → App introduction with Sign In/Sign Up options
2. **Login/SignUp** → User authentication with Firebase
3. **Main App** → Bottom tab navigation with Home, Courses, and Profile

### Course Management
- **Home Screen**: Shows unpurchased courses and teachers
- **Courses Screen**: Displays purchased courses with "Learn" buttons
- **Course Types**: Toggle between Public and Private classes
- **Search & Filter**: Find courses by title, instructor, or description

### User Profile
- **Account Balance**: View and manage funds
- **Profile Editing**: Update personal information and password
- **Transaction History**: View all purchases and balance updates
- **Profile Picture**: Upload custom profile images via URL

### Purchase System
- **Buy Screen**: Complete purchase interface with payment methods
- **Balance Management**: Add funds to account
- **Transaction Tracking**: Complete history of all financial activities

## 🛠️ Available Scripts

```bash
# Development
npm start              # Start Expo development server
npm run android        # Run on Android
npm run ios           # Run on iOS
npm run web           # Run on Web

# Database Management
npm run seed-firestore    # Seed database with sample data
npm run create-test-user  # Create test user account
npm run reset-project     # Reset project to initial state

# Code Quality
npm run lint           # Run ESLint
```

## 🎨 UI/UX Features

### Color Scheme
- **Primary**: `#8b5cf6` (Purple)
- **Secondary**: `#059669` (Green for success actions)
- **Background**: `#f8fafc` (Light gray)
- **Text**: `#1e293b` (Dark gray)

### Navigation Structure
```
Welcome Screen
├── Login Screen
├── Sign Up Screen
└── Main App (Tab Navigation)
    ├── Home Screen
    │   ├── Course Tab
    │   └── Teacher Tab
    ├── Courses Screen
    │   ├── Public Classes
    │   └── Private Classes
    └── User Screen
        ├── Edit Profile
        ├── Change Password
        └── Transaction History
```

## 🔧 Customization

### Adding New Features
1. **New Screens**: Add to `screens/` directory
2. **New Components**: Add to `components/` directory
3. **Database Changes**: Update Firestore collections and helper functions
4. **Navigation**: Update navigation types and routes

### Styling
- Consistent purple theme throughout the app
- Modern card-based layouts
- Responsive design for all screen sizes
- Loading states and error handling

## 🚀 Deployment

### Expo Build
```bash
# Build for production
expo build:android
expo build:ios
```

### Firebase Deployment
1. Configure Firebase project
2. Set up Firestore security rules
3. Deploy to Firebase hosting (for web)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React Native and Expo
- Powered by Firebase Firestore
- Icons and emojis for visual elements
- Modern UI/UX design principles

---

**Made with ❤️ for the yoga community**
