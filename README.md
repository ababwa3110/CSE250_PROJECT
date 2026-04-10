# Visitor Log Management System
A modern, full-stack, self-service Visitor Management System.
## Tech Stack
- Frontend: HTML, Tailwind CSS
- Backend: Node.js, Express
- Database: MariaDB
- ### Backend
* **Node.js**: JavaScript runtime environment.
* **Express.js**: Web application framework for the server.

### Version Control
* **Git & GitHub**: For source code management and collaboration.

## 🛡Security Features

### 1. Location-Based Access Control (Geofencing)
To prevent the "Off-Site Check-In" exploit (where visitors scan a shared picture of the QR code from home), this application implements strict client-side geofencing.
* **Mechanism:** The frontend utilizes the HTML5 `navigator.geolocation` API to fetch the user's live coordinates upon page load.
* **Validation:** We use the Haversine formula to calculate the straight-line distance between the visitor's device and the official Ahmedabad University campus coordinates.
* **Enforcement:** If the device is located outside a 200-meter radius of the campus, the check-in form is aggressively hidden from the DOM, and an access-denied error is rendered, ensuring only physically present visitors can register.

### 2. Admin Dashboard Security
The security guard dashboard is isolated and protected against unauthorized access.
* **Frontend Isolation:** The dashboard utilizes a state-toggled UI container. The visitor log table remains unrendered until valid credentials are provided, preventing unauthorized shoulder-surfing or DOM inspection.
* **Backend Authentication:** All sensitive API endpoints (e.g., `GET /api/visitors`, `PUT /api/exit/:id`) are shielded by a custom `requireAuth` middleware. This ensures that even if a user bypasses the frontend UI or attempts to hit the endpoints via Postman, the server will reject the request without a valid session token/password.