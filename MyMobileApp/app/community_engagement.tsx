import { API_URL } from "../config/config";

import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
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

const community_engagement = () => {
  const navigation = useNavigation();

  // 🔹 Language State
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

  // 🔹 UploadPost States
  const [postContent, setPostContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);

  const inbuiltHashtags = [
    "@Bhatti_Mallu",
    "@INCTelangana",
    "@INCIndia",
    "@revanth_anumula",
    "@RahulGandhi",
    "@RahulGandhiiFan",
    "@Congress4TS",
    "@UWCforYouth",
    "@iycballia",
    "@meeseethakka",
    "#TelanganaCongress",
    "#IndianNationalCongress",
    "#CongressParty",
    "#CongressLeadership",
    "#CongressForProgress",
    "#INCIndia",
    "#RahulGandhi",
    "#WeSupportCongress",
    "#PriyankaGandhi",
    "#congress",
    "#JaiHind",
    "#DemocracyWithCongress🤚",
  ];

  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedFiles(result.assets);
    }
  };

  const handleAddHashtags = () => {
    const allTags = inbuiltHashtags.join(" ");
    setPostContent((prev) => `${prev} ${allTags}`.trim());
  };

  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async () => {
  if (selectedFiles.length === 0) {
    Alert.alert("Please select at least one file.");
    return;
  }

  setLoading(true);

  const formData = new FormData();
  formData.append("category", "community_engagement");
  formData.append("postContent", postContent);

  selectedFiles.forEach((file) => {
    const uri = Platform.OS === "android" ? file.uri : file.uri.replace("file://", "");
    formData.append("files[]", {
      uri,
      name: file.fileName || uri.split("/").pop(),
      type: file.mimeType || "image/jpeg",
    });
  });

  formData.append("platforms", JSON.stringify(selectedPlatforms));

  try {
    const response = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // ✅ SUCCESS ALERT + NAVIGATION TO Portfolio SCREEN
    Alert.alert(
      "✅ Success",
      result.message || "Post uploaded successfully!",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("communityengagement"), // 👈 navigate after success
        },
      ]
    );

    setPostContent("");
    setSelectedFiles([]);
    setSelectedPlatforms([]);
  } catch (error) {
    console.error("Upload error:", error);
    Alert.alert("❌ Upload failed", error.message || "Please try again.");
  } finally {
    setLoading(false);
  }
};




  return (
    <View style={styles.container}>
      {/* 🔹 HEADER */}
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
          onPress={() => navigation.navigate("communityengagement")}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Upload Post Section */}
      <ScrollView contentContainerStyle={styles.bodyContent}>
        <View style={styles.card}>
          <Text style={styles.heading}>Upload Images</Text>

          {/* Post Content */}
          <TextInput
            style={styles.textArea}
            placeholder="Enter your post content"
            value={postContent}
            onChangeText={setPostContent}
            multiline
          />

          {/* Add Hashtags */}
          <TouchableOpacity
            style={styles.hashtagButton}
            onPress={handleAddHashtags}
          >
            <Text style={styles.buttonText}>Add Hashtags</Text>
          </TouchableOpacity>

          {/* Choose Files */}
          <TouchableOpacity style={styles.fileButton} onPress={pickImages}>
            <Text style={styles.buttonText}>
              {selectedFiles.length > 0
                ? `${selectedFiles.length} file(s) chosen`
                : "Choose Files"}
            </Text>
          </TouchableOpacity>

          {/* Preview Images */}
          <View style={styles.previewRow}>
            {selectedFiles.map((file, idx) => (
              <Image
                key={idx}
                source={{ uri: file.uri }}
                style={styles.previewImage}
              />
            ))}
          </View>

          {/* Social Platforms */}
          <View style={styles.platformRow}>
            <TouchableOpacity onPress={() => togglePlatform("facebook")}>
              <FontAwesome
                name="facebook-square"
                size={40}
                color={
                  selectedPlatforms.includes("facebook") ? "#1877F2" : "gray"
                }
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => togglePlatform("instagram")}>
              <FontAwesome
                name="instagram"
                size={40}
                color={
                  selectedPlatforms.includes("instagram") ? "#E1306C" : "gray"
                }
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => togglePlatform("twitter")}>
              <Ionicons
                name="logo-twitter"
                size={40}
                color={
                  selectedPlatforms.includes("twitter") ? "#1DA1F2" : "gray"
                }
              />
            </TouchableOpacity>
          </View>

          {/* Post Button */}
          <TouchableOpacity
            style={styles.postButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.postText}>Post</Text>
            )}
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

export default community_engagement;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },

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
    padding: 10,
    // backgroundColor: "#ffffffdd",
  },
  backButton: {
    backgroundColor: "#555",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  backText: { color: "#fff", fontWeight: "bold" },

  // Upload Card
  bodyContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  card: {
    width: "95%",
    maxWidth: 400,
    // backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 18,
  },
  textArea: {
    height: 130,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#fff",
    textAlignVertical: "top",
    marginBottom: 25,
  },
  hashtagButton: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 12,
  },
  fileButton: {
    backgroundColor: "#5777AA",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  previewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
    justifyContent: "center",
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    margin: 5,
  },
  platformRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  postButton: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  postText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // FOOTER
  footer: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#5777AA",
    paddingVertical: 10,
  },
  footerImage: { width: 100, height: 80, resizeMode: "contain" },
});
