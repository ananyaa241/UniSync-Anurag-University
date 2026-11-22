const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/unisync_db');
  const hod = await mongoose.connection.collection('users').findOne({ role: 'HOD' });
  const coord = await mongoose.connection.collection('users').findOne({ role: 'COORDINATOR' });
  const facultyList = await mongoose.connection.collection('users').find({ role: 'FACULTY' }).toArray();

  console.log('HOD:', hod.fullName, '| Coord:', coord.fullName, '| Faculty count:', facultyList.length);

  // Update existing coordinator-to-faculty tasks
  await mongoose.connection.collection('tasks').updateMany(
    { title: 'Submit Student Internal Marks Report — Semester III' },
    {
      $set: {
        taskType: 'COORDINATOR_TO_FACULTY',
        creatorRole: 'COORDINATOR',
        createdBy: coord._id
      }
    }
  );

  await mongoose.connection.collection('tasks').updateMany(
    { title: 'Submit DBMS Course File & Lab Rubrics Documentation' },
    {
      $set: {
        taskType: 'COORDINATOR_TO_FACULTY',
        creatorRole: 'COORDINATOR',
        createdBy: coord._id,
        assignees: [
          {
            facultyId: facultyList[2]._id, // Dr. Priya Joshi
            role: 'FACULTY',
            status: 'IN_PROGRESS',
            progressPercentage: 40,
            submissionFiles: []
          }
        ]
      }
    }
  );

  // Add Dean-assigned tasks to Coordinator if not already existing
  const deanTask1Exists = await mongoose.connection.collection('tasks').findOne({ title: 'NBA Criteria 3 Accreditation Dossier & Faculty Compliance' });
  if (!deanTask1Exists) {
    const nextWeek = new Date(Date.now() + 6 * 86400000);
    await mongoose.connection.collection('tasks').insertOne({
      title: 'NBA Criteria 3 Accreditation Dossier & Faculty Compliance',
      description: 'Coordinate with all departmental faculty members to consolidate course outcome attainments, lab rubrics, and continuous internal evaluation records for NBA criteria 3 compliance.',
      category: 'Accreditation',
      department: 'Computer Science and Engineering',
      priority: 'HIGH',
      createdBy: hod._id,
      creatorRole: 'DEAN',
      taskType: 'DEAN_TO_COORDINATOR',
      assignees: [
        {
          facultyId: coord._id,
          role: 'COORDINATOR',
          status: 'IN_PROGRESS',
          progressPercentage: 60,
          submissionFiles: [],
          submissionNotes: 'All faculty members have submitted drafts. Consolidating into unified NBA dossier.'
        }
      ],
      progressPercentage: 60,
      startDate: new Date(),
      dueDate: nextWeek,
      dueTime: '17:00',
      reviewRequired: true,
      instructions: 'Ensure all mapping matrices follow Bloom Taxonomy levels 1 through 5.',
      expectedDeliverables: 'Consolidated Criteria 3 PDF dossier signed by department review committee.',
      attachments: [],
      comments: [],
      overallStatus: 'IN_PROGRESS',
      isArchived: false,
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created Dean-to-Coordinator Task 1');
  }

  const deanTask2Exists = await mongoose.connection.collection('tasks').findOne({ title: 'Annual Academic Audit & Curriculum Benchmarking 2026' });
  if (!deanTask2Exists) {
    const nextFortnight = new Date(Date.now() + 12 * 86400000);
    await mongoose.connection.collection('tasks').insertOne({
      title: 'Annual Academic Audit & Curriculum Benchmarking 2026',
      description: 'Prepare the annual academic audit summary report comparing current R22 regulations with AICTE model curriculum guidelines for upcoming Board of Studies (BoS) review.',
      category: 'Curriculum',
      department: 'Computer Science and Engineering',
      priority: 'MEDIUM',
      createdBy: hod._id,
      creatorRole: 'DEAN',
      taskType: 'DEAN_TO_COORDINATOR',
      assignees: [
        {
          facultyId: coord._id,
          role: 'COORDINATOR',
          status: 'NOT_STARTED',
          progressPercentage: 0,
          submissionFiles: []
        }
      ],
      progressPercentage: 0,
      startDate: new Date(),
      dueDate: nextFortnight,
      dueTime: '16:00',
      reviewRequired: true,
      instructions: 'Highlight emerging trends in Generative AI, Cloud Systems, and Quantum Computing electives.',
      expectedDeliverables: 'Comparative BoS curriculum matrix document.',
      attachments: [],
      comments: [],
      overallStatus: 'NOT_STARTED',
      isArchived: false,
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created Dean-to-Coordinator Task 2');
  }

  // Also add 1 more faculty task so Dr. Krishna has an assignment
  const facTask3Exists = await mongoose.connection.collection('tasks').findOne({ title: 'Mid-Term Examination Question Bank & Taxonomy Mapping' });
  if (!facTask3Exists) {
    const nextWeek = new Date(Date.now() + 5 * 86400000);
    await mongoose.connection.collection('tasks').insertOne({
      title: 'Mid-Term Examination Question Bank & Taxonomy Mapping',
      description: 'Submit mid-term question bank with Bloom’s taxonomy classification levels and Course Outcome (CO) mapping for Advanced Data Structures.',
      category: 'Examination',
      department: 'Computer Science and Engineering',
      priority: 'HIGH',
      createdBy: coord._id,
      creatorRole: 'COORDINATOR',
      taskType: 'COORDINATOR_TO_FACULTY',
      assignees: [
        {
          facultyId: facultyList[3]._id, // Dr. Krishna
          role: 'FACULTY',
          status: 'NOT_STARTED',
          progressPercentage: 0,
          submissionFiles: []
        }
      ],
      progressPercentage: 0,
      startDate: new Date(),
      dueDate: nextWeek,
      dueTime: '17:00',
      reviewRequired: true,
      instructions: 'Include at least 2 questions per CO with clear marking distribution.',
      expectedDeliverables: 'Verified question bank in college prescribed template.',
      attachments: [],
      comments: [],
      overallStatus: 'NOT_STARTED',
      isArchived: false,
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Created Faculty Task 3');
  }

  console.log('Hierarchy alignment complete.');
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
