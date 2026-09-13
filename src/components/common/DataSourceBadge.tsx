/**
 * DataSourceBadge
 * SIH26095 | MoSJE Nirikshan AI
 *
 * Visual provenance component to clearly communicate data authenticity.
 * Ensures zero ambiguity between authentic Government of India data and prototype demo records.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DataSourceMetadata } from '../../types/master';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';

interface DataSourceBadgeProps {
  dataSource?: DataSourceMetadata;
  size?: 'sm' | 'md';
  showDetails?: boolean;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  dataSource,
  size = 'sm',
  showDetails = false,
}) => {
  if (!dataSource) return null;

  const isOfficial = dataSource.type === 'OFFICIAL' && dataSource.verificationStatus === 'VERIFIED';
  const isPublic = dataSource.type === 'PUBLIC' && dataSource.verificationStatus === 'VERIFIED';
  const isDemo = dataSource.type === 'DEMO' || dataSource.verificationStatus === 'DEMO';
  const isSimulated = dataSource.type === 'SIMULATED';

  let badgeColor: string = colors.text.muted;
  let bgColor: string = '#F1F5F9';
  let borderColor: string = '#CBD5E1';
  let iconName: keyof typeof Ionicons.glyphMap = 'help-circle-outline';
  let label = 'UNVERIFIED';

  if (isOfficial) {
    badgeColor = colors.status.normal; // #1E8E5A
    bgColor = 'rgba(30, 142, 90, 0.1)';
    borderColor = 'rgba(30, 142, 90, 0.3)';
    iconName = 'shield-checkmark';
    label = 'OFFICIAL • VERIFIED';
  } else if (isPublic) {
    badgeColor = colors.brand.primary; // #2A5CE0
    bgColor = 'rgba(42, 92, 224, 0.1)';
    borderColor = 'rgba(42, 92, 224, 0.3)';
    iconName = 'globe-outline';
    label = 'PUBLIC • VERIFIED';
  } else if (isDemo) {
    badgeColor = colors.status.warning; // #D98C1E
    bgColor = 'rgba(217, 140, 30, 0.1)';
    borderColor = 'rgba(217, 140, 30, 0.3)';
    iconName = 'flask-outline';
    label = 'DEMO DATA';
  } else if (isSimulated) {
    badgeColor = '#7C3AED';
    bgColor = 'rgba(124, 58, 237, 0.1)';
    borderColor = 'rgba(124, 58, 237, 0.3)';
    iconName = 'hardware-chip-outline';
    label = 'SIMULATED';
  }

  const isSmall = size === 'sm';

  const handleOpenSource = () => {
    if (dataSource.sourceUrl) {
      Linking.openURL(dataSource.sourceUrl).catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: bgColor,
            borderColor: borderColor,
            paddingVertical: isSmall ? 2 : 4,
            paddingHorizontal: isSmall ? spacing.xs + 2 : spacing.sm,
          },
        ]}
      >
        <Ionicons name={iconName} size={isSmall ? 11 : 14} color={badgeColor} style={styles.icon} />
        <Text
          style={[
            styles.label,
            {
              color: badgeColor,
              fontSize: isSmall ? 10 : 12,
            },
          ]}
        >
          {label}
        </Text>
      </View>

      {showDetails && (
        <View style={styles.detailsContainer}>
          {dataSource.sourceName ? (
            <Text style={styles.sourceName}>Source: {dataSource.sourceName}</Text>
          ) : null}
          {dataSource.sourceUrl ? (
            <TouchableOpacity onPress={handleOpenSource} activeOpacity={0.7}>
              <Text style={styles.sourceUrl} numberOfLines={1}>
                {dataSource.sourceUrl} ↗
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailsContainer: {
    marginTop: 4,
  },
  sourceName: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  sourceUrl: {
    fontSize: 11,
    color: colors.brand.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: 1,
  },
});
