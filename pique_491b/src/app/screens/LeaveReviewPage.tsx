// LeaveReviewScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { ArrowLeft, Star, Upload, X } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { auth } from '@/firebase';
import { apiPostReview } from '@/api';

// ----- Types (adjust to your app) -----
export type Event = {
  id: string;
  imageUrl: string;
  businessName: string;
  location: string;
};

type Props = {
  event: Event;
  onBack: () => void;
  onReviewPosted: () => void;
};

type MediaItem = {
  uri: string;
  type: "image" | "video";
};

export function LeaveReviewScreen({ event, onBack, onReviewPosted }: Props) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);

  const ratingLabel = useMemo(() => {
    switch (rating) {
      case 1:
        return "Not good";
      case 2:
        return "Could've been better";
      case 3:
        return "OK";
      case 4:
        return "Good";
      case 5:
        return "Great";
      default:
        return "";
    }
  }, [rating]);

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const pickMedia = async () => {
    if (media.length >= 10) return;

    // Permissions (Expo)
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow photo library access to upload media.");
      return;
    }

    const remaining = 10 - media.length;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // images + videos
      allowsMultipleSelection: true,
      selectionLimit: remaining, // iOS 14+ / Android varies by picker implementation
      quality: 0.9,
    });

    if (result.canceled) return;

    const picked: MediaItem[] = result.assets.slice(0, remaining).map((a: ImagePicker.ImagePickerAsset) => ({
      uri: a.uri,
      type: a.type === "video" ? "video" : "image",
    }));

    setMedia((prev) => [...prev, ...picked]);
  };

  const handlePostReview = async () => {
    if (!auth.currentUser) {
      Alert.alert("Sign in required", "Please sign in to post a review.");
      return;
    }
    if (rating <= 0 || rating > 5) {
      Alert.alert("Invalid rating", "Please select a rating between 1 and 5.");
      return;
    }
    if (!reviewText.trim()) {
      Alert.alert("Missing review", "Please add a short review before posting.");
      return;
    }
    await apiPostReview({
      eventId: event.id,
      rating,
      comment: reviewText,
    });
    onReviewPosted();
  };

  const canPost = rating > 0 && reviewText.trim().length > 0;

  const topPad =
    Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0;

  return (
    <SafeAreaView style={styles.root}>
      {/* Header (sticky) */}
      <View style={[styles.header, { paddingTop: 12 + topPad }]}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Back">
          <ArrowLeft size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Review</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Info */}
        <View style={styles.sectionRow}>
          <View style={styles.eventRow}>
            <Image source={{ uri: event.imageUrl }} style={styles.eventImg} />
            <View style={{ flex: 1 }}>
              <Text style={styles.eventName}>{event.businessName}</Text>
              <Text style={styles.eventLoc}>{event.location}</Text>
            </View>
          </View>
        </View>

        {/* Star Rating */}
        <View style={styles.sectionRow}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => {
              const active = s <= rating;
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => setRating(s)}
                  style={styles.starBtn}
                  accessibilityRole="button"
                  accessibilityLabel={`Rate ${s} star${s === 1 ? "" : "s"}`}
                >
                  <Star
                    size={42}
                    color={active ? "#FF6B35" : "#9CA3AF"}
                    fill={active ? "#FF6B35" : "#D1D5DB"}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {!!ratingLabel && (
            <Text style={styles.ratingLabel}>{ratingLabel}</Text>
          )}
        </View>

        {/* Review Text */}
        <View style={styles.sectionRow}>
          <TextInput
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="Share details of your experience at this place"
            placeholderTextColor="#9CA3AF"
            multiline
            style={styles.textarea}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{reviewText.length} characters</Text>
        </View>

        {/* Photo / Video Upload */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Add Photos or Videos</Text>

          <View style={styles.mediaGrid}>
            {media.map((m, idx) => (
              <View key={`${m.uri}-${idx}`} style={styles.mediaCell}>
                <Image source={{ uri: m.uri }} style={styles.mediaImg} />
                <TouchableOpacity
                  onPress={() => removeMedia(idx)}
                  style={styles.removeBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Remove uploaded media"
                >
                  <X size={16} color="#fff" />
                </TouchableOpacity>

                {m.type === "video" && (
                  <View style={styles.videoBadge}>
                    <Text style={styles.videoBadgeText}>VIDEO</Text>
                  </View>
                )}
              </View>
            ))}

            {media.length < 10 && (
              <TouchableOpacity
                onPress={pickMedia}
                style={styles.uploadCell}
                accessibilityRole="button"
                accessibilityLabel="Add photos or videos"
              >
                <Upload size={24} color="#9CA3AF" />
                <Text style={styles.uploadText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.helperText}>Upload up to 10 photos or videos</Text>
        </View>

        {/* Tips */}
        <View style={[styles.sectionRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.sectionTitle}>A few things to consider</Text>

          {[
            "Would you recommend this to a friend?",
            "What did you love or not love?",
            "Any tips for other attendees?",
          ].map((t, i) => (
            <View key={i} style={styles.tipRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.tipText}>{t}</Text>
            </View>
          ))}
        </View>

        {/* Spacer so footer doesn't overlap */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky Post Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handlePostReview}
          disabled={!canPost}
          style={[styles.postBtn, canPost ? styles.postBtnOn : styles.postBtnOff]}
          accessibilityRole="button"
          accessibilityLabel="Post review"
        >
          <Text style={[styles.postText, canPost ? styles.postTextOn : styles.postTextOff]}>
            Post Review
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#111" },

  sectionRow: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  eventRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  eventImg: { width: 80, height: 80, borderRadius: 10, backgroundColor: "#E5E7EB" },
  eventName: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 4 },
  eventLoc: { fontSize: 13, color: "#111" },

  starsRow: { flexDirection: "row", justifyContent: "center", gap: 10 },
  starBtn: { padding: 2 },
  ratingLabel: { marginTop: 12, textAlign: "center", fontSize: 14, color: "#4B5563" },

  textarea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#111",
  },
  charCount: { marginTop: 8, fontSize: 12, color: "#6B7280" },

  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 12 },

  mediaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  mediaCell: { width: 90, height: 90 },
  mediaImg: { width: "100%", height: "100%", borderRadius: 10, backgroundColor: "#E5E7EB" },
  removeBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  videoBadge: {
    position: "absolute",
    left: 6,
    bottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  videoBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  uploadCell: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  uploadText: { fontSize: 11, color: "#6B7280" },
  helperText: { marginTop: 12, fontSize: 12, color: "#6B7280" },

  tipRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 8 },
  bullet: { marginRight: 10, fontSize: 16, color: "#4B5563", lineHeight: 18 },
  tipText: { flex: 1, fontSize: 13, color: "#4B5563", lineHeight: 18 },

  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  postBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  postBtnOn: { backgroundColor: "#FF6B35" },
  postBtnOff: { backgroundColor: "#E5E7EB" },
  postText: { fontSize: 15, fontWeight: "700" },
  postTextOn: { color: "#fff" },
  postTextOff: { color: "#9CA3AF" },
});

export default LeaveReviewScreen;
