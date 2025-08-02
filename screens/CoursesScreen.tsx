import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CourseCard, { Course } from '../components/CourseCard';

// Mock data for all available courses
const mockAllCourses: Course[] = [
  {
    id: '1',
    title: 'Beginner Yoga Flow',
    instructor: 'Sarah Johnson',
    duration: '45 min',
    level: 'Beginner',
    price: 29.99,
    description: 'Perfect for beginners looking to start their yoga journey with gentle poses and breathing techniques.',
  },
  {
    id: '2',
    title: 'Power Vinyasa Flow',
    instructor: 'Michael Chen',
    duration: '60 min',
    level: 'Intermediate',
    price: 39.99,
    description: 'Dynamic flow sequence that builds strength and flexibility through continuous movement.',
  },
  {
    id: '3',
    title: 'Restorative Yoga',
    instructor: 'Emma Davis',
    duration: '30 min',
    level: 'All Levels',
    price: 24.99,
    description: 'Deep relaxation practice using props to support the body in gentle, healing poses.',
  },
  {
    id: '4',
    title: 'Advanced Ashtanga',
    instructor: 'David Rodriguez',
    duration: '90 min',
    level: 'Advanced',
    price: 49.99,
    description: 'Traditional Ashtanga sequence for experienced practitioners seeking a challenging practice.',
  },
  {
    id: '5',
    title: 'Yin Yoga Deep Stretch',
    instructor: 'Lisa Wang',
    duration: '75 min',
    level: 'Intermediate',
    price: 34.99,
    description: 'Long-held poses that target deep connective tissues and promote flexibility.',
  },
  {
    id: '6',
    title: 'Morning Flow',
    instructor: 'Alex Thompson',
    duration: '20 min',
    level: 'Beginner',
    price: 19.99,
    description: 'Quick morning routine to energize your day with sun salutations and gentle stretches.',
  },
  {
    id: '7',
    title: 'Meditation & Mindfulness',
    instructor: 'Priya Patel',
    duration: '15 min',
    level: 'All Levels',
    price: 14.99,
    description: 'Guided meditation practice to cultivate mindfulness and inner peace.',
  },
  {
    id: '8',
    title: 'Yoga for Athletes',
    instructor: 'Chris Martinez',
    duration: '50 min',
    level: 'Intermediate',
    price: 44.99,
    description: 'Specialized sequences designed to complement athletic training and improve performance.',
  },
];

const CoursesScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Courses</Text>
        <Text style={styles.subtitle}>
          Browse our complete collection of yoga courses
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mockAllCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            showBuyButton={false}
          />
        ))}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
});

export default CoursesScreen; 