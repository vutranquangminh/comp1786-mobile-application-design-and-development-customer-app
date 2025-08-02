# Yoga Customer App

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
