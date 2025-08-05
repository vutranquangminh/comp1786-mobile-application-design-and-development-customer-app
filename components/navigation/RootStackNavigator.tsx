import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import BuyScreen from '../../screens/BuyScreen';
import CourseDetailScreen from '../../screens/CourseDetailScreen';
import EditProfileScreen from '../../screens/EditProfileScreen';
import LoginScreen from '../../screens/LoginScreen';
import SignUpScreen from '../../screens/SignUpScreen';
import TestFirestoreScreen from '../../screens/TestFirestoreScreen';
import TransactionScreen from '../../screens/TransactionScreen';
import WelcomeScreen from '../../screens/WelcomeScreen';
import MainTabNavigator from './MainTabNavigator';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  CourseDetail: { courseId: string };
  Buy: { course: any };
  EditProfile: { userData: any; focusPassword?: boolean };
  TestFirestore: undefined;
  Transactions: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
      />
      <Stack.Screen 
        name="MainTabs" 
        component={(props) => <MainTabNavigator {...props} />}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Buy" 
        component={BuyScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="TestFirestore" 
        component={TestFirestoreScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Transactions" 
        component={TransactionScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default RootStackNavigator; 