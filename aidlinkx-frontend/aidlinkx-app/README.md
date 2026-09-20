# AidLinkX — Humanitarian Disaster Relief & Emergency Coordination Network

AidLinkX is an offline-first disaster response and relief coordination platform connecting affected residents, first responders, relief camp workers, and district/national coordinators.

## Deployment Architecture
- **Frontend (Angular)**: Deployed on AWS Amplify.
- **Backend (Spring Boot)**: Deployed on AWS ECS + Fargate with Amazon RDS MySQL.

## Key Features
- **Offline-Ready SOS Dispatch**: Resident emergency requests are cached on-device during network dropouts and automatically synchronized the moment connection is detected.
- **Optional Resident Authentication**: Residents can request help immediately with zero login required, or optionally register/sign-in via phone or email to track tickets.
- **Comprehensive Disaster Triage**: Supports multiple disaster types (Flood, Earthquake, Cyclone, Landslide, Wildfire, Heatwave, Tsunami, Cloudburst, Industrial Hazard, Other with custom details) and special needs tracking (infants, elderly, pregnant, injured, medication).
- **Non-Compulsory Reference Photo**: Victims and volunteers can attach photos of flood levels, road blocks, or roof locations to assist boat and aerial rescue.
- **Emergency Dial Directory**: One-click hotline access to 112 (National Emergency), 108 (Ambulance), 101 (Fire & Rescue), 1070 (Disaster Authority), and 24/7 AidLinkX dispatch.
- **Feedback & Quality System**: Dedicated `/feedback` portal for community suggestions and operational rating.
- **Coordinator Command Workspace**: Triage resident SOS calls and camp supply demands from Pending → Accepted → Dispatched → Delivered with 1-click hackathon demo credentials.

## Development & Build

### Frontend
```bash
cd aidlinkx-frontend/aidlinkx-app
npm install
npm run build
npm start
```

### Backend
```bash
cd aidlinkx-backend
mvn clean compile
mvn test-compile
```
