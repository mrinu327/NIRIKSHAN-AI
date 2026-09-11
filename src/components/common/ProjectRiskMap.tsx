import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { RiskBadge } from './RiskBadge';
import { Project, RiskLevel } from '@nirikshan/shared-types';

interface ProjectRiskMapProps {
  projects: Project[];
  onSelectProject?: (project: Project) => void;
}

export const ProjectRiskMap: React.FC<ProjectRiskMapProps> = ({ projects, onSelectProject }) => {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects.length > 0 ? projects[0].id : ''
  );
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const filteredProjects = projects.filter((p) => {
    if (activeFilter === 'ALL') return true;
    return p.riskLevel === activeFilter;
  });

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  // Map latitude/longitude to relative percentage positions on canvas
  // Approx bounds for India: Lat 8 to 36 N, Long 68 to 96 E
  const getPinCoordinates = (p: Project) => {
    const latMin = 8.0;
    const latMax = 35.0;
    const lonMin = 69.0;
    const lonMax = 92.0;

    const topPercent = Math.max(
      10,
      Math.min(85, 100 - ((p.latitude - latMin) / (latMax - latMin)) * 80 - 10)
    );
    const leftPercent = Math.max(
      10,
      Math.min(88, ((p.longitude - lonMin) / (lonMax - lonMin)) * 80 + 10)
    );

    return { top: `${topPercent}%`, left: `${leftPercent}%` };
  };

  const getMarkerColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.CRITICAL:
        return '#DC2626';
      case RiskLevel.HIGH:
        return '#EA580C';
      case RiskLevel.MEDIUM:
        return '#D97706';
      case RiskLevel.LOW:
      default:
        return '#16A34A';
    }
  };

  const handleOpenDetails = (projectId: string) => {
    router.push({
      pathname: '/(official)/project-details',
      params: { id: projectId },
    });
  };

  return (
    <View style={styles.wrapper}>
      {/* Simulation Banner & Filter Bar */}
      <View style={styles.topControlBar}>
        <View style={styles.simBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.simBadgeText}>DEMO GIS TELEMETRY OVERVIEW</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[styles.chip, activeFilter === lvl && styles.chipActive]}
              onPress={() => setActiveFilter(lvl)}
            >
              <Text style={[styles.chipText, activeFilter === lvl && styles.chipTextActive]}>
                {lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Interactive Map Surface */}
      <View style={styles.mapCanvas}>
        {/* Background Grid Lines & Regional Watermark */}
        <View style={styles.gridOverlay}>
          <View style={styles.gridLineH1} />
          <View style={styles.gridLineH2} />
          <View style={styles.gridLineV1} />
          <View style={styles.gridLineV2} />
          <Text style={styles.watermarkText}>NATIONAL MONITORING GRID • DoSJE</Text>
        </View>

        {/* Map Pins */}
        {filteredProjects.map((p) => {
          const coords = getPinCoordinates(p);
          const isSelected = p.id === selectedProjectId;
          const pinColor = getMarkerColor(p.riskLevel);

          return (
            <TouchableOpacity
              key={p.id}
              activeOpacity={0.8}
              style={[
                styles.markerWrapper,
                { top: coords.top as any, left: coords.left as any },
              ]}
              onPress={() => {
                setSelectedProjectId(p.id);
                if (onSelectProject) onSelectProject(p);
              }}
            >
              <View
                style={[
                  styles.markerPin,
                  { backgroundColor: pinColor },
                  isSelected && styles.markerPinSelected,
                ]}
              >
                <Text style={styles.markerScoreText}>{p.riskScore}</Text>
              </View>
              {isSelected && (
                <View style={styles.selectedMarkerTooltip}>
                  <Text numberOfLines={1} style={styles.tooltipText}>
                    {p.name.replace('Demo ', '')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Legend */}
        <View style={styles.legendBox}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
            <Text style={styles.legendText}>Critical</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EA580C' }]} />
            <Text style={styles.legendText}>High</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#16A34A' }]} />
            <Text style={styles.legendText}>Low</Text>
          </View>
        </View>
      </View>

      {/* Selected Project Interactive Popover Card */}
      {selectedProject && (
        <View style={styles.popoverCard}>
          <View style={styles.popoverTop}>
            <View style={styles.popoverTitleWrap}>
              <Text style={styles.popoverName} numberOfLines={1}>
                {selectedProject.name}
              </Text>
              <Text style={styles.popoverMeta}>
                📍 {selectedProject.district}, {selectedProject.state} • {selectedProject.type}
              </Text>
            </View>
            <RiskBadge
              level={selectedProject.riskLevel}
              score={selectedProject.riskScore}
              showScore={true}
            />
          </View>

          <View style={styles.popoverMetricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Beneficiaries</Text>
              <Text style={styles.metricVal}>👥 {selectedProject.beneficiaryCount}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Capacity</Text>
              <Text style={styles.metricVal}>🏛️ {selectedProject.capacity} Beds</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Status</Text>
              <Text style={styles.metricVal}>
                {selectedProject.status === 'UNDER_INVESTIGATION' ? '⚠️ Under Audit' : '✅ Active'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.inspectBtn}
            activeOpacity={0.85}
            onPress={() => handleOpenDetails(selectedProject.id)}
          >
            <Text style={styles.inspectBtnText}>Open 7-Tab Project Details →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  topControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
    flexWrap: 'wrap',
    gap: 6,
  },
  simBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
    marginRight: 6,
  },
  simBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 4,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.white,
  },
  mapCanvas: {
    height: 240,
    backgroundColor: '#E6EEF5',
    borderRadius: borderRadius.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  gridLineH1: {
    position: 'absolute',
    top: '33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  gridLineH2: {
    position: 'absolute',
    top: '66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  gridLineV1: {
    position: 'absolute',
    left: '33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#CBD5E1',
  },
  gridLineV2: {
    position: 'absolute',
    left: '66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#CBD5E1',
  },
  watermarkText: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  markerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  markerPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.md,
  },
  markerPinSelected: {
    transform: [{ scale: 1.25 }],
    borderColor: '#1E293B',
    borderWidth: 2.5,
  },
  markerScoreText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '800',
  },
  selectedMarkerTooltip: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: 2,
    maxWidth: 110,
  },
  tooltipText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '600',
  },
  legendBox: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.textMuted,
  },
  popoverCard: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  popoverTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  popoverTitleWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  popoverName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  popoverMeta: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 2,
  },
  popoverMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs + 2,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9,
    color: colors.textLight,
  },
  metricVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    marginTop: 1,
  },
  inspectBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs + 4,
    alignItems: 'center',
  },
  inspectBtnText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
  },
});
