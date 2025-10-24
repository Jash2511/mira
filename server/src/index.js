
import app from './app.js';
import { connectDB } from './utils/db.js';



const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error('Failed to connect DB', e);
    process.exit(1);
  });

