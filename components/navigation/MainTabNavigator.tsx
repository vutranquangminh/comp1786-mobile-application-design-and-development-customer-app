import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CoursesScreen from '../../screens/CoursesScreen';
import HomeScreen from '../../screens/HomeScreen';
import UserScreen from '../../screens/UserScreen';

export type MainTabParamList = {
  Home: undefined;
  Courses: undefined;
  User: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  CourseDetail: { courseId: string };
  Buy: { course: any };
  TestFirestore: undefined;
};

type MainTabNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Props {
  navigation: MainTabNavigationProp;
}

const MainTabNavigator: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? '🏠' : '🏠';
          } else if (route.name === 'Courses') {
            iconName = focused ? '📚' : '📚';
          } else if (route.name === 'User') {
            iconName = focused ? '👤' : '👤';
          } else {
            iconName = '❓';
          }

          return <Text style={{ fontSize: size, color }}>{iconName}</Text>;
        },
        tabBarActiveTintColor: '#27ae60',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e1e8ed',
          paddingBottom: insets.bottom,
          paddingTop: 5,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={(props) => <HomeScreen {...props} navigation={navigation} />}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="Courses" 
        component={(props) => <CoursesScreen {...props} navigation={navigation} />}
        options={{
          title: 'Courses',
        }}
      />
      <Tab.Screen 
        name="User" 
        component={UserScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator; 