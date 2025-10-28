import express from 'express';
import 'dotenv/config';

const app = express();

const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'development';
const appName = process.env.APP_NAME || 'My Node App';

app.get('/', (req, res) => {
  res.json({
    message: `Hello from ${appName}!`,
    environment: env,
  });
});

app.listen(port, () => {
  console.log(`${appName} running in ${env} mode on port ${port}`);
});
