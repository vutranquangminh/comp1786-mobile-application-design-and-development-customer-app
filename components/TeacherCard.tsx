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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <LinearGradient
        colors={[ModernColors.background.primary, ModernColors.background.secondary]}
        style={styles.cardGradient}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[ModernColors.primary.light, ModernColors.primary.main]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{getInitials(teacher.name)}</Text>
            </LinearGradient>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
            </View>
          </View>
          
          <View style={styles.teacherInfo}>
            <Text style={styles.name}>{teacher.name}</Text>
            <View style={styles.experienceContainer}>
              <Ionicons name="star" size={16} color={ModernColors.primary.main} />
              <Text style={styles.experience}>{teacher.experience} years experience</Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="calendar" size={16} color={ModernColors.text.tertiary} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Teaching Since</Text>
              <Text style={styles.statValue}>{formatDate(teacher.dateStartedTeaching)}</Text>
            </View>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Ionicons name="flower" size={16} color={ModernColors.text.tertiary} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Specialties</Text>
              <Text style={styles.statValue}>Vinyasa, Hatha, Meditation</Text>
            </View>
          </View>
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star} 
                  name="star" 
                  size={14} 
                  color={star <= 4 ? ModernColors.primary.main : ModernColors.text.tertiary} 
                />
              ))}
            </View>
            <Text style={styles.ratingText}>4.8 (24 reviews)</Text>
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
              <Ionicons name="calendar" size={18} color={ModernColors.text.inverse} />
              <Text style={styles.bookButtonText}>Book Session</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: ModernColors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: ModernColors.text.inverse,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ModernColors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ModernColors.background.primary,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ModernColors.success.main,
  },
  teacherInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: ModernColors.text.primary,
    marginBottom: 8,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  experience: {
    fontSize: 14,
    color: ModernColors.text.secondary,
    fontWeight: '600',
  },
  statsContainer: {
    marginBottom: 20,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ModernColors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: ModernColors.text.tertiary,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    color: ModernColors.text.primary,
    fontWeight: '600',
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flex: 1,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookButtonText: {
    color: ModernColors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TeacherCard; 