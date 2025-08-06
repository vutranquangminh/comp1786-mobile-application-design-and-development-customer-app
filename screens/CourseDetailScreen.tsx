import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestoreHelpers } from '../config/firebase';
import { ModernColors } from '../constants/Colors';
import { useFirestore } from '../hooks/useFirestore';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  CourseDetail: { courseId: string; course: any };
  Buy: { course: any };
};

type CourseDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CourseDetail'>;

interface Props {
  navigation: CourseDetailScreenNavigationProp;
  route: { params: { courseId: string; course: any } };
}

interface Teacher {
  id: string;
  name: string;
  experience: string;
  dateStartedTeaching: string;
  bio?: string;
  specialties?: string[];
  certifications?: string[];
}

const CourseDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { courseId, course } = route.params;
  const { getCollection, loading, error } = useFirestore();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);

  useEffect(() => {
    loadCourseAndTeacherData();
  }, [courseId]);

  const loadCourseAndTeacherData = async () => {
    try {
      setLoadingTeacher(true);
      
      // Load detailed course data from Firestore
      const courses = await firestoreHelpers.queryDocuments('courses', [
        { field: 'Id', operator: '==', value: parseInt(courseId) }
      ]);
      
      if (courses.length > 0) {
        const courseInfo = courses[0];
        setCourseData(courseInfo);
        
        // Load teacher data
        if (courseInfo.TeacherId) {
          const teachers = await firestoreHelpers.queryDocuments('teachers', [
            { field: 'Id', operator: '==', value: courseInfo.TeacherId }
          ]);
          
          if (teachers.length > 0) {
            const teacherInfo = teachers[0];
            setTeacher({
              id: teacherInfo.Id.toString(),
              name: teacherInfo.Name,
              experience: teacherInfo.Experience,
              dateStartedTeaching: teacherInfo.DateStartedTeaching,
              bio: teacherInfo.Bio || 'Experienced yoga instructor with a passion for helping students achieve their wellness goals.',
              specialties: teacherInfo.Specialties ? teacherInfo.Specialties.split(', ') : ['Vinyasa', 'Hatha', 'Meditation'],
              certifications: teacherInfo.Certifications ? teacherInfo.Certifications.split(', ') : ['RYT-200', 'Yoga Alliance Certified']
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading course and teacher data:', error);
    } finally {
      setLoadingTeacher(false);
    }
  };

  const handleBuyPress = () => {
    navigation.navigate('Buy', { course });
  };

  if (loading || loadingTeacher) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ModernColors.primary.main} />
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Back Button */}
        <LinearGradient
          colors={[ModernColors.background.primary, ModernColors.background.secondary]}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={ModernColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Course Details</Text>
          <View style={styles.headerSpacer} />
        </LinearGradient>

        {/* Course Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[ModernColors.primary.light, ModernColors.primary.main]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <Ionicons name="flower" size={48} color={ModernColors.text.inverse} />
              </View>
              <Text style={styles.courseTitle}>{course.title}</Text>
              <Text style={styles.courseInstructor}>by {course.instructor}</Text>
              <View style={styles.courseMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time" size={16} color={ModernColors.text.inverse} />
                  <Text style={styles.metaText}>{course.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="flower" size={16} color={ModernColors.text.inverse} />
                  <Text style={styles.metaText}>{course.level}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="card" size={16} color={ModernColors.text.inverse} />
                  <Text style={styles.metaText}>${course.price}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Course Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Course</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>

        {/* What You'll Learn */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You'll Learn</Text>
          <View style={styles.learningPoints}>
            <View style={styles.learningPoint}>
              <Ionicons name="checkmark-circle" size={20} color={ModernColors.success.main} />
              <Text style={styles.learningText}>Proper breathing techniques and mindfulness</Text>
            </View>
            <View style={styles.learningPoint}>
              <Ionicons name="checkmark-circle" size={20} color={ModernColors.success.main} />
              <Text style={styles.learningText}>Correct posture and alignment for optimal practice</Text>
            </View>
            <View style={styles.learningPoint}>
              <Ionicons name="checkmark-circle" size={20} color={ModernColors.success.main} />
              <Text style={styles.learningText}>Stress relief and relaxation techniques</Text>
            </View>
            <View style={styles.learningPoint}>
              <Ionicons name="checkmark-circle" size={20} color={ModernColors.success.main} />
              <Text style={styles.learningText}>Building strength and flexibility</Text>
            </View>
          </View>
        </View>

        

        {/* Instructor Section */}
        {teacher && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Instructor</Text>
            <View style={styles.instructorCard}>
              <View style={styles.instructorAvatar}>
                <Text style={styles.instructorInitial}>
                  {teacher.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.instructorInfo}>
                <Text style={styles.instructorName}>{teacher.name}</Text>
                <Text style={styles.instructorExperience}>{teacher.experience}</Text>
              </View>
            </View>
            
            <Text style={styles.instructorBio}>{teacher.bio}</Text>
            
            {teacher.specialties && (
              <View style={styles.specialtiesContainer}>
                <Text style={styles.specialtiesTitle}>Specialties:</Text>
                <View style={styles.specialtiesList}>
                  {teacher.specialties.map((specialty, index) => (
                    <View key={index} style={styles.specialtyTag}>
                      <Text style={styles.specialtyText}>{specialty}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {teacher.certifications && (
              <View style={styles.certificationsContainer}>
                <Text style={styles.certificationsTitle}>Certifications:</Text>
                <View style={styles.certificationsList}>
                  {teacher.certifications.map((cert, index) => (
                    <View key={index} style={styles.certificationTag}>
                      <Ionicons name="checkmark-circle" size={16} color={ModernColors.success.main} />
                      <Text style={styles.certificationText}>{cert}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Spacer for bottom button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Buy Button - Fixed at Bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.buyButton} onPress={handleBuyPress}>
          <LinearGradient
            colors={[ModernColors.primary.main, ModernColors.primary.dark]}
            style={styles.buyButtonGradient}
          >
            <Ionicons name="card" size={20} color={ModernColors.text.inverse} />
            <Text style={styles.buyButtonText}>Buy Course - ${course.price}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ModernColors.background.secondary,
  },
  scrollView: {
    flex: 1,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: ModernColors.error.main,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: ModernColors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  heroSection: {
    margin: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  heroGradient: {
    padding: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: ModernColors.text.inverse,
    textAlign: 'center',
    marginBottom: 8,
  },
  courseInstructor: {
    fontSize: 16,
    color: ModernColors.text.inverse,
    opacity: 0.9,
    marginBottom: 20,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: ModernColors.text.inverse,
    fontWeight: '500',
  },
  section: {
    backgroundColor: ModernColors.background.primary,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: ModernColors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ModernColors.text.primary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: ModernColors.text.secondary,
    lineHeight: 24,
  },
  learningPoints: {
    gap: 12,
  },
  learningPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  learningText: {
    fontSize: 16,
    color: ModernColors.text.secondary,
    flex: 1,
    lineHeight: 24,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ModernColors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: ModernColors.text.tertiary,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: ModernColors.text.primary,
    fontWeight: '500',
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: ModernColors.background.tertiary,
    padding: 16,
    borderRadius: 12,
  },
  instructorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ModernColors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  instructorInitial: {
    fontSize: 28,
    fontWeight: '700',
    color: ModernColors.text.inverse,
  },
  instructorInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  instructorName: {
    fontSize: 20,
    fontWeight: '600',
    color: ModernColors.text.primary,
    marginBottom: 4,
  },
  instructorExperience: {
    fontSize: 14,
    color: ModernColors.primary.main,
    fontWeight: '500',
    marginBottom: 8,
  },
  instructorBio: {
    fontSize: 14,
    color: ModernColors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  specialtiesContainer: {
    marginBottom: 12,
  },
  specialtiesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ModernColors.text.primary,
    marginBottom: 8,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    backgroundColor: ModernColors.primary.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specialtyText: {
    fontSize: 12,
    color: ModernColors.primary.main,
    fontWeight: '500',
  },
  certificationsContainer: {
    marginBottom: 8,
  },
  certificationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: ModernColors.text.primary,
    marginBottom: 8,
  },
  certificationsList: {
    gap: 8,
  },
  certificationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  certificationText: {
    fontSize: 14,
    color: ModernColors.text.secondary,
  },
  bottomSpacer: {
    height: 100,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: ModernColors.background.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: ModernColors.border.light,
    shadowColor: ModernColors.shadow.medium,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  buyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buyButtonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buyButtonText: {
    color: ModernColors.text.inverse,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default CourseDetailScreen; 