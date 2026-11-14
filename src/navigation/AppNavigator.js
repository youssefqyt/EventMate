import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import EventsScreen from "../screens/EventsScreen";
import BookingsScreen from "../screens/BookingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EventDetailsScreen from "../screens/EventDetailsScreen";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: "home",
  Events: "compass",
  Bookings: "calendar",
  Profile: "person-circle",
};

function ProtectedTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: "#AEB7D0",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size }) => (
          <Ionicons color={color} name={tabIcons[route.name] || "ellipse"} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ title: "Explore" }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ title: "Bookings" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.coral} size="large" />
      <Text style={styles.loadingText}>Getting things ready…</Text>
    </View>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return (
    <Stack.Navigator
      key={user ? "authenticated" : "guest"}
      screenOptions={{ headerShown: false }}
    >
      {user ? (
        <>
          <Stack.Screen name="ProtectedTabs" component={ProtectedTabs} />
          <Stack.Screen
            name="EventDetails"
            component={EventDetailsScreen}
            options={{
              headerShown: true,
              title: "Event details",
              headerTintColor: colors.navy,
              headerStyle: { backgroundColor: colors.cream },
              headerShadowVisible: false,
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    backgroundColor: colors.cream,
    flex: 1,
    justifyContent: "center",
  },
  loadingText: {
    color: colors.slate,
    marginTop: 12,
  },
  tabBar: {
    backgroundColor: colors.navy,
    borderTopWidth: 0,
    elevation: 0,
    height: 68,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 5,
  },
});
