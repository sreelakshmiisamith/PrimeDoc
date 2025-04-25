"use client"

export default function FilterPanel({
  specialties,
  consultationType,
  selectedSpecialties,
  sortBy,
  onConsultationChange,
  onSpecialtyChange,
  onSortChange,
}) {
  return (
    <aside className="filters">
      <div className="filter-section">
        <h3 data-testid="filter-header-moc">Consultation Mode</h3>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              data-testid="filter-video-consult"
              checked={consultationType === "Video Consult"}
              onChange={() => onConsultationChange("Video Consult")}
            />
            Video Consult
          </label>
          <label className="radio-label">
            <input
              type="radio"
              data-testid="filter-in-clinic"
              checked={consultationType === "In Clinic"}
              onChange={() => onConsultationChange("In Clinic")}
            />
            In Clinic
          </label>
        </div>
      </div>

      <div className="filter-section specialties-section">
        <h3 data-testid="filter-header-speciality">Specialities</h3>
        <div className="checkbox-group">
          {specialties.map((specialty, index) => (
            <label key={index} className="checkbox-label">
              <input
                type="checkbox"
                data-testid={`filter-specialty-${specialty.replace(/\s+/g, "")}`}
                checked={selectedSpecialties.includes(specialty)}
                onChange={() => onSpecialtyChange(specialty)}
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
              onChange={() => onSortChange("fees")}
            />
            Fees (Low to High)
          </label>
          <label className="radio-label">
            <input
              type="radio"
              data-testid="sort-experience"
              checked={sortBy === "experience"}
              onChange={() => onSortChange("experience")}
            />
            Experience (High to Low)
          </label>
        </div>
      </div>
      {specialties.length === 0 && <div className="no-specialties">No specialties available</div>}
    </aside>
  )
}
