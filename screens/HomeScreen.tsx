import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CourseCard, { Course } from '../components/CourseCard';

// Mock data for unpurchased courses
const mockUnpurchasedCourses: Course[] = [
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
];

const HomeScreen: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(mockUnpurchasedCourses);

  const handleBuyPress = (course: Course) => {
    Alert.alert(
      'Purchase Course',
      `Would you like to purchase "${course.title}" for $${course.price}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Buy Now',
          onPress: () => {
            // Remove the course from the list after purchase
            setCourses(prevCourses => 
              prevCourses.filter(c => c.id !== course.id)
            );
            Alert.alert('Success', 'Course purchased successfully!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Courses</Text>
        <Text style={styles.subtitle}>
          Explore our collection of yoga courses
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {courses.length > 0 ? (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              showBuyButton={true}
              onBuyPress={handleBuyPress}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🎉</Text>
            <Text style={styles.emptyStateTitle}>All Caught Up!</Text>
            <Text style={styles.emptyStateText}>
              You've purchased all available courses. Check back soon for new content!
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});

export default HomeScreen; 