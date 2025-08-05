import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ModernColors } from '../constants/Colors';

export interface Course {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  level: string;
  price: number;
  description: string;
  imageUrl?: string;
}

interface CourseCardProps {
  course: Course;
  showBuyButton?: boolean;
  showLearnButton?: boolean;
  onBuyPress?: (course: Course) => void;
  onLearnPress?: (course: Course) => void;
  onPress?: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  showBuyButton = false,
  showLearnButton = false,
  onBuyPress,
  onLearnPress,
  onPress,
}) => {
  const handleBuyPress = () => {
    if (onBuyPress) {
      onBuyPress(course);
    }
  };

  const handleLearnPress = () => {
    if (onLearnPress) {
      onLearnPress(course);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress(course);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {course.imageUrl ? (
          <Image source={{ uri: course.imageUrl }} style={styles.image} />
        ) : (
          <LinearGradient
            colors={[ModernColors.primary.light, ModernColors.primary.main]}
            style={styles.imagePlaceholder}
          >
            <Ionicons name="flower" size={48} color={ModernColors.text.inverse} />
          </LinearGradient>
        )}
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{course.level}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        
        <Text style={styles.instructor} numberOfLines={1}>
          {course.instructor}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {course.description}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>${course.price}</Text>
          <Text style={styles.duration}>{course.duration}</Text>
          
          {showBuyButton && (
            <TouchableOpacity style={styles.buyButton} onPress={handleBuyPress}>
              <LinearGradient
                colors={[ModernColors.primary.main, ModernColors.primary.dark]}
                style={styles.buyButtonGradient}
              >
                <Text style={styles.buyButtonText}>Buy</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {showLearnButton && (
            <TouchableOpacity style={styles.learnButton} onPress={handleLearnPress}>
              <LinearGradient
                colors={[ModernColors.primary.main, ModernColors.primary.dark]}
                style={styles.learnButtonGradient}
              >
                <Text style={styles.learnButtonText}>Learn</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: ModernColors.background.card,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: ModernColors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: ModernColors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  levelText: {
    color: ModernColors.primary.main,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: ModernColors.text.primary,
    lineHeight: 24,
    marginBottom: 8,
  },
  instructor: {
    fontSize: 14,
    color: ModernColors.text.secondary,
    fontWeight: '500',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: ModernColors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: ModernColors.primary.main,
  },
  duration: {
    fontSize: 14,
    color: ModernColors.text.secondary,
    fontWeight: '500',
  },
  buyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buyButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buyButtonText: {
    color: ModernColors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
  learnButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  learnButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  learnButtonText: {
    color: ModernColors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CourseCard; 