import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { ResizeMode, Video } from "expo-av";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Icon from "react-native-vector-icons/MaterialIcons";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const [language, setLanguage] = useState("English");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [languageItems, setLanguageItems] = useState([
    { label: "English", value: "English" },
    { label: "తెలుగు", value: "Telugu" },
  ]);

  const [data, setData] = useState({});
  const navigation = useNavigation();
  const scrollRef = useRef(null); // 🔹 Create ref for ScrollView

  // 🔹 Scroll to top function
  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Load AsyncStorage data
  useEffect(() => {
    const loadData = async () => {
      const keys = [
        "logoURL",
        "brandName",
        "brandDescription",
        "brandNameTelugu",
        "brandDescriptionTelugu",
        "profileImage1",
        "profileImage2",
        "profileName",
        "profileAddress",
        "profileOrg",
        "profileVision",
        "video1",
        "video2",
      ];
      const entries = await AsyncStorage.multiGet(keys);
      const obj = Object.fromEntries(entries);
      setData(obj);
    };
    loadData();
  }, []);

  const logoURL = data.logoURL
    ? { uri: data.logoURL }
    : require("../assets/images/logo.png");

  const brandName = data.brandName || "Indian National Congress (INC)";
  const brandDescription =
    data.brandDescription ||
    "Chairman of the Telangana Vikalangula Cooperative Corporation (TVCC)";
  const brandNameTelugu = data.brandNameTelugu || "భారత జాతీయ కాంగ్రెస్ (INC)";
  const brandDescriptionTelugu =
    data.brandDescriptionTelugu ||
    "తెలంగాణ వికలాంగుల సహకార సంస్థ (TVCC) ఛైర్మన్.";

  const profileImage1 = data.profileImage1
    ? { uri: data.profileImage1 }
    : { uri: "https://via.placeholder.com/200" };
  const profileImage2 = data.profileImage2
    ? { uri: data.profileImage2 }
    : { uri: "https://via.placeholder.com/200" };

  const name = data.profileName || "Muttineni Veeraiah";
  const address =
    data.profileAddress || "Nalgonda Cross Roads, Malakpet, Hyderabad";
  const org =
    data.profileOrg || "Telangana Vikalangula Cooperative Corporation (TVCC)";
  const vision =
    data.profileVision ||
    "Your voice matters—stay engaged, raise your concerns, and join me in building a better future.";

  const video1 = data.video1 || "";
  const video2 = data.video2 || "";

  const socialLinks = {
    facebook: "https://www.facebook.com/profile.php?id=61558450514835",
    instagram: "https://www.instagram.com/veeraiahmuttineni/",
    twitter: "https://x.com/veeraiahvarma",
    youtube: "#",
    whatsapp: "https://wa.me/",
  };

  const aboutItems = [
    {
      title: "Portfolio",
      te: "పోర్ట్‌ఫోలియో",
      img: require("../assets/images/portfolio1.png"),
      nav: "portfolio",
    },
    {
      title: "Social Activities",
      te: "సామాజిక కార్యకలాపాలు",
      img: require("../assets/images/social_activities.png"),
      nav: "socialactivities",
    },
    {
      title: "Community Engagement",
      te: "సముదాయ అనుసంధానం",
      img: require("../assets/images/community_engagement.png"),
      nav: "communityengagement",
    },
    {
      title: "Photo Gallery",
      te: "ఫోటో గ్యాలరీ",
      img: require("../assets/images/photogallery1.png"),
      nav: "photogallery",
    },
    {
      title: "Social Media",
      te: "సామాజిక మీడియా",
      img: require("../assets/images/social_media1.jpg"),
      nav: "socialmedia",
    },
  ];

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* 🔹 Header */}
      <View style={styles.header}>
        <Image source={logoURL} style={styles.logo} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.brandName}>
            {language === "English" ? brandName : brandNameTelugu}
          </Text>
          <Text style={styles.brandDesc}>
            {language === "English"
              ? brandDescription
              : brandDescriptionTelugu}
          </Text>
        </View>

        {/* ✅ Language Dropdown */}
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
            ArrowDownIconComponent={({ style }) => (
              <Icon name="arrow-drop-down" size={28} color="#000" />
            )}
            ArrowUpIconComponent={({ style }) => (
              <Icon name="arrow-drop-up" size={28} color="#000" />
            )}
            textStyle={{ color: "#000", fontWeight: "bold" }}
            labelStyle={{ color: "#000", fontWeight: "bold" }}
            listMode="SCROLLVIEW"
          />
        </View>
      </View>

      {/* 🔹 Profile 1 */}
      <View style={styles.profileSection}>
        <Image source={profileImage1} style={styles.profileImage} />
        <Text style={styles.name}>
          {language === "English" ? name : "ముత్తినేని వీరయ్య"}
        </Text>
        <Text style={styles.org}>
          {language === "English" ? org : "తెలంగాణ వికలాంగుల సహకార సంస్థ (TVCC)"}
        </Text>
        <Text style={styles.address}>
          {language === "English"
            ? address
            : "నల్లగొండ క్రాస్ రోడ్స్, మలక్‌పేట్, హైదరాబాదు"}
        </Text>
        <Text style={styles.vision}>
          {language === "English"
            ? vision
            : "మీరు చెప్పే మాటలకు విలువ ఉంది... మంచి భవిష్యత్తు కోసం కలసి ముందుకెళ్దాం."}
        </Text>
      </View>

      {/* 🔹 Profile 2 */}
      <View style={styles.profileSection}>
        <Image source={profileImage2} style={styles.profileImage} />
      </View>

      {/* 🔹 Videos */}
      <Text style={styles.sectionTitle}>
        {language === "English" ? "Watch Our Videos" : "మా వీడియోలను చూడండి"}
      </Text>

      <View style={styles.videoContainer}>
        {[video1, video2].map((v, i) => (
          <View key={i} style={styles.videoBox}>
            <Video
              source={v ? { uri: v } : require("../assets/images/VM-1.mp4")}
              style={styles.video}
              resizeMode={ResizeMode.COVER}
              useNativeControls
              isLooping
            />
          </View>
        ))}
      </View>

      {/* 🔹 About Candidate */}
      <Text style={styles.sectionTitle}>
        {language === "English" ? "About Candidate" : "అభ్యర్థి గురించి"}
      </Text>

      <View style={styles.aboutRow}>
        {aboutItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            style={styles.aboutCard}
            onPress={() => navigation.navigate(item.nav)}
          >
            <Image source={item.img} style={styles.aboutIcon} />
            <Text style={styles.aboutText}>
              {language === "English" ? item.title : item.te}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔹 Social Icons */}
      <View style={styles.socialIcons}>
        {Object.entries({
          facebook: require("../assets/images/facebook.png"),
          instagram: require("../assets/images/instagram.png"),
          twitter: require("../assets/images/twitter.png"),
          youtube: require("../assets/images/youtube.png"),
          whatsapp: require("../assets/images/whatsapp.png"),
        }).map(([k, v]) => (
          <TouchableOpacity
            key={k}
            onPress={() => Linking.openURL(socialLinks[k])}
            style={styles.socialBox}
          >
            <Image source={v} style={styles.socialImage} />
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔹 Footer */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={scrollToTop}>
          <Image
            source={require("../assets/images/home.jpg")}
            style={styles.footerImage}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#5777AA",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 2000,
  },
  logo: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#fff" },
  brandName: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  brandDesc: { fontSize: 13, color: "#fff" },

  languageDropdown: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff",
    height: 40,
    borderRadius: 5,
  },
  languageDropdownContainer: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    zIndex: 2000,
  },

  profileSection: {
    alignItems: "center",
    paddingVertical: 25,
  },
  profileImage: {
    width: width * 0.8,
    height: width * 0.9,
    borderRadius: 15,
    resizeMode: "cover",
  },
  name: { fontSize: 26, fontWeight: "bold", marginTop: 10, color: "#111" },
  org: { fontSize: 15, color: "#333", textAlign: "center" },
  address: { fontSize: 14, color: "#444", textAlign: "center" },
  vision: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#111",
  },
  videoContainer: { alignItems: "center" },
  videoBox: {
    width: width * 0.9,
    height: width * 0.5,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 20,
  },
  video: { width: "100%", height: "100%" },
  aboutRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  aboutCard: { alignItems: "center", margin: 10, width: 48 },
  aboutIcon: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginBottom: 6,
    backgroundColor: "#eee",
  },
  aboutText: {
    fontSize: 8,
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginVertical: 30,
  },
  socialBox: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    elevation: 4,
  },
  socialImage: { width: 28, height: 28, resizeMode: "contain" },
  footer: {
    backgroundColor: "#5777AA",
    alignItems: "center",
    paddingVertical: 20,
  },
  footerImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
    borderRadius: 12,
  },
});
