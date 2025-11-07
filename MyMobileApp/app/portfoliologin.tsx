import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Icon from "react-native-vector-icons/MaterialIcons";

const screenWidth = Dimensions.get("window").width;

const Portfoliologin = () => {
  
  const [filter, setFilter] = useState("All");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  // Language Dropdown
  const [languageOpen, setLanguageOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const [languageItems, setLanguageItems] = useState([
    { label: "English", value: "English" },
    { label: "తెలుగు", value: "Telugu" },
  ]);

  // 🔹 State for logo and content
  const [logoURL, setLogoURL] = useState<any>(require("../assets/images/logo.png"));
  const [brandName, setBrandName] = useState("Indian National Congress (INC)");
  const [brandDescription, setBrandDescription] = useState("default desc");
  const [brandNameTelugu, setBrandNameTelugu] = useState(
    "భారత జాతీయ కాంగ్రెస్ (INC)"
  );
  const [brandDescriptionTelugu, setBrandDescriptionTelugu] = useState(
    "తెలంగాణ వికలాంగుల సహకార సంస్థ (TVCC) ఛైర్మన్."
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedLogo = await AsyncStorage.getItem("logoURL");
        const storedBrandName = await AsyncStorage.getItem("brandName");
        const storedBrandDescription = await AsyncStorage.getItem("brandDescription");
        const storedBrandNameTelugu = await AsyncStorage.getItem("brandNameTelugu");
        const storedBrandDescriptionTelugu = await AsyncStorage.getItem("brandDescriptionTelugu");

        if (storedLogo) setLogoURL({ uri: storedLogo });
        if (storedBrandName) setBrandName(storedBrandName);
        if (storedBrandDescription) setBrandDescription(storedBrandDescription);
        if (storedBrandNameTelugu) setBrandNameTelugu(storedBrandNameTelugu);
        if (storedBrandDescriptionTelugu) setBrandDescriptionTelugu(storedBrandDescriptionTelugu);
      } catch (error) {
        console.log("AsyncStorage load error:", error);
      }
    };

    loadData();
  }, []);

 const handleLogin = async () => {
  if (email === "admin@gmail.com" && password === "Admin@123") {
    try {
      const now = new Date().getTime();
      await AsyncStorage.setItem("lastLoginTime", now.toString());
      navigation.navigate("port_folio");
    } catch (error) {
      console.log("Error saving login time:", error);
    }
  } else {
    alert("Invalid credentials");
  }
};


  return (
    <View style={styles.container}>
      {/* 🔹 HEADER SECTION */}
      <View style={styles.header}>
        <Image source={logoURL} style={styles.logo} />

        <View style={styles.textBlock}>
          <Text style={styles.brandName}>
            {language === "English" ? brandName : brandNameTelugu}
          </Text>
          <Text style={styles.brandDescription}>
            {language === "English" ? brandDescription : brandDescriptionTelugu}
          </Text>
        </View>

        {/* Language Dropdown */}
        <View style={{ width: 130, zIndex: 2000 }}>
          <DropDownPicker
            open={languageOpen}
            value={language}
            items={languageItems}
            setOpen={setLanguageOpen}
            setValue={setLanguage}
            setItems={setLanguageItems}
            style={styles.languageDropdown}
            dropDownContainerStyle={styles.languageDropdownContainer}
            ArrowDownIconComponent={() => (
              <Icon name="arrow-drop-down" size={28} color="#000000ff" />
            )}
            ArrowUpIconComponent={() => (
              <Icon name="arrow-drop-up" size={28} color="#000000ff" />
            )}
            textStyle={{ color: "#000000ff", fontWeight: "bold" }}
            labelStyle={{ color: "#000000ff", fontWeight: "bold" }}
          />
        </View>
      </View>

      {/* 🔹 TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("portfolio")}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 LOGIN FORM SECTION */}
      <ScrollView contentContainerStyle={styles.bodyContent}>
        <View style={styles.loginBox}>
          <Text style={styles.loginTitle}>Login</Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 🔹 FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate("home-page")}>
          <Image
            source={require("../assets/images/home.jpg")}
            style={styles.footerImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Portfoliologin;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  // HEADER
  header: {
    width: "100%",
    backgroundColor: "#5777AA",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2000,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 40,
    resizeMode: "cover",
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  textBlock: { flex: 1, marginLeft: 10, justifyContent: "center" },
  brandName: { fontWeight: "bold", fontSize: 18, color: "white" },
  brandDescription: { fontSize: 14, color: "white" },

  languageDropdown: {
    backgroundColor: "#ffffffff",
    borderColor: "#ffffffff",
    height: 40,
    borderRadius: 5,
  },
  languageDropdownContainer: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
  },
  // TOP BAR
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#fff",
  },
  backButton: {
    backgroundColor: "#555",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  backText: { color: "#fff", fontWeight: "bold" },

  // LOGIN BOX
  bodyContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loginBox: {
    width: 350,
    padding: 30,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
    alignItems: "center",
  },
  loginTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  loginButton: {
    width: "100%",
    padding: 12,
    borderRadius: 5,
    backgroundColor: "#007bff",
    alignItems: "center",
  },
  loginButtonText: { color: "#fff", fontWeight: "bold" },

  // Footer
  footer: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#5777AA",
    paddingVertical: 10,
  },
  footerImage: { width: 100, height: 80, resizeMode: "contain" },
});