import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {course.imageUrl ? (
          <Image source={{ uri: course.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🧘‍♀️</Text>
          </View>
        )}
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{course.level}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {course.title}
          </Text>
          <Text style={styles.duration}>{course.duration}</Text>
        </View>
        
        <View style={styles.instructorRow}>
          <Text style={styles.instructor} numberOfLines={1}>
            by {course.instructor}
          </Text>
          <Text style={styles.price}>${course.price}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {course.description}
        </Text>

        {showBuyButton && (
          <TouchableOpacity style={styles.buyButton} onPress={handleBuyPress}>
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
        )}

        {showLearnButton && (
          <TouchableOpacity style={styles.learnButton} onPress={handleLearnPress}>
            <Text style={styles.learnButtonText}>Learn</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 60,
  },
  levelBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 12,
  },
  instructorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructor: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
    marginRight: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  buyButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  learnButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  learnButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CourseCard; 