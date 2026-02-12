const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Hospital = require('../models/Hospital');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const args = process.argv.slice(2);
    if (args.length < 4) {
      console.log('Usage: node create_admin.js <email> <password> <firstName> <lastName> [hospitalCode]');
      process.exit(1);
    }

    const [email, password, firstName, lastName, hospitalCode] = args;

    let hospitalId = null;
    let role = 'super_admin';

    if (hospitalCode) {
      const hospital = await Hospital.findOne({ code: hospitalCode });
      if (!hospital) {
        console.error(`Hospital with code ${hospitalCode} not found!`);
        process.exit(1);
      }
      hospitalId = hospital._id;
      role = 'hospital_admin';
    }

    const admin = await Admin.create({
      email,
      password,
      name: { firstName, lastName },
      role,
      hospital: hospitalId,
      permissions: role === 'super_admin' ? [] : ['view_users', 'manage_staff', 'manage_resources']
    });

    console.log(`✅ Admin created successfully!`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    if (hospitalCode) console.log(`Hospital: ${hospitalCode}`);

    process.exit();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
