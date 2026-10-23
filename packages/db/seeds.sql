-- =============================================================================
-- ORBIT v2 — Deterministic Test & Demo Seeds
-- Authored by DataModelerAgent (Division B2)
-- =============================================================================

-- 1. SEED USERS (Password: 'OrbitPassword123!' hashed with Argon2id)
INSERT INTO users (id, email, hashed_password, full_name, is_active, is_verified)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'maya.founder@orbit.dev',
        '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$dGVzdGhhc2hlZHBhc3N3b3JkZm9yb3JiaXRkZW1v',
        'Maya Lin',
        TRUE,
        TRUE
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'david.architect@orbit.dev',
        '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$dGVzdGhhc2hlZHBhc3N3b3JkZm9yb3JiaXRkZW1v',
        'David Chen',
        TRUE,
        TRUE
    )
ON CONFLICT (email) DO NOTHING;

-- 2. SEED ORGANIZATIONS
INSERT INTO orgs (id, name, slug, billing_email, stripe_customer_id, subscription_tier)
VALUES 
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Acme Ventures',
        'acme-ventures',
        'billing@acmeventures.io',
        'cus_test_acme_123',
        'starter'
    )
ON CONFLICT (slug) DO NOTHING;

-- 3. SEED MEMBERSHIPS
INSERT INTO memberships (id, user_id, org_id, role)
VALUES 
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '11111111-1111-1111-1111-111111111111',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'owner'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        '22222222-2222-2222-2222-222222222222',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'admin'
    )
ON CONFLICT (user_id, org_id) DO NOTHING;

-- 4. SEED SAMPLE RUN
INSERT INTO runs (
    id,
    run_id,
    org_id,
    created_by,
    title,
    idea_raw,
    normalized_idea,
    status,
    current_node,
    clarity_score,
    scope_locked,
    repair_count,
    reproducibility_hash
)
VALUES (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'run-orbit-v2-discovery-01',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'ORBIT v2 Monorepo Factory',
    'Autonomous platform converting raw founder ideas into verified, bootable, tested full-stack monorepos.',
    'ORBIT v2 — Multi-agent platform that turns raw founder ideas into verified, running, downloadable full-stack monorepos inside sandboxed workspaces.',
    'scope_locked',
    'ScopeGuard',
    0.95,
    TRUE,
    0,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
)
ON CONFLICT (run_id) DO NOTHING;

-- 5. SEED SPECIFICATIONS
INSERT INTO specifications (
    id,
    run_id,
    prd_markdown,
    scope_contract,
    architecture_spec,
    version
)
VALUES (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'run-orbit-v2-discovery-01',
    '# PRD: ORBIT v2 Monorepo Factory\n\n- Problem: Founder Idea Execution Chasm\n- Personas: Maya (Founder), David (Architect)\n- Scope: 7 MVP Features strictly bounded',
    '{"title": "ScopeContract", "scope_locked": true, "in_scope": ["Intake", "PRD", "Next.js 15 UI", "FastAPI Lambda", "Test Gates", "Repair Loop", "ZIP Export"], "out_of_scope": ["Live Multi-user Editing", "24/7 Hosting", "Self-hosted Models", "DR Replication"], "assumptions": ["Serverless Next.js 15 on Vercel + Python Lambda + DynamoDB", "$29 pay-per-export"]}'::jsonb,
    '{"backend": "FastAPI", "frontend": "Next.js 15", "database": "PostgreSQL 16", "cache": "Redis 7"}'::jsonb,
    1
)
ON CONFLICT (run_id, version) DO NOTHING;

-- 6. SEED ARTIFACTS
INSERT INTO artifacts (
    id,
    artifact_id,
    run_id,
    artifact_type,
    name,
    file_path,
    sha256,
    size_bytes,
    metadata
)
VALUES (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'art-prd-01',
    'run-orbit-v2-discovery-01',
    'prd',
    'PRD.md',
    'runs/run-orbit-v2-discovery-01/PRD.md',
    'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    3842,
    '{"author": "PRDAgent", "division": "A"}'::jsonb
)
ON CONFLICT (artifact_id) DO NOTHING;

-- 7. SEED SAMPLE ORDER ($29.00 USD PAY-PER-EXPORT)
INSERT INTO orders (
    id,
    order_number,
    org_id,
    user_id,
    run_id,
    amount_cents,
    currency,
    stripe_session_id,
    status,
    download_token
)
VALUES (
    '99999999-9999-9999-9999-999999999999',
    'ORD-2026-0001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'run-orbit-v2-discovery-01',
    2900,
    'USD',
    'cs_test_sample_session_999',
    'paid',
    'tok_dl_orbit_export_demo_777'
)
ON CONFLICT (order_number) DO NOTHING;
