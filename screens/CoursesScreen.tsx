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

const CoursesScreen: React.FC = () => {
  const { getCollection, loading, error } = useFirestore();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter courses when search query changes
  useEffect(() => {
    const filtered = filterCourses(courses, searchQuery);
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  if (loading && courses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Courses</Text>
        <Text style={styles.subtitle}>
          Courses you have purchased
        </Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your purchased courses..."
            placeholderTextColor="#999"
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
              onPress={(course) => {
                navigation.navigate('CourseDetail', { courseId: course.id });
              }}
            />
          ))
        ) : searchQuery.length > 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No courses match your search</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search terms</Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No purchased courses</Text>
            <Text style={styles.emptySubtext}>Purchase courses from the Home tab to see them here</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#2c3e50',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    color: '#e74c3c',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },

});

export default CoursesScreen; 