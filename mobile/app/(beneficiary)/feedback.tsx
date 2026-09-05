import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../src/constants/theme';
import { GovHeader, Card, Button } from '../../src/components/common';
import { Sentiment } from '@nirikshan/shared-types';

export default function BeneficiaryFeedback() {
  const [sentiment, setSentiment] = useState<Sentiment>(Sentiment.POSITIVE);
  const [comments, setComments] = useState(
    'The de-addiction counseling sessions and food provided daily have been very helpful. Staff is respectful.'
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    Alert.alert(
      'Feedback Recorded',
      `Sentiment: ${sentiment}. Your direct feedback has been submitted to the DoSJE oversight committee.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GovHeader title="CITIZEN FEEDBACK" subtitle="Scheme Service Quality & Facility Experience" />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.infoPill}>
          <Text style={styles.infoPillText}>
            🛡️ Confidential Beneficiary Feedback • Directly submitted to Ministry
          </Text>
        </View>

        <Card title="Rate Your Experience" subtitle="Institute: Demo Welfare Institute - Coimbatore">
          <Text style={styles.sectionLabel}>Overall Satisfaction Sentiment:</Text>
          <View style={styles.sentimentRow}>
            <TouchableOpacity
              style={[
                styles.sentimentBtn,
                sentiment === Sentiment.POSITIVE && styles.sentimentPositiveActive,
              ]}
              onPress={() => setSentiment(Sentiment.POSITIVE)}
            >
              <Text style={styles.sentimentIcon}>😊</Text>
              <Text style={styles.sentimentText}>Satisfied</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sentimentBtn,
                sentiment === Sentiment.NEUTRAL && styles.sentimentNeutralActive,
              ]}
              onPress={() => setSentiment(Sentiment.NEUTRAL)}
            >
              <Text style={styles.sentimentIcon}>😐</Text>
              <Text style={styles.sentimentText}>Neutral</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sentimentBtn,
                sentiment === Sentiment.NEGATIVE && styles.sentimentNegativeActive,
              ]}
              onPress={() => setSentiment(Sentiment.NEGATIVE)}
            >
              <Text style={styles.sentimentIcon}>😞</Text>
              <Text style={styles.sentimentText}>Grievance</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Comments & Grievances:</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            value={comments}
            onChangeText={setComments}
            placeholder="Describe food, facilities, staff behavior, or any issues..."
          />

          <Button
            title={submitted ? "Update Feedback" : "Submit Confidential Feedback"}
            variant="success"
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
  infoPill: {
    backgroundColor: '#DCFCE7',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: spacing.base,
  },
  infoPillText: {
    color: colors.success,
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  sentimentRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sentimentBtn: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  sentimentPositiveActive: {
    borderColor: colors.success,
    backgroundColor: '#F0FDF4',
  },
  sentimentNeutralActive: {
    borderColor: colors.warning,
    backgroundColor: '#FFFBEB',
  },
  sentimentNegativeActive: {
    borderColor: colors.danger,
    backgroundColor: '#FEF2F2',
  },
  sentimentIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  sentimentText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  textArea: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: spacing.base,
  },
  submitBtn: {
    marginTop: spacing.xs,
  },
});
