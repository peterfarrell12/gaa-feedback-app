-- GAA Feedback System Database Schema (Normalized)

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('coach', 'player')),
    club VARCHAR(255) NOT NULL,
    position VARCHAR(100), -- For players
    age INTEGER,
    jersey_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('match', 'training')),
    opponent VARCHAR(255), -- For matches
    date DATE NOT NULL,
    club VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form templates table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    estimated_time VARCHAR(20),
    icon VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template sections table
CREATE TABLE template_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template questions table
CREATE TABLE template_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES template_sections(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('rating', 'text', 'multiple_choice', 'yes_no')),
    options JSONB, -- For multiple choice questions
    scale INTEGER, -- For rating questions
    required BOOLEAN DEFAULT true,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forms table
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    template_id UUID REFERENCES templates(id),
    event_id UUID REFERENCES events(id),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
    allow_anonymous BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form responses table
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES forms(id),
    user_id UUID REFERENCES users(id), -- NULL for anonymous responses
    is_anonymous BOOLEAN DEFAULT false,
    completion_time_seconds INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual question responses table
CREATE TABLE question_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
    question_id UUID REFERENCES template_questions(id),
    answer_text TEXT,
    answer_numeric INTEGER,
    answer_choice VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_club ON users(club);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_club ON events(club);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_template_sections_template_id ON template_sections(template_id);
CREATE INDEX idx_template_sections_order ON template_sections(order_index);
CREATE INDEX idx_template_questions_section_id ON template_questions(section_id);
CREATE INDEX idx_template_questions_order ON template_questions(order_index);
CREATE INDEX idx_forms_event_id ON forms(event_id);
CREATE INDEX idx_forms_template_id ON forms(template_id);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_responses_form_id ON responses(form_id);
CREATE INDEX idx_responses_user_id ON responses(user_id);
CREATE INDEX idx_responses_submitted_at ON responses(submitted_at);
CREATE INDEX idx_question_responses_response_id ON question_responses(response_id);
CREATE INDEX idx_question_responses_question_id ON question_responses(question_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on your security requirements)
CREATE POLICY "Allow all operations for authenticated users" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON events FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON templates FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON template_sections FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON template_questions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON forms FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON responses FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON question_responses FOR ALL TO authenticated USING (true);

-- Insert sample data
-- Insert template
INSERT INTO templates (id, name, description, type, estimated_time, icon) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Post-Match Standard Review', 'Performance, tactics, and team dynamics', 'post_game', '5-7 min', '⚽');

-- Insert sections for post-match template
INSERT INTO template_sections (id, template_id, title, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Performance Assessment', 1),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Tactical Analysis', 2),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Team Dynamics', 3);

-- Insert questions for Performance Assessment section
INSERT INTO template_questions (section_id, question_text, question_type, scale, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'How would you rate your individual performance today?', 'rating', 10, 1),
('550e8400-e29b-41d4-a716-446655440011', 'How would you rate the team''s overall performance?', 'rating', 10, 2),
('550e8400-e29b-41d4-a716-446655440011', 'What was your strongest contribution to the team today?', 'text', NULL, 3),
('550e8400-e29b-41d4-a716-446655440011', 'What area would you most like to improve for next match?', 'text', NULL, 4);

-- Insert questions for Tactical Analysis section
INSERT INTO template_questions (section_id, question_text, question_type, options, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440012', 'How well did we execute our game plan?', 'rating', NULL, 1),
('550e8400-e29b-41d4-a716-446655440012', 'Which tactical area needs most improvement?', 'multiple_choice', '["Defensive Shape", "Attack Transition", "Set Pieces", "Possession Play"]', 2),
('550e8400-e29b-41d4-a716-446655440012', 'Any tactical suggestions for future matches?', 'text', NULL, 3);

-- Insert questions for Team Dynamics section
INSERT INTO template_questions (section_id, question_text, question_type, scale, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440013', 'How would you rate team communication today?', 'rating', 10, 1),
('550e8400-e29b-41d4-a716-446655440013', 'How positive was the team atmosphere?', 'rating', 10, 2),
('550e8400-e29b-41d4-a716-446655440013', 'Any feedback for the coaching staff?', 'text', NULL, 3),
('550e8400-e29b-41d4-a716-446655440013', 'Do you feel your voice is heard in team decisions?', 'yes_no', NULL, 4),
('550e8400-e29b-41d4-a716-446655440013', 'Additional comments (optional)', 'text', NULL, 5);

-- Insert training template
INSERT INTO templates (id, name, description, type, estimated_time, icon) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Training Session Review', 'Drills, fitness, and skill development', 'post_training', '4-6 min', '🏃');

-- Insert sections for training template
INSERT INTO template_sections (id, template_id, title, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', 'Session Quality', 1),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 'Training Environment', 2);

-- Insert questions for Session Quality section
INSERT INTO template_questions (section_id, question_text, question_type, scale, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'How would you rate today''s training session?', 'rating', 10, 1),
('550e8400-e29b-41d4-a716-446655440021', 'How challenging was the session for your skill level?', 'rating', 10, 2),
('550e8400-e29b-41d4-a716-446655440021', 'Which drill or activity was most beneficial?', 'text', NULL, 3);

INSERT INTO template_questions (section_id, question_text, question_type, options, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'Which area did you improve most?', 'multiple_choice', '["Ball Skills", "Fitness", "Tactical Awareness", "Communication"]', 4);

-- Insert questions for Training Environment section
INSERT INTO template_questions (section_id, question_text, question_type, scale, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440022', 'How clear were the coaching instructions?', 'rating', 10, 1),
('550e8400-e29b-41d4-a716-446655440022', 'How supportive was the team atmosphere?', 'rating', 10, 2),
('550e8400-e29b-41d4-a716-446655440022', 'Suggestions for improving future training sessions?', 'text', NULL, 3),
('550e8400-e29b-41d4-a716-446655440022', 'Do you feel comfortable asking questions during training?', 'yes_no', NULL, 4);