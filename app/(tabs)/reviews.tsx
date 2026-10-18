import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../providers/AuthProvider";

const colors = theme.colors;

type ReviewBook = {
  book_id: string;
  books: {
    title: string;
    author: string;
  };
};

type Review = {
  id: string;
  book_id: string;
  rating: number;
  body: string;
  created_at: string;
};

const covers = {
  "the moonlit garden|elara vale": require("../../assets/images/a-moonlit-garden.png"),
  "a crown of thorns|lyra wren": require("../../assets/images/crown-of-thorns.png"),
  "where stars sleep|iris everly": require("../../assets/images/where-stars-sleep.png"),
};

function getCover(title: string, author: string) {
  const key = `${title.trim().toLowerCase()}|${author.trim().toLowerCase()}`;
  return covers[key as keyof typeof covers];
}

export default function ReviewsScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [books, setBooks] = useState<ReviewBook[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");

  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      let active = true;

      async function loadReviews() {
        setLoading(true);
        setMessage("");

        try {
          const [booksResult, reviewsResult] = await Promise.all([
            supabase
              .from("user_books")
              .select("book_id, books(title, author)")
              .eq("user_id", userId)
              .order("added_at", { ascending: false })
              .returns<ReviewBook[]>(),

            supabase
              .from("reviews")
              .select("id, book_id, rating, body, created_at")
              .eq("user_id", userId)
              .returns<Review[]>(),
          ]);

          if (booksResult.error) {
            throw new Error(booksResult.error.message);
          }

          if (reviewsResult.error) {
            throw new Error(reviewsResult.error.message);
          }

          if (active) {
            setBooks(booksResult.data ?? []);
            setReviews(reviewsResult.data ?? []);
            setSelectedBookId(null);
          }
        } catch (error) {
          if (active) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Could not load your reviews.",
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      }

      void loadReviews();

      return () => {
        active = false;
      };
    }, [userId]),
  );

  function startReview(bookId: string, existingReview?: Review) {
    if (saving || deletingReviewId) return;
    setPendingDeleteId(null);
    setSelectedBookId(bookId);
    setEditingReviewId(existingReview?.id ?? null);
    setRating(existingReview?.rating ?? 0);
    setBody(existingReview?.body ?? "");
    setMessage("");
  }

  async function handleDeleteReview(reviewId: string) {
    if (!userId || saving || deletingReviewId) return;

    setDeletingReviewId(reviewId);
    setMessage("");

    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", userId)
        .select("id")
        .single();

      if (error) throw new Error(error.message);

      setReviews((current) =>
        current.filter((review) => review.id !== reviewId),
      );

      setPendingDeleteId(null);
      setMessage("Your review has been deleted.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not delete your review. Please try again.",
      );
    } finally {
      setDeletingReviewId(null);
    }
  }

  async function handleSaveReview() {
    if (!userId || !selectedBookId || saving) return;

    if (rating < 1 || rating > 5) {
      setMessage("Choose a rating from 1 to 5 stars.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const query = editingReviewId
        ? supabase
            .from("reviews")
            .update({
              rating,
              body: body.trim(),
            })
            .eq("id", editingReviewId)
            .eq("user_id", userId)
            .eq("book_id", selectedBookId)
        : supabase.from("reviews").insert({
            user_id: userId,
            book_id: selectedBookId,
            rating,
            body: body.trim(),
          });

      const { data, error } = await query
        .select("id, book_id, rating, body, created_at")
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error(
            "You already reviewed this book. Reopen Reviews to refresh.",
          );
        }

        throw new Error(error.message);
      }

      setReviews((current) => [
        ...current.filter((review) => review.book_id !== data.book_id),
        data,
      ]);

      setMessage(
        editingReviewId
          ? "Your review has been updated."
          : "Your review has been saved.",
      );

      setSelectedBookId(null);
      setEditingReviewId(null);
      setRating(0);
      setBody("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save your review. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>My Reviews</Text>

        {!loading && (
          <Text style={styles.summary}>
            {reviews.length} saved {reviews.length === 1 ? "review" : "reviews"}
          </Text>
        )}

        {message ? (
          <Text accessibilityRole="alert" style={styles.message}>
            {message}
          </Text>
        ) : null}

        {loading ? (
          <ActivityIndicator color={colors.rose} />
        ) : books.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No books to review yet</Text>
            <Text style={styles.muted}>
              Add a book in My Library, then return here.
            </Text>
          </View>
        ) : (
          books.map((entry) => {
            const book = entry.books;
            const review = reviews.find(
              (item) => item.book_id === entry.book_id,
            );
            const cover = getCover(book.title, book.author);
            const isWriting = selectedBookId === entry.book_id;

            return (
              <View key={entry.book_id} style={styles.card}>
                <View style={styles.bookRow}>
                  <View style={styles.coverFrame}>
                    {cover ? (
                      <Image
                        source={cover}
                        style={styles.cover}
                        resizeMode="contain"
                        accessibilityLabel={`${book.title} cover`}
                      />
                    ) : (
                      <Text style={styles.coverInitial}>
                        {book.title.charAt(0)}
                      </Text>
                    )}
                  </View>

                  <View style={styles.bookDetails}>
                    <Text style={styles.bookTitle}>{book.title}</Text>
                    <Text style={styles.muted}>{book.author}</Text>

                    {review && (
                      <>
                        <Text
                          accessibilityLabel={`${review.rating} out of 5 stars`}
                          style={styles.savedStars}
                        >
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </Text>

                        <Text style={styles.date}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                {review && !isWriting ? (
                  <>
                    <Text style={styles.reviewBody}>
                      {review.body || "Rated without a written review."}
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      disabled={saving || !!deletingReviewId}
                      onPress={() => startReview(entry.book_id, review)}
                      style={styles.writeButton}
                    >
                      <Text style={styles.actionText}>Edit review</Text>
                    </Pressable>

                    {pendingDeleteId === review.id ? (
                      <View
                        style={{
                          marginTop: 10,
                          padding: 14,
                          borderRadius: 14,
                          backgroundColor: colors.pink,
                        }}
                      >
                        <Text
                          style={{
                            color: colors.text,
                            fontSize: 14,
                            lineHeight: 22,
                          }}
                        >
                          Delete this review? Your book will stay in your
                          library.
                        </Text>

                        <Pressable
                          accessibilityRole="button"
                          disabled={saving || !!deletingReviewId}
                          onPress={() => void handleDeleteReview(review.id)}
                          style={styles.textButton}
                        >
                          <Text style={styles.actionText}>
                            {deletingReviewId === review.id
                              ? "Deleting..."
                              : "Yes, delete review"}
                          </Text>
                        </Pressable>

                        <Pressable
                          accessibilityRole="button"
                          disabled={!!deletingReviewId}
                          onPress={() => setPendingDeleteId(null)}
                          style={styles.textButton}
                        >
                          <Text style={{ color: colors.plum, fontSize: 14 }}>
                            Cancel
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        disabled={saving || !!deletingReviewId}
                        onPress={() => {
                          setPendingDeleteId(review.id);
                          setMessage("");
                        }}
                        style={styles.textButton}
                      >
                        <Text style={styles.actionText}>Delete review</Text>
                      </Pressable>
                    )}
                  </>
                ) : isWriting ? (
                  <View style={styles.form}>
                    <Text style={styles.label}>Your rating</Text>

                    <View style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Pressable
                          key={value}
                          accessibilityRole="button"
                          accessibilityLabel={`Rate ${value} out of 5 stars`}
                          accessibilityState={{ selected: rating === value }}
                          disabled={saving}
                          onPress={() => setRating(value)}
                          style={styles.starButton}
                        >
                          <Text style={styles.star}>
                            {value <= rating ? "★" : "☆"}
                          </Text>
                        </Pressable>
                      ))}
                    </View>

                    <Text style={styles.label}>Your review</Text>

                    <TextInput
                      accessibilityLabel="Your written review"
                      value={body}
                      onChangeText={setBody}
                      multiline
                      maxLength={5000}
                      editable={!saving}
                      placeholder="What did you think of this book?"
                      placeholderTextColor={colors.muted}
                      style={styles.input}
                    />

                    <Text style={styles.characterCount}>
                      {body.length} / 5000
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      disabled={saving}
                      onPress={() => void handleSaveReview()}
                      style={[styles.saveButton, saving && styles.dimmed]}
                    >
                      {saving ? (
                        <ActivityIndicator color={colors.card} />
                      ) : (
                        <Text style={styles.saveText}>
                          {editingReviewId ? "Save changes" : "Save review"}
                        </Text>
                      )}
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      disabled={saving}
                      onPress={() => {
                        setSelectedBookId(null);
                        setMessage("");
                      }}
                      style={styles.textButton}
                    >
                      <Text style={styles.actionText}>Cancel</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    disabled={saving}
                    onPress={() => startReview(entry.book_id)}
                    style={styles.writeButton}
                  >
                    <Text style={styles.actionText}>Write a review</Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    padding: 22,
    paddingBottom: 40,
    gap: 16,
  },
  heading: {
    fontFamily: "StorySemiBold",
    fontSize: 36,
    color: colors.text,
  },
  summary: {
    color: colors.muted,
    fontSize: 14,
    marginBottom: 4,
  },
  message: {
    color: colors.plum,
    fontSize: 14,
    lineHeight: 22,
  },
  card: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  bookRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  coverFrame: {
    width: 68,
    height: 102,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.plum,
    alignItems: "center",
    justifyContent: "center",
  },
  cover: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  coverInitial: {
    fontFamily: "StorySemiBold",
    fontSize: 38,
    color: colors.card,
  },
  bookDetails: {
    flex: 1,
    gap: 4,
  },
  bookTitle: {
    fontFamily: "StorySemiBold",
    fontSize: 25,
    lineHeight: 28,
    color: colors.text,
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  savedStars: {
    color: colors.rose,
    fontSize: 23,
    letterSpacing: 1,
  },
  date: {
    color: colors.muted,
    fontSize: 12,
  },
  reviewBody: {
    marginTop: 16,
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
  },
  form: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    marginBottom: 8,
  },
  starRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  starButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  star: {
    fontSize: 34,
    color: colors.rose,
  },
  input: {
    minHeight: 130,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: "top",
  },
  characterCount: {
    marginTop: 6,
    textAlign: "right",
    color: colors.muted,
    fontSize: 12,
  },
  saveButton: {
    minHeight: 50,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: colors.rose,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: colors.card,
    fontSize: 15,
    fontWeight: "600",
  },
  textButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  writeButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionText: {
    color: colors.rose,
    fontSize: 14,
    fontWeight: "600",
  },
  dimmed: {
    opacity: 0.7,
  },
  empty: {
    paddingVertical: 36,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: "StoryItalic",
    color: colors.text,
    fontSize: 28,
  },
});
