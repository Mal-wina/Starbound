import { router } from "expo-router";
import {
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../../constants/theme";

const colors = theme.colors;
const serif = Platform.OS === "android" ? "serif" : "Georgia";

// Sample books for building the layout.
// Later, these will come from your Supabase library.
const books = [
  {
    id: "moon",
    title: "The Moonlit Garden",
    author: "Elara Vale",
    status: "Currently Reading",
    artwork: require("../../assets/images/moon-garden-cover.png"),
  },
  {
    id: "crown",
    title: "A Crown of Thorns",
    author: "Lyra Wren",
    status: "Finished",
    artwork: require("../../assets/images/rose-crown-cover.png"),
  },
  {
    id: "stars",
    title: "Where Stars Sleep",
    author: "Iris Everly",
    status: "Want to Read",
    artwork: require("../../assets/images/lavender-castle-cover.png"),
  },
];

type Book = {
  id: string;
  title: string;
  author: string;
  status: string;
  artwork: ImageSourcePropType;
};

function BookCover({ book, small = false }: { book: Book; small?: boolean }) {
  return (
    <View style={styles.cover}>
      <Image
        source={book.artwork}
        style={styles.coverImage}
        resizeMode="cover"
        accessible={false}
      />

      <View style={styles.coverFrame}>
        <Text style={styles.coverStar}>✧</Text>

        <Text
          numberOfLines={4}
          style={[styles.coverTitle, small && { fontSize: 10, lineHeight: 12 }]}
        >
          {book.title}
        </Text>

        {!small && (
          <Text style={styles.coverAuthor}>{book.author.toUpperCase()}</Text>
        )}
      </View>
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
        {/* Illustrated header */}
        <View style={styles.hero}>
          <Image
            source={require("../../assets/images/sanctuary-garden.png")}
            style={styles.heroImage}
            resizeMode="cover"
            accessible={false}
          />

          <View style={styles.brand}>
            <Text style={styles.brandStars}>✧ ☾ ✧</Text>
            <Text style={styles.brandTitle}>Starbound</Text>
          </View>

          <View style={styles.hangingStar}>
            <View style={styles.starThread} />
            <Text style={styles.goldStar}>✦</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.sectionHeading}>
            <Text style={styles.welcome}>My reading</Text>
            <Text style={styles.goldStar}>✧</Text>
          </View>

          {/* Current book */}
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
              <BookCover book={currentBook} small />
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

          {/* Reading goal */}
          <View style={styles.goalCard}>
            <View style={styles.sectionHeading}>
              <Text style={styles.heading}>Reading goal</Text>
              <Text style={styles.goldStar}>☾</Text>
            </View>

            <Text style={styles.goalNumber}>
              {completed}
              <Text style={styles.goalLabel}> / {goal} books</Text>
            </Text>

            <View
              accessibilityRole="progressbar"
              accessibilityValue={{
                min: 0,
                max: goal,
                now: completed,
              }}
              style={styles.progressTrack}
            >
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>

            <Text style={styles.author}>Sample library</Text>
          </View>
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
    paddingTop: 28,
    gap: 6,
  },
  brandStars: {
    fontSize: 14,
    letterSpacing: 6,
    color: colors.plum,
  },
  brandTitle: {
    fontFamily: serif,
    fontSize: 43,
    color: colors.text,
    textShadowColor: "#FFF5E8",
    textShadowRadius: 10,
    textShadowOffset: { width: 0, height: 1 },
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
  coverFrame: {
    flex: 1,
    margin: 5,
    padding: 4,
    gap: 6,
    borderWidth: 0.5,
    borderColor: "#D9BA8799",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  coverStar: {
    color: "#E7C999",
    fontSize: 11,
  },
  coverTitle: {
    fontFamily: serif,
    fontSize: 16,
    lineHeight: 19,
    color: "#FFF0D8",
    textAlign: "center",
    textShadowColor: "#21162E",
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 1 },
  },
  coverAuthor: {
    color: "#F1DCC0",
    fontSize: 7,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  goalCard: {
    padding: 20,
    gap: 14,
    borderRadius: theme.radius.card,
    backgroundColor: colors.lavender,
    borderWidth: 1,
    borderColor: "#DECDDF",
    marginTop: 6,
  },
  goalNumber: {
    fontFamily: serif,
    fontSize: 34,
    color: colors.text,
  },
  goalLabel: {
    fontSize: 17,
    color: colors.muted,
  },
  progressTrack: {
    height: 7,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#DBCBD9",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: colors.rose,
  },
});
