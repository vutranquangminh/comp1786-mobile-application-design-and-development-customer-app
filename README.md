# Yoga Customer App

A React Native yoga app with Firebase Firestore integration for managing courses and user data.

## Features

- **Firebase Firestore Integration**: Real-time database for courses and user data
- **Authentication**: User sign-up and sign-in functionality
- **Course Management**: Browse, add, update, and delete yoga courses
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Cross-platform**: Works on iOS, Android, and Web

## Firebase Setup

This app is configured to use Firebase Firestore with the following services:
- **Firestore Database**: For storing course and user data
- **Authentication**: For user management
- **Real-time updates**: Automatic data synchronization

### Configuration

The Firebase configuration is located in `config/firebase.ts` and includes:
- Firestore database connection
- Authentication setup
- Helper functions for CRUD operations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- Firebase project with Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd yogacustomerapp
```

2. Install dependencies:
```bash
npm install
```

3. Seed the database with sample data:
```bash
npm run seed-firestore
```

4. Start the development server:
```bash
npm start
```

## Database Structure

### Collections

#### `courses`
Stores yoga course information:
```typescript
{
  id: string;
  title: string;
  instructor: string;
  duration: string;
  level: string;
  price: number;
  description: string;
  createdAt: Date;
}
```

## Usage

### Firestore Operations

The app provides custom hooks for easy Firestore operations:

#### `useFirestore()` Hook
```typescript
const { 
  loading, 
  error, 
  getCollection, 
  addDocument, 
  updateDocument, 
  deleteDocument,
  queryDocuments 
} = useFirestore();

// Get all courses
const courses = await getCollection('courses');

// Add a new course
const courseId = await addDocument('courses', courseData);

// Update a course
await updateDocument('courses', courseId, updatedData);

// Delete a course
await deleteDocument('courses', courseId);

// Query courses with filters
const filteredCourses = await queryDocuments('courses', [
  { field: 'level', operator: '==', value: 'Beginner' }
], 'createdAt', 10);
```

#### `useAuth()` Hook
```typescript
const { 
  user, 
  loading, 
  signUp, 
  signIn, 
  signOut 
} = useAuth();

// Sign up
await signUp(email, password);

// Sign in
await signIn(email, password);

// Sign out
await signOut();
```

### Example Component

See `components/FirestoreExample.tsx` for a complete example of how to use Firestore operations in your components.

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start on Android
- `npm run ios` - Start on iOS
- `npm run web` - Start on Web
- `npm run seed-firestore` - Seed the database with sample data
- `npm run reset-project` - Reset the project to initial state

## Project Structure

```
yogacustomerapp/
├── config/
│   └── firebase.ts          # Firebase configuration and helpers
├── hooks/
│   ├── useFirestore.ts      # Firestore custom hook
│   └── useColorScheme.ts    # Theme hook
├── components/
│   ├── FirestoreExample.tsx # Example Firestore usage
│   └── ...                  # Other components
├── screens/
│   ├── cccCoursesScreen.tsx    # Updated to use Firestore
│   └── ...                  # Other screens
└── scripts/
    └── seedFirestore.js     # Database seeding script
```

## Security Rules

Make sure to set up proper Firestore security rules in your Firebase console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

A React Native application built with Expo that provides a comprehensive yoga course platform with user authentication and course management.

## Features

- **Two-Level Navigation Structure**
  - Stack Navigator for authentication flow (Welcome, Login, SignUp)
  - Bottom Tab Navigator for main app screens (Home, Courses, Profile)

- **Authentication Flow**
  - Welcome screen with app introduction
  - Login screen with email/password authentication
  - Sign up screen with comprehensive user registration
  - Automatic navigation to main app after successful authentication

- **Course Management**
  - Home screen displays unpurchased courses with "Buy" buttons
  - Courses screen shows all available courses for browsing
  - Reusable CourseCard component for consistent course display
  - Purchase functionality with confirmation dialogs

- **User Profile**
  - User information display (name, email, phone, date of birth)
  - Account settings and support options
  - Logout functionality that resets navigation to welcome screen

## Project Structure

```
yogaclientapp/
├── App.tsx                          # Main app component
├── index.js                         # App entry point
├── screens/                         # Screen components
│   ├── WelcomeScreen.tsx           # Welcome/introduction screen
│   ├── LoginScreen.tsx             # User login screen
│   ├── SignUpScreen.tsx            # User registration screen
│   ├── HomeScreen.tsx              # Home screen with unpurchased courses
│   ├── CoursesScreen.tsx           # All courses browsing screen
│   └── UserScreen.tsx              # User profile screen
├── components/                      # Reusable components
│   ├── CourseCard.tsx              # Course display component
│   └── navigation/                 # Navigation components
│       ├── RootStackNavigator.tsx  # Main stack navigator
│       └── MainTabNavigator.tsx    # Bottom tab navigator
└── package.json                    # Dependencies and scripts
```

## Navigation Flow

1. **Welcome Screen** - App introduction with Sign In/Sign Up buttons
2. **Login/SignUp Screens** - Authentication flow (no bottom tabs)
3. **Main App** - Bottom tab navigation with:
   - **Home** - Unpurchased courses with buy functionality
   - **Courses** - All available courses for browsing
   - **Profile** - User information and settings

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on your preferred platform:
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

## Demo Credentials

For testing the login functionality:
- Email: `user@example.com`
- Password: `password`

## Key Features

### Course Management
- **Home Screen**: Shows courses the user hasn't purchased yet
- **Courses Screen**: Displays all available courses
- **Purchase Flow**: Confirmation dialog and course removal after purchase

### User Experience
- Clean, modern UI design
- Smooth navigation transitions
- Responsive design for different screen sizes
- Loading states and error handling

### Technical Implementation
- TypeScript for type safety
- React Navigation for navigation management
- Expo for cross-platform development
- Modular component architecture
- Reusable components (CourseCard)

## Customization

### Adding New Courses
Edit the mock data in `screens/HomeScreen.tsx` and `screens/CoursesScreen.tsx`:

```typescript
const mockCourses: Course[] = [
  {
    id: 'unique-id',
    title: 'Course Title',
    instructor: 'Instructor Name',
    duration: '45 min',
    level: 'Beginner',
    price: 29.99,
    description: 'Course description...',
  },
  // ... more courses
];
```

### Styling
The app uses a consistent color scheme:
- Primary: `#27ae60` (green)
- Secondary: `#2c3e50` (dark blue)
- Background: `#f8f9fa` (light gray)
- Text: `#7f8c8d` (gray)

## Future Enhancements

- Firebase Authentication integration
- Real backend API integration
- Course video streaming
- User progress tracking
- Push notifications
- Offline support
- Payment gateway integration

## License

This project is licensed under the MIT License.
# yoyacustomerapp
