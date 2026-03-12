-- Supabase SQL Schema for GovTech CRM

-- 1. Create the Users Table
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'officer', 'admin')),
    preferred_language TEXT DEFAULT 'en',
    department TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert Demo Users
INSERT INTO public.users (id, email, name, password, role, preferred_language, phone)
VALUES ('u1', 'citizen@gov.in', 'Ravi Kumar', 'citizen123', 'citizen', 'hi', '+91-9876543210');

INSERT INTO public.users (id, email, name, password, role, preferred_language, department)
VALUES ('u2', 'officer@gov.in', 'Priya Sharma', 'officer123', 'officer', 'en', 'GENERAL');

INSERT INTO public.users (id, email, name, password, role, preferred_language, department)
VALUES ('u3', 'officer2@gov.in', 'Arjun Mehta', 'officer123', 'officer', 'en', 'PWD');

INSERT INTO public.users (id, email, name, password, role, preferred_language)
VALUES ('u4', 'admin@gov.in', 'Dr. Sunita Rao', 'admin123', 'admin', 'en');


-- 2. Create the Complaints Table
CREATE TABLE public.complaints (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    original_text TEXT,
    original_language TEXT,
    translated BOOLEAN DEFAULT FALSE,
    category TEXT,
    subcategory TEXT,
    severity TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'in_progress', 'resolved', 'rejected')),
    location TEXT,
    latitude FLOAT8,
    longitude FLOAT8,
    department TEXT,
    assigned_to TEXT,
    citizen_email TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]'::jsonb,
    history JSONB DEFAULT '[]'::jsonb,
    ai_classification JSONB,
    translation_info JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Insert Demo Complaints
INSERT INTO public.complaints (id, title, description, category, subcategory, severity, status, location, latitude, longitude, department, citizen_email, history, submitted_at, updated_at) 
VALUES (
    'GOV-2026-00001', 
    'Large pothole on MG Road near bus stop', 
    'There is a very large pothole near the bus stop causing accidents.', 
    'roads', 'pothole', 'high', 'in_progress', 'MG Road, Pune', 18.5204, 73.8567, 'PWD', 'citizen@gov.in', 
    '[{"status": "submitted", "note": "Complaint received and registered.", "timestamp": "2026-03-07T12:00:00Z"}, {"status": "under_review", "note": "Forwarded to Public Works Department.", "timestamp": "2026-03-08T12:00:00Z"}, {"status": "in_progress", "note": "PWD team dispatched. Repairs scheduled.", "timestamp": "2026-03-10T12:00:00Z"}]'::jsonb,
    '2026-03-07T12:00:00Z', '2026-03-10T12:00:00Z'
);

INSERT INTO public.complaints (id, title, description, category, subcategory, severity, status, location, latitude, longitude, department, citizen_email, history, submitted_at, updated_at, resolved_at) 
VALUES (
    'GOV-2026-00002', 
    'No water supply for 3 days in Sector 7', 
    'Our area has had no water supply for 3 days. Please resolve urgently.', 
    'water', 'no_supply', 'critical', 'resolved', 'Sector 7, Noida', 28.5355, 77.3910, 'WATER', 'citizen@gov.in', 
    '[{"status": "submitted", "note": "Complaint received.", "timestamp": "2026-03-02T12:00:00Z"}, {"status": "resolved", "note": "Water supply restored. Apologies for inconvenience.", "timestamp": "2026-03-11T12:00:00Z"}]'::jsonb,
    '2026-03-02T12:00:00Z', '2026-03-11T12:00:00Z', '2026-03-11T12:00:00Z'
);
