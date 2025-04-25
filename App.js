"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import "./App.css"

function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [consultationType, setConsultationType] = useState("")
  const [selectedSpecialties, setSelectedSpecialties] = useState([])
  const [sortBy, setSortBy] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchRef = useRef(null)

  // Fetch doctors data from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json")
        if (!response.ok) {
          throw new Error("Failed to fetch data")
        }
        const data = await response.json()
        setDoctors(data)
        setFilteredDoctors(data)

        // Extract unique specialties
        const allSpecialties = new Set()
        data.forEach((doctor) => {
          if (Array.isArray(doctor.specialties)) {
            doctor.specialties.forEach((specialty) => allSpecialties.add(specialty))
          } else if (doctor.specialties) {
            allSpecialties.add(doctor.specialties)
          }
        })
        setSpecialties(Array.from(allSpecialties).sort())

        setIsLoading(false)
      } catch (err) {
        setError(err.message)
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // Handle URL params
  useEffect(() => {
    const search = searchParams.get("search") || ""
    const consult = searchParams.get("consult") || ""
    const sort = searchParams.get("sort") || ""
    const specs = searchParams.getAll("specialty") || []

    setSearchTerm(search)
    setConsultationType(consult)
    setSortBy(sort)
    setSelectedSpecialties(specs)
  }, [searchParams])

  // Apply filters when filter state changes
  useEffect(() => {
    applyFilters()
  }, [searchTerm, consultationType, selectedSpecialties, sortBy, doctors])

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    if (searchTerm) params.append("search", searchTerm)
    if (consultationType) params.append("consult", consultationType)
    if (sortBy) params.append("sort", sortBy)
    selectedSpecialties.forEach((specialty) => params.append("specialty", specialty))

    setSearchParams(params)
  }, [searchTerm, consultationType, selectedSpecialties, sortBy, setSearchParams])

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)

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
    setSearchTerm(name)
    setShowSuggestions(false)
  }

  // Handle consultation type change
  const handleConsultationChange = (type) => {
    setConsultationType(type === consultationType ? "" : type)
  }

  // Handle specialty selection
  const handleSpecialtyChange = (specialty) => {
    setSelectedSpecialties((prev) => {
      if (prev.includes(specialty)) {
        return prev.filter((s) => s !== specialty)
      } else {
        return [...prev, specialty]
      }
    })
  }

  // Handle sort selection
  const handleSortChange = (sortType) => {
    setSortBy(sortType === sortBy ? "" : sortType)
  }

  // Apply all filters and sorting
  const applyFilters = () => {
    let result = [...doctors]

    // Apply search filter
    if (searchTerm) {
      result = result.filter((doctor) => doctor.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Apply consultation type filter
    if (consultationType) {
      result = result.filter((doctor) => doctor.consultationType === consultationType)
    }

    // Apply specialty filters
    if (selectedSpecialties.length > 0) {
      result = result.filter((doctor) => {
        if (Array.isArray(doctor.specialties)) {
          return selectedSpecialties.some((specialty) => doctor.specialties.includes(specialty))
        } else if (doctor.specialties) {
          return selectedSpecialties.includes(doctor.specialties)
        }
        return false
      })
    }

    // Apply sorting
    if (sortBy === "fees") {
      result.sort((a, b) => a.fees - b.fees)
    } else if (sortBy === "experience") {
      result.sort((a, b) => b.experience - a.experience)
    }

    setFilteredDoctors(result)
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

  if (isLoading) return <div className="loading">Loading doctors...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>Find a Doctor</h1>
          <div className="search-container" ref={searchRef}>
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
                <i className="fa fa-search"></i>
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
        </div>
      </header>

      <main className="main">
        <div className="container main-content">
          <aside className="filters">
            <div className="filter-section">
              <h3 data-testid="filter-header-moc">Consultation Mode</h3>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    data-testid="filter-video-consult"
                    checked={consultationType === "Video Consult"}
                    onChange={() => handleConsultationChange("Video Consult")}
                  />
                  Video Consult
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    data-testid="filter-in-clinic"
                    checked={consultationType === "In Clinic"}
                    onChange={() => handleConsultationChange("In Clinic")}
                  />
                  In Clinic
                </label>
              </div>
            </div>

            <div className="filter-section">
              <h3 data-testid="filter-header-speciality">Specialities</h3>
              <div className="checkbox-group">
                {specialties.map((specialty, index) => (
                  <label key={index} className="checkbox-label">
                    <input
                      type="checkbox"
                      data-testid={`filter-specialty-${specialty.replace(/\s+/g, "")}`}
                      checked={selectedSpecialties.includes(specialty)}
                      onChange={() => handleSpecialtyChange(specialty)}
                    />
                    {specialty}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3 data-testid="filter-header-sort">Sort By</h3>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    data-testid="sort-fees"
                    checked={sortBy === "fees"}
                    onChange={() => handleSortChange("fees")}
                  />
                  Fees (Low to High)
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    data-testid="sort-experience"
                    checked={sortBy === "experience"}
                    onChange={() => handleSortChange("experience")}
                  />
                  Experience (High to Low)
                </label>
              </div>
            </div>
          </aside>

          <section className="doctors-list">
            <h2>Available Doctors ({filteredDoctors.length})</h2>
            {filteredDoctors.length === 0 ? (
              <div className="no-results">No doctors found matching your criteria</div>
            ) : (
              filteredDoctors.map((doctor, index) => (
                <div key={index} className="doctor-card" data-testid="doctor-card">
                  <div className="doctor-avatar">
                    <img
                      src={
                        doctor.image ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=random`
                      }
                      alt={doctor.name}
                    />
                  </div>
                  <div className="doctor-info">
                    <h3 data-testid="doctor-name">{doctor.name}</h3>
                    <p data-testid="doctor-speciality">
                      {Array.isArray(doctor.specialties) ? doctor.specialties.join(", ") : doctor.specialties}
                    </p>
                    <p data-testid="doctor-experience">{doctor.experience} years experience</p>
                    <p data-testid="doctor-fee">₹{doctor.fees}</p>
                    <p>{doctor.consultationType}</p>
                    <button className="book-btn">Book Appointment</button>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default App

