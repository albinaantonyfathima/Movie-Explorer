import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import Header, { MovieContext } from './Header.jsx'
import HomePage, { MovieDetailsPage } from './Home.jsx'
import './App.css'

function App() {
  const [favorites, setFavorites] = useState([])

  return (
    <MovieContext.Provider value={{ favorites, setFavorites }}>
      <Header />
      <main className="page-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<HomePage />} />
          <Route path="/movie/:imdbID" element={<MovieDetailsPage />} />
          <Route path="*" element={<p className="message-panel">Page not found. <Link to="/">Return home</Link></p>} />
        </Routes>
      </main>
      <footer className="site-footer">Movie information provided by OMDb.</footer>
    </MovieContext.Provider>
  )
}

export default App
