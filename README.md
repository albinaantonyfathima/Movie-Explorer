# Movie Explorer Application

A beginner-friendly React app for searching movies with the OMDb API, filtering results by genre, and viewing movie details.

## Run the app

Install the dependencies and start Vite:

```sh
npm install
npm run dev
```

Add an OMDb API key to the existing `.env` file:

```text
VITE_OMDB_API_KEY=your_key_here
```

Restart the dev server after changing `.env`. Do not commit your real API key.

## Routes

- `/` displays movie search and genre filters.
- `/search?q=movie-name` opens search results for a movie.
- `/movie/:id` displays details for one IMDb movie ID.

## React concepts

- `useState` stores form values, movies, loading/error messages, category, and favorites.
- `useEffect` loads movie lists and fetches details when the movie ID changes.
- `MovieContext` shares favorite movie IDs between components.
- `Link` and React Router provide page navigation without full page reloads.
- OMDb search results do not contain genres or ratings, so the app requests details for each displayed result before filtering.
