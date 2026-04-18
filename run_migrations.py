import json

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

files = [
    '/home/eldrwal/Desktop/Pos-Sahl/supabase/migrations/001_core_schema.sql',
    '/home/eldrwal/Desktop/Pos-Sahl/supabase/migrations/002_saas_layer.sql',
    '/home/eldrwal/Desktop/Pos-Sahl/supabase/migrations/003_rls_policies.sql',
    '/home/eldrwal/Desktop/Pos-Sahl/supabase/seed.sql'
]

combined = ""
for file in files:
    combined += read_file(file) + "\n\n"

print("We have " + str(len(combined)) + " characters of SQL.")
