import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
