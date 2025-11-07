import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";

const HeaderSettings = ({ setLogoUpdated, setVideo1, setVideo2 }) => {
  const navigation = useNavigation();

  const [logoPreview, setLogoPreview] = useState("");
  const [brandName, setBrandName] = useState("");
  const [brandDescription, setBrandDescription] = useState("");

  const [profileImage1, setProfileImage1] = useState("");
  const [profileImage2, setProfileImage2] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileOrg, setProfileOrg] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileVision, setProfileVision] = useState("");

  const [videoPreview1, setVideoPreview1] = useState(null);
  const [videoPreview2, setVideoPreview2] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const storedLogo = await AsyncStorage.getItem("logoURL");
      if (storedLogo) setLogoPreview(storedLogo);

      setBrandDescription(
        (await AsyncStorage.getItem("brandDescription")) ||
          "default description"
      );
      setBrandName(
        (await AsyncStorage.getItem("brandName")) ||
          "Indian National Congress (INC)"
      );
      setProfileImage1(
        (await AsyncStorage.getItem("profileImage1")) ||
          "https://via.placeholder.com/200"
      );
      setProfileImage2(
        (await AsyncStorage.getItem("profileImage2")) ||
          "https://via.placeholder.com/200"
      );
      setProfileName((await AsyncStorage.getItem("profileName")) || "");
      setProfileOrg((await AsyncStorage.getItem("profileOrg")) || "");
      setProfileAddress((await AsyncStorage.getItem("profileAddress")) || "");
      setProfileVision((await AsyncStorage.getItem("profileVision")) || "");

      const savedVideo1 = await AsyncStorage.getItem("video1");
      const savedVideo2 = await AsyncStorage.getItem("video2");
      if (savedVideo1) setVideoPreview1(savedVideo1);
      if (savedVideo2) setVideoPreview2(savedVideo2);
    };
    loadData();
  }, []);

  const handleFileUpload = async (setFile, key) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setFile(base64Img);
      await AsyncStorage.setItem(key, base64Img);
    }
  };

  const handleVideoUpload = async (key, setter, previewSetter) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "video/mp4",
    });

    if (result.type === "success") {
      setter(result.uri);
      previewSetter(result.uri);
      await AsyncStorage.setItem(key, result.uri);
    }
  };

  const handleSave = async () => {
    if (logoPreview) await AsyncStorage.setItem("logoURL", logoPreview);
    await AsyncStorage.setItem("brandName", brandName);
    await AsyncStorage.setItem("brandDescription", brandDescription);

    await AsyncStorage.setItem("profileImage1", profileImage1);
    await AsyncStorage.setItem("profileImage2", profileImage2);
    await AsyncStorage.setItem("profileName", profileName);
    await AsyncStorage.setItem("profileOrg", profileOrg);
    await AsyncStorage.setItem("profileAddress", profileAddress);
    await AsyncStorage.setItem("profileVision", profileVision);

    if (setLogoUpdated) setLogoUpdated((prev) => !prev);

    Alert.alert("Success", "Settings saved successfully!");
    navigation.navigate("home-page"); // ✅ navigate to Home
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Header Settings</Text>

      <Text style={styles.label}>Select Logo Image</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleFileUpload(setLogoPreview, "logoURL")}
      >
        <Text style={styles.buttonText}>Choose Logo</Text>
      </TouchableOpacity>
      {logoPreview ? (
        <Image source={{ uri: logoPreview }} style={styles.image} />
      ) : null}

      <Text style={styles.label}>Brand Name</Text>
      <TextInput
        style={styles.input}
        value={brandName}
        onChangeText={setBrandName}
      />

      <Text style={styles.label}>Brand Description</Text>
      <TextInput
        style={styles.input}
        value={brandDescription}
        onChangeText={setBrandDescription}
      />

      <Text style={styles.title}>Profile Settings</Text>

      <Text style={styles.label}>Profile Image 1</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleFileUpload(setProfileImage1, "profileImage1")}
      >
        <Text style={styles.buttonText}>Choose Image 1</Text>
      </TouchableOpacity>
      {profileImage1 ? (
        <Image source={{ uri: profileImage1 }} style={styles.image} />
      ) : null}

      <Text style={styles.label}>Profile Image 2</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleFileUpload(setProfileImage2, "profileImage2")}
      >
        <Text style={styles.buttonText}>Choose Image 2</Text>
      </TouchableOpacity>
      {profileImage2 ? (
        <Image source={{ uri: profileImage2 }} style={styles.image} />
      ) : null}

      <Text style={styles.label}>Profile Name</Text>
      <TextInput
        style={styles.input}
        value={profileName}
        onChangeText={setProfileName}
      />

      <Text style={styles.label}>Profile Organization</Text>
      <TextInput
        style={styles.input}
        value={profileOrg}
        onChangeText={setProfileOrg}
      />

      <Text style={styles.label}>Profile Address</Text>
      <TextInput
        style={styles.input}
        value={profileAddress}
        onChangeText={setProfileAddress}
      />

      <Text style={styles.label}>Profile Vision</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={profileVision}
        onChangeText={setProfileVision}
        multiline
      />

      <Text style={styles.title}>Upload Videos</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          handleVideoUpload("video1", setVideo1, setVideoPreview1)
        }
      >
        <Text style={styles.buttonText}>Choose Video 1</Text>
      </TouchableOpacity>
      {videoPreview1 && (
        <Video
          source={{ uri: videoPreview1 }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          handleVideoUpload("video2", setVideo2, setVideoPreview2)
        }
      >
        <Text style={styles.buttonText}>Choose Video 2</Text>
      </TouchableOpacity>
      {videoPreview2 && (
        <Video
          source={{ uri: videoPreview2 }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save All Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default HeaderSettings;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    marginVertical: 12,
    fontWeight: "bold",
  },
  label: {
    marginTop: 10,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 6,
    marginTop: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "green",
    padding: 24,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 8,
    borderRadius: 8,
  },
  video: {
    width: "100%",
    height: 200,
    marginTop: 10,
    backgroundColor: "#000",
  },
});
