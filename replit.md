# EQUIMON Cloud Platform

## Overview

EQUIMON Cloud is a comprehensive industrial monitoring platform designed for collecting, storing, analyzing, and visualizing data from manufacturing equipment and IoT sensors. The platform operates on a distributed architecture with local base stations (edge devices) collecting data from production sites and transmitting it to a centralized cloud service for analysis and monitoring.

The system supports multi-tenant operations with role-based access control, real-time data visualization, alerting capabilities, and comprehensive device management. It's built as a modern full-stack web application with a React-based frontend and Express.js backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using **React with TypeScript**, following modern development practices:
- **UI Framework**: Radix UI components with Tailwind CSS for styling, using the shadcn/ui component system
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Build System**: Vite for fast development and optimized production builds
- **Authentication**: Session-based authentication integrated with Replit's OpenID Connect system

The frontend implements a responsive design with role-based UI rendering, supporting admin, operator, and monitor user roles with different access levels to features and data.

### Backend Architecture
The server-side is implemented using **Express.js with TypeScript**:
- **API Design**: RESTful API structure with organized route handlers
- **Database ORM**: Drizzle ORM for type-safe database operations and migrations
- **Authentication**: Passport.js with OpenID Connect strategy for Replit integration
- **Session Management**: PostgreSQL-backed session storage using connect-pg-simple
- **Development Setup**: Custom Vite integration for hot reloading during development

### Data Storage Solutions
**PostgreSQL Database** with Neon serverless hosting:
- **Schema Design**: Comprehensive relational model covering companies, users, stations, devices, sensor data, alerts, and alert rules
- **Data Types**: Support for JSON metadata storage, enums for status tracking, and decimal precision for sensor readings
- **Indexing**: Strategic indexing on session expiration and frequently queried fields
- **Migrations**: Drizzle Kit for database schema versioning and deployment

### Authentication and Authorization
**Role-Based Access Control (RBAC)**:
- **Authentication Provider**: Replit OpenID Connect integration
- **Session Management**: Server-side sessions with PostgreSQL storage
- **User Roles**: Three-tier role system (admin, operator, monitor) with hierarchical permissions
- **Multi-tenancy**: Company-based data isolation with user-company associations

### Core Business Logic
**Station Management**: Base station activation via QR code scanning or manual UUID entry, with lifecycle management and status monitoring
**Device Integration**: Support for multiple device types per station with configurable parameters and real-time data collection
**Data Processing**: Sensor data ingestion with timestamp tracking, value validation, and aggregation capabilities
**Alerting System**: Configurable alert rules with threshold-based triggers and multi-level severity classification

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Database Connectivity**: @neondatabase/serverless with WebSocket support for edge environments

### Authentication Services
- **Replit Authentication**: OpenID Connect integration for user authentication
- **Session Storage**: PostgreSQL-backed session persistence

### UI and Development Tools
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling System**: Tailwind CSS with custom design tokens and theming
- **Development Environment**: Replit-specific tooling including cartographer and dev banner plugins
- **Data Visualization**: Recharts for interactive charts and metrics display

### Build and Development
- **Build Tools**: Vite for frontend building, esbuild for backend compilation
- **Development Features**: Hot module replacement, runtime error overlays, and development banners
- **Code Quality**: TypeScript for type safety, ESLint-compatible tooling