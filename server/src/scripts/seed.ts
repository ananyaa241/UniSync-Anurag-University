import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { Announcement } from '../models/Announcement.js';
import { Meeting } from '../models/Meeting.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { FeedbackRequest } from '../models/FeedbackRequest.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unisync_db';

export const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected to MongoDB for seeding.');

    // Clear existing collections
    await User.deleteMany({});
    await Task.deleteMany({});
    await Announcement.deleteMany({});
    await Meeting.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await FeedbackRequest.deleteMany({});

    console.log('[Seed] Cleared existing records.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Anurag@123', salt);

    // 1. Create Core Users for Anurag University CSE
    const hod = await User.create({
      fullName: 'Dr. G. Vishnu Murthy',
      email: 'dean.cse@anurag.edu.in',
      employeeId: 'AU-CSE-001',
      role: 'HOD',
      department: 'Computer Science and Engineering',
      designation: 'Dean, CSE',
      phone: '+91 9876543210',
      passwordHash,
      accountStatus: 'ACTIVE',
      isEmailVerified: true,
      notificationPreferences: { inApp: true, email: true, sms: false, classReminders: false, reminderOffsetMinutes: 10 }
    });

    const coordinator = await User.create({
      fullName: 'Prof. Kavitha Reddy',
      email: 'coordinator.cse@anurag.edu.in',
      employeeId: 'AU-CSE-012',
      role: 'COORDINATOR',
      department: 'Computer Science and Engineering',
      designation: 'Associate Professor & Academic Coordinator',
      phone: '+91 9876543211',
      passwordHash,
      accountStatus: 'ACTIVE',
      isEmailVerified: true,
      notificationPreferences: { inApp: true, email: true, sms: false, classReminders: false, reminderOffsetMinutes: 10 }
    });

    const faculty1 = await User.create({
      fullName: 'Dr. Ananya Sharma',
      email: 'ananya.cse@anurag.edu.in',
      employeeId: 'AU-CSE-045',
      role: 'FACULTY',
      department: 'Computer Science and Engineering',
      designation: 'Assistant Professor (Senior Scale)',
      phone: '+91 9876543212',
      passwordHash,
      accountStatus: 'ACTIVE',
      isEmailVerified: true,
      notificationPreferences: { inApp: true, email: true, sms: false, classReminders: false, reminderOffsetMinutes: 10 }
    });

    const faculty2 = await User.create({
      fullName: 'Prof. Rahul Varma',
      email: 'rahul.cse@anurag.edu.in',
      employeeId: 'AU-CSE-056',
      role: 'FACULTY',
      department: 'Computer Science and Engineering',
      designation: 'Assistant Professor',
      phone: '+91 9876543213',
      passwordHash,
      accountStatus: 'ACTIVE',
      isEmailVerified: true,
      notificationPreferences: { inApp: true, email: true, sms: false, classReminders: false, reminderOffsetMinutes: 10 }
    });

    const faculty3 = await User.create({
      fullName: 'Dr. Priya Joshi',
      email: 'priya.cse@anurag.edu.in',
      employeeId: 'AU-CSE-078',
      role: 'FACULTY',
      department: 'Computer Science and Engineering',
      designation: 'Associate Professor',
      phone: '+91 9876543214',
      passwordHash,
      accountStatus: 'ACTIVE',
      isEmailVerified: true,
      notificationPreferences: { inApp: true, email: true, sms: false, classReminders: false, reminderOffsetMinutes: 10 }
    });

    console.log('[Seed] Created default users: HOD, Coordinator, and Faculty.');

    // 2. Realistic Departmental Tasks
    const nextFriday = new Date();
    nextFriday.setDate(nextFriday.getDate() + 5);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 8);

    await Task.create({
      title: 'Submit Student Internal Marks Report — Semester III',
      description: 'Please upload compiled mid-term internal marks sheets for CSE Year II / Semester III including theory and tutorial components as per NBA guidelines.',
      category: 'Examination',
      priority: 'HIGH',
      createdBy: coordinator._id,
      assignees: [
        {
          facultyId: faculty1._id,
          status: 'NOT_STARTED',
          submissionFiles: []
        },
        {
          facultyId: faculty2._id,
          status: 'NOT_STARTED',
          submissionFiles: []
        }
      ],
      dueDate: nextFriday,
      dueTime: '17:00',
      reviewRequired: true,
      requiredDocumentsDescription: 'Consolidated Excel / signed PDF marks verification report.',
      overallStatus: 'IN_PROGRESS'
    });

    await Task.create({
      title: 'Submit DBMS Course File & Lab Rubrics Documentation',
      description: 'Prepare complete DBMS course dossier including syllabus map, lecture plan, assignment rubrics, and previous question papers.',
      category: 'Documentation',
      priority: 'MEDIUM',
      createdBy: hod._id,
      assignees: [
        {
          facultyId: faculty1._id,
          status: 'NOT_STARTED',
          submissionFiles: []
        }
      ],
      dueDate: nextWeek,
      dueTime: '16:00',
      reviewRequired: true,
      requiredDocumentsDescription: 'Course File PDF file package.',
      overallStatus: 'NOT_STARTED'
    });

    // 3. Department Announcements
    await Announcement.create({
      title: 'NBA Accreditation Inspection Preparedness Meeting',
      message: 'All CSE Faculty members are requested to keep their updated course files, lab logbooks, and student mentor record sheets ready by Monday morning for the internal mock inspection.',
      priority: 'HIGH',
      targetAudience: 'ALL',
      createdBy: hod._id
    });

    // 4. Department Meeting with Google Meet
    const meetingDate = new Date();
    meetingDate.setDate(meetingDate.getDate() + 2);
    await Meeting.create({
      title: 'CSE Department Academic Council Monthly Review',
      description: 'Discussion on syllabus coverage, mid-term examinations, and student project phase-1 evaluation.',
      agenda: '1. Syllabus tracking\n2. Lab attendance review\n3. IEEE Conference paper submissions\n4. Follow-up milestones',
      date: meetingDate,
      startTime: '14:30',
      durationMinutes: 60,
      organizerId: hod._id,
      participants: [
        { userId: coordinator._id, status: 'ACCEPTED' },
        { userId: faculty1._id, status: 'ACCEPTED' },
        { userId: faculty2._id, status: 'INVITED' },
        { userId: faculty3._id, status: 'INVITED' }
      ],
      googleMeetLink: 'https://meet.google.com/cse-anurag-sync',
      status: 'SCHEDULED'
    });

    // 5. Private 1-on-1 Direct Chat between Coordinator and Dr. Ananya (PRIVACY DEMO)
    const directChat = await Conversation.create({
      type: 'DIRECT',
      participants: [coordinator._id, faculty1._id],
      admins: [coordinator._id],
      lastMessage: {
        text: 'Hello Dr. Ananya, please verify the internal marks calculation sheet whenever convenient.',
        senderId: coordinator._id,
        sentAt: new Date()
      }
    });

    await Message.create({
      conversationId: directChat._id,
      senderId: coordinator._id,
      content: 'Hello Dr. Ananya, please verify the internal marks calculation sheet whenever convenient.',
      readBy: [{ userId: coordinator._id, readAt: new Date() }]
    });

    console.log('[Seed] Database successfully populated with realistic Anurag University CSE seed data!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
