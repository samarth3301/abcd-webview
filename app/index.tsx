import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    BackHandler,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const SITE_URL = "https://sjsofttech.com/";

export default function Index() {
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const canGoBack = useRef(false);

  // Android hardware back navigates web history instead of exiting.
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (canGoBack.current) {
          webRef.current?.goBack();
          return true;
        }
        return false;
      });
      return () => sub.remove();
    }, []),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <WebView
        ref={webRef}
        source={{ uri: SITE_URL }}
        style={styles.web}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setFailed(true)}
        onHttpError={() => setFailed(true)}
        onNavigationStateChange={(s) => {
          canGoBack.current = s.canGoBack;
        }}
        pullToRefreshEnabled
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
      />
      {loading && !failed && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" />
        </View>
      )}
      {failed && (
        <View style={styles.overlay}>
          <Text style={styles.errorText}>
            Can&apos;t reach sjsofttech.com. Check your connection.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  web: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  errorText: { padding: 24, textAlign: "center", color: "#444" },
});
