/**
 * RootNavigator
 * Controls high-level navigation routing based on current selected role.
 * Responsive for both mobile and desktop web viewports.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';
import { OfficialStackNavigator } from './OfficialStackNavigator';
import { InspectorStackNavigator } from './InspectorStackNavigator';
import { NgoTabNavigator } from './NgoTabNavigator';
import { colors } from '../theme/colors';

export const RootNavigator: React.FC = () => {
  const { currentRole } = useAuth();

  const renderContent = () => {
    switch (currentRole) {
      case 'official':
        return <OfficialStackNavigator />;
      case 'inspector':
        return <InspectorStackNavigator />;
      case 'ngo':
        return <NgoTabNavigator />;
      case null:
      default:
        return <RoleSelectionScreen />;
    }
  };

  return (
    <NavigationContainer>
      <View style={styles.container}>{renderContent()}</View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral.background,
  },
});
