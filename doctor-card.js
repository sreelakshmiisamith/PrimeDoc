export default function DoctorCard({ doctor }) {
    return (
      <div className="doctor-card" data-testid="doctor-card">
        <div className="doctor-avatar">
          <img
            src={
              doctor.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name) || "/placeholder.svg"}&background=random`
            }
            alt={doctor.name}
          />
        </div>
        <div className="doctor-info">
          <h3 data-testid="doctor-name">{doctor.name}</h3>
          <p data-testid="doctor-speciality">
            {Array.isArray(doctor.specialties) ? doctor.specialties.join(", ") : doctor.specialties}
          </p>
          <p data-testid="doctor-experience">{doctor.experience} years of experience</p>
          <p data-testid="doctor-fee">₹{doctor.fees}</p>
          <p>{doctor.consultationType}</p>
          <button className="book-btn">Book Appointment</button>
        </div>
      </div>
    )
  }
  