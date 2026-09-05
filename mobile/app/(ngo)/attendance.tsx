import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';

export default function NGOAttendance() {
  const [headcount, setHeadcount] = useState('92');
  const [staffCount, setStaffCount] = useState('14');
  const [mealProvided, setMealProvided] = useState('92');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    Alert.alert(
      'Attendance Submitted',
      `Reported: ${headcount} beneficiaries, ${staffCount} staff. Stamped with timestamp and server hash.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="DAILY ATTENDANCE" subtitle="DoSJE Scheme Beneficiary Ingestion" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.guidelineCard}>
          <Text style={styles.guidelineTitle}>⚠️ Legal Declaration Notice</Text>
          <Text style={styles.guidelineText}>
            Submitting inflated headcounts triggers automated computer vision verification and mandatory surprise field inspections.
          </Text>
        </View>

        <Card title="Submit Today's Headcount" subtitle="Date: Today (Active Operating Cycle)">
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Active Beneficiaries Present Today</Text>
            <TextInput
              style={styles.input}
              value={headcount}
              onChangeText={setHeadcount}
              keyboardType="number-pad"
            />
            <Text style={styles.inputHint}>Sanctioned capacity: 100 maximum</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Staff & Caregivers on Duty</Text>
            <TextInput
              style={styles.input}
              value={staffCount}
              onChangeText={setStaffCount}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Lunch / Midday Meals Served</Text>
            <TextInput
              style={styles.input}
              value={mealProvided}
              onChangeText={setMealProvided}
              keyboardType="number-pad"
            />
          </View>

          <Button
            title={submitted ? "Update Submitted Attendance" : "Submit Headcount to DoSJE"}
            onPress={handleSubmit}
            style={styles.submitBtn}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    padding: spacing.base,
    backgroundColor: colors.background,
  },
  guidelineCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
  },
  guidelineTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 2,
  },
  guidelineText: {
    fontSize: typography.fontSize.xs,
    color: '#92400E',
    lineHeight: 17,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontWeight: '700',
  },
  inputHint: {
    fontSize: 10,
    color: colors.textLight,
    marginTop: 3,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});
