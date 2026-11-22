import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

export const generateDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt, tone = 'formal', type = 'email' } = req.body;

    if (!prompt) {
      res.status(400).json({ success: false, message: 'Prompt instructions are required.' });
      return;
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (groqApiKey && groqApiKey.trim() !== '') {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqApiKey}`
          },
          body: JSON.stringify({
            model: 'llama3-8b-8192',
            messages: [
              {
                role: 'system',
                content: `You are the AI Academic Assistant for the Computer Science & Engineering (CSE) Department at Anurag University. Assist faculty and coordinators in drafting crisp, polite, structured academic communications, task specifications, meeting agendas, and circulars in a ${tone} tone.`
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7
          })
        });

        const json = (await response.json()) as any;
        if (json.choices && json.choices.length > 0) {
          res.json({
            success: true,
            data: { draft: json.choices[0].message.content, tone, provider: 'Groq Llama-3' }
          });
          return;
        }
      } catch (err) {
        console.warn('Groq API error, falling back to rule-based template generation:', err);
      }
    }

    // High quality intelligent template fallback when key not configured
    let draft = '';
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    if (type === 'email') {
      draft = `Subject: CSE Department Notice: ${prompt.slice(0, 40)}...\n\nDear Esteemed Faculty Members,\n\nGreetings from the CSE Academic Coordination Desk.\n\nWith reference to institutional requirements, please note the following update:\n${prompt}\n\nPlease ensure required submissions or actions are completed before the scheduled timeline. For any queries, feel free to reply directly or contact the coordination desk.\n\nWarm regards,\n${req.user!.fullName}\n${req.user!.designation}\nDepartment of Computer Science & Engineering\nAnurag University`;
    } else if (type === 'task') {
      draft = `Task Objective:\n${prompt}\n\nDetailed Deliverables:\n1. Prepare and review academic documentation according to AU CSE guidelines.\n2. Submit internal marks verification sheet and lab progress reports.\n3. Ensure sign-off from module coordinator before final deadline.\n\nSubmission Guidelines:\nPlease upload files in PDF or Excel format via the UniSync task portal.`;
    } else if (type === 'announcement') {
      draft = `CIRCULAR: CSE DEPARTMENT\nDate: ${dateStr}\n\nAttention: All CSE Faculty & Technical Staff\n\n${prompt}\n\nAll members are requested to take note of the above and adhere to the scheduled timelines accordingly.\n\nBy Order,\nHead of Department (CSE)\nAnurag University`;
    } else {
      draft = `Meeting Title: Academic Coordination Review\n\nAgenda:\n1. Review of current semester curriculum progress.\n2. Discussion regarding: ${prompt}\n3. Laboratory logbooks and student internal assessment updates.\n4. Action items and follow-up timeline.\n\nDate & Time: As scheduled in calendar.\nPlatform: Google Meet`;
    }

    res.json({
      success: true,
      data: {
        draft,
        tone,
        provider: 'UniSync Academic AI Assistant (Built-in)'
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
