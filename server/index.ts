import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { join } from 'path';
import { existsSync } from 'fs';
import { testConnection } from './db';

// Import routes
import authRoutes from './routes/auth';
import inventoryRoutes from './routes/inventory';
import ordersRoutes from './routes/orders';
import staffRoutes from './routes/staff';
import suppliersRoutes from './routes/suppliers';

const app = express();
const PORT = process.env.PORT || 5174;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for SPA
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: NODE_ENV === 'production' ? false : true, // Same-origin in prod, allow all in dev
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: NODE_ENV 
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/suppliers', suppliersRoutes);

// Serve static files from dist directory
const distPath = join(__dirname, '../dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // SPA fallback - serve index.html for non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API endpoint not found' });
    }
    
    res.sendFile(join(distPath, 'index.html'));
  });
} else {
  console.warn('Warning: dist directory not found. Static files will not be served.');
  
  // Fallback for development
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Gabriel Kitchen Management System API',
      version: '1.0.0',
      environment: NODE_ENV
    });
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    ...(NODE_ENV === 'development' && { error: err.message })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    console.log('✅ Database connection established');

    app.listen(PORT, () => {
      console.log(`🚀 Gabriel Kitchen Management System API running on port ${PORT}`);
      console.log(`📊 Environment: ${NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      
      if (existsSync(distPath)) {
        console.log(`🌐 Frontend served from: http://localhost:${PORT}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();