import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

interface ToneConfig {
  label: string;
  criteriaSummary: string;
  guidelines: string;
}

const TONE_CONFIGS: Record<string, ToneConfig> = {
  friendly: {
    label: 'Polite & Encouraging',
    criteriaSummary: 'Warm appreciation, supportive tone, courteous requests, and proactive assistance offers.',
    guidelines:
      'CRITICAL TONE REQUIREMENTS (POLITE & ENCOURAGING):\n' +
      '- Use a warm, cordial, appreciative, and motivating tone throughout.\n' +
      '- Express genuine gratitude for the faculty/staff members hard work, dedication, and impact on students.\n' +
      '- Frame requests collaboratively and politely (e.g. "Kindly submit", "We would deeply appreciate your support", "Thank you for your continuous dedication").\n' +
      '- Proactively offer help or guidance if they face any difficulties or technical hurdles.\n' +
      '- Sign off with encouraging, warm closings (e.g. "With warm regards and appreciation", "Thank you for your valuable cooperation").'
  },
  urgent: {
    label: 'Urgent & Deadline-Driven',
    criteriaSummary: 'Prominent priority tag, strict non-negotiable deadlines, and numbered action items.',
    guidelines:
      'CRITICAL TONE REQUIREMENTS (URGENT & DEADLINE-DRIVEN):\n' +
      '- Mark the message prominently with "[URGENT: TIME-SENSITIVE]".\n' +
      '- Emphasize strict, non-negotiable deadlines (date & time) with high visual prominence.\n' +
      '- Clearly state the institutional impact and compliance necessity (e.g. Dean Executive Review, NBA Accreditation inspection, or Examination Cell audit).\n' +
      '- Present action items in crisp, numbered/bulleted format demanding immediate turnaround without delay.\n' +
      '- State escalation or direct contact instructions for any blockers.'
  },
  professional: {
    label: 'Professional & Direct',
    criteriaSummary: 'Concise executive summary, structured bullet points, and objective deliverables.',
    guidelines:
      'CRITICAL TONE REQUIREMENTS (PROFESSIONAL & DIRECT):\n' +
      '- Write in a crisp, objective, concise, and business-academic executive tone.\n' +
      '- Eliminate conversational fluff; state the core objective directly in the opening sentence.\n' +
      '- Present expected deliverables, responsibilities, and timeline milestones in clean bullet points.\n' +
      '- Maintain clear, unambiguous expectations with structured professional closing.'
  },
  formal: {
    label: 'Formal & Institutional',
    criteriaSummary: 'Official Anurag University CSE protocol, administrative circular structure, and institutional authority.',
    guidelines:
      'CRITICAL TONE REQUIREMENTS (FORMAL & INSTITUTIONAL):\n' +
      '- Adhere strictly to Anurag University Department of CSE official administrative protocol.\n' +
      '- Use formal academic salutations (e.g. "Respected Faculty Members", "Official Departmental Memorandum").\n' +
      '- Reference official university directives, academic regulations, and quality standards (NBA/NAAC).\n' +
      '- Maintain an authoritative, dignified institutional voice with official department sign-off.'
  }
};

const GROQ_MODELS = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

