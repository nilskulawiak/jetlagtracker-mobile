import { MaterialIcons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "@/components/Shared/styles";
import { colors } from "@/utils/colors";

export function PageLayout({
  children,
  onBack,
  onRefresh,
  refreshing,
  title,
}: {
  children: ReactNode;
  onBack?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  title: string;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {onBack ? (
              <Pressable
                accessibilityLabel="Back"
                accessibilityRole="button"
                onPress={onBack}
                style={[styles.iconButton, styles.headerBackButton]}
              >
                <MaterialIcons color={colors.ink} name="arrow-back" size={22} />
              </Pressable>
            ) : null}
            <View style={styles.titleBlock}>
              <Text style={styles.kicker}>Jet Lag tracker</Text>
              <Text numberOfLines={1} style={styles.title}>{title}</Text>
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing ?? false} onRefresh={onRefresh} />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
