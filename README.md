Community Crisis Management System 🚨
A full-stack web application for reporting, managing, and responding to community crises with real-time notifications and role-based access control.

Key Features ✨
Multi-role Dashboard System:

👨‍💼 Admin: User management & crisis oversight

🚑 Responder: Crisis assignment & status updates

👥 Citizen: Crisis reporting & notifications

Core Functionalities:

📍 Crisis reporting with geolocation

🔔 Real-time email notifications

📊 Dashboard analytics & statistics

🔄 Status workflow management (Pending → Assigned → Resolved)

Technical Highlights:

🔒 JWT Authentication & Authorization

📱 Responsive React frontend

🚀 Spring Boot backend

🗄 PostgreSQL database

🔄 RESTful API architecture

Tech Stack 💻
Category	Technologies
Frontend	React, React Router, Axios, CSS3
Backend	Spring Boot, Spring Security, Spring Data JPA
Database	PostgreSQL
Auth	JWT, BCrypt Password Encoding
DevOps	Maven, Git
Project Structure 📂
community-crisis-system/
├── frontend/               # React application
│   ├── public/             # Static assets
│   └── src/                # React components
│       ├── contexts/       # Auth context
│       ├── pages/          # Application views
│       └── styles/         # CSS files
│
├── backend/                # Spring Boot application
│   ├── src/main/java/
│   │   ├── config/         # Security configurations
│   │   ├── controller/     # REST controllers
│   │   ├── model/          # Entity classes
│   │   ├── repository/     # JPA repositories
│   │   ├── service/        # Business logic
│   │   └── security/       # Auth components
│   └── src/main/resources/ # Application properties
│
└── README.md               # Project documentation
Installation ⚙️
Backend Setup:

bash
cd backend
mvn spring-boot:run
Frontend Setup:

bash
cd frontend
npm install
npm start
Contributing 🤝
We welcome contributions! Please fork the repository and create a pull request with your improvements.

License 📜
This project is licensed under the MIT License - see the LICENSE file for details.

Why This Project? ❓
This system addresses critical community needs by:

Providing real-time crisis reporting

Enabling efficient emergency response

Offering transparent communication between citizens and responders

Reducing response times through organized workflows

Perfect for:

🏙 Municipal emergency services

🏘 Community watch programs

🚒 Disaster response organizations

This description provides a comprehensive overview while being visually appealing with emojis and clear section organization. It highlights both the technical and practical aspects of the project, making it attractive to both developers and potential users/organizations who might benefit from the system.
