import { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MovieContext } from './Header.jsx'

const API_URL = 'https://www.omdbapi.com/'
const API_KEY = import.meta.env.VITE_OMDB_API_KEY

async function getMovieDetails(imdbID) {
  if (!API_KEY || API_KEY === 'PASTE_MY_OMDB_API_KEY_HERE') {
    throw new Error('Add your OMDb API key to VITE_OMDB_API_KEY in .env.')
  }

  const response = await fetch(`${API_URL}?apikey=${API_KEY}&i=${encodeURIComponent(imdbID)}&plot=full`)
  if (!response.ok) throw new Error('Could not connect to OMDb.')

  const data = await response.json()
  if (data.Response === 'False') throw new Error(data.Error || 'Movie not found.')
  return data
}

async function searchMovies(title) {
  if (!API_KEY || API_KEY === 'PASTE_MY_OMDB_API_KEY_HERE') {
    throw new Error('Add your OMDb API key to VITE_OMDB_API_KEY in .env.')
  }

  const response = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(title)}&type=movie`)
  if (!response.ok) throw new Error('Could not connect to OMDb.')

  const data = await response.json()
  if (data.Response === 'False') throw new Error(data.Error || 'No movies found.')

  const results = (data.Search || []).slice(0, 8)

  // The search response does not include genres or ratings, so load those for each card.
  for (let i = 0; i < results.length; i++) {
    try {
      const details = await getMovieDetails(results[i].imdbID)
      results[i].Genre = details.Genre
      results[i].imdbRating = details.imdbRating
    } catch {
      results[i].Genre = ''
      results[i].imdbRating = 'N/A'
    }
  }

  return results
}

function MovieCard({ movie }) {
  const { favorites, setFavorites } = useContext(MovieContext)
  const hasPoster = movie.Poster && movie.Poster !== 'N/A'
  const isFavorite = favorites.includes(movie.imdbID)

  function toggleFavorite() {
    if (isFavorite) {
      setFavorites(favorites.filter((id) => id !== movie.imdbID))
    } else {
      setFavorites([...favorites, movie.imdbID])
    }
  }

  return (
    <article className="movie-card">
      <Link className="movie-card-link" to={`/movie/${movie.imdbID}`}>
        {hasPoster ? (
          <img className="movie-poster" src={movie.Poster} alt={`${movie.Title} poster`} loading="lazy" />
        ) : (
          <div className="movie-poster poster-placeholder">Poster unavailable</div>
        )}
        <div className="movie-card-info">
          <h3 title={movie.Title}>{movie.Title}</h3>
          <div className="movie-meta">
            <span>{movie.Year}</span>
            <span className="movie-rating">
              IMDb: {movie.imdbRating && movie.imdbRating !== 'N/A' ? `${movie.imdbRating}/10` : 'N/A'}
            </span>
          </div>
          <p className="movie-genre">{movie.Genre || 'Genre unavailable'}</p>
        </div>
      </Link>
      <button
        className="favorite-button"
        type="button"
        onClick={toggleFavorite}
      >
        {isFavorite ? 'Remove favorite' : 'Save favorite'}
      </button>
    </article>
  )
}

function Home() {
  const [search, setSearch] = useState('')
  const [movies, setMovies] = useState([])
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadMovies() {
      try {
        setMovies(await searchMovies('movie'))
      } catch (loadError) {
        setError(loadError.message)
      }
      setLoading(false)
    }

    loadMovies()
  }, [])

  async function handleSearch(event) {
    event.preventDefault()
    if (!search.trim()) {
      setError('Enter a movie title to search.')
      return
    }

    setLoading(true)
    setError('')
    setCategory('All')
    try {
      setMovies(await searchMovies(search.trim()))
    } catch (searchError) {
      setMovies([])
      setError(searchError.message)
    }
    setLoading(false)
  }

  const visibleMovies = movies.filter((movie) => (
    category === 'All' || (movie.Genre && movie.Genre.includes(category))
  ))

  return (
    <>
      <section className="home-intro">
        <p className="eyebrow">A better night starts here</p>
        <h1>Discover Your Next Movie</h1>
        <p>Search movies, filter by genre, and explore the details.</p>
        <form className="search-form" onSubmit={handleSearch} role="search">
          <input
            aria-label="Movie title"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Try a title, like Inception"
            type="search"
            value={search}
          />
          <button type="submit">Search</button>
        </form>
      </section>

      <section aria-labelledby="movies-heading">
        <div className="section-heading">
          <div>
            <h2 id="movies-heading">Movies</h2>
            <p>Movie information provided by OMDb</p>
          </div>
          <label className="category-filter">
            Category
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>All</option>
              <option>Action</option>
              <option>Comedy</option>
              <option>Drama</option>
              <option>Horror</option>
            </select>
          </label>
        </div>

        {loading && <p className="loading-state">Loading movies...</p>}
        {error && <p className="message-panel" role="alert">{error}</p>}
        {!loading && !error && visibleMovies.length === 0 && (
          <p className="message-panel">No movies match this category.</p>
        )}
        {!loading && !error && visibleMovies.length > 0 && (
          <div className="movie-grid">
            {visibleMovies.map((movie) => <MovieCard key={movie.imdbID} movie={movie} />)}
          </div>
        )}
      </section>
    </>
  )
}

export function MovieDetailsPage() {
  const { imdbID } = useParams()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadMovie() {
      setLoading(true)
      setError('')
      try {
        setMovie(await getMovieDetails(imdbID))
      } catch (detailsError) {
        setError(detailsError.message)
      }
      setLoading(false)
    }

    loadMovie()
  }, [imdbID])

  if (loading) return <p className="loading-state">Loading movie details...</p>
  if (error) {
    return (
      <>
        <Link className="details-back" to="/">Back to movies</Link>
        <p className="message-panel" role="alert">{error}</p>
      </>
    )
  }

  const hasPoster = movie.Poster && movie.Poster !== 'N/A'

  return (
    <>
      <Link className="details-back" to="/">Back to movies</Link>
      <article className="details-layout">
        <div className="details-poster">
          {hasPoster ? <img src={movie.Poster} alt={`${movie.Title} poster`} /> : <div className="poster-placeholder">Poster unavailable</div>}
        </div>
        <div className="details-content">
          <p className="eyebrow">Movie details</p>
          <h1>{movie.Title}</h1>
          <p className="details-subtitle">{movie.Year} · {movie.Genre}</p>
          <div className="details-rating">
            IMDb Rating: {movie.imdbRating && movie.imdbRating !== 'N/A' ? `${movie.imdbRating}/10` : 'Not available'}
          </div>
          <dl className="details-list">
            <dt>Director</dt><dd>{movie.Director || 'Not available'}</dd>
            <dt>Actors</dt><dd>{movie.Actors || 'Not available'}</dd>
          </dl>
          <h2 className="plot-heading">Plot</h2>
          <p className="plot-copy">{movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : 'Plot not available.'}</p>
        </div>
      </article>
    </>
  )
}

export default Home