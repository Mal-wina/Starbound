import { router } from "expo-router";
import {
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

const colors = theme.colors;
const serif = "StorySerif";

// Sample data until we connect Supabase.
const books = [
  {
    id: "moon",
    title: "The Moonlit Garden",
    author: "Elara Vale",
    status: "Currently Reading",
    artwork: require("../../assets/images/a-moonlit-garden.png"),
  },
  {
    id: "crown",
    title: "A Crown of Thorns",
    author: "Lyra Wren",
    status: "Finished",
    artwork: require("../../assets/images/crown-of-thorns.png"),
  },
  {
    id: "stars",
    title: "Where Stars Sleep",
    author: "Iris Everly",
    status: "Want to Read",
    artwork: require("../../assets/images/where-stars-sleep.png"),
  },
];

type Book = {
  id: string;
  title: string;
  author: string;
  status: string;
  artwork: ImageSourcePropType;
};

// The title and author are already part of these cover images.
function BookCover({ book }: { book: Book }) {
  return (
    <View style={styles.cover}>
      <Image
        source={book.artwork}
        style={styles.coverImage}
        resizeMode="cover"
        accessible={false}
      />
    </View>
  );
}

export default function HomeScreen() {
  const currentBook = books[0];
  const completed = books.filter((book) => book.status === "Finished").length;
  const goal = 12;
  const progress = Math.min(completed / goal, 1);

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
        {/* Castle header */}
        <View style={styles.hero}>
          <Image
            source={require("../../assets/images/sanctuary-garden.png")}
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
          {/* Currently reading */}
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

          {/* Bookshelf */}
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

          <View style={styles.bookshelf}>
            {books.map((book) => (
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

          {/* Illustrated reading goal */}
          <ReadingGoalCard completed={completed} goal={goal} />
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
    height: 300,
    overflow: "hidden",
  },
  heroImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  brand: {
    alignItems: "center",
    paddingTop: 24,
  },

  brandTitle: {
    fontFamily: "StorySemiBold",
    fontSize: 52,
    lineHeight: 62,
    letterSpacing: 0.5,
    color: "#43243B",
    textShadowColor: "rgba(255, 240, 218, 0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  hangingStar: {
    position: "absolute",
    right: 30,
    top: 0,
    alignItems: "center",
  },
  starThread: {
    height: 45,
    width: 1,
    backgroundColor: colors.gold,
  },
  goldStar: {
    color: colors.gold,
    fontSize: 21,
  },
  content: {
    marginTop: -24,
    padding: 22,
    gap: 18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.background,
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  welcome: {
    fontFamily: serif,
    color: colors.text,
    fontSize: 27,
  },
  heading: {
    fontFamily: serif,
    fontSize: 22,
    color: colors.text,
  },
  link: {
    fontSize: 12,
    color: colors.rose,
  },
  readingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: "0px 5px 16px rgba(92, 55, 75, 0.07)",
  },
  readingDetails: {
    flex: 1,
    gap: 7,
  },
  ribbon: {
    position: "absolute",
    right: 18,
    top: 0,
    width: 13,
    height: 25,
    alignItems: "center",
    paddingTop: 4,
    backgroundColor: "#D8AFC2",
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 2,
  },
  bookTitle: {
    fontFamily: serif,
    fontSize: 20,
    color: colors.text,
  },
  author: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
  },
  status: {
    fontSize: 10,
    color: colors.rose,
  },
  chevron: {
    fontSize: 25,
    color: colors.rose,
  },
  bookshelf: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  shelfBook: {
    flex: 1,
    gap: 7,
  },
  shelfTitle: {
    fontFamily: serif,
    fontSize: 15,
    lineHeight: 19,
    color: colors.text,
  },
  cover: {
    width: "100%",
    aspectRatio: 0.66,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#30283D",
    boxShadow: "2px 4px 8px rgba(49, 30, 43, 0.2)",
  },
  coverImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  goalScene: {
    width: "100%",
    maxWidth: 340,
    aspectRatio: 0.8,
    alignSelf: "center",
  },
  goalGlow: {
    position: "absolute",
    left: "22%",
    right: "22%",
    top: "24%",
    bottom: "15%",
    borderRadius: 150,
    backgroundColor: "#F0E2ED",
    opacity: 0.35,
  },
  goalArtwork: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  goalContent: {
    position: "absolute",
    left: "30%",
    right: "30%",
    top: "37%",
    alignItems: "center",
    gap: 4,
  },
  goalTitle: {
    fontFamily: serif,
    fontSize: 25,
    lineHeight: 30,
    color: colors.text,
    textAlign: "center",
  },
  goalYear: {
    fontFamily: serif,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 2,
    color: colors.muted,
  },
  goalNumber: {
    fontFamily: serif,
    fontSize: 52,
    lineHeight: 58,
    color: colors.text,
    marginTop: 4,
  },
  goalLabel: {
    fontFamily: serif,
    fontSize: 29,
    color: colors.plum,
  },
  goalBooks: {
    fontFamily: serif,
    fontSize: 20,
    lineHeight: 24,
    color: colors.plum,
  },
  goalPercent: {
    fontSize: 10,
    lineHeight: 16,
    color: colors.muted,
    marginTop: 3,
  },
  progressTrack: {
    width: "100%",
    height: 5,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#DDCAD8",
    marginTop: 9,
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: colors.rose,
  },
});
