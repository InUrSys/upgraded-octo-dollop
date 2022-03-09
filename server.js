const express = require('express')
const connectDB = require('./config/db')

const app = express();
const PORT = process.env.PORT || 5000

connectDB();

//Init middleware
app.use(express.json({extended: false}));

app.get('/', (req, res) => res.send('API RUNNING'))

// Define routes
app.use('/api/users', require('./routes/api/user'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/posts', require('./routes/api/posts'))

app.listen(PORT, () => console.log(`Server Started on port ${PORT}`))