import asyncio
from uuid import UUID
import httpx

from app.core.security import create_token

async def test_cofounder_api():
    base_url = "http://127.0.0.1:8000/v1"
    user_id = UUID("29d4ff8c-ab8b-464c-8061-139768f6a157")
    token = create_token(user_id, "access")
    headers = {"Authorization": f"Bearer {token}"}
    
    project_id = "f1e53814-dc90-4df9-98af-138cd2e96dd0"
    print(f"Testing Gemini Co-Founder Intelligence on Project: {project_id}")
    
    async with httpx.AsyncClient(base_url=base_url, headers=headers, timeout=30.0) as client:
        # 1. Test 4-Layer Memory
        print("\n--- 1. Testing 4-Layer Memory Synthesis ---")
        mem_resp = await client.get(f"/cofounder/memory?project_id={project_id}")
        print(f"Memory Status: {mem_resp.status_code}")
        assert mem_resp.status_code == 200, f"Memory error: {mem_resp.text}"
        mem = mem_resp.json()
        print(f"  [Project Memory]: {mem.get('project_memory', {}).get('name')}")
        print(f"    - Target Customer: {mem.get('project_memory', {}).get('target_customer')}")
        print(f"    - Problem Statement: {mem.get('project_memory', {}).get('problem_statement')}")
        print(f"  [Decision Memory]: {len(mem.get('decision_memory', []))} decisions tracked")
        for d in mem.get('decision_memory', [])[:2]:
            print(f"    - [{d.get('category')}]: {d.get('decision')}")
        print(f"  [Product Memory]: {len(mem.get('product_memory', []))} architectural components")
        for p in mem.get('product_memory', [])[:2]:
            print(f"    - {p.get('component')} -> {p.get('status')} ({p.get('tech_choice')})")
        exec_mem = mem.get('execution_memory', {})
        print(f"  [Execution Memory]: Completion={exec_mem.get('completion_percentage')}% ({exec_mem.get('completed_tasks')}/{exec_mem.get('total_tasks')} tasks)")
        print(f"  [Contradictions Radar]: {len(mem.get('unresolved_contradictions', []))} contradictions detected")
        for c in mem.get('unresolved_contradictions', []):
            print(f"    ! Severity={c.get('severity')}: {c.get('description')}")
            
        # 2. Test Proactive Guidance across all 6 workspaces
        print("\n--- 2. Testing Proactive Guidance across 6 Workspaces ---")
        workspaces = ["mission", "evidence", "architecture", "sprints", "launch", "growth"]
        for ws in workspaces:
            g_resp = await client.get(f"/cofounder/guidance?project_id={project_id}&workspace={ws}")
            print(f"\nGuidance [{ws.upper()}] Status: {g_resp.status_code}")
            assert g_resp.status_code == 200, f"Guidance error for {ws}: {g_resp.text}"
            g = g_resp.json()
            insights = g.get('proactive_insights', [])
            suggestions = [i for i in insights if i['type'] == 'suggestion']
            warnings = [i for i in insights if i['type'] == 'warning']
            risks = [i for i in insights if i['type'] == 'risk']
            opportunities = [i for i in insights if i['type'] == 'opportunity']
            print(f"  Headline: {g.get('headline')}")
            print(f"  Executive Summary: {g.get('executive_summary')[:100]}...")
            print(f"  Suggestions ({len(suggestions)}): {[s['title'] for s in suggestions]}")
            print(f"  Warnings ({len(warnings)}): {[w['title'] for w in warnings]}")
            print(f"  Risks ({len(risks)}): {[r['title'] for r in risks]}")
            print(f"  Opportunities ({len(opportunities)}): {[o['title'] for o in opportunities]}")
            print(f"  Next Best Actions ({len(g.get('next_best_actions', []))}): {g.get('next_best_actions')[:2]}")
            print(f"  Contradictions ({len(g.get('contradictions', []))}): {[c['title'] for c in g.get('contradictions', [])]}")

        # 3. Test Logging a Decision
        print("\n--- 3. Testing Decision Logging into Memory ---")
        dec_payload = {
            "project_id": project_id,
            "category": "pricing",
            "decision": "Enforce $5,000/mo minimum annual contract for enterprise tier",
            "rationale": "Align customer success team with high-conviction accounts to prevent early churn",
            "trade_offs": ["Excludes self-serve prosumers initially, but safeguards runway"]
        }
        dec_resp = await client.post("/cofounder/decisions", json=dec_payload)
        print(f"Log Decision Status: {dec_resp.status_code}")
        assert dec_resp.status_code == 200, f"Decision log error: {dec_resp.text}"
        print(f"  Successfully logged decision: {dec_resp.json().get('decision')}")

        # 4. Test Assumption Challenger (7-Day Smoke Test)
        print("\n--- 4. Testing Counter-Factual Assumption Challenger ---")
        chall_payload = {
            "project_id": project_id,
            "assumption": "Early-stage founders will eagerly pay $5,000 upfront with zero human interaction",
            "workspace": "launch"
        }
        chall_resp = await client.post("/cofounder/challenge", json=chall_payload)
        print(f"Assumption Challenge Status: {chall_resp.status_code}")
        assert chall_resp.status_code == 200, f"Challenge error: {chall_resp.text}"
        c = chall_resp.json()
        print(f"  Vulnerability Score: {c.get('vulnerability_score')}/100")
        print(f"  Counter-Factual: {c.get('counter_factual_analysis')}")
        print(f"  7-Day Smoke Test: {c.get('seven_day_experiment')}")
        print(f"  Recommended Action: {c.get('recommended_action')}")

    print("\n>>> ALL GEMINI INTELLIGENCE BACKEND CONTRACTS VERIFIED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    asyncio.run(test_cofounder_api())
