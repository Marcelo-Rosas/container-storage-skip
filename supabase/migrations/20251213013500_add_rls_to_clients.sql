-- Enable RLS on clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own clients
DROP POLICY IF EXISTS "Allow users to insert their own clients" ON clients;
CREATE POLICY "Allow users to insert their own clients" ON clients
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to select their own clients
-- This is necessary for the .select() part of the insert operation and general viewing
DROP POLICY IF EXISTS "Allow users to select their own clients" ON clients;
CREATE POLICY "Allow users to select their own clients" ON clients
    FOR SELECT
    USING (auth.uid() = user_id);
