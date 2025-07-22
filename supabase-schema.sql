-- GAA Feedback System Database Schema

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
    structure JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forms table
CREATE TABLE forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    template_id UUID REFERENCES templates(id),
    event_id UUID REFERENCES events(id),
    structure JSONB NOT NULL,
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
    responses JSONB NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    completion_time_seconds INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_club ON users(club);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_club ON events(club);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_forms_event_id ON forms(event_id);
CREATE INDEX idx_forms_template_id ON forms(template_id);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_responses_form_id ON responses(form_id);
CREATE INDEX idx_responses_user_id ON responses(user_id);
CREATE INDEX idx_responses_submitted_at ON responses(submitted_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on your security requirements)
-- For now, allow all authenticated users to read/write
CREATE POLICY "Allow all operations for authenticated users" ON users FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON events FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON templates FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON forms FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON responses FOR ALL TO authenticated USING (true);

-- Insert default templates
INSERT INTO templates (id, name, description, type, estimated_time, icon, structure) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Post-Match Standard Review', 'Performance, tactics, and team dynamics', 'post_game', '5-7 min', '⚽', '{
    "sections": [
        {
            "title": "Performance Assessment",
            "questions": [
                {"id": "q1", "type": "rating", "text": "How would you rate your individual performance today?", "scale": 10},
                {"id": "q2", "type": "rating", "text": "How would you rate the team''s overall performance?", "scale": 10},
                {"id": "q3", "type": "text", "text": "What was your strongest contribution to the team today?"},
                {"id": "q4", "type": "text", "text": "What area would you most like to improve for next match?"}
            ]
        },
        {
            "title": "Tactical Analysis",
            "questions": [
                {"id": "q5", "type": "rating", "text": "How well did we execute our game plan?", "scale": 10},
                {"id": "q6", "type": "multiple_choice", "text": "Which tactical area needs most improvement?", "options": ["Defensive Shape", "Attack Transition", "Set Pieces", "Possession Play"]},
                {"id": "q7", "type": "text", "text": "Any tactical suggestions for future matches?"}
            ]
        },
        {
            "title": "Team Dynamics",
            "questions": [
                {"id": "q8", "type": "rating", "text": "How would you rate team communication today?", "scale": 10},
                {"id": "q9", "type": "rating", "text": "How positive was the team atmosphere?", "scale": 10},
                {"id": "q10", "type": "text", "text": "Any feedback for the coaching staff?"},
                {"id": "q11", "type": "yes_no", "text": "Do you feel your voice is heard in team decisions?"},
                {"id": "q12", "type": "text", "text": "Additional comments (optional)"}
            ]
        }
    ]
}'),
('550e8400-e29b-41d4-a716-446655440002', 'Training Session Review', 'Drills, fitness, and skill development', 'post_training', '4-6 min', '🏃', '{
    "sections": [
        {
            "title": "Session Quality",
            "questions": [
                {"id": "t1", "type": "rating", "text": "How would you rate today''s training session?", "scale": 10},
                {"id": "t2", "type": "rating", "text": "How challenging was the session for your skill level?", "scale": 10},
                {"id": "t3", "type": "text", "text": "Which drill or activity was most beneficial?"},
                {"id": "t4", "type": "multiple_choice", "text": "Which area did you improve most?", "options": ["Ball Skills", "Fitness", "Tactical Awareness", "Communication"]}
            ]
        },
        {
            "title": "Training Environment",
            "questions": [
                {"id": "t5", "type": "rating", "text": "How clear were the coaching instructions?", "scale": 10},
                {"id": "t6", "type": "rating", "text": "How supportive was the team atmosphere?", "scale": 10},
                {"id": "t7", "type": "text", "text": "Suggestions for improving future training sessions?"},
                {"id": "t8", "type": "yes_no", "text": "Do you feel comfortable asking questions during training?"}
            ]
        }
    ]
}');