# Starbound

Starbound is a mobile reading tracker I built for a university assignment.
I wanted it to feel like a small fantasy bookshelf, with soft colours,
flowers and illustrated book covers.

## What you can do

- Create an account and log in
- Add books to your library
- Mark books as Want to Read, Currently Reading, or Finished
- Remove books from your library
- Give books a star rating and write, edit, or delete reviews
- Set a yearly reading goal and see your progress on Home

Each account has its own library and reviews. When someone adds a book
with the same title and author as an existing book, the app reuses its
details instead of creating another copy.

## Built with

- React Native and Expo
- TypeScript
- Expo Router
- Supabase for authentication and the PostgreSQL database

The database has four tables: profiles, books, user_books, and reviews.
Row Level Security controls access to each user's personal data.

## Design

The interface uses pastel pink, lavender, cream, floral decorations
and fantasy-inspired artwork. The artwork was generated with AI,
and I used AI assistance while developing and debugging the app.

## Testing

I tested the app in a browser and on my phone. I also used two accounts to check that libraries and reviews stayed separate and ran database checks for access permissions.

## Limitations

Books need to be added manually. Three sample books have illustrated
covers, but other books use a placeholder. Search suggestions, social
features and recommendations are outside the scope of this version.
