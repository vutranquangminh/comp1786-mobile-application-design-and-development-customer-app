# 🧘‍♀️ Lotus Yoga App

A React Native mobile app for yoga studio management built with Expo and Firebase.

## ✨ Features

- **🔐 Authentication** - Sign up/login with email/password
- **🏠 Home Dashboard** - Browse courses and teachers with search
- **📚 Course Management** - Purchase and track learning progress
- **👤 User Profile** - Complete profile management with image upload
- **💰 Transactions** - View purchase history and manage balance
- **🎨 Modern UI** - Beautiful design with smooth animations

## 🛠️ Tech Stack

- **React Native** + **Expo** - Mobile development
- **TypeScript** - Type safety
- **Firebase** - Backend (Firestore + Auth)
- **React Navigation** - Navigation system
- **Expo Vector Icons** - Icon library

## 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone <repository-url>
   cd Lotus-Yoga-App-Customer
   npm install
   ```

2. **Setup Firebase**
   - Create Firebase project
   - Update `config/firebase.ts`
   - Enable Firestore and Auth

3. **Seed Database**
   ```bash
   npm run seed-firestore
   npm run create-test-user
   ```

4. **Run App**
   ```bash
   npm start
   ```

## 📱 Screens

- **Welcome** - App entry point
- **Login/SignUp** - Authentication
- **Home** - Browse courses & teachers
- **Courses** - Purchased courses
- **Profile** - User account management
- **Buy** - Course purchase flow
- **Transactions** - Payment history

## 🗄️ Database

**Collections:**
- `customers` - User accounts
- `courses` - Available courses
- `teachers` - Instructor profiles
- `transactions` - Payment records
- `course_customer_crossrefs` - Purchase links

## 🎨 Design

- **Colors**: Purple primary (#8b5cf6)
- **Typography**: Modern, clean fonts
- **Components**: Rounded cards with shadows
- **Navigation**: Bottom tabs with active indicators

## 📦 Scripts

```bash
npm start              # Start development server
npm run android        # Run on Android
npm run ios           # Run on iOS
npm run web           # Run on web
npm run seed-firestore # Seed database
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Open Pull Request

---

**Built with ❤️ using React Native, Expo, and Firebase**
