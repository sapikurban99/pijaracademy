# Docker Setup for Pijar Academy

## Overview
This project includes Docker configuration for easy deployment and development.

## Prerequisites
- Docker Desktop installed
- Docker Compose installed

## Quick Start

### 1. Build and Run with Docker Compose
```bash
docker-compose up --build
```

This will:
- Build the Docker image
- Start the container on port 3003
- Load environment variables from `.env` file

### 2. Access the Application
Open your browser and navigate to: `http://localhost:3003`

## Development vs Production

### Development Mode
For development with hot reload, use:
```bash
docker-compose up --build
```

### Production Build
The Dockerfile creates an optimized production build with:
- Minimal dependencies
- Standalone Next.js output
- Optimized image size

## Configuration

### Port Configuration
The application is configured to run on **port 3003** as specified in:
- Dockerfile: `EXPOSE 3003`
- docker-compose.yml: `"3003:3003"`
- Environment: `PORT=3003`

To change the port:
1. Update `EXPOSE 3003` in Dockerfile
2. Update `ports: "3003:3003"` in docker-compose.yml
3. Update `PORT=3003` in Dockerfile

### Environment Variables
Environment variables are loaded from the `.env` file and passed to both build and runtime:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Important**: The `.env` file is required for the Docker build to work correctly.

## Docker Commands

### Build Only
```bash
docker-compose build
```

### Start Container
```bash
docker-compose up
```

### Stop Container
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Remove Everything
```bash
docker-compose down -v
```

## Troubleshooting

### Node.js Version Issues
Next.js requires Node.js version ">=20.9.0". The Dockerfile uses Node.js 20-alpine to ensure compatibility. If you encounter Node.js version errors:
1. Verify the Dockerfile uses `FROM node:20-alpine AS base`
2. Ensure you have the latest Docker images: `docker pull node:20-alpine`
3. Rebuild the container: `docker-compose up --build --force-recreate`

### Port Already in Use
If port 3003 is already in use:
1. Stop the service using port 3003, or
2. Change the port mapping in docker-compose.yml

### Build Issues
If you encounter build issues:
1. Clear Docker cache: `docker system prune -a`
2. Rebuild: `docker-compose up --build --force-recreate`

### Environment Variables Not Loading
Ensure your `.env` file exists in the project root and contains the required variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Common issues:**
- `.env` file not present → Create the file with required variables
- `.env` file in `.dockerignore` → Remove `.env` from `.dockerignore` (it should be included)
- Variables not loading → Verify `.env` file format and variable names match exactly

**Build-time vs Runtime:**
- Build-time: Variables passed via `args` in docker-compose.yml
- Runtime: Variables passed via `environment` in docker-compose.yml

## Architecture

### Multi-stage Build
The Dockerfile uses a multi-stage build for optimization:
1. **Base Stage**: Node.js 20 Alpine setup (Next.js requires >=20.9.0)
2. **Deps Stage**: Install dependencies
3. **Builder Stage**: Build Next.js application with environment variables
4. **Runner Stage**: Minimal production image with environment variables

### Container Configuration
- **Base Image**: Node.js 20 Alpine (Next.js requires >=20.9.0)
- **User**: Non-root user (nextjs:nodejs)
- **Restart Policy**: unless-stopped
- **Network**: Bridge network (pijar-network)

## Production Deployment

For production deployment:
1. Update `.env` with production Supabase credentials
2. Build: `docker-compose up --build -d`
3. Monitor: `docker-compose logs -f`

The `-d` flag runs the container in detached mode.