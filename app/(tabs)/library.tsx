import { useEffect, useState } from "react";
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

const statuses = [
  { value: "want_to_read", label: "Want to Read" },
  { value: "currently_reading", label: "Currently Reading" },
  { value: "finished", label: "Finished" },
] as const;

type ReadingStatus = (typeof statuses)[number]["value"];

type LibraryEntry = {
  book_id: string;
  status: ReadingStatus;
  books: {
    title: string;
    author: string;
    genre: string;
  };
};

const coverImages = {
  "the moonlit garden|elara vale": require("../../assets/images/a-moonlit-garden.png"),
  "a crown of thorns|lyra wren": require("../../assets/images/crown-of-thorns.png"),
  "where stars sleep|iris everly": require("../../assets/images/where-stars-sleep.png"),
};

function getCover(title: string, author: string) {
  const key = `${title.trim().toLowerCase()}|${author.trim().toLowerCase()}`;
  return coverImages[key as keyof typeof coverImages];
}

async function fetchLibrary(userId: string) {
  const { data, error } = await supabase
    .from("user_books")
    .select("book_id, status, books(title, author, genre)")
    .eq("user_id", userId)
    .order("added_at", { ascending: false })
    .returns<LibraryEntry[]>();

  if (error) throw new Error(error.message);

  return data ?? [];
}

