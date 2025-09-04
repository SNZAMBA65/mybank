# MyBank - Personal Finance Management

## Description

MyBank is a web application that allows individuals to manage their personal expenses. Built with React (frontend) and Symfony (backend), it provides a simple and intuitive interface for tracking spending and categorizing expenses.

## Features

- **User Authentication**: Secure login and registration
- **Expense Management**: Create, view, edit, and delete expenses
- **Category Management**: Organize expenses by categories
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## Technologies Used

### Backend
- **PHP 8.2** with **Symfony 6**
- **MySQL** database
- **Doctrine ORM** for database management
- **JWT Authentication** for secure API access

### Frontend
- **React 18** with **TypeScript**
- **Vite** for development and build
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Zustand** for state management

### DevOps
- **Docker** for containerization
- **GitHub Actions** for CI/CD
- **ESLint** and **PHPStan** for code quality

## Prerequisites

- **Docker** and **Docker Compose**
- **Git**
- **Node.js 18+** (for local development)
- **PHP 8.2+** (for local development)

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/mybank-project.git
cd mybank-project
```

### 2. Environment Configuration

Copy the environment files:

```bash
# Backend
cp backend/.env backend/.env.local

# Frontend
cp Frontend/.env.example Frontend/.env.local
```

Edit the configuration files as needed.

### 3. Docker Setup

Build and start the containers:

```bash
# Build and start all services
docker-compose up --build -d

# Check if services are running
docker-compose ps
```

### 4. Database Setup

Run migrations:

```bash
docker-compose exec backend php bin/console doctrine:migrations:migrate
```

Load fixtures (optional):

```bash
docker-compose exec backend php bin/console doctrine:fixtures:load
```

## Usage

Once the containers are running:

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **PHPMyAdmin**: [http://localhost:8080](http://localhost:8080)

### API Endpoints

```
POST /api/auth/login     - User authentication
GET  /api/operations     - List user operations
POST /api/operations     - Create new operation
PUT  /api/operations/{id} - Update operation
DELETE /api/operations/{id} - Delete operation
GET  /api/categories     - List categories
```

## Development

### Running Tests

```bash
# Backend tests
docker-compose exec backend php bin/phpunit

# Frontend tests
docker-compose exec frontend npm test

# Integration tests
docker-compose exec backend php bin/console app:test:integration
```

### Code Quality

```bash
# Backend linting
docker-compose exec backend vendor/bin/phpstan analyse

# Frontend linting
docker-compose exec frontend npm run lint
```

## Deployment

### Automated Deployment

The project uses GitHub Actions for CI/CD. Every push to the `main` branch triggers:

1. **Code Quality Checks**: ESLint, PHPStan
2. **Unit Tests**: PHPUnit, Jest
3. **Integration Tests**: API and database connectivity
4. **Build**: Docker images creation
5. **Deploy**: Automatic deployment to production

### Manual Deployment

Use the deployment script:

```bash
# Deploy latest version
./scripts/deploy.sh deploy

# Rollback to previous version
./scripts/deploy.sh rollback

# Create database backup
./scripts/deploy.sh backup
```

## Project Structure

```
project-mybank/
├── backend/                # Symfony backend
│   ├── src/
│   │   ├── Controller/     # API controllers
│   │   ├── Entity/         # Database entities
│   │   └── Repository/     # Data repositories
│   ├── migrations/         # Database migrations
│   ├── tests/             # Backend tests
│   └── Dockerfile
├── Frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── store/         # State management
│   ├── public/           # Static assets
│   └── Dockerfile
├── .github/workflows/    # CI/CD pipelines
├── scripts/             # Deployment scripts
├── docker-compose.yml   # Docker configuration
└── README.md           # This file
```

## Environment Variables

### Backend (.env.local)
```
DATABASE_URL=mysql://mybank_user:mybank_password@database:3306/mybank
JWT_SECRET_KEY=your-secret-key
APP_ENV=dev
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

### Unit Tests
- Backend: PHPUnit for API endpoints and business logic
- Frontend: Jest for component testing

### Integration Tests
- API connectivity tests
- Database integration tests
- End-to-end user workflows

## Troubleshooting

### Common Issues

**Port already in use:**
```bash
docker-compose down
sudo lsof -i :5173 :8000 :3306
```

**Permission issues:**
```bash
sudo chown -R $USER:$USER .
```

**Database connection failed:**
```bash
docker-compose restart database
docker-compose logs database
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact: [samirnzamba069@gmail.com]

## Acknowledgments

- L'École Multimédia for the project guidelines
- Symfony and React communities for excellent documentation