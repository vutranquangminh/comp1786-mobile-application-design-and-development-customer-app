import { useColorScheme } from 'react-native';
import { View, ViewProps } from 'react-native';
import { Colors } from '../constants/Colors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  useSafeArea?: boolean;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? darkColor : lightColor;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

// Modern themed view with enhanced styling
export function ModernThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  useSafeArea = false,
  ...otherProps 
}: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? darkColor : lightColor;

  return (
    <View 
      style={[
        { 
          backgroundColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }, 
        style
      ]} 
      {...otherProps} 
    />
  );
}
