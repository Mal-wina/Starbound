import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ReadingGoalCard from "../../components/ReadingGoalCard";
import { theme } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../providers/AuthProvider";

const colors = theme.colors;
const serif = "StorySerif";

type LibraryRow = {
  book_id: string;
  status: string;
  finished_at: string | null;
  books: {
    title: string;
    author: string;
  };
};

type Book = {
  id: string;
  title: string;
  author: string;
  status: string;
  finishedAt: string | null;
  artwork?: ImageSourcePropType;
};

type HomeData = {
  username: string;
  goal: number;
  books: Book[];
};

const covers = {
  "the moonlit garden|elara vale": require("../../assets/images/a-moonlit-garden.png"),
  "a crown of thorns|lyra wren": require("../../assets/images/crown-of-thorns.png"),
  "where stars sleep|iris everly": require("../../assets/images/where-stars-sleep.png"),
};

function getArtwork(title: string, author: string) {
  const key = `${title.trim().toLowerCase()}|${author.trim().toLowerCase()}`;
  return covers[key as keyof typeof covers];
}

function BookCover({ book }: { book: Book }) {
  return (
    <View style={styles.cover}>
      {book.artwork ? (
        <Image
          source={book.artwork}
          style={styles.coverImage}
          resizeMode="contain"
          accessible={false}
        />
      ) : (
        <View
          style={{
            flex: 1,
            padding: 8,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: colors.gold,
          }}
        >
          <Text
            numberOfLines={4}
            style={{
              fontFamily: "StorySemiBold",
              fontSize: 17,
              color: colors.card,
              textAlign: "center",
            }}
          >
            {book.title}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;

  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Refresh whenever the reader returns to Home.
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      let active = true;

      async function loadHome() {
        setLoading(true);
        setMessage("");

        try {
          const [profileResult, libraryResult] = await Promise.all([
            supabase
              .from("profiles")
              .select("username, reading_goal")
              .eq("id", userId)
              .single(),

            supabase
              .from("user_books")
              .select("book_id, status, finished_at, books(title, author)")
              .eq("user_id", userId)
              .order("added_at", { ascending: false })
              .returns<LibraryRow[]>(),
          ]);

          if (profileResult.error) {
            throw new Error(profileResult.error.message);
          }

          if (libraryResult.error) {
            throw new Error(libraryResult.error.message);
          }

          const savedBooks: Book[] = (libraryResult.data ?? []).map(
            (entry) => ({
              id: entry.book_id,
              title: entry.books.title,
              author: entry.books.author,
              status: entry.status,
              finishedAt: entry.finished_at,
              artwork: getArtwork(entry.books.title, entry.books.author),
            }),
          );

          if (active) {
            setData({
              username: profileResult.data.username,
              goal: profileResult.data.reading_goal,
              books: savedBooks,
            });
          }
        } catch (error) {
          if (active) {
            setMessage(
              error instanceof Error
                ? error.message
                : "Could not load your reading overview.",
            );
          }
        } finally {
          if (active) setLoading(false);
        }
      }

      void loadHome();

      return () => {
        active = false;
      };
    }, [userId]),
  );

  const books = data?.books ?? [];

  const currentBook = books.find((book) => book.status === "currently_reading");

  const totalCompleted = books.filter(
    (book) => book.status === "finished",
  ).length;

  const currentYear = new Date().getFullYear();

  const completedThisYear = books.filter(
    (book) =>
      book.status === "finished" &&
      book.finishedAt !== null &&
      new Date(book.finishedAt).getFullYear() === currentYear,
  ).length;

  function openLibrary() {
    router.push("/library");
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.hero}>
          <Image
            source={require("../../assets/images/starbound-dawn-header.png")}
            style={styles.heroImage}
            resizeMode="cover"
            accessible={false}
          />

          <View style={styles.brand}>
            <Text style={styles.brandTitle}>Starbound</Text>
          </View>

          <View style={styles.hangingStar}>
            <View style={styles.starThread} />
            <Text style={styles.goldStar}>✦</Text>
          </View>
        </View>

        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color={colors.rose} />
          ) : message ? (
            <Text accessibilityRole="alert" style={styles.author}>
              {message}
            </Text>
          ) : data ? (
            <>
              <View style={{ gap: 6 }}>
                <Text style={styles.welcome}>
                  Welcome back, {data.username}
                </Text>

                <Text style={styles.author}>
                  {totalCompleted} {totalCompleted === 1 ? "book" : "books"}{" "}
                  finished
                  {" · "}
                  {books.length} in your library
                </Text>
              </View>

              <View style={styles.sectionHeading}>
                <Text style={styles.heading}>Currently reading</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={openLibrary}
                  hitSlop={10}
                >
                  <Text style={styles.link}>My library ›</Text>
                </Pressable>
              </View>

              {currentBook ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View current book in my library"
                  onPress={openLibrary}
                  style={styles.readingCard}
                >
                  <View style={styles.ribbon}>
                    <Text style={{ color: "#FFF4D8", fontSize: 9 }}>✦</Text>
                  </View>

                  <View style={{ width: 70 }}>
                    <BookCover book={currentBook} />
                  </View>

                  <View style={styles.readingDetails}>
                    <Text style={styles.bookTitle}>{currentBook.title}</Text>
                    <Text style={styles.author}>{currentBook.author}</Text>
                    <Text style={styles.status}>Currently Reading</Text>
                  </View>

                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={openLibrary}
                  style={styles.readingCard}
                >
                  <Text style={[styles.author, { flex: 1 }]}>
                    Choose a book in My Library and mark it Currently Reading to
                    display it here.
                  </Text>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              )}

              <View style={styles.sectionHeading}>
                <Text style={styles.heading}>My bookshelf</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={openLibrary}
                  hitSlop={10}
                >
                  <Text style={styles.link}>View all ›</Text>
                </Pressable>
              </View>

              {books.length === 0 ? (
                <Text style={styles.author}>
                  Your library is empty. Add your first book in My Library.
                </Text>
              ) : (
                <View style={styles.bookshelf}>
                  {books.slice(0, 3).map((book) => (
                    <Pressable
                      key={book.id}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${book.title} in my library`}
                      onPress={openLibrary}
                      style={styles.shelfBook}
                    >
                      <BookCover book={book} />

                      <Text numberOfLines={2} style={styles.shelfTitle}>
                        {book.title}
                      </Text>

                      <Text numberOfLines={1} style={styles.author}>
                        {book.author}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <ReadingGoalCard completed={completedThisYear} goal={data.goal} />
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  hero: {
    width: "100%",
    aspectRatio: 2,
    overflow: "hidden",
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  brand: {
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  brandTitle: {
    fontFamily: "StorySemiBold",
    fontSize: 52,
    lineHeight: 64,
    color: "#51334B",
  },
  heading: {
    fontFamily: "StorySemiBold",
    fontSize: 25,
    lineHeight: 31,
    color: colors.text,
    flexShrink: 1,
  },
  hangingStar: {
    display: "none",
  },
  starThread: {
    width: 1,
    height: 30,
    backgroundColor: colors.gold,
  },
  goldStar: {
    color: colors.gold,
    fontSize: 20,
  },
  content: {
    marginTop: -22,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 12,
    gap: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: colors.background,
  },
  welcomeLabel: {
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0.8,
    color: colors.muted,
  },
  welcome: {
    fontFamily: "StoryItalic",
    fontSize: 30,
    lineHeight: 36,
    color: colors.plum,
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  link: {
    fontSize: 13,
    color: colors.rose,
  },
  readingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 18,
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: "0px 5px 16px rgba(92, 55, 75, 0.06)",
  },
  readingDetails: {
    flex: 1,
    gap: 7,
  },
  ribbon: {
    position: "absolute",
    right: 18,
    top: 0,
    width: 14,
    height: 28,
    alignItems: "center",
    paddingTop: 5,
    backgroundColor: "#D8AFC2",
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 2,
  },
  bookTitle: {
    fontFamily: "StorySemiBold",
    fontSize: 24,
    lineHeight: 28,
    color: colors.text,
  },
  author: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  status: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: colors.pink,
    fontSize: 11,
    lineHeight: 16,
    color: colors.text,
  },
  chevron: {
    fontSize: 26,
    color: colors.rose,
  },
  bookshelf: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 12,
  },
  shelfBook: {
    width: "30%",
    flexGrow: 0,
    flexShrink: 0,
    gap: 7,
  },
  shelfTitle: {
    fontFamily: "StorySemiBold",
    fontSize: 18,
    lineHeight: 21,
    color: colors.text,
  },
  cover: {
    width: "100%",
    aspectRatio: 2 / 3,
    borderRadius: 9,
    overflow: "hidden",
    backgroundColor: colors.plum,
    boxShadow: "2px 4px 8px rgba(49, 30, 43, 0.16)",
  },
  coverImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
});
