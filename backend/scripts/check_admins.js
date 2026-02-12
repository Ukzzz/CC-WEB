const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const admins = await Admin.find({});
    console.log('Admins found:', admins.length);
    admins.forEach(a => {
      console.log(`- Email: ${a.email}, Role: ${a.role}, ID: ${a._id}`);
    });
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
