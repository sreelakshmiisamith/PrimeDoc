"use client"

import { useState, useEffect } from "react"
import DoctorCard from "@/components/doctor-card"
import SearchBar from "@/components/search-bar"
import FilterPanel from "@/components/filter-panel"
import { useSearchParams, useRouter } from "next/navigation"

export default function DoctorListing() {
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [consultationType, setConsultationType] = useState("")
  const [selectedSpecialties, setSelectedSpecialties] = useState([])
  const [sortBy, setSortBy] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [suggestions, setSuggestions] = useState([])

  const searchParams = useSearchParams()
  const router = useRouter()

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
        console.error("API Error:", err)
        setError(err.message)
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // Handle search suggestions
  useEffect(() => {
    if (searchTerm) {
      const matches = doctors
        .filter((doctor) => doctor.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 3)
      setSuggestions(matches)
    } else {
      setSuggestions([])
    }
  }, [searchTerm, doctors])

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
    const params = new URLSearchParams(searchParams.toString())

    // Clear existing params that we're going to update
    params.delete("search")
    params.delete("consult")
    params.delete("sort")
    params.delete("specialty")

    if (searchTerm) params.append("search", searchTerm)
    if (consultationType) params.append("consult", consultationType)
    if (sortBy) params.append("sort", sortBy)
    selectedSpecialties.forEach((specialty) => params.append("specialty", specialty))

    router.push(`?${params.toString()}`)
  }, [searchTerm, consultationType, selectedSpecialties, sortBy, router, searchParams])

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

  // Handle search term change
  const handleSearchChange = (value) => {
    setSearchTerm(value)
  }

  // Handle suggestion click
  const handleSuggestionClick = (name) => {
    setSearchTerm(name)
    applyFilters()
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

  if (isLoading) return <div className="loading">Loading doctors...</div>
  if (error) return <div className="error">Error: {error}</div>

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="text-center">PrimeDoc</h1>
          <div className="search-bar-container">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container main-content">
          <FilterPanel
            specialties={specialties}
            consultationType={consultationType}
            selectedSpecialties={selectedSpecialties}
            sortBy={sortBy}
            onConsultationChange={handleConsultationChange}
            onSpecialtyChange={handleSpecialtyChange}
            onSortChange={handleSortChange}
          />

          <section className="doctors-list">
            <h2>Available Doctors ({filteredDoctors.length})</h2>
            {filteredDoctors.length === 0 ? (
              <div className="no-results">No doctors found matching your criteria</div>
            ) : (
              filteredDoctors.map((doctor, index) => (
                <DoctorCard key={index} doctor={{ ...doctor, fees: `₹${doctor.fees}` }} />
              ))
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
