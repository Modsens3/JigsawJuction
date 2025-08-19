# 🧩 JigsawJunction - Custom Puzzle Creation Platform

A modern, full-stack web application for creating and ordering custom jigsaw puzzles with advanced features like laser cutting integration and Google Drive storage.

## 🌟 Features

### 🎨 Core Features
- **Custom Puzzle Creation**: Upload images and create personalized jigsaw puzzles
- **Predefined Puzzle Selection**: Choose from 12 predefined puzzles with different shapes and difficulties
- **Laser Cutting Integration**: Generate SVG files for laser cutting machines
- **Shopping Cart**: Complete e-commerce functionality
- **Order Management**: Track orders and manage customer data

### 🔧 Technical Features
- **TypeScript**: Full type safety across the stack
- **React Frontend**: Modern, responsive UI with Wouter routing
- **Express Backend**: RESTful API with comprehensive middleware
- **Database**: SQLite/PostgreSQL support with Drizzle ORM
- **Google Drive Integration**: Cloud storage for files and images
- **Memory Optimization**: Advanced garbage collection and memory management

### 🛡️ Security Features
- **JWT Authentication**: Secure user sessions
- **Password Hashing**: Bcrypt encryption
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data sanitization
- **CORS Configuration**: Secure cross-origin requests

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- SQLite (included) or PostgreSQL

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/jigsawjunction.git
cd jigsawjunction
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development server**
```bash
npm run dev
```

5. **Start frontend preview**
```bash
npm run preview
```

## 📁 Project Structure

```
JigsawJunction/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   └── stores/        # Zustand state management
├── server/                # Express backend
│   ├── __tests__/         # Test files
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   └── utils/             # Server utilities
├── shared/                # Shared types and schemas
└── uploads/               # File uploads directory
```

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000
SESSION_SECRET=your-session-secret

# Database Configuration
DATABASE_URL=sqlite:./data/jigsawjunction.db
# For PostgreSQL: postgresql://user:password@localhost:5432/jigsawjunction

# Google Drive Configuration
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY=your-private-key
GOOGLE_DRIVE_FOLDER_ID=your-folder-id

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## 📊 API Documentation

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /api/auth/login
Login with existing credentials.

#### POST /api/auth/admin/login
Admin login for dashboard access.

### Puzzle Endpoints

#### GET /api/predefined-puzzles
Get all predefined puzzles with optional filtering.

**Query Parameters:**
- `type`: Filter by puzzle type (round, octagon, square)
- `difficulty`: Filter by difficulty (easy, medium, hard, very_hard)
- `featured`: Filter featured puzzles only

#### GET /api/predefined-puzzles/:id
Get specific predefined puzzle by ID.

#### GET /api/predefined-puzzles/types
Get available puzzle types and difficulties.

### Order Endpoints

#### POST /api/orders
Create a new puzzle order.

#### GET /api/orders
Get user's order history (authenticated).

### Admin Endpoints

#### GET /api/admin/orders
Get all orders (admin only).

#### GET /api/admin/download-laser/:orderId
Download laser cutting SVG for an order.

## 🎨 Frontend Components

### Core Components
- **ProductConfigurator**: Main puzzle customization interface
- **PredefinedPuzzleSelector**: Puzzle selection and filtering
- **ShoppingCart**: Cart management and checkout
- **AdminDashboard**: Admin panel for order management

### UI Components
- **Button**: Reusable button component
- **Card**: Content container component
- **Select**: Dropdown selection component
- **Slider**: Range input component

## 🔒 Security Considerations

### Authentication
- JWT tokens with expiration
- Secure session management
- Password hashing with bcrypt

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### Rate Limiting
- Request rate limiting per IP
- Authentication attempt limiting
- API abuse prevention

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```bash
docker build -t jigsawjunction .
docker run -p 5000:5000 jigsawjunction
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Configure production database
- Set up Google Drive service account
- Configure SSL certificates

## 📈 Performance Optimization

### Memory Management
- Automatic garbage collection
- Memory usage monitoring
- Cache optimization
- Resource cleanup

### Database Optimization
- Connection pooling
- Query optimization
- Indexing strategy
- Data archiving

### Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle size optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## 🎯 Roadmap

### Planned Features
- [ ] Mobile app development
- [ ] Advanced puzzle algorithms
- [ ] Social sharing features
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Payment gateway integration

### Performance Improvements
- [ ] CDN integration
- [ ] Advanced caching
- [ ] Database sharding
- [ ] Microservices architecture

---

**Built with ❤️ using modern web technologies**
