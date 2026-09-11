/**
 * RootNavigator
 * Controls high-level navigation routing based on current selected role.
 * Responsive for both mobile and desktop web viewports.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { AuthStackNavigator } from './AuthStackNavigator';
import { OfficialStackNavigator } from './OfficialStackNavigator';
import { InspectorStackNavigator } from './InspectorStackNavigator';
import { NgoTabNavigator } from './NgoTabNavigator';
import { colors } from '../theme/colors';

export const RootNavigator: React.FC = () => {
  const { currentRole, isAuthenticated } = useAuth();

  const renderContent = () => {
    if (!isAuthenticated || !currentRole) {
      return <AuthStackNavigator key="auth-stack" />;
    }

    switch (currentRole) {
      case 'official':
        return <OfficialStackNavigator key="official-stack" />;
      case 'inspector':
        return <InspectorStackNavigator key="inspector-stack" />;
      case 'ngo':
        return <NgoTabNavigator key="ngo-stack" />;
      default:
        return <AuthStackNavigator key="auth-stack-fallback" />;
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
