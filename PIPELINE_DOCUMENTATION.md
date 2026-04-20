# Pipeline CI/CD Documentation

## Overview

This project includes a comprehensive CI/CD pipeline designed for modern React applications with TypeScript, Vite, and Supabase integration.

## Pipeline Structure

### 1. Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` branch

**Jobs:**

#### `lint-and-test`
- Runs ESLint for code quality
- Executes unit tests with coverage
- Uploads coverage reports to Codecov

#### `build`
- Builds the application for production
- Uploads build artifacts for deployment

#### `security-scan`
- Runs npm security audit
- Performs Snyk security scanning
- Checks for vulnerabilities

#### `deploy-staging`
- Deploys to staging environment (develop branch)
- Runs E2E tests on staging

#### `deploy-production`
- Deploys to production (main branch)
- Sends deployment notifications

#### `build-android`
- Builds Android APK using Capacitor
- Uploads APK artifact

### 2. Code Quality Pipeline (`.github/workflows/code-quality.yml`)

**Jobs:**

#### `code-quality`
- TypeScript type checking
- ESLint analysis
- Prettier formatting check
- Dependency analysis (depcheck)
- Bundle size analysis
- SonarCloud code analysis

#### `performance`
- Lighthouse CI performance testing
- Performance metrics collection
- Uploads Lighthouse results

## Environment Setup

### Required Secrets

Configure these secrets in your GitHub repository settings:

```bash
# Security scanning
SNYK_TOKEN=your_snyk_token
SONAR_TOKEN=your_sonar_token

# Performance monitoring
LHCI_GITHUB_APP_TOKEN=your_lighthouse_token

# Deployment (example)
VERCEL_TOKEN=your_vercel_token
STAGING_URL=your_staging_url
PRODUCTION_URL=your_production_url
```

### Environment Variables

```bash
NODE_VERSION=18
CACHE_VERSION=v1
```

## Docker Configuration

### Services

1. **App**: Main application container
2. **Database**: Supabase PostgreSQL
3. **Redis**: Caching layer
4. **Nginx**: Reverse proxy with SSL termination

### Docker Commands

```bash
# Build and run locally
npm run docker:build
npm run docker:run

# Development with Docker Compose
npm run docker:dev
npm run docker:stop
```

## Deployment Options

### 1. Vercel (Recommended)

The project includes `vercel.json` configuration for seamless deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Docker Deployment

```bash
# Build production image
docker build -t traversee-connect .

# Run container
docker run -p 3000:3000 traversee-connect
```

### 3. Traditional Web Server

Deploy the `dist/` folder to any web server (Apache, Nginx, etc.).

## Quality Gates

### Performance Requirements
- Lighthouse Performance score: ≥ 80%
- Accessibility score: ≥ 90%
- Best Practices score: ≥ 80%
- SEO score: ≥ 80%

### Code Quality Requirements
- All ESLint rules must pass
- TypeScript compilation must succeed
- Test coverage minimum: 80%
- No high-severity security vulnerabilities

## Monitoring and Observability

### Logs
- Application logs: Console output
- Nginx logs: `/var/log/nginx/`
- Build logs: GitHub Actions logs

### Metrics
- Lighthouse performance metrics
- Bundle size tracking
- Code coverage reports
- Security vulnerability reports

## Local Development

### Prerequisites

```bash
# Node.js 18+
npm --version

# Docker (optional)
docker --version
docker-compose --version
```

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Formatting
npm run format
```

## Branch Strategy

### `main` Branch
- Production-ready code
- Automatic deployment to production
- Strict quality gates

### `develop` Branch
- Integration branch
- Automatic deployment to staging
- Relaxed quality gates

### Feature Branches
- Create from `develop`
- Use pull requests for review
- Must pass all quality checks

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

2. **Test Failures**
   - Ensure test database is accessible
   - Check environment variables
   - Review test configuration

3. **Deployment Issues**
   - Verify environment variables
   - Check deployment target configuration
   - Review deployment logs

### Debug Commands

```bash
# Debug build locally
npm run build

# Debug tests
npm run test:ui

# Check types
npm run type-check

# Analyze bundle
npm run build -- --analyze
```

## Best Practices

1. **Commit Messages**: Use conventional commit format
2. **Branch Naming**: Use descriptive feature branch names
3. **Pull Requests**: Include tests and documentation
4. **Dependencies**: Regularly update and audit dependencies
5. **Security**: Keep secrets secure and rotate regularly

## Integration with External Services

### Supabase
- Database migrations in `supabase/` directory
- Environment variables for connection
- Real-time subscriptions support

### Capacitor (Mobile)
- Android build configuration
- Native plugin integration
- Cross-platform deployment

### Monitoring Services
- Lighthouse CI for performance
- SonarCloud for code quality
- Snyk for security scanning
