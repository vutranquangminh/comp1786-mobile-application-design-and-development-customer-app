import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth, useFirestore } from '../hooks/useFirestore';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  price: number;
  createdAt: any;
}

export default function FirestoreExample() {
  const { 
    loading, 
    error, 
    getCollection, 
    addDocument, 
    updateDocument, 
    deleteDocument,
    queryDocuments 
  } = useFirestore();
  
  const { user, signIn, signOut } = useAuth();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    price: ''
  });

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await getCollection('courses');
      setCourses(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load courses');
    }
  };

  const addCourse = async () => {
    if (!newCourse.title || !newCourse.description || !newCourse.instructor || !newCourse.duration || !newCourse.price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const courseData = {
        ...newCourse,
        price: parseFloat(newCourse.price),
        createdAt: new Date(),
      };
      
      await addDocument('courses', courseData);
      setNewCourse({ title: '', description: '', instructor: '', duration: '', price: '' });
      loadCourses(); // Reload the list
      Alert.alert('Success', 'Course added successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to add course');
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      await deleteDocument('courses', courseId);
      loadCourses(); // Reload the list
      Alert.alert('Success', 'Course deleted successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to delete course');
    }
  };

  const searchCourses = async () => {
    try {
      // Example: Search for courses by instructor
      const filters = [
        { field: 'instructor', operator: '==', value: 'John Doe' }
      ];
      const data = await queryDocuments('courses', filters, 'createdAt', 10);
      setCourses(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to search courses');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Firestore Example</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {/* Add Course Form */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Add New Course</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Course Title"
          value={newCourse.title}
          onChangeText={(text) => setNewCourse({...newCourse, title: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={newCourse.description}
          onChangeText={(text) => setNewCourse({...newCourse, description: text})}
          multiline
        />
        
        <TextInput
          style={styles.input}
          placeholder="Instructor"
          value={newCourse.instructor}
          onChangeText={(text) => setNewCourse({...newCourse, instructor: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Duration (e.g., 60 minutes)"
          value={newCourse.duration}
          onChangeText={(text) => setNewCourse({...newCourse, duration: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Price"
          value={newCourse.price}
          onChangeText={(text) => setNewCourse({...newCourse, price: text})}
          keyboardType="numeric"
        />
        
        <TouchableOpacity style={styles.button} onPress={addCourse}>
          <Text style={styles.buttonText}>Add Course</Text>
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={loadCourses}>
          <Text style={styles.buttonText}>Refresh Courses</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={searchCourses}>
          <Text style={styles.buttonText}>Search Courses</Text>
        </TouchableOpacity>
      </View>

      {/* Courses List */}
      <View style={styles.coursesContainer}>
        <Text style={styles.sectionTitle}>Courses ({courses.length})</Text>
        
        {courses.map((course) => (
          <View key={course.id} style={styles.courseItem}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.courseDescription}>{course.description}</Text>
            <Text style={styles.courseDetails}>
              Instructor: {course.instructor} | Duration: {course.duration} | Price: ${course.price}
            </Text>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => deleteCourse(course.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 5,
    flex: 0.48,
    alignItems: 'center',
  },
  coursesContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 15,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  courseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  courseDetails: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 