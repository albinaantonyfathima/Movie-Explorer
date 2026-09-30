import { createContext } from 'react'
import { Link } from 'react-router-dom'

export const MovieContext = createContext(null)

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="CineFind home">
          <span className="brand-mark" aria-hidden="true">C</span>
          <span>CineFind</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
        </nav>
      </div>
    </header>
  )
}

export default Header