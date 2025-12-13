-- Ensure RLS is enabled on clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Ensure the SELECT policy exists and is correct
DROP POLICY IF EXISTS "Allow users to select their own clients" ON clients;

CREATE POLICY "Allow users to select their own clients" ON clients
    FOR SELECT
    USING (auth.uid() = user_id);
