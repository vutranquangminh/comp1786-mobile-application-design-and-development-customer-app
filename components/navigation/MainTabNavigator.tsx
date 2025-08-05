import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CoursesScreen from '../../screens/CoursesScreen';
import HomeScreen from '../../screens/HomeScreen';
import UserScreen from '../../screens/UserScreen';
import { ModernColors } from '../../constants/Colors';

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
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Courses') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'User') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={size} color={color} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          );
        },
        tabBarActiveTintColor: ModernColors.primary.main,
        tabBarInactiveTintColor: ModernColors.text.tertiary,
        tabBarStyle: {
          backgroundColor: ModernColors.background.primary,
          borderTopWidth: 1,
          borderTopColor: ModernColors.border.light,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          height: 70 + insets.bottom,
          shadowColor: ModernColors.shadow.medium,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
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

const styles = {
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  },
  activeIndicator: {
    position: 'absolute' as const,
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ModernColors.primary.main,
  },
};

export default MainTabNavigator; 