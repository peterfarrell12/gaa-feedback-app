// Core feedback logic extracted from feedback-dev-tool.js for web app and API use

export type QuestionType = 'rating' | 'text' | 'multiple_choice' | 'yes_no';

export interface FeedbackQuestion {
  type: QuestionType;
  text: string;
  scale?: number;
  options?: string[];
}

export interface FeedbackSection {
  title: string;
  questions: FeedbackQuestion[];
}

export interface FeedbackTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  sections: number;
  questions: number;
  estimatedTime: string;
  icon: string;
  structure: FeedbackSection[];
}

export function getDefaultTemplates(): FeedbackTemplate[] {
  return [
    {
      id: 'post_match_standard',
      name: 'Post-Match Standard Review',
      description: 'Performance, tactics, and team dynamics',
      type: 'post_game',
      sections: 3,
      questions: 12,
      estimatedTime: '5-7 min',
      icon: '⚽',
      structure: [
        {
          title: 'Performance Assessment',
          questions: [
            { type: 'rating', text: 'How would you rate your individual performance today?', scale: 10 },
            { type: 'rating', text: 'How would you rate the team\'s overall performance?', scale: 10 },
            { type: 'text', text: 'What was your strongest contribution to the team today?' },
            { type: 'text', text: 'What area would you most like to improve for next match?' }
          ]
        },
        {
          title: 'Tactical Analysis',
          questions: [
            { type: 'rating', text: 'How well did we execute our game plan?', scale: 10 },
            { type: 'multiple_choice', text: 'Which tactical area needs most improvement?', options: ['Defensive Shape', 'Attack Transition', 'Set Pieces', 'Possession Play'] },
            { type: 'text', text: 'Any tactical suggestions for future matches?' }
          ]
        },
        {
          title: 'Team Dynamics',
          questions: [
            { type: 'rating', text: 'How would you rate team communication today?', scale: 10 },
            { type: 'rating', text: 'How positive was the team atmosphere?', scale: 10 },
            { type: 'text', text: 'Any feedback for the coaching staff?' },
            { type: 'yes_no', text: 'Do you feel your voice is heard in team decisions?' },
            { type: 'text', text: 'Additional comments (optional)' }
          ]
        }
      ]
    },
    {
      id: 'training_session',
      name: 'Training Session Review',
      description: 'Drills, fitness, and skill development',
      type: 'post_training',
      sections: 4,
      questions: 15,
      estimatedTime: '6-8 min',
      icon: '🏃',
      structure: [
        {
          title: 'Session Quality',
          questions: [
            { type: 'rating', text: 'How would you rate today\'s training session?', scale: 10 },
            { type: 'rating', text: 'How challenging was the session for your skill level?', scale: 10 },
            { type: 'text', text: 'Which drill or activity was most beneficial?' }
          ]
        }
      ]
    },
    {
      id: 'development_review',
      name: 'Player Development Review',
      description: 'Personal growth and goal setting',
      type: 'development',
      sections: 3,
      questions: 10,
      estimatedTime: '8-10 min',
      icon: '📈',
      structure: [
        {
          title: 'Self Assessment',
          questions: [
            { type: 'rating', text: 'How would you rate your progress this season?', scale: 10 },
            { type: 'text', text: 'What are you most proud of in your development?' }
          ]
        }
      ]
    }
  ];
}

export function validateFormStructure(form: { sections?: FeedbackSection[]; structure?: FeedbackSection[] }) {
  const errors: string[] = [];
  const sections = form.sections || form.structure;
  if (!sections || sections.length === 0) {
    errors.push('Form must have at least one section');
  }
  sections?.forEach((section, sIndex) => {
    if (!section.questions || section.questions.length === 0) {
      errors.push(`Section ${sIndex + 1} must have at least one question`);
    }
    section.questions.forEach((question, qIndex) => {
      if (!question.text || question.text.trim() === '') {
        errors.push(`Question ${qIndex + 1} in section ${sIndex + 1} must have text`);
      }
      if (!['rating', 'text', 'multiple_choice', 'yes_no'].includes(question.type)) {
        errors.push(`Question ${qIndex + 1} has invalid type: ${question.type}`);
      }
    });
  });
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function countTotalQuestions(form: { sections?: FeedbackSection[]; structure?: FeedbackSection[] }) {
  const sections = form.sections || form.structure;
  if (!sections) return 0;
  return sections.reduce((total, section) => total + (section.questions ? section.questions.length : 0), 0);
}

export function generateMockAnalytics() {
  const totalResponses = Math.floor(Math.random() * 20) + 15; // 15-35 responses
  const anonymousResponses = Math.floor(totalResponses * (Math.random() * 0.5 + 0.3)); // 30-80% anonymous
  return {
    totalResponses,
    anonymousResponses,
    responseRate: Math.floor((totalResponses / 30) * 100), // Assuming 30 players
    avgPerformanceRating: (Math.random() * 3 + 6.5).toFixed(1), // 6.5-9.5
    insights: [
      'Team communication rated highly (8.2/10 average)',
      'Defensive shape identified as area for improvement',
      '75% of players feel their voice is heard in team decisions',
      'Suggested focus: Set piece execution and fitness levels'
    ],
    questionAnalysis: [
      { question: 'Individual Performance', avgRating: 7.8, responseCount: totalResponses },
      { question: 'Team Performance', avgRating: 8.1, responseCount: totalResponses },
      { question: 'Communication', avgRating: 8.2, responseCount: totalResponses }
    ]
  };
} 