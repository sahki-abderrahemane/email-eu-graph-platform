# GraphInsight - Frontend

Modern, responsive Next.js web application for the Email-EU Graph Analytics Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3001`

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 📁 Project Structure

```
app/
├── page.tsx                  # Landing page
├── login/                    # Authentication
├── register/
├── dashboard/               # Main dashboard
├── graph-explorer/          # Interactive graph visualization
├── predictions/             # ML predictions interface
├── community-analyzer/      # Community detection
├── explainability-panel/    # Model explanations
└── settings/                # User settings

components/
└── Sidebar.tsx              # Main navigation

lib/
├── api.ts                   # API service
└── auth-context.tsx         # Auth state management
```

## 🎨 Features

- **Premium Dark Theme**: Glassmorphism, gradients, and animations
- **Responsive Design**: Works on all devices
- **Framer Motion**: Smooth page transitions
- **Protected Routes**: JWT-based authentication
- **Real-time Updates**: Dynamic data visualization

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🔗 API Integration

The frontend connects to:
- **API Gateway**: `http://localhost:3000/api`
- Handles auth, graph data, and ML predictions

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | User login |
| `/register` | User registration |
| `/dashboard` | Network statistics overview |
| `/graph-explorer` | Interactive network visualization |
| `/predictions` | Department & link predictions |
| `/community-analyzer` | Community detection |
| `/explainability-panel` | Model explanations |
| `/settings` | User preferences |
