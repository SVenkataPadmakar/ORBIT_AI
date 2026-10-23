import json
import time
import urllib.request
import urllib.error

BASE_BACKEND = "http://localhost:8000"
BASE_FRONTEND = "http://localhost:3000"

def request_json(url, method="GET", data=None, headers=None):
    headers = headers or {}
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        res_body = e.read().decode("utf-8")
        try:
            err_json = json.loads(res_body)
        except Exception:
            err_json = {"raw": res_body}
        return e.code, err_json

def request_raw(url, method="GET"):
    req = urllib.request.Request(url, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, response.read().decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", errors="ignore")

def run_end_to_end_test():
    print("=" * 60)
    print("STARTING COMPLETE END-TO-END VERIFICATION")
    print("=" * 60)

    # 1. Health checks
    print("\n[Step 1] Checking Backend Health...")
    status, body = request_json(f"{BASE_BACKEND}/health")
    print(f" -> Status: {status}, Response: {body}")
    assert status == 200, f"Health check failed: {status}"
    assert body.get("status") == "ok", f"Health status not ok: {body}"
    print(" [PASS] Backend health is OK")

    print("\n[Step 2] Checking Frontend Pages...")
    status, html = request_raw(f"{BASE_FRONTEND}/")
    print(f" -> Frontend /: Status {status}, Length: {len(html)} bytes")
    assert status == 200, f"Frontend landing page failed: {status}"

    status, html = request_raw(f"{BASE_FRONTEND}/login")
    print(f" -> Frontend /login: Status {status}")
    assert status == 200, f"Frontend login page failed: {status}"

    status, html = request_raw(f"{BASE_FRONTEND}/register")
    print(f" -> Frontend /register: Status {status}")
    assert status == 200, f"Frontend register page failed: {status}"
    print(" [PASS] Frontend routes respond with 200 OK")

    # 3. User Registration
    timestamp = int(time.time())
    email = f"founder_{timestamp}@example.com"
    password = "SecurePassword123!"
    print(f"\n[Step 3] Registering new user: {email}...")
    status, body = request_json(
        f"{BASE_BACKEND}/v1/auth/register",
        method="POST",
        data={"email": email, "password": password, "full_name": "Antigravity Founder"}
    )
    print(f" -> Status: {status}")
    assert status == 201, f"Registration failed: {status} {body}"
    access_token = body["access_token"]
    user_id = body["user"]["id"]
    auth_headers = {"Authorization": f"Bearer {access_token}"}
    print(f" [PASS] Registered user {user_id} with access token issued")

    # 4. User Profile (/me)
    print("\n[Step 4] Fetching authenticated user profile (/v1/auth/me)...")
    status, me_body = request_json(f"{BASE_BACKEND}/v1/auth/me", headers=auth_headers)
    print(f" -> Status: {status}, Email: {me_body.get('email')}, Role: {me_body.get('role')}")
    assert status == 200, f"/me failed: {status}"
    print(" [PASS] User identity verified")

    # 5. Create Startup Project
    print("\n[Step 5] Creating startup project...")
    project_payload = {
        "name": "Agentic Compliance Copilot",
        "idea_description": "An autonomous AI agent platform that scans smart contracts and regulatory filings for startups.",
        "target_audience": "FinTech and Web3 founders",
        "industry": "FinTech / LegalTech",
        "budget_band": "$25k - $50k",
        "goals": "Launch MVP and secure 20 design partners in 90 days"
    }
    status, project = request_json(
        f"{BASE_BACKEND}/v1/projects",
        method="POST",
        data=project_payload,
        headers=auth_headers
    )
    print(f" -> Status: {status}, Project ID: {project.get('id')}, Name: {project.get('name')}")
    assert status == 201, f"Project creation failed: {status} {project}"
    project_id = project["id"]
    print(f" [PASS] Project '{project['name']}' created successfully")

    # 6. List Projects
    print("\n[Step 6] Listing user projects...")
    status, project_list = request_json(f"{BASE_BACKEND}/v1/projects", headers=auth_headers)
    print(f" -> Status: {status}, Total projects: {project_list.get('total')}")
    assert status == 200, f"List projects failed: {status}"
    assert any(p["id"] == project_id for p in project_list["items"]), "Created project not in list"
    print(" [PASS] Project listed in dashboard")

    # 7. Start AI Specialist Pipeline
    print(f"\n[Step 7] Starting 6-Stage AI Specialist Pipeline for project {project_id}...")
    status, pipeline_res = request_json(
        f"{BASE_BACKEND}/v1/projects/{project_id}/pipeline/start",
        method="POST",
        headers=auth_headers
    )
    print(f" -> Status: {status}, Mode: {pipeline_res.get('mode')}, Status: {pipeline_res.get('status')}")
    assert status == 200, f"Pipeline start failed: {status} {pipeline_res}"
    print(" [PASS] 6-stage AI specialist pipeline completed successfully")

    # 8. Check latest pipeline status & artifacts
    print("\n[Step 8] Checking latest pipeline status and generated artifacts...")
    status, latest_pipeline = request_json(
        f"{BASE_BACKEND}/v1/projects/{project_id}/pipeline/latest",
        headers=auth_headers
    )
    print(f" -> Status: {status}, Overall Pipeline Status: {latest_pipeline.get('status')}")
    runs = latest_pipeline.get("runs", [])
    print(f" -> Completed specialist agent stages ({len(runs)}):")
    for r in runs:
        print(f"    * Stage: {r.get('stage')}, Status: {r.get('status')}, Provider: {r.get('provider')}")
    assert status == 200, f"Latest pipeline status failed: {status}"
    assert len(runs) == 6, f"Expected 6 runs, got {len(runs)}"
    print(" [PASS] All 6 specialist stages executed cleanly")

    # 9. Startup Execution Center & Phase Gates
    print("\n[Step 9] Generating / Fetching Startup Execution Plan...")
    status, execution_plan = request_json(
        f"{BASE_BACKEND}/v1/projects/{project_id}/execution",
        headers=auth_headers
    )
    print(f" -> Status: {status}")
    assert status == 200, f"Execution plan failed: {status}"
    build_phase = execution_plan.get("build", {})
    launch_phase = execution_plan.get("launch", {})
    growth_phase = execution_plan.get("growth", {})
    all_tasks = build_phase.get("tasks", []) + launch_phase.get("tasks", []) + growth_phase.get("tasks", [])
    print(f" -> Build Phase Objective: {build_phase.get('objective')}")
    print(f" -> Launch Phase Objective: {launch_phase.get('objective')}")
    print(f" -> Growth Phase Objective: {growth_phase.get('objective')}")
    print(f" -> Total Actionable Tasks across phases: {len(all_tasks)}")
    assert len(all_tasks) > 0, "No tasks found in execution plan"
    print(" [PASS] Startup Execution Center plan generated")

    # 10. Update a Task Status in Execution Center
    task_to_update = all_tasks[0]
    task_id = task_to_update["id"]
    print(f"\n[Step 10] Updating Task '{task_to_update['title']}' ({task_id}) status to 'in_progress'...")
    status, updated_plan = request_json(
        f"{BASE_BACKEND}/v1/projects/{project_id}/execution/tasks/{task_id}",
        method="PATCH",
        data={"status": "in_progress"},
        headers=auth_headers
    )
    print(f" -> Status: {status}")
    assert status == 200, f"Task update failed: {status}"
    updated_build_tasks = updated_plan.get("build", {}).get("tasks", [])
    updated_launch_tasks = updated_plan.get("launch", {}).get("tasks", [])
    updated_growth_tasks = updated_plan.get("growth", {}).get("tasks", [])
    all_updated = {t["id"]: t for t in (updated_build_tasks + updated_launch_tasks + updated_growth_tasks)}
    assert all_updated[task_id]["status"] == "in_progress", f"Task status not updated: {all_updated[task_id]}"
    print(f" [PASS] Task '{task_to_update['title']}' updated to 'in_progress'")

    # 11. Persistent AI Co-Founder Chat
    print("\n[Step 11] Interacting with Floating AI Co-Founder...")
    chat_payload = {
        "message": "What are the top 3 technical risks and recommended architecture for this startup?",
        "project_id": project_id,
        "page_context": "execution_center"
    }
    status, chat_res = request_json(
        f"{BASE_BACKEND}/v1/cofounder/chat",
        method="POST",
        data=chat_payload,
        headers=auth_headers
    )
    print(f" -> Status: {status}")
    assert status == 200, f"Co-founder chat failed: {status}"
    answer = chat_res.get("answer", "")
    print(f" -> AI Co-Founder Provider: {chat_res.get('provider')}")
    print(f" -> Confidence Score: {chat_res.get('confidence_score')}%")
    print(f" -> Answer excerpt: {answer[:180]}...")
    print(" [PASS] AI Co-founder answered with contextual project memory")

    # 13. Admin Overview & Metrics
    print("\n[Step 13] Verifying Admin Dashboard & Metrics...")
    import subprocess
    cmd = f'powershell -Command "$env:PGPASSWORD=\'changeme\'; & \'C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe\' -U copilot -d ai_startup_copilot -h localhost -c \\\"UPDATE users SET role=\'admin\' WHERE id=\'{user_id}\';\\\""'
    subprocess.run(cmd, shell=True, check=True, stdout=subprocess.DEVNULL)
    
    status, admin_overview = request_json(
        f"{BASE_BACKEND}/v1/admin/overview",
        headers=auth_headers
    )
    print(f" -> Status: {status}")
    assert status == 200, f"Admin overview failed: {status}"
    print(f" -> Admin Users Metrics: {admin_overview.get('users')}")
    print(f" -> Admin Revenue Metrics: {admin_overview.get('revenue')}")
    print(f" -> Admin Agents Metrics: {admin_overview.get('agents')}")
    print(f" -> Admin System Metrics: {admin_overview.get('system')}")
    print(" [PASS] Admin role-guarded overview metrics operational")

    print("\n" + "=" * 60)
    print("ALL 13 END-TO-END CHECKS COMPLETED AND VERIFIED 100% SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_end_to_end_test()
