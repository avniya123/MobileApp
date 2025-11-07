import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DEFAULT_EMAIL = "admin@gmail.com";
const DEFAULT_PASSWORD = "1234567";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const toggleAnim = new Animated.Value(0);

  const handleToggle = () => {
    Animated.timing(toggleAnim, {
      toValue: isAdmin ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsAdmin(!isAdmin);
    setEmail("");
    setPassword("");
  };

  const handleSignIn = () => {
    if (loading) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (isAdmin) {
        if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
          router.replace("/HeaderSettings");
        } else {
          Alert.alert(
            "Invalid Credentials",
            "Please enter the correct admin email & password."
          );
        }
      } else {
        router.replace("/home-page");
      }
    }, 800);
  };

  // Interpolate background color based on toggle
  const backgroundColor = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#28a745", "#007bff"], // green → blue
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {isAdmin ? "Admin Login" : "User Login"}
        </Text>

        <TextInput
          style={[styles.input, !isAdmin && styles.disabledInput]}
          placeholder="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={isAdmin}
          placeholderTextColor="#999"
        />

        <TextInput
          style={[styles.input, !isAdmin && styles.disabledInput]}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={isAdmin}
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.authButton, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {loading
              ? "Please wait..."
              : isAdmin
              ? "Sign in as Admin"
              : "Sign in as User"}
          </Text>
        </TouchableOpacity>

        {/* Toggle Button */}
        <TouchableOpacity
          onPress={handleToggle}
          style={styles.toggleContainer}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.toggleButton,
              {
                backgroundColor: backgroundColor,
              },
            ]}
          >
            <Text style={styles.toggleText}>
              {isAdmin ? "Switch to User Mode" : "Switch to Admin Mode"}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    transition: "0.5s ease",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  disabledInput: {
    backgroundColor: "#eee",
    color: "#888",
  },
  authButton: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  toggleContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  toggleText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
