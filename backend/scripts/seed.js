/**
 * Database Seed Script
 * Creates initial admin user and sample data
 * 
 * Usage: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Admin = require('../models/Admin');
const Hospital = require('../models/Hospital');
const Staff = require('../models/Staff');
const Resource = require('../models/Resource');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out in production)
    console.log('Clearing existing data...');
    await Admin.deleteMany({});
    await Hospital.deleteMany({});
    await Staff.deleteMany({});
    await Resource.deleteMany({});

    // Create Super Admin
    console.log('Creating Super Admin...');
    const superAdmin = await Admin.create({
      email: 'admin@healthcare.com',
      password: 'Admin@123',
      name: {
        firstName: 'Super',
        lastName: 'Admin'
      },
      role: 'super_admin',
      permissions: [
        'manage_hospitals',
        'manage_staff',
        'manage_resources',
        'view_users',
        'manage_users',
        'view_analytics'
      ],
      isActive: true
    });
    console.log('Super Admin created:', superAdmin.email);

    // Create Sample Hospitals
    console.log('Creating sample hospitals...');
    const hospitals = await Hospital.insertMany([
      {
        name: 'City General Hospital',
        code: 'CGH001',
        location: {
          address: '123 Main Street',
          city: 'Lahore',
          state: 'Punjab',
          zipCode: '54000',
          coordinates: { type: 'Point', coordinates: [74.3587, 31.5204] }
        },
        contact: {
          phone: '+92-42-1234567',
          email: 'info@citygeneral.com',
          website: 'https://citygeneral.com',
          emergencyHotline: '1122'
        },
        emergencyServices: {
          available: true,
          description: '24/7 Emergency Services with Trauma Center',
          operatingHours: { is24x7: true }
        },
        status: 'active',
        metadata: {
          establishedYear: 1985,
          accreditation: ['JCI', 'ISO 9001'],
          specializations: ['Cardiology', 'Neurology', 'Orthopedics']
        }
      },
      {
        name: 'National Medical Center',
        code: 'NMC002',
        location: {
          address: '456 Hospital Road',
          city: 'Karachi',
          state: 'Sindh',
          zipCode: '75500',
          coordinates: { type: 'Point', coordinates: [67.0011, 24.8607] }
        },
        contact: {
          phone: '+92-21-7654321',
          email: 'contact@nationalmedical.pk',
          website: 'https://nationalmedical.pk',
          emergencyHotline: '115'
        },
        emergencyServices: {
          available: true,
          description: 'Level 1 Trauma Center',
          operatingHours: { is24x7: true }
        },
        status: 'active',
        metadata: {
          establishedYear: 1990,
          accreditation: ['JCI', 'NABH'],
          specializations: ['Oncology', 'Pediatrics', 'Transplant']
        }
      },
      {
        name: 'Metro Healthcare',
        code: 'MHC003',
        location: {
          address: '789 Healthcare Avenue',
          city: 'Islamabad',
          state: 'ICT',
          zipCode: '44000',
          coordinates: { type: 'Point', coordinates: [73.0479, 33.6844] }
        },
        contact: {
          phone: '+92-51-9876543',
          email: 'help@metrohealthcare.pk',
          emergencyHotline: '1166'
        },
        emergencyServices: {
          available: true,
          description: 'Emergency & Urgent Care',
          operatingHours: { is24x7: true }
        },
        status: 'active',
        metadata: {
          establishedYear: 2010,
          specializations: ['General Medicine', 'Surgery', 'Gynecology']
        }
      }
    ]);
    console.log(`Created ${hospitals.length} hospitals`);

    // Create Hospital Admin for first hospital
    console.log('Creating Hospital Admin...');
    const hospitalAdmin = await Admin.create({
      email: 'hospital.admin@citygeneral.com',
      password: 'Hospital@123',
      name: {
        firstName: 'Hospital',
        lastName: 'Admin'
      },
      role: 'hospital_admin',
      hospital: hospitals[0]._id,
      permissions: [
        'manage_staff',
        'manage_resources',
        'view_users',
        'view_analytics'
      ],
      isActive: true
    });
    console.log('Hospital Admin created:', hospitalAdmin.email);

    // Create Sample Staff
    console.log('Creating sample staff...');
    const staff = await Staff.insertMany([
      {
        employeeId: 'DOC001',
        name: { firstName: 'Ahmed', lastName: 'Khan' },
        role: 'doctor',
        specialization: 'Cardiology',
        department: 'Cardiology',
        hospital: hospitals[0]._id,
        contact: {
          phone: '+92-300-1234567',
          email: 'ahmed.khan@citygeneral.com'
        },
        shift: {
          type: 'morning',
          timings: { start: '08:00', end: '16:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        qualifications: [
          { degree: 'MBBS', institution: 'King Edward Medical University', year: 2005 },
          { degree: 'FCPS Cardiology', institution: 'CPSP', year: 2010 }
        ],
        status: 'active'
      },
      {
        employeeId: 'DOC002',
        name: { firstName: 'Fatima', lastName: 'Ali' },
        role: 'doctor',
        specialization: 'Pediatrics',
        department: 'Pediatrics',
        hospital: hospitals[0]._id,
        contact: {
          phone: '+92-300-2345678',
          email: 'fatima.ali@citygeneral.com'
        },
        shift: {
          type: 'afternoon',
          timings: { start: '14:00', end: '22:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        },
        qualifications: [
          { degree: 'MBBS', institution: 'Aga Khan University', year: 2008 },
          { degree: 'MD Pediatrics', institution: 'AKUH', year: 2013 }
        ],
        status: 'active'
      },
      {
        employeeId: 'NUR001',
        name: { firstName: 'Maria', lastName: 'Hassan' },
        role: 'nurse',
        department: 'Emergency',
        hospital: hospitals[0]._id,
        contact: {
          phone: '+92-300-3456789',
          email: 'maria.hassan@citygeneral.com'
        },
        shift: {
          type: 'rotating',
          timings: { start: '07:00', end: '19:00' },
          workingDays: ['monday', 'wednesday', 'friday', 'sunday']
        },
        status: 'active'
      },
      {
        employeeId: 'DOC003',
        name: { firstName: 'Hassan', lastName: 'Raza' },
        role: 'doctor',
        specialization: 'Neurology',
        department: 'Neurology',
        hospital: hospitals[1]._id,
        contact: {
          phone: '+92-300-4567890',
          email: 'hassan.raza@nationalmedical.pk'
        },
        shift: {
          type: 'morning',
          timings: { start: '09:00', end: '17:00' },
          workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        },
        status: 'active'
      }
    ]);
    console.log(`Created ${staff.length} staff members`);

    // Create Sample Resources
    console.log('Creating sample resources...');
    const resources = await Resource.insertMany([
      // Hospital 1 Resources
      {
        hospital: hospitals[0]._id,
        resourceType: 'bed',
        category: 'general',
        total: 200,
        available: 45,
        occupied: 150,
        maintenance: 5,
        location: { floor: 'Multiple', wing: 'All Wings' },
        updatedBy: superAdmin._id
      },
      {
        hospital: hospitals[0]._id,
        resourceType: 'icu_bed',
        category: 'critical_care',
        total: 30,
        available: 8,
        occupied: 20,
        maintenance: 2,
        location: { floor: '3rd', wing: 'ICU Wing' },
        updatedBy: superAdmin._id
      },
      {
        hospital: hospitals[0]._id,
        resourceType: 'ventilator',
        category: 'critical_care',
        total: 25,
        available: 10,
        occupied: 15,
        maintenance: 0,
        location: { floor: '3rd', wing: 'ICU Wing' },
        updatedBy: superAdmin._id
      },
      {
        hospital: hospitals[0]._id,
        resourceType: 'emergency_ward',
        category: 'emergency',
        total: 15,
        available: 5,
        occupied: 10,
        maintenance: 0,
        location: { floor: 'Ground', wing: 'Emergency' },
        updatedBy: superAdmin._id
      },
      // Hospital 2 Resources
      {
        hospital: hospitals[1]._id,
        resourceType: 'bed',
        category: 'general',
        total: 350,
        available: 80,
        occupied: 260,
        maintenance: 10,
        location: { floor: 'Multiple', wing: 'All Wings' },
        updatedBy: superAdmin._id
      },
      {
        hospital: hospitals[1]._id,
        resourceType: 'icu_bed',
        category: 'critical_care',
        total: 50,
        available: 12,
        occupied: 35,
        maintenance: 3,
        location: { floor: '5th', wing: 'Critical Care' },
        updatedBy: superAdmin._id
      },
      // Hospital 3 Resources
      {
        hospital: hospitals[2]._id,
        resourceType: 'bed',
        category: 'general',
        total: 100,
        available: 30,
        occupied: 65,
        maintenance: 5,
        location: { floor: 'Multiple', wing: 'All Wings' },
        updatedBy: superAdmin._id
      },
      {
        hospital: hospitals[2]._id,
        resourceType: 'ventilator',
        category: 'critical_care',
        total: 10,
        available: 4,
        occupied: 6,
        maintenance: 0,
        location: { floor: '2nd', wing: 'ICU' },
        updatedBy: superAdmin._id
      }
    ]);
    console.log(`Created ${resources.length} resources`);

    console.log('\n========================================');
    console.log('Database seeded successfully!');
    console.log('========================================');
    console.log('\nTest Credentials:');
    console.log('----------------------------------------');
    console.log('Super Admin:');
    console.log('  Email: admin@healthcare.com');
    console.log('  Password: Admin@123');
    console.log('----------------------------------------');
    console.log('Hospital Admin:');
    console.log('  Email: hospital.admin@citygeneral.com');
    console.log('  Password: Hospital@123');
    console.log('----------------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
