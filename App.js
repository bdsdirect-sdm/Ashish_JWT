
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const { User } = require('./models');  // Import the User model

const app = express();
const port = 3000;
app.use(bodyParser.json());

// Key
const jwtSecret = 'Hello';


const sequelize = new Sequelize('User_JWT', 'root', 'Password123#@!', {
  host: 'localhost',
  dialect: 'mysql'
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' })
})

// Signup
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'User already exists or invalid input', error });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
console.log("hello")
  try {
    const user = await User.findOne({ where: { email : email } });
    console.log("In Login")

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    console.log('User found:', user)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('password donot match')

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '1h' });
    console.log('token generated')

    res.json({ token });
  } catch (error) {
    console.log('error happen in login')
    res.status(500).json({ message: 'error', error });
  }
});

// Middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token is missing' });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Protected
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Welcome, your user ID is ${req.user.id}` });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

sequelize.authenticate()
  .then(() => {
    console.log('connected Sucessful')

  })
  .catch(err => {
    console.error('unable to connect')
  })