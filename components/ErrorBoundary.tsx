import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/utils/colors";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  retry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{error.message}</Text>
        <TouchableOpacity onPress={this.retry} style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.info,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  buttonText: {
    color: colors.panel,
    fontSize: 15,
    fontWeight: "600",
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.page,
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24,
  },
  message: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  title: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "600",
  },
});