export const generateDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt, tone = 'formal', type = 'email' } = req.body;

    if (!prompt || !prompt.trim()) {
      res.status(400).json({ success: false, message: 'Prompt instructions are required.' });
      return;
    }

    const toneConfig = TONE_CONFIGS[tone] || TONE_CONFIGS.formal;
    const userFullName = req.user?.fullName || 'Academic Coordinator';
    const userDesignation = req.user?.designation || 'Department of Computer Science & Engineering';

    const groqApiKey = process.env.GROQ_API_KEY;

    if (groqApiKey && groqApiKey.trim() !== '') {
      for (const modelName of GROQ_MODELS) {
        try {
          const systemContent = `You are the AI Academic Assistant for the Department of Computer Science & Engineering (CSE) at Anurag University, Hyderabad.
You help the Dean, Academic Coordinators, and Faculty draft clear, ready-to-use institutional communications.

Target Communication Type: ${type.toUpperCase()}
Selected Communication Tone: ${toneConfig.label}

${toneConfig.guidelines}

FORMAT INSTRUCTIONS FOR CATEGORY (${type.toUpperCase()}):
- If "email": Provide a clear "Subject:", followed by an appropriate greeting, structured paragraphs embodying the tone criteria, clear next steps, and sign-off (${userFullName}, ${userDesignation}, Anurag University).
- If "task": Provide "Task Objective", "Context & Importance", "Detailed Deliverables (numbered)", "Deadlines & Milestones", and "Submission Guidelines" strictly applying the ${toneConfig.label} tone.
- If "announcement": Provide an official "CIRCULAR: DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING", Reference/Date, clear notice body applying the ${toneConfig.label} tone, and official sign-off authority.
- If "meeting": Provide "Meeting Title", "Purpose & Objectives", "Numbered Agenda Items", "Scheduled Time & Platform", and "Attendee Preparation Guidelines" strictly applying the ${toneConfig.label} tone.`;

          const userContent = `Please draft a ready-to-use ${type} with the following details:
"${prompt}"

Remember: You MUST strictly adopt the "${toneConfig.label}" criteria:
${toneConfig.criteriaSummary}`;

          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqApiKey.trim()}`
            },
            body: JSON.stringify({
              model: modelName,
              messages: [
                { role: 'system', content: systemContent },
                { role: 'user', content: userContent }
              ],
              temperature: tone === 'friendly' ? 0.75 : 0.6,
              max_tokens: 850
            })
          });

          const json = (await response.json()) as any;
          if (json.choices && json.choices.length > 0 && json.choices[0].message?.content) {
            res.json({
              success: true,
              data: {
                draft: json.choices[0].message.content.trim(),
                tone,
                toneLabel: toneConfig.label,
                criteriaSummary: toneConfig.criteriaSummary,
                provider: `Groq (${modelName})`
              }
            });
            return;
          }
        } catch (modelErr) {
          console.warn(`Groq model ${modelName} error, trying next:`, modelErr);
        }
      }
    }

    // High-quality tone-specific intelligent template fallback
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    let draft = '';

    if (type === 'email') {
      if (tone === 'friendly') {
        draft = `Subject: Friendly Note: ${prompt.slice(0, 50)}...\n\nDear Esteemed Faculty Colleagues,\n\nI hope you are having a productive and pleasant week. Thank you all for your relentless dedication to our students and the department.\n\nWe would like to kindly bring the following item to your attention:\n${prompt}\n\nWe would greatly appreciate it if you could assist us by reviewing and completing this at your earliest convenience. If you need any assistance, course data, or support with the submissions, please feel free to reach out anytime—we are always here to support you.\n\nThank you so much for your continuous cooperation and commitment to academic excellence.\n\nWarm regards,\n${userFullName}\n${userDesignation}\nDepartment of Computer Science & Engineering\nAnurag University`;
      } else if (tone === 'urgent') {
        draft = `Subject: [URGENT / TIME-SENSITIVE] Action Required: ${prompt.slice(0, 45)}...\n\nAttention: All CSE Faculty Members,\n\nThis is an urgent and critical notification regarding upcoming university review deadlines.\n\nImmediate Directive:\n${prompt}\n\nStrict Submission Deadline:\nAll submissions must be completed and uploaded no later than the scheduled deadline without exception. Non-compliance may adversely impact department audits and academic scheduling.\n\nImmediate Action Items:\n1. Verify and compile the required documentation immediately.\n2. Upload completed files to the UniSync portal or deliver to the coordination desk.\n3. Report any technical impediments to the department office immediately.\n\nYour immediate compliance is required.\n\nBy Order of Dean / Academic Coordination Desk,\n${userFullName}\nDepartment of Computer Science & Engineering\nAnurag University`;
      } else if (tone === 'professional') {
        draft = `Subject: Directive: ${prompt.slice(0, 50)}...\n\nDear Faculty Members,\n\nPlease note the following update regarding departmental operations:\n\nObjective:\n${prompt}\n\nKey Deliverables:\n• Review specified criteria and ensure all requisite documentation is verified.\n• Submit records via the UniSync departmental portal by the assigned timeline.\n• Coordinate with respective module leads for any cross-functional alignment.\n\nPoint of Contact:\nFor technical or procedural clarifications, please contact the coordination desk.\n\nRegards,\n${userFullName}\n${userDesignation}\nDepartment of Computer Science & Engineering\nAnurag University`;
      } else {
        // formal
        draft = `Subject: Official Notification: ${prompt.slice(0, 50)}...\n\nRespected Faculty Members,\n\nGreetings from the Department of Computer Science & Engineering, Anurag University.\n\nIn accordance with institutional academic directives and regulatory benchmarks, your attention is invited to the following:\n\n${prompt}\n\nAll concerned faculty members are hereby instructed to adhere strictly to the stipulated academic timelines and maintain required documentation in compliance with university quality standards.\n\nYour customary cooperation in upholding institutional excellence is solicited.\n\nSincerely,\n${userFullName}\n${userDesignation}\nDepartment of Computer Science & Engineering\nAnurag University`;
      }
    } else if (type === 'task') {
      if (tone === 'friendly') {
        draft = `Task Objective:\n${prompt}\n\nCollaborative Goals & Context:\nThank you for guiding our CSE students. This task is aimed at streamlining our semester documentation and supporting our academic milestones together.\n\nRecommended Steps:\n1. Kindly compile your course records, internal marks, and student logbooks.\n2. Review with your module peer if helpful, and upload via the UniSync portal.\n3. Reach out to the coordination desk if you encounter any difficulties—we are here to help!\n\nSubmission Timeline:\nPlease upload at your earliest convenience prior to the scheduled date.\n\nThank you for your ongoing commitment to quality education!`;
      } else if (tone === 'urgent') {
        draft = `[HIGH PRIORITY & TIME-SENSITIVE] Task Directive\n\nTask Scope:\n${prompt}\n\nMandatory Compliance Requirements:\n1. Immediate verification of student records, attendance, and evaluation dossiers.\n2. Final submission to the department examination / accreditation desk.\n3. Mandatory sign-off required prior to deadline.\n\nNon-Negotiable Submission Deadline:\nStrict adherence is required. Late submissions cannot be accommodated due to institutional audit schedules.\n\nEscalation:\nReport any system bottlenecks to the department coordinator immediately.`;
      } else if (tone === 'professional') {
        draft = `Task Specification: Departmental Milestone\n\nScope:\n${prompt}\n\nDeliverables & Output Criteria:\n1. Completed documentation in designated PDF / Excel template format.\n2. Verification of Course Outcomes (COs) and student assessment matrices.\n3. Digital submission through the UniSync task repository.\n\nReview & Acceptance:\nSubmissions will be validated by the Module Coordinator and Academic Committee upon receipt.`;
      } else {
        draft = `Official Academic Task Specification\nDepartment of Computer Science & Engineering\n\nTask Title & Description:\n${prompt}\n\nInstitutional Guidelines:\n1. Adhere to Anurag University curriculum and evaluation benchmarks.\n2. Submit internal assessments, course files, and attendance logs.\n3. Maintain audit-ready documentation for institutional quality assurance.\n\nSubmission Protocol:\nAll documents must be uploaded via UniSync with institutional CSE credentials.`;
      }
    } else if (type === 'announcement') {
      if (tone === 'friendly') {
        draft = `DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\nAnurag University | Academic Circular\nDate: ${dateStr}\n\nDear Faculty, Staff, and Students,\n\nWe are delighted to share the following departmental update:\n\n${prompt}\n\nWe truly appreciate everyone's collective energy and support in making our department a thriving center for learning and research. Please feel free to participate actively and share your valuable suggestions.\n\nWarmest regards,\nAcademic Coordination Desk & HOD\nDepartment of Computer Science & Engineering\nAnurag University`;
      } else if (tone === 'urgent') {
        draft = `[URGENT CIRCULAR] DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\nAnurag University | Office of the Dean & HOD\nRef: AU/CSE/URGENT/${dateStr.replace(/\s+/g, '-')}\nDate: ${dateStr}\n\nATTENTION: ALL CSE FACULTY, TECHNICAL STAFF & STUDENTS\n\nCRITICAL NOTIFICATION:\n${prompt}\n\nSTRICT COMPLIANCE DIRECTIVE:\nAll concerned individuals are hereby directed to complete required submissions and actions immediately. No extensions will be granted given university scheduling imperatives.\n\nBy Immediate Order,\nDean & Head of Department (CSE)\nAnurag University`;
      } else if (tone === 'professional') {
        draft = `DEPARTMENTAL NOTICE: CSE\nAnurag University | Date: ${dateStr}\n\nTo: All CSE Faculty & Technical Personnel\n\nSubject: ${prompt.slice(0, 60)}...\n\nDetails:\n${prompt}\n\nAction Required:\nAll members are requested to review the above operational requirements and execute deliverables according to the established departmental schedule.\n\nHead of Department\nDepartment of Computer Science & Engineering`;
      } else {
        draft = `CIRCULAR: DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING\nAnurag University (Autonomous)\nDate: ${dateStr}\nRef No: AU/CSE/CIRCULAR/2026\n\nSubject: Official Departmental Notice\n\nAttention: All Faculty Members and Academic Coordinators\n\n${prompt}\n\nAll concerned are hereby instructed to take cognizance of the aforementioned directive and ensure rigorous compliance in letter and spirit.\n\nBy Order,\nHead of Department (CSE)\nAnurag University`;
      }
    } else {
      // meeting
      if (tone === 'friendly') {
        draft = `Meeting Invitation: Academic Coordination & Collaboration Session\n\nDear Esteemed Faculty Colleagues,\n\nYou are warmly invited to an upcoming department interaction:\n\nFocus Topic:\n${prompt}\n\nProposed Agenda:\n1. Welcoming remarks and celebration of recent academic milestones.\n2. Open discussion and constructive sharing regarding: ${prompt}\n3. Support needed, faculty feedback, and collaborative next steps.\n\nPlatform: Google Meet / Department Seminar Hall\nTime: As scheduled in departmental calendar\n\nWe look forward to an enriching discussion. Thank you for your continued dedication!\n\nWarm regards,\n${userFullName}\nCSE Department, Anurag University`;
      } else if (tone === 'urgent') {
        draft = `[URGENT] Emergency Academic Review Meeting\nDepartment of Computer Science & Engineering\n\nCRITICAL CALL TO MEETING:\n${prompt}\n\nMandatory Attendance:\nAll designated committee members, module coordinators, and faculty must attend without fail.\n\nUrgent Agenda Items:\n1. Immediate resolution of: ${prompt}\n2. Review of compliance gaps, attendance defaulters, and examination preparedness.\n3. Instant action assignment and immediate deadlines.\n\nDate & Time: As notified via calendar invite\nMode: Department Board Room & Google Meet Link\n\nStrict attendance will be recorded.\n\nDean & HOD (CSE)\nAnurag University`;
      } else if (tone === 'professional') {
        draft = `Meeting Notice: CSE Department Review\n\nObjective:\n${prompt}\n\nAgenda:\n1. Status briefing on current operational deliverables.\n2. Review of key action items: ${prompt}\n3. Resource allocation and timeline alignment.\n4. Decisions and assigned responsibilities.\n\nSchedule: Refer to official calendar invite\nLocation: Virtual / Department Conference Room\n\nCoordinator\nDepartment of Computer Science & Engineering`;
      } else {
        draft = `NOTICE OF OFFICIAL ACADEMIC MEETING\nDepartment of Computer Science & Engineering\nAnurag University\n\nRef: AU/CSE/MEETING/2026\nDate: ${dateStr}\n\nSubject: Official Departmental Meeting Notice\n\nNotice is hereby given that a formal meeting of the CSE Academic Committee will convene to discuss:\n\n${prompt}\n\nAgenda:\n1. Confirmation of minutes of previous meeting.\n2. Discussion and institutional deliberation on: ${prompt}\n3. Academic compliance, NBA criteria verification, and syllabus pacing.\n4. Any other matter with permission of the Chair.\n\nAll members are requested to attend with updated records.\n\nBy Order,\nHead of Department (CSE)\nAnurag University`;
      }
    }

    res.json({
      success: true,
      data: {
        draft,
        tone,
        toneLabel: toneConfig.label,
        criteriaSummary: toneConfig.criteriaSummary,
        provider: 'UniSync Academic AI Assistant (Built-in Tone Engine)'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
