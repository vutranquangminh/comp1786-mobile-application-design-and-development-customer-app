import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ModernColors } from '../constants/Colors';

export interface Teacher {
  id: string;
  name: string;
  experience: string;
  dateStartedTeaching: string;
}

interface TeacherCardProps {
  teacher: Teacher;
  onBookPress: (teacher: Teacher) => void;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, onBookPress }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <LinearGradient
          colors={[ModernColors.primary.light, ModernColors.primary.main]}
          style={styles.avatar}
        >
          <Ionicons name="person" size={32} color={ModernColors.text.inverse} />
        </LinearGradient>
        <View style={styles.info}>
          <Text style={styles.name}>{teacher.name}</Text>
          <Text style={styles.experience}>{teacher.experience} years</Text>
        </View>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.detailValue}>{formatDate(teacher.dateStartedTeaching)}</Text>
      </View>

      <TouchableOpacity 
        style={styles.bookButton}
        onPress={() => onBookPress(teacher)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[ModernColors.primary.main, ModernColors.primary.dark]}
          style={styles.bookButtonGradient}
        >
          <Text style={styles.bookButtonText}>Book</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: ModernColors.background.card,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: ModernColors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: ModernColors.text.primary,
    marginBottom: 6,
  },
  experience: {
    fontSize: 14,
    color: ModernColors.text.secondary,
    fontWeight: '500',
  },
  details: {
    marginBottom: 24,
  },
  detailValue: {
    fontSize: 14,
    color: ModernColors.text.secondary,
    fontWeight: '500',
  },
  bookButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: ModernColors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TeacherCard; 