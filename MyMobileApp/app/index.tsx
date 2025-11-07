import { createNativeStackNavigator } from "@react-navigation/native-stack";
import communityengagement from "./communityengagement";
import Settings from "./HeaderSettings";
import HomeScreen from "./home-page";
import Portfolio from "./portfolio";
import SignIn from "./sign-in";
import socialactivities from "./socialactivities";

const Stack = createNativeStackNavigator();

export default function Root() {
  return (
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen
        name="SignIn"
        component={SignIn}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Portfolio"
        component={Portfolio}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="socialactivities"
        component={socialactivities}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="communityengagement"
        component={communityengagement}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
