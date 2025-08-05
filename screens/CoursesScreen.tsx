import { StackNavigationProp } from '@react-navigation/stack';
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
import { firestoreHelpers } from '../config/firebase';
import { useAuth, useFirestore } from '../hooks/useFirestore';

type RootStackParamList = {
  CourseDetail: { courseId: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: NavigationProp;
}

const CoursesScreen: React.FC<Props> = ({ navigation }) => {
  const { getCollection, loading, error } = useFirestore();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseType, setCourseType] = useState<'public' | 'private'>('public');

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

  // Function to filter courses based on search query and course type
  const filterCourses = (courses: Course[], query: string) => {
    let filteredCourses = courses;
    
    // Filter by course type (public/private)
    if (courseType === 'public') {
      // Show public courses (group classes)
      filteredCourses = courses.filter(course => 
        !course.title.toLowerCase().includes('private')
      );
    } else if (courseType === 'private') {
      // Show private courses (one-on-one classes)
      filteredCourses = courses.filter(course => 
        course.title.toLowerCase().includes('private') ||
        course.instructor.toLowerCase().includes('private')
      );
    }
    
    // Filter by search query
    if (!query.trim()) {
      return filteredCourses;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return filteredCourses.filter(course => 
      course.title.toLowerCase().includes(lowercaseQuery) ||
      course.instructor.toLowerCase().includes(lowercaseQuery) ||
      course.description.toLowerCase().includes(lowercaseQuery) ||
      course.level.toLowerCase().includes(lowercaseQuery)
    );
  };

  const loadCourses = async () => {
    try {
      // Get current user ID from auth state
      const currentUserId = user?.Id;
      
      if (!currentUserId) {
        setCourses([]);
        return;
      }
      
      // Get purchased courses for current user
      const purchasedCourses = await firestoreHelpers.queryDocuments('course_customer_crossrefs', [
        { field: 'customerId', operator: '==', value: currentUserId }
      ]);
      
      if (purchasedCourses.length === 0) {
        setCourses([]);
        return;
      }
      
      // Get purchased course IDs
      const purchasedCourseIds = purchasedCourses.map((purchase: any) => purchase.courseId);
      
      // Get all courses and filter to only purchased ones
      const allCourses = await getCollection('courses');
      
      const userPurchasedCourses = allCourses.filter((course: any) => 
        purchasedCourseIds.includes(course.Id)
      );
      
      // Transform Firestore data to match Course interface
      const transformedCourses: Course[] = await Promise.all(
        userPurchasedCourses.map(async (course: any) => {
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
      setFilteredCourses(transformedCourses);
    } catch (err) {
      // Handle error silently
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Reload courses when user changes
  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  // Filter courses when search query changes or course type changes
  useEffect(() => {
    const filtered = filterCourses(courses, searchQuery);
    setFilteredCourses(filtered);
  }, [searchQuery, courses, courseType]);

  if (loading && courses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Courses</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your purchased courses..."
            placeholderTextColor="#94a3b8"
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
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Course Type Toggle */}
        <View style={styles.courseTypeToggleContainer}>
          <TouchableOpacity
            style={[
              styles.courseTypeToggleOption,
              courseType === 'public' && styles.courseTypeToggleOptionSelected
            ]}
            onPress={() => setCourseType('public')}
          >
            <Text style={[
              styles.courseTypeToggleText,
              courseType === 'public' && styles.courseTypeToggleTextSelected
            ]}>
              Public Class
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.courseTypeToggleOption,
              courseType === 'private' && styles.courseTypeToggleOptionSelected
            ]}
            onPress={() => setCourseType('private')}
          >
            <Text style={[
              styles.courseTypeToggleText,
              courseType === 'private' && styles.courseTypeToggleTextSelected
            ]}>
              Private Class
            </Text>
          </TouchableOpacity>
        </View>
        {error && (
          <Text style={styles.errorText}>Error: {error}</Text>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              showBuyButton={false}
              showLearnButton={true}
              onLearnPress={(course) => {
                // Navigate to course learning interface
                navigation.navigate('CourseDetail', { courseId: course.id });
              }}
              onPress={(course) => {
                navigation.navigate('CourseDetail', { courseId: course.id });
              }}
            />
          ))
        ) : searchQuery.length > 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🔍</Text>
            <Text style={styles.emptyStateTitle}>No Results Found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search terms or browse all available courses.
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📚</Text>
            <Text style={styles.emptyStateTitle}>No Purchased Courses</Text>
            <Text style={styles.emptyStateText}>
              Purchase courses from the Home tab to see them here
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 48,
    marginBottom: 16,
  },
  courseTypeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  courseTypeToggleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseTypeToggleOptionSelected: {
    backgroundColor: '#ffffff',
  },
  courseTypeToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  courseTypeToggleTextSelected: {
    color: '#8b5cf6',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 0,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
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
    color: '#64748b',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default CoursesScreen; 