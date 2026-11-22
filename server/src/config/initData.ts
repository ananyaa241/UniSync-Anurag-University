import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const ensureInitialData = async (): Promise<void> => {
  try {
    const deanEmail = 'dean.cse@anurag.edu.in';
    const existingDean = await User.findOne({ email: deanEmail });

    // Salt and hash default institutional password: Anurag@123
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Anurag@123', salt);

    if (!existingDean) {
      console.log('[Auto-Init] Provisioning Dean account on connected database...');
      await User.create({
        fullName: 'Dr. G. Vishnu Murthy',
        email: deanEmail,
        employeeId: 'AU-CSE-001',
        role: 'HOD',
        department: 'Computer Science and Engineering',
        designation: 'Dean, CSE',
        phone: '+91 9876543210',
        passwordHash,
        accountStatus: 'ACTIVE',
        isEmailVerified: true,
        notificationPreferences: {
          inApp: true,
          email: true,
          sms: false,
          classReminders: false,
          reminderOffsetMinutes: 10
        }
      });
      console.log('[Auto-Init] Dean account created successfully: dean.cse@anurag.edu.in');
    }

    const coordEmail = 'coordinator.cse@anurag.edu.in';
    const existingCoord = await User.findOne({ email: coordEmail });
    if (!existingCoord) {
      await User.create({
        fullName: 'Prof. Kavitha Reddy',
        email: coordEmail,
        employeeId: 'AU-CSE-012',
        role: 'COORDINATOR',
        department: 'Computer Science and Engineering',
        designation: 'Associate Professor & Academic Coordinator',
        phone: '+91 9876543211',
        passwordHash,
        accountStatus: 'ACTIVE',
        isEmailVerified: true,
        notificationPreferences: {
          inApp: true,
          email: true,
          sms: false,
          classReminders: false,
          reminderOffsetMinutes: 10
        }
      });
      console.log('[Auto-Init] Academic Coordinator account created: coordinator.cse@anurag.edu.in');
    }

    const facultyEmail = 'ananya.cse@anurag.edu.in';
    const existingFaculty = await User.findOne({ email: facultyEmail });
    if (!existingFaculty) {
      await User.create({
        fullName: 'Dr. Ananya Sharma',
        email: facultyEmail,
        employeeId: 'AU-CSE-045',
        role: 'FACULTY',
        department: 'Computer Science and Engineering',
        designation: 'Assistant Professor',
        phone: '+91 9876543212',
        passwordHash,
        accountStatus: 'ACTIVE',
        isEmailVerified: true,
        notificationPreferences: {
          inApp: true,
          email: true,
          sms: false,
          classReminders: true,
          reminderOffsetMinutes: 15
        }
      });
      console.log('[Auto-Init] Faculty account created: ananya.cse@anurag.edu.in');
    }
  } catch (error) {
    console.error('[Auto-Init] Notice: Could not auto-provision initial accounts:', error);
  }
};
