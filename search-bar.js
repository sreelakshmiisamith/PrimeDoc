"use client"

import { useState, useRef, useEffect } from "react"

export default function SearchBar({ searchTerm, onSearchChange, doctors }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value
    onSearchChange(value)

    if (value.trim() === "") {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Generate suggestions based on doctor names
    const matchedDoctors = doctors.filter((doctor) => doctor.name.toLowerCase().includes(value.toLowerCase()))

    setSuggestions(matchedDoctors.slice(0, 3))
    setShowSuggestions(true)
  }

  // Handle suggestion selection
  const handleSuggestionClick = (name) => {
    onSearchChange(name)
    setShowSuggestions(false)
  }

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setShowSuggestions(false)
  }

  return (
    <div className="search-container mx-auto" ref={searchRef}>
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          data-testid="autocomplete-input"
          placeholder="Search for doctors by name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <button type="submit" className="search-button">
          <i className="fa fa-search">🔍</i>
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((doctor, index) => (
            <li
              key={index}
              data-testid="suggestion-item"
              onClick={() => handleSuggestionClick(doctor.name)}
              className="suggestion-item"
            >
              {doctor.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