export default function LibraryScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState<ReadingStatus>("want_to_read");

  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [updatingBookId, setUpdatingBookId] = useState<string | null>(null);

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    async function load() {
      try {
        const books = await fetchLibrary(userId!);
        if (active) setEntries(books);
      } catch (error) {
        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Could not load your library.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [userId]);

  async function handleAddBook() {
    if (saving || !userId) return;

    setMessage("");

    if (!title.trim() || !author.trim() || !genre.trim()) {
      setMessage("Please enter a title, author, and genre.");
      return;
    }

    setSaving(true);
    let saved = false;

    try {
      const { data, error } = await supabase.rpc("add_book_to_library", {
        p_title: title.trim(),
        p_author: author.trim(),
        p_genre: genre.trim(),
        p_status: status,
      });

      if (error) throw new Error(error.message);

      const result = data?.[0];

      if (!result) {
        throw new Error("No save result was returned. Please try again.");
      }

      saved = true;

      setMessage(
        result.added
          ? "Book added to your library."
          : "This book is already in your library.",
      );

      setTitle("");
      setAuthor("");
      setGenre("");
      setStatus("want_to_read");
      setShowForm(false);

      const books = await fetchLibrary(userId);
      setEntries(books);
    } catch (error) {
      setMessage(
        saved
          ? "Your book was saved, but the shelf could not refresh. Reload the page."
          : error instanceof Error
            ? error.message
            : "Could not save your book. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleChangeStatus(
    entry: LibraryEntry,
    nextStatus: ReadingStatus,
  ) {
    if (!userId || updatingBookId || saving || deletingBookId) return;

    if (entry.status === nextStatus) {
      setEditingBookId(null);
      return;
    }

    setUpdatingBookId(entry.book_id);
    setMessage("");

    try {
      const { error } = await supabase
        .from("user_books")
        .update({
          status: nextStatus,
          finished_at:
            nextStatus === "finished" ? new Date().toISOString() : null,
        })
        .eq("user_id", userId)
        .eq("book_id", entry.book_id)
        .select("book_id")
        .single();

      if (error) throw new Error(error.message);

      setEntries((current) =>
        current.map((book) =>
          book.book_id === entry.book_id
            ? { ...book, status: nextStatus }
            : book,
        ),
      );

      setEditingBookId(null);
      setMessage("Reading status updated.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update the status. Please try again.",
      );
    } finally {
      setUpdatingBookId(null);
    }
  }

  async function handleRemoveBook(bookId: string) {
    if (!userId || deletingBookId || updatingBookId || saving) return;

    setDeletingBookId(bookId);
    setMessage("");

    try {
      const { error } = await supabase
        .from("user_books")
        .delete()
        .eq("user_id", userId)
        .eq("book_id", bookId)
        .select("book_id")
        .single();

      if (error) throw new Error(error.message);

      setEntries((current) =>
        current.filter((entry) => entry.book_id !== bookId),
      );

      setPendingDeleteId(null);
      setEditingBookId(null);
      setMessage("Book removed from your library.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not remove the book. Please try again.",
      );
    } finally {
      setDeletingBookId(null);
    }
  }

  const selectedEntry = entries.find(
    (entry) => entry.book_id === editingBookId,
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heading}>
          <Text style={styles.title}>My Library</Text>

          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={() => {
              setShowForm(!showForm);
              setMessage("");
            }}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>
              {showForm ? "Close" : "+ Add book"}
            </Text>
          </Pressable>
        </View>

        {showForm && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>A new addition</Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              accessibilityLabel="Book title"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholder="The Moonlit Garden"
              placeholderTextColor={colors.muted}
              maxLength={200}
              editable={!saving}
            />

            <Text style={styles.label}>Author</Text>
            <TextInput
              accessibilityLabel="Book author"
              value={author}
              onChangeText={setAuthor}
              style={styles.input}
              placeholder="Elara Vale"
              placeholderTextColor={colors.muted}
              maxLength={150}
              editable={!saving}
            />

            <Text style={styles.label}>Genre</Text>
            <TextInput
              accessibilityLabel="Book genre"
              value={genre}
              onChangeText={setGenre}
              style={styles.input}
              placeholder="Fantasy"
              placeholderTextColor={colors.muted}
              maxLength={80}
              editable={!saving}
            />

            <Text style={styles.label}>Reading status</Text>

            <View style={styles.statusOptions}>
              {statuses.map((option) => (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: status === option.value }}
                  disabled={saving}
                  onPress={() => setStatus(option.value)}
                  style={[
                    styles.statusOption,
                    status === option.value && styles.statusSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      status === option.value && styles.statusTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={() => void handleAddBook()}
              style={[styles.saveButton, saving && styles.dimmed]}
            >
              {saving ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.saveText}>Add to my library</Text>
              )}
            </Pressable>
          </View>
        )}

        {message ? (
          <Text accessibilityRole="alert" style={styles.message}>
            {message}
          </Text>
        ) : null}

        {selectedEntry && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>{selectedEntry.books.title}</Text>

            <Text style={styles.label}>Reading status</Text>

            <View style={styles.statusOptions}>
              {statuses.map((option) => (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: selectedEntry.status === option.value,
                  }}
                  disabled={!!updatingBookId || !!deletingBookId || saving}
                  onPress={() =>
                    void handleChangeStatus(selectedEntry, option.value)
                  }
                  style={[
                    styles.statusOption,
                    selectedEntry.status === option.value &&
                      styles.statusSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      selectedEntry.status === option.value &&
                        styles.statusTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {updatingBookId ? (
              <ActivityIndicator
                color={colors.rose}
                style={{ marginTop: 16 }}
              />
            ) : null}

            {pendingDeleteId === selectedEntry.book_id ? (
              <View style={{ marginTop: 20 }}>
                <Text style={{ color: colors.text, lineHeight: 22 }}>
                  Remove this book and your review for it?
                </Text>

                <Pressable
                  accessibilityRole="button"
                  disabled={!!deletingBookId || !!updatingBookId || saving}
                  onPress={() => void handleRemoveBook(selectedEntry.book_id)}
                  style={{ paddingVertical: 14 }}
                >
                  <Text style={{ color: colors.rose, fontWeight: "600" }}>
                    {deletingBookId ? "Removing..." : "Yes, remove"}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={!!deletingBookId}
                  onPress={() => setPendingDeleteId(null)}
                  style={{ paddingVertical: 12 }}
                >
                  <Text style={{ color: colors.plum }}>Cancel removal</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                disabled={!!deletingBookId || !!updatingBookId || saving}
                onPress={() => setPendingDeleteId(selectedEntry.book_id)}
                style={{ paddingTop: 22, paddingBottom: 12 }}
              >
                <Text style={{ color: colors.rose, fontSize: 14 }}>
                  Remove from my library
                </Text>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={!!updatingBookId || !!deletingBookId}
              onPress={() => {
                setEditingBookId(null);
                setPendingDeleteId(null);
              }}
              style={{ paddingVertical: 12 }}
            >
              <Text style={{ color: colors.plum, fontSize: 14 }}>Close</Text>
            </Pressable>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={colors.rose} style={{ marginTop: 30 }} />
        ) : entries.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Your shelves are waiting</Text>
            <Text style={styles.emptyText}>
              Add your first book to begin your collection.
            </Text>
          </View>
        ) : (
          <View style={styles.shelf}>
            {entries.map((entry) => {
              const book = entry.books;
              const cover = getCover(book.title, book.author);

              return (
                <View key={entry.book_id} style={styles.book}>
                  {cover ? (
                    <View style={styles.coverFrame}>
                      <Image
                        source={cover}
                        style={styles.cover}
                        resizeMode="contain"
                        accessibilityLabel={`${book.title} cover`}
                      />
                    </View>
                  ) : (
                    <View style={styles.fallbackCover}>
                      <Text style={styles.coverDecoration}>✦</Text>
                      <Text style={styles.coverTitle} numberOfLines={4}>
                        {book.title}
                      </Text>
                      <Text style={styles.coverAuthor} numberOfLines={2}>
                        {book.author}
                      </Text>
                    </View>
                  )}

                  <Text style={styles.bookTitle} numberOfLines={2}>
                    {book.title}
                  </Text>

                  <Text style={styles.author} numberOfLines={1}>
                    {book.author}
                  </Text>

                  <Text style={styles.genre} numberOfLines={1}>
                    {book.genre}
                  </Text>

                  <View style={styles.statusBadge}>
                    <Text style={styles.bookStatus}>
                      {
                        statuses.find((option) => option.value === entry.status)
                          ?.label
                      }
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Manage ${book.title}`}
                    disabled={!!updatingBookId || !!deletingBookId || saving}
                    onPress={() => {
                      setEditingBookId(
                        editingBookId === entry.book_id ? null : entry.book_id,
                      );
                      setPendingDeleteId(null);
                      setMessage("");
                    }}
                    style={styles.manageButton}
                  >
                    <Text style={styles.manageText}>Manage</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
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
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontFamily: "StorySemiBold",
    fontSize: 36,
    color: colors.text,
    flexShrink: 1,
  },
  addButton: {
    backgroundColor: colors.pink,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addButtonText: {
    color: colors.text,
    fontSize: 14,
  },
  form: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  formTitle: {
    fontFamily: "StoryItalic",
    fontSize: 28,
    color: colors.text,
    flexShrink: 1,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginTop: 14,
    marginBottom: 8,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusOption: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusSelected: {
    backgroundColor: colors.plum,
    borderColor: colors.plum,
  },
  statusText: {
    fontSize: 14,
    color: colors.text,
  },
  statusTextSelected: {
    color: colors.card,
  },
  saveButton: {
    minHeight: 50,
    marginTop: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.rose,
  },
  saveText: {
    color: colors.card,
    fontSize: 15,
    fontWeight: "600",
  },
  dimmed: {
    opacity: 0.7,
  },
  message: {
    color: colors.plum,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  empty: {
    paddingVertical: 50,
    alignItems: "center",
  },
  emptyTitle: {
    fontFamily: "StoryItalic",
    fontSize: 28,
    color: colors.text,
    textAlign: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
    textAlign: "center",
  },
  shelf: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 22,
  },
  book: {
    width: "48%",
    padding: 10,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  coverFrame: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.lavender,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cover: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  fallbackCover: {
    width: "100%",
    aspectRatio: 2 / 3,
    padding: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: colors.plum,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  coverDecoration: {
    color: colors.gold,
    fontSize: 22,
    marginBottom: 8,
  },
  coverTitle: {
    fontFamily: "StorySemiBold",
    fontSize: 18,
    color: colors.card,
    textAlign: "center",
  },
  coverAuthor: {
    marginTop: 8,
    color: colors.pink,
    fontSize: 10,
    textAlign: "center",
  },
  bookTitle: {
    fontFamily: "StorySemiBold",
    fontSize: 21,
    lineHeight: 24,
    color: colors.text,
    marginTop: 9,
  },
  author: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  genre: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.pink,
  },
  bookStatus: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
  },
  manageButton: {
    marginTop: 8,
    minHeight: 44,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  manageText: {
    color: colors.plum,
    fontSize: 13,
    fontWeight: "600",
  },
});
