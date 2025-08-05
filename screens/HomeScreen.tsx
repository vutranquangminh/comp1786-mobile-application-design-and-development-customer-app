import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CourseCard, { Course } from '../components/CourseCard';
import TeacherCard, { Teacher } from '../components/TeacherCard';
import { firestoreHelpers } from '../config/firebase';
import { ModernColors } from '../constants/Colors';
import { useAuth, useFirestore } from '../hooks/useFirestore';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  CourseDetail: { courseId: string };
  Buy: { course: any };
  TestFirestore: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'course' | 'teacher'>('course');
  const [unpurchasedCourses, setUnpurchasedCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const { getCollection, loading: firestoreLoading, error } = useFirestore();
  const { user } = useAuth();

  // Function to get teacher name by TeacherId
  const getTeacherName = async (teacherId: number): Promise<string> => {
    try {
      const teachers = await firestoreHelpers.queryDocuments('teachers', [
        { field: 'Id', operator: '==', value: teacherId }
      ]);
      
      if (teachers.length > 0) {
        return teachers[0].Name;
      } else {
        return `Teacher ${teacherId}`;
      }
    } catch (error) {
      console.error('💥 Error getting teacher name:', error);
      return `Teacher ${teacherId}`;
    }
  };

  // Function to filter courses based on search query
  const filterCourses = (courses: Course[], query: string) => {
    if (!query.trim()) {
      return courses;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return courses.filter(course => 
      course.title.toLowerCase().includes(lowercaseQuery) ||
      course.instructor.toLowerCase().includes(lowercaseQuery) ||
      course.description.toLowerCase().includes(lowercaseQuery) ||
      course.level.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Function to filter teachers based on search query
  const filterTeachers = (teachers: Teacher[], query: string) => {
    if (!query.trim()) {
      return teachers;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return teachers.filter(teacher => 
      teacher.name.toLowerCase().includes(lowercaseQuery) ||
      teacher.experience.toLowerCase().includes(lowercaseQuery)
    );
  };

  // Function to get courses that user hasn't bought yet
  const getUnpurchasedCourses = async () => {
    try {
      const currentUserId = user?.Id;
      
      if (!currentUserId) {
        // If no user, show all courses
        return courses;
      }

      // Get user's purchased courses
      const purchasedCourses = await firestoreHelpers.queryDocuments('course_customer_crossrefs', [
        { field: 'CustomerId', operator: '==', value: currentUserId }
      ]);

      // Get IDs of purchased courses
      const purchasedCourseIds = purchasedCourses.map((purchase: any) => purchase.CourseId.toString());

      // Filter out purchased courses
      return courses.filter(course => !purchasedCourseIds.includes(course.id));
    } catch (error) {
      console.error('Error getting unpurchased courses:', error);
      return courses; // Return all courses if there's an error
    }
  };

  // Function to load teachers
  const loadTeachers = async () => {
    try {
      const teachersData = await getCollection('teachers');
      const transformedTeachers: Teacher[] = teachersData.map((teacher: any) => ({
        id: teacher.Id.toString(),
        name: teacher.Name,
        experience: teacher.Experience,
        dateStartedTeaching: teacher.DateStartedTeaching,
      }));
      setTeachers(transformedTeachers);
      setFilteredTeachers(transformedTeachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      // Get current user ID from auth state
      const currentUserId = user?.Id;
      
      if (!currentUserId) {
        // For testing purposes, show all courses if no user is logged in
        const allCourses = await getCollection('courses');
        const transformedCourses: Course[] = await Promise.all(
          allCourses.map(async (course: any) => {
            const teacherName = await getTeacherName(course.TeacherId);
            return {
              id: course.Id.toString(),
              title: course.Name,
              instructor: teacherName,
              duration: `${course.Duration} min`,
              level: course.Category || 'All Levels',
              price: parseFloat(course.Price.replace('$', '')) || 0,
              description: course.Description,
            };
          })
        );
        setCourses(transformedCourses);
        setLoading(false);
        return;
      }
      
      // Get all courses
      const allCourses = await getCollection('courses');
      
      // Get purchased courses for current user
      const purchasedCourses = await firestoreHelpers.queryDocuments('course_customer_crossrefs', [
        { field: 'customerId', operator: '==', value: currentUserId }
      ]);
      
      // Get purchased course IDs
      const purchasedCourseIds = purchasedCourses.map((purchase: any) => purchase.courseId);
      
      // Filter out purchased courses
      const unpurchasedCourses = allCourses.filter((course: any) => 
        !purchasedCourseIds.includes(course.Id)
      );
      
      // Transform Firestore data to match Course interface
      const transformedCourses: Course[] = await Promise.all(
        unpurchasedCourses.map(async (course: any) => {
          const teacherName = await getTeacherName(course.TeacherId);
          return {
            id: course.Id.toString(),
            title: course.Name,
            instructor: teacherName,
            duration: `${course.Duration} min`,
            level: course.Category || 'All Levels',
            price: parseFloat(course.Price.replace('$', '')) || 0,
            description: course.Description,
          };
        })
      );
      
      setCourses(transformedCourses);
      setUnpurchasedCourses(transformedCourses);
      setFilteredCourses(transformedCourses);
    } catch (error) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCourses();
    loadTeachers();
  }, []);

  // Reload courses when user changes
  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  // Filter courses and teachers when search query changes or tab changes
  useEffect(() => {
    if (selectedTab === 'course') {
      const filtered = filterCourses(unpurchasedCourses, searchQuery);
      setFilteredCourses(filtered);
    } else {
      const filtered = filterTeachers(teachers, searchQuery);
      setFilteredTeachers(filtered);
    }
  }, [searchQuery, unpurchasedCourses, teachers, selectedTab]);

  const handleBuyPress = (course: Course) => {
    navigation.navigate('Buy', { course });
  };

  const handleBookPress = (teacher: Teacher) => {
    // For now, show an alert. You can implement navigation to a booking screen later
    alert(`Booking private class with ${teacher.name}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ModernColors.primary.main} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={[ModernColors.background.primary, ModernColors.background.secondary]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Discover</Text>
            <Text style={styles.headerSubtitle}>Find your perfect yoga course</Text>
          </View>
          
          {/* Enhanced Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchIconContainer}>
              <Ionicons name="search" size={18} color={ModernColors.text.tertiary} />
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses and teachers..."
              placeholderTextColor={ModernColors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close" size={16} color={ModernColors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Modern Toggle Bar */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                selectedTab === 'course' && styles.toggleOptionSelected
              ]}
              onPress={() => setSelectedTab('course')}
            >
              <Ionicons 
                name="library" 
                size={16} 
                color={selectedTab === 'course' ? ModernColors.primary.main : ModernColors.text.secondary} 
                style={styles.toggleIcon}
              />
              <Text style={[
                styles.toggleText,
                selectedTab === 'course' && styles.toggleTextSelected
              ]}>
                Courses
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.toggleOption,
                selectedTab === 'teacher' && styles.toggleOptionSelected
              ]}
              onPress={() => setSelectedTab('teacher')}
            >
              <Ionicons 
                name="people" 
                size={16} 
                color={selectedTab === 'teacher' ? ModernColors.primary.main : ModernColors.text.secondary} 
                style={styles.toggleIcon}
              />
              <Text style={[
                styles.toggleText,
                selectedTab === 'teacher' && styles.toggleTextSelected
              ]}>
                Teachers
              </Text>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={16} color={ModernColors.error.main} />
              <Text style={styles.errorText}>Error: {error}</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === 'course' ? (
          // Course Tab Content
          filteredCourses.length > 0 ? (
            <View style={styles.cardsContainer}>
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  showBuyButton={true}
                  onBuyPress={handleBuyPress}
                />
              ))}
            </View>
          ) : searchQuery.length > 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="search" size={32} color={ModernColors.text.tertiary} />
              </View>
              <Text style={styles.emptyStateTitle}>No courses found</Text>
              <Text style={styles.emptyStateText}>Try adjusting your search terms</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="checkmark-circle" size={32} color={ModernColors.success.main} />
              </View>
              <Text style={styles.emptyStateTitle}>All caught up!</Text>
              <Text style={styles.emptyStateText}>You've purchased all available courses</Text>
            </View>
          )
        ) : (
          // Teacher Tab Content
          filteredTeachers.length > 0 ? (
            <View style={styles.cardsContainer}>
              {filteredTeachers.map((teacher) => (
                <TeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  onBookPress={handleBookPress}
                />
              ))}
            </View>
          ) : searchQuery.length > 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="search" size={32} color={ModernColors.text.tertiary} />
              </View>
              <Text style={styles.emptyStateTitle}>No teachers found</Text>
              <Text style={styles.emptyStateText}>Try adjusting your search terms</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="people" size={32} color={ModernColors.text.tertiary} />
              </View>
              <Text style={styles.emptyStateTitle}>No teachers available</Text>
              <Text style={styles.emptyStateText}>Check back later for new instructors</Text>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ModernColors.background.secondary,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
  },
  headerTop: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: ModernColors.text.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: ModernColors.text.secondary,
    fontWeight: '400',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernColors.background.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: ModernColors.border.light,
    height: 56,
    marginBottom: 20,
    shadowColor: ModernColors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIconContainer: {
    marginRight: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: ModernColors.background.tertiary,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  toggleOptionSelected: {
    backgroundColor: ModernColors.background.primary,
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleIcon: {
    marginRight: 4,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: ModernColors.text.secondary,
  },
  toggleTextSelected: {
    color: ModernColors.primary.main,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: ModernColors.text.primary,
    paddingVertical: 0,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ModernColors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  cardsContainer: {
    gap: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ModernColors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: ModernColors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: ModernColors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: ModernColors.text.secondary,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: ModernColors.error.main,
    fontWeight: '500',
  },
});

export default HomeScreen; 