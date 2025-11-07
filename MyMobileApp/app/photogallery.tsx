import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import GestureRecognizer from "react-native-swipe-gestures";
import Icon from "react-native-vector-icons/MaterialIcons";

const screenWidth = Dimensions.get("window").width;

// Replace this with your PC's local IP
const SERVER_URL = "http://192.168.0.12:5000";

const photogallery = () => {
  const navigation = useNavigation();

  // Language Dropdown
  const [languageOpen, setLanguageOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const [languageItems, setLanguageItems] = useState([
    { label: "English", value: "English" },
    { label: "తెలుగు", value: "Telugu" },
  ]);

  // Filter Dropdown
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [filterItems, setFilterItems] = useState([
    { label: "All", value: "All" },
    { label: "Today", value: "Today" },
    { label: "This Week", value: "This Week" },
    { label: "This Year", value: "This Year" },
    { label: "Custom", value: "Custom" },
  ]);

  // Dates
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Brand Info
  const [logoURL, setLogoURL] = useState<any>(require("../assets/images/logo.png"));
  const [brandName, setBrandName] = useState("Indian National Congress (INC)");
  const [brandDescription, setBrandDescription] = useState(
    "Chairman of the Telangana Vikalangula Cooperative Corporation (TVCC)."
  );
  const [brandNameTelugu, setBrandNameTelugu] = useState("భారత జాతీయ కాంగ్రెస్ (INC)");
  const [brandDescriptionTelugu, setBrandDescriptionTelugu] = useState(
    "తెలంగాణ వికలాంగుల సహకార సంస్థ (TVCC) ఛైర్మన్."
  );

  // Uploaded Images
  const [uploadedImages, setUploadedImages] = useState<{ uri: string }[]>([]);
  const category = "photo_gallery"; // Category for fetching images

  // === Fullscreen Modal State ===
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openImage = (index: number) => {
    setCurrentIndex(index);
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  // === Fetch Images from Backend ===
  useEffect(() => {
    fetch(`${SERVER_URL}/api/photos/${category}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched photogallery images:", data);

        if (Array.isArray(data)) {
          const formatted = data.map((url) => ({ uri: url }));
          setUploadedImages(formatted);
        } else {
          console.warn("Unexpected response format:", data);
        }
      })
      .catch((err) => {
        console.error("Error fetching photogallery images:", err);
      });
  }, []);

  // === Helper: Get Week Number ===
  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  // === Filter Logic ===
  const filterImagesByDate = (images: { uri: string }[]) => {
    if (filter === "All") return images;
    return images.filter((img) => {
      const filename = img.uri.split("/").pop();
      const timestampString = filename?.split("-")[0];
      const timestamp = Number(timestampString);
      const uploadDate = new Date(timestamp);
      if (isNaN(uploadDate.getTime())) return false;

      const today = new Date();

      if (filter === "Today") {
        return uploadDate.toDateString() === today.toDateString();
      }
      if (filter === "This Week") {
        return (
          uploadDate.getFullYear() === today.getFullYear() &&
          getWeekNumber(uploadDate) === getWeekNumber(today)
        );
      }
      if (filter === "This Year") {
        return uploadDate.getFullYear() === today.getFullYear();
      }
      if (filter === "Custom" && fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        return uploadDate >= from && uploadDate <= to;
      }

      return true;
    });
  };

  const filteredImages = filterImagesByDate(uploadedImages);

  // Load Brand Data from AsyncStorage
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

  // Handle Upload Navigation
  const handleUpload = async () => {
    try {
      const lastLoginTime = await AsyncStorage.getItem("lastLoginTime");
      const now = new Date().getTime();
      const FIVE_MINUTES = 5 * 60 * 1000;

      if (lastLoginTime && now - parseInt(lastLoginTime) < FIVE_MINUTES) {
        navigation.navigate("photo_gallery");
      } else {
        navigation.navigate("photogallery_login");
      }
    } catch (error) {
      console.log("Error checking login time:", error);
      navigation.navigate("photogallery_login");
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
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
            ArrowDownIconComponent={() => <Icon name="arrow-drop-down" size={28} color="#000" />}
            ArrowUpIconComponent={() => <Icon name="arrow-drop-up" size={28} color="#000" />}
            textStyle={{ color: "#000", fontWeight: "bold" }}
            labelStyle={{ color: "#000", fontWeight: "bold" }}
          />
        </View>
      </View>

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("home-page")}
        >
          <Text style={styles.backText}>
            {language === "English" ? "Back" : "వెనుకకు"}
          </Text>
        </TouchableOpacity>

        {/* Filter + Dates */}
        <View style={{ zIndex: 1500, flexDirection: "column" }}>
          <View style={{ width: 150, zIndex: 1500 }}>
            <DropDownPicker
              open={filterOpen}
              value={filter}
              items={filterItems}
              setOpen={setFilterOpen}
              setValue={setFilter}
              setItems={setFilterItems}
              style={styles.filterDropdown}
              dropDownContainerStyle={styles.filterDropdownContainer}
              ArrowDownIconComponent={() => <Icon name="arrow-drop-down" size={24} color="#333" />}
              ArrowUpIconComponent={() => <Icon name="arrow-drop-up" size={24} color="#333" />}
              textStyle={{ color: "#333", fontWeight: "600" }}
            />
          </View>

          {filter === "Custom" && (
            <View style={styles.dateContainer}>
              <View style={styles.dateRow}>
                <TouchableOpacity
                  style={styles.dateBox}
                  onPress={() => setShowFromPicker(true)}
                >
                  <Text style={styles.dateLabel}>From:</Text>
                  <Text style={styles.dateText}>
                    {fromDate ? fromDate.toLocaleDateString() : "Select"}
                  </Text>
                </TouchableOpacity>
                {showFromPicker && (
                  <DateTimePicker
                    value={fromDate || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      setShowFromPicker(false);
                      if (selectedDate) setFromDate(selectedDate);
                    }}
                  />
                )}

                <TouchableOpacity
                  style={styles.dateBox}
                  onPress={() => setShowToPicker(true)}
                >
                  <Text style={styles.dateLabel}>To:</Text>
                  <Text style={styles.dateText}>
                    {toDate ? toDate.toLocaleDateString() : "Select"}
                  </Text>
                </TouchableOpacity>
                {showToPicker && (
                  <DateTimePicker
                    value={toDate || new Date()}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(event, selectedDate) => {
                      setShowToPicker(false);
                      if (selectedDate) setToDate(selectedDate);
                    }}
                  />
                )}
              </View>
            </View>
          )}
        </View>

        {/* Upload Button */}
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Text style={styles.uploadText}>
            {language === "English" ? "Upload" : "అప్‌లోడ్"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* BODY: Images */}
      <ScrollView style={styles.bodyContent}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
          {filteredImages.length > 0 ? (
            filteredImages.map((img, index) => (
              <TouchableOpacity key={index} onPress={() => openImage(index)}>
                <Image
                  source={{ uri: img.uri }}
                  style={{
                    width: 120,
                    height: 120,
                    margin: 8,
                    borderRadius: 10,
                    backgroundColor: "#eee",
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ textAlign: "center", marginTop: 20, color: "#666" }}>
              No images found.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* FULLSCREEN MODAL */}
      {modalVisible && filteredImages.length > 0 && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <GestureRecognizer
            style={{
              flex: 1,
              // backgroundColor: "rgba(0,0,0,0.95)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onSwipeLeft={() => {
              if (currentIndex < filteredImages.length - 1) {
                setCurrentIndex(currentIndex + 1);
              }
            }}
            onSwipeRight={() => {
              if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
              }
            }}
          >
            <TouchableOpacity
              style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
              activeOpacity={1}
              onPress={closeModal}
            >
              <Image
                source={{ uri: filteredImages[currentIndex].uri }}
                style={{
                  width: screenWidth * 0.9,
                  height: screenWidth * 0.9, // square image
                  borderRadius: 10,
                  backgroundColor: "#000000ff",
                }}
                resizeMode="contain"
              />

            </TouchableOpacity>
          </GestureRecognizer>
        </Modal>
      )}

      {/* FOOTER */}
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

export default photogallery;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
    backgroundColor: "#fff" 
  },
  textBlock: { 
    flex: 1, 
    marginLeft: 10 
  },
  brandName: { 
    fontWeight: "bold", 
    fontSize: 18, 
    color: "white" 
  },
  brandDescription: { 
    fontSize: 14, 
    color: "white" 
  },
  languageDropdown: { 
    backgroundColor: "#fff", 
    borderColor: "#fff", 
    height: 40, 
    borderRadius: 5 
  },
  languageDropdownContainer: { 
    backgroundColor: "#fff", 
    borderColor: "#ccc" 
  },
  topBar: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: 10, 
    backgroundColor: "#fff", 
    zIndex: 1500 
  },
  backButton: { 
    backgroundColor: "#555", 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 5 
  },
  backText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
  filterDropdown: { 
    backgroundColor: "#fff", 
    borderColor: "#ccc", 
    height: 45, 
    borderRadius: 5 
  },
  filterDropdownContainer: { 
    backgroundColor: "#fff", 
    borderColor: "#ccc" 
  },
  dateContainer: { 
    width: "100%", 
    marginTop: 8, 
    alignItems: "flex-start" 
  },
  dateRow: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  dateBox: { 
    flexDirection: "row", 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 5, 
    paddingHorizontal: 8, 
    paddingVertical: 6, 
    marginRight: 10, 
    backgroundColor: "#fff" 
  },
  dateLabel: { 
    fontWeight: "bold", 
    marginRight: 5 
  },
  dateText: { 
    fontSize: 14, 
    color: "#333" 
  },
  uploadButton: { 
    backgroundColor: "#007bff", 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 5 
  },
  uploadText: { 
    color: "#fff", 
    fontWeight: "bold" 
  },
  bodyContent: { 
    flex: 1 
  },
  imageGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "center", 
    padding: 8 
  },
  imageItem: { 
    width: screenWidth / 3 - 12, 
    height: 150, 
    margin: 4, 
    borderRadius: 8 },
  footer: { 
    alignItems: "center", 
    marginBottom: 20, 
    backgroundColor: "#5777AA", 
    paddingVertical: 10 
  },
  footerImage: { 
    width: 100, 
    height: 80, 
    resizeMode: "contain" 
  },
});
