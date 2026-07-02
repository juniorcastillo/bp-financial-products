import { createExpressServer } from 'routing-controllers';
import 'dotenv/config';

const PORT = 3002;

const app = createExpressServer({
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
  },
  routePrefix: '/bp',
  controllers: [__dirname + '/controllers/*{.js,.ts}'],
});

app.listen(PORT, () => {
  console.log('Servidor iniciado');
  console.log(`Host: http://localhost:${PORT}`);
  console.log(`Fecha/Hora: ${new Date().toLocaleString()}`);
});