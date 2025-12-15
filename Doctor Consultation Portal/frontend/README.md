# Frontend - Doctor Appointment Portal

React-based frontend for the Doctor Appointment Portal.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Features

- **Role-Based Routing**: Different dashboards for patients, doctors, and admins
- **Responsive Design**: Mobile-friendly UI built with Tailwind CSS
- **Real-time Updates**: Automatic data refresh after actions
- **Toast Notifications**: User feedback for all actions
- **Protected Routes**: Authentication required for dashboard access

## Project Structure

- `src/pages/` - Page components
- `src/components/` - Reusable components
- `src/contexts/` - React contexts (AuthContext)
- `src/services/` - API service layer

