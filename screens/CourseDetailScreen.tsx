import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFirestore } from '../hooks/useFirestore';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  CourseDetail: { courseId: string };
};

type CourseDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CourseDetail'>;

interface Props {
  navigation: CourseDetailScreenNavigationProp;
  route: { params: { courseId: string } };
}

interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  level: string;
  price: number;
  description: string;
  createdAt: any;
}

const CourseDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { courseId } = route.params;
  const { getCollection, loading, error } = useFirestore();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const courses = await getCollection('courses');
      const foundCourse = courses.find((c: Course) => c.id === courseId);
      if (foundCourse) {
        setCourse(foundCourse);
      }
    } catch (err) {
      console.error('Failed to load course:', err);
    }
  };

  const handleEnroll = () => {
    Alert.alert(
      'Enroll in Course',
      `Would you like to enroll in "${course?.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Enroll',
          onPress: () => {
            Alert.alert('Success', 'You have been enrolled in this course!');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#27ae60" />
          <Text style={styles.loadingText}>Loading course details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Course not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Course Info */}
        <View style={styles.courseContainer}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseInstructor}>by {course.instructor}</Text>
          
          <View style={styles.courseStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{course.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Level</Text>
              <Text style={styles.statValue}>{course.level}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Price</Text>
              <Text style={styles.statValue}>${course.price}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Course</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>

        {/* What You'll Learn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Learn</Text>
          <View style={styles.learningPoints}>
            <View style={styles.learningPoint}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.learningText}>Proper breathing techniques</Text>
            </View>
            <View style={styles.learningPoint}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.learningText}>Correct posture and alignment</Text>
            </View>
            <View style={styles.learningPoint}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.learningText}>Mindfulness and meditation</Text>
            </View>
            <View style={styles.learningPoint}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.learningText}>Stress relief techniques</Text>
            </View>
          </View>
        </View>

        {/* Instructor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Instructor</Text>
          <View style={styles.instructorCard}>
            <View style={styles.instructorAvatar}>
              <Text style={styles.instructorInitial}>
                {course.instructor.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.instructorInfo}>
              <Text style={styles.instructorName}>{course.instructor}</Text>
              <Text style={styles.instructorBio}>
                Certified yoga instructor with over 10 years of experience in teaching various yoga styles.
              </Text>
            </View>
          </View>
        </View>

        {/* Enroll Button */}
        <TouchableOpacity style={styles.enrollButton} onPress={handleEnroll}>
          <Text style={styles.enrollButtonText}>Enroll Now - ${course.price}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '500',
  },
  courseContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  courseInstructor: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginTop: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
  },
  learningPoints: {
    gap: 12,
  },
  learningPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#27ae60',
    marginRight: 8,
    marginTop: 2,
  },
  learningText: {
    fontSize: 16,
    color: '#34495e',
    flex: 1,
    lineHeight: 24,
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  instructorInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  instructorBio: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  enrollButton: {
    backgroundColor: '#27ae60',
    marginHorizontal: 24,
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  enrollButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
  },
});

export default CourseDetailScreen; 