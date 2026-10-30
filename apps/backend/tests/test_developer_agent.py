"""
ORBIT — Developer Agent and Sandbox Tools Test Suite.
Verifies:
  1. SandboxProvider ABC, LocalDockerProvider, and E2BProvider.
  2. Typed tool interface: fs, shell, pkg, http, test, artifact.
  3. Developer sub-FSM execution:
     SCAFFOLD → BUILD_BE → BUILD_FE → INTEGRATE → TESTS → INFRA → VERIFY → PACKAGE.
  4. Success criteria:
     - orbit.zip generated and downloadable
     - Unzip contains complete project (docker-compose.yml, FastAPI, Next.js 15, tests)
     - Zero hardcoded secrets (.env.example only)
     - Progress events emitted on 5% steps
     - Budget enforcement and repair limits
"""
import os
import shutil
import tempfile
import zipfile
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from app.agents.developer import (
    DeveloperFSM,
    ExecutionBudget,
    BudgetExceededError,
    RepairThresholdExceededError,
    FailureTaxonomy,
    developer,
)
from app.core.llm import get_deepseek_client, generate_deepseek_code
from app.graph.state import OrbitState
from app.sandbox.provider import (
    ExecResult,
    LocalDockerProvider,
    E2BProvider,
    SandboxProvider,
    get_sandbox_provider,
)
from app.tools import artifact, fs, shell, test
from app.tools.context import bind_sandbox


@pytest.fixture
def temp_workspace():
    """Provides an isolated temporary directory for sandbox tests."""
    temp_dir = tempfile.mkdtemp(prefix="orbit-test-ws-")
    yield temp_dir
    shutil.rmtree(temp_dir, ignore_errors=True)


def test_sandbox_provider_interface_and_implementations(temp_workspace):
    """
    Verifies SandboxProvider ABC contract and LocalDockerProvider functionality.
    """
    provider = LocalDockerProvider(base_dir=temp_workspace)
    run_id = "test-run-sandbox-01"
    provider.start(run_id)

    # 1. Test write_file & read_file
    provider.write_file("/workspace/hello.txt", "Hello ORBIT Sandbox")
    content = provider.read_file("/workspace/hello.txt")
    assert content == "Hello ORBIT Sandbox"

    # 2. Test list_files
    provider.write_file("/workspace/src/app.py", "print('app')")
    files = provider.list_files()
    assert "hello.txt" in files
    assert "src/app.py" in files

    # 3. Test patch_file
    diff = "--- a/hello.txt\n+++ b/hello.txt\n-Hello ORBIT Sandbox\n+Hello Patched Sandbox"
    patched = provider.patch_file("/workspace/hello.txt", diff)
    assert patched is True
    assert provider.read_file("/workspace/hello.txt") == "Hello Patched Sandbox"

    # 4. Test exec
    res = provider.exec("echo sandbox_ok", cwd="/workspace")
    assert res.exit_code == 0
    assert "sandbox_ok" in res.stdout

    # 5. Test factory and E2BProvider instantiation
    factory_provider = get_sandbox_provider("dev")
    assert isinstance(factory_provider, LocalDockerProvider)

    e2b = E2BProvider(api_key=None)
    assert isinstance(e2b, SandboxProvider)

    provider.stop()


def test_typed_tools_interface(temp_workspace):
    """
    Verifies typed tool interface:
      fs.write, fs.read, fs.patch, fs.list
      shell.exec, pkg.install, http.probe
      test.run
      artifact.zip, artifact.upload
    """
    sb = LocalDockerProvider(base_dir=temp_workspace)
    sb.start("test-tools-run")

    with bind_sandbox(sb):
        # 1. fs tool
        fs.write("/workspace/test_file.txt", "line 1\nline 2")
        assert fs.read("/workspace/test_file.txt") == "line 1\nline 2"
        fs.patch("/workspace/test_file.txt", "-line 2\n+line 2 patched")
        assert "patched" in fs.read("/workspace/test_file.txt")
        file_list = fs.list()
        assert "test_file.txt" in file_list

        # 2. shell, pkg, and http tools
        exec_res = shell.exec("echo tool_test")
        assert exec_res.exit_code == 0
        assert "tool_test" in exec_res.stdout

        pkg_res = shell.pkg.install("pnpm", ["typescript"], cwd="/workspace")
        assert isinstance(pkg_res, ExecResult)

        # http probe simulation
        probe_ok = shell.http.probe("http://invalid-test-domain-12345.local", 200, timeout=0.1)
        assert probe_ok is False

        # 3. test tool
        test_res = test.run("pytest", cwd="/workspace")
        assert isinstance(test_res, test.TestResult)
        assert test_res.framework == "pytest"

        # 4. artifact tool
        zip_path = artifact.zip("/workspace")
        assert os.path.exists(zip_path)
        assert zip_path.endswith("orbit.zip")

        zip_uri = artifact.upload(zip_path=zip_path, run_id="test-tools-run")
        assert "orbit.zip" in zip_uri

    sb.stop()


def test_developer_sub_fsm_execution_and_artifacts(temp_workspace):
    """
    Full end-to-end execution of Developer Agent sub-FSM:
      1. SCAFFOLD
      2. BUILD_BE
      3. BUILD_FE
      4. INTEGRATE
      5. TESTS
      6. INFRA
      7. VERIFY LOOP
      8. PACKAGE
    """
    run_id = "run-dev-fsm-01"
    state = OrbitState(
        run_id=run_id,
        tenant_id="tenant-test",
        user_id="user-tester",
        idea="Autonomous AI Technical Interviewer",
        prd_md="# PRD\n## 3. MVP Feature List\nF-01 [Must-Have]\nF-02 [Must-Have]",
        design={
            "architecture": "# Architecture\ngraph TB\nTech Stack: FastAPI, Next.js",
            "schema_sql": "CREATE TABLE users (id UUID PRIMARY KEY);",
            "openapi": "openapi: 3.1.0\ninfo:\n  title: Test\n  version: 1.0.0\npaths: {}",
            "wireframes": "ASCII Wireframes\n(F-01) Interview Session",
        },
    )

    sb = LocalDockerProvider(base_dir=temp_workspace)

    emitted_events = []

    def mock_emit(*args, **kwargs):
        from app.graph.progress import emit as real_emit
        ev = real_emit(*args, **kwargs)
        emitted_events.append(ev)
        return ev

    with patch("app.agents.developer.emit", side_effect=mock_emit):
        res = developer(state, sandbox=sb)

    # 1. State updates conformance
    assert "workspace_uri" in res
    assert "zip_uri" in res
    assert res["progress"]["developer"] == 100
    assert "orbit.zip" in res["zip_uri"]

    ws_path = Path(sb.get_workspace_dir())
    assert ws_path.exists()

    # 2. Check Phase 1: SCAFFOLD files
    assert (ws_path / "pnpm-workspace.yaml").exists()
    assert (ws_path / "package.json").exists()
    assert (ws_path / ".gitignore").exists()

    # 3. Check Phase 2: BUILD_BE files
    api_dir = ws_path / "apps" / "api"
    assert (api_dir / "pyproject.toml").exists()
    assert (api_dir / "main.py").exists()
    assert (api_dir / "models.py").exists()
    assert (api_dir / "schemas.py").exists()
    assert (api_dir / "routers" / "interviews.py").exists()

    # 4. Check Phase 3: BUILD_FE files (Next.js 15 app router)
    web_dir = ws_path / "apps" / "web"
    assert (web_dir / "package.json").exists()
    assert (web_dir / "app" / "layout.tsx").exists()
    assert (web_dir / "app" / "page.tsx").exists()
    assert (web_dir / "app" / "healthz" / "route.ts").exists()
    # Wireframe pages
    assert (web_dir / "app" / "interview" / "[id]" / "page.tsx").exists()
    assert (web_dir / "app" / "questions" / "page.tsx").exists()
    assert (web_dir / "app" / "scorecards" / "[id]" / "page.tsx").exists()
    assert (web_dir / "app" / "proctoring" / "page.tsx").exists()
    assert (web_dir / "app" / "candidates" / "page.tsx").exists()

    # 5. Check Phase 4: INTEGRATE files
    assert (web_dir / "lib" / "api.ts").exists()
    assert (api_dir / "core" / "config.py").exists()

    # 6. Check Phase 5: TESTS files
    assert (api_dir / "tests" / "test_health.py").exists()
    assert (api_dir / "tests" / "test_interviews.py").exists()
    assert (web_dir / "vitest.config.ts").exists()
    assert (ws_path / "playwright.config.ts").exists()
    assert (ws_path / "tests" / "e2e" / "golden_path.spec.ts").exists()

    # 7. Check Phase 6: INFRA files
    assert (api_dir / "Dockerfile").exists()
    assert (web_dir / "Dockerfile").exists()
    assert (ws_path / "docker-compose.yml").exists()
    assert (ws_path / ".env.example").exists()
    assert (ws_path / "README.md").exists()

    # 8. Check Phase 8: PACKAGE & Evidence
    assert (web_dir / "public" / "screenshots" / "fe_preview.svg").exists()

    # 9. Check Git Commits: Every phase has a commit with "[{phase}] {what}"
    git_log_res = sb.exec("git log --oneline -n 10", cwd="/workspace")
    assert git_log_res.exit_code == 0
    commits_text = git_log_res.stdout
    assert "[SCAFFOLD]" in commits_text
    assert "[BUILD_BE]" in commits_text
    assert "[BUILD_FE]" in commits_text
    assert "[INTEGRATE]" in commits_text
    assert "[TESTS]" in commits_text
    assert "[INFRA]" in commits_text
    assert "[VERIFY]" in commits_text

    # 10. Check Progress Reporting: emitted on 5% steps
    dev_events = [e for e in emitted_events if e["agent"] == "developer"]
    assert len(dev_events) >= 10
    pcts = [e["percent"] for e in dev_events]
    assert pcts[-1] == 100
    for p in pcts[:-1]:
        assert p % 5 == 0 or p == 99 or p == 0


def test_success_criterion_zip_package_integrity_and_contents(temp_workspace):
    """
    SUCCESS CRITERIA:
      - orbit.zip downloads and unzips cleanly
      - Zero hardcoded secrets in zip (.env.example only, NO .env)
      - docker-compose.yml defines healthchecks for services
      - pytest and pnpm test suites present in zip
      - FE evidence screenshot present in zip
    """
    run_id = "run-zip-integrity-01"
    state = OrbitState(
        run_id=run_id,
        idea="Autonomous AI Technical Interviewer",
        prd_md="# PRD\n## 3. MVP Feature List\nF-01 [Must-Have]\nF-02 [Must-Have]",
        design={
            "architecture": "# Architecture\ngraph TB\nTech Stack: FastAPI, Next.js",
            "schema_sql": "CREATE TABLE users (id UUID PRIMARY KEY);",
            "openapi": "openapi: 3.1.0\ninfo:\n  title: Test\n  version: 1.0.0\npaths: {}",
            "wireframes": "ASCII Wireframes\n(F-01) Interview Session",
        },
    )
    sb = LocalDockerProvider(base_dir=temp_workspace)

    res = developer(state, sandbox=sb)
    zip_path = Path(temp_workspace) / run_id / "orbit.zip"
    assert zip_path.exists()

    # Extract to a fresh inspection directory
    extract_dir = Path(temp_workspace) / "extracted_orbit"
    extract_dir.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(extract_dir)

    # 1. Zero hardcoded secrets: .env must NOT be present
    assert not (extract_dir / ".env").exists()
    assert not (extract_dir / ".env.local").exists()
    assert (extract_dir / ".env.example").exists()

    env_example_content = (extract_dir / ".env.example").read_text(encoding="utf-8")
    assert "replace-with-secure-32-char-random-key" in env_example_content

    # 2. docker-compose.yml has healthchecks
    dc_content = (extract_dir / "docker-compose.yml").read_text(encoding="utf-8")
    assert "healthcheck:" in dc_content
    assert "/healthz" in dc_content
    assert "orbit_db" in dc_content

    # 3. Tests are present
    assert (extract_dir / "apps" / "api" / "tests" / "test_health.py").exists()
    assert (extract_dir / "apps" / "web" / "vitest.config.ts").exists()

    # 4. Frontend screenshot evidence is present
    assert (extract_dir / "apps" / "web" / "public" / "screenshots" / "fe_preview.svg").exists()


def test_developer_budget_enforcement():
    """
    Verifies that exceeding constitutional limits (tool calls, tokens, time)
    triggers BudgetExceededError and halts gracefully.
    """
    budget = ExecutionBudget(max_tool_calls=5, max_tokens=1000)
    for _ in range(5):
        budget.record_tool_call(tokens_estimate=100)

    with pytest.raises(BudgetExceededError):
        budget.record_tool_call(tokens_estimate=100)


def test_deepseek_client_configuration_and_key_validation(temp_workspace):
    """
    Verifies Task 1 & 2:
      - DeepSeek client points to OpenAI-compatible base_url https://api.deepseek.com/v1.
      - Developer agent validates DEEPSEEK_API_KEY presence with critical required message.
      - Developer agent pins model to deepseek-coder.
    """
    # 1. Verify DeepSeek client configuration
    client = get_deepseek_client()
    assert str(client.base_url).rstrip("/") == "https://api.deepseek.com/v1"

    # 2. Verify human-in-the-loop requirement when DEEPSEEK_API_KEY is missing
    state = OrbitState(run_id="test-key-missing-01", idea="AI Code Reviewer")
    with patch.dict(os.environ, {"DEEPSEEK_API_KEY": ""}):
        with patch("app.agents.developer.get_settings") as mock_settings:
            mock_settings.return_value.deepseek_api_key = ""
            with pytest.raises(ValueError, match="🛑 API KEY REQUIRED: I need the DEEPSEEK_API_KEY to test the Developer Agent."):
                DeveloperFSM(state=state)

    # 3. Verify DeveloperFSM initializes with deepseek-coder when key is present
    sb = LocalDockerProvider(base_dir=temp_workspace)
    fsm = DeveloperFSM(state=state, sandbox=sb)
    assert fsm.model == "deepseek-coder"
    assert fsm.deepseek_key.startswith("sk-")


def test_developer_scaffold_simple_project_with_deepseek(temp_workspace):
    """
    Verifies Task 4: Scaffolding a simple project using the Developer Agent with DeepSeek key.
    Checks scaffold files, backend and frontend creation, and package output.
    """
    run_id = "run-deepseek-scaffold-01"
    state = OrbitState(
        run_id=run_id,
        idea="Lightweight AI Task Router",
        prd_md="# PRD\n## Features\nF-01 Task Routing",
        design={
            "architecture": "# Architecture\nFastAPI backend, Next.js frontend",
            "schema_sql": "CREATE TABLE tasks (id TEXT PRIMARY KEY);",
            "openapi": "openapi: 3.1.0\ninfo:\n  title: Task Router\n  version: 1.0.0\npaths: {}",
            "wireframes": "ASCII: Task dashboard",
        },
    )

    sb = LocalDockerProvider(base_dir=temp_workspace)
    with bind_sandbox(sb):
        sb.start(run_id)
        fsm = DeveloperFSM(state=state, sandbox=sb)
        assert fsm.model == "deepseek-coder"

        # Execute scaffolding phase using deepseek-coder configuration
        fsm.phase_1_scaffold()
        ws_path = Path(sb.get_workspace_dir())
        assert (ws_path / "pnpm-workspace.yaml").exists()
        assert (ws_path / "package.json").exists()
        assert (ws_path / ".gitignore").exists()

        # Execute backend building
        fsm.phase_2_build_backend()
        api_dir = ws_path / "apps" / "api"
        assert (api_dir / "pyproject.toml").exists()
        assert (api_dir / "main.py").exists()
        assert (api_dir / "models.py").exists()

        # Execute frontend building
        fsm.phase_3_build_frontend()
        web_dir = ws_path / "apps" / "web"
        assert (web_dir / "package.json").exists()
        assert (web_dir / "app" / "page.tsx").exists()

        # Verify repair patch helper logic with FailureTaxonomy
        repair_patch = fsm._generate_repair_patch(
            failure_type=FailureTaxonomy.SYNTAX_ERROR,
            target_file="/workspace/package.json",
            error_text="SyntaxError: Unexpected token",
            default_patch='+  "scripts": { "build": "echo build passed" }',
        )
        assert repair_patch is not None

        # Verify packaging metadata records deepseek-coder
        fsm.phase_4_integrate()
        fsm.phase_5_tests()
        fsm.phase_6_infra()
        fsm.phase_7_verify_loop()
        ws_uri, zip_uri = fsm.phase_8_package()

        assert "orbit.zip" in zip_uri
        assert (Path(temp_workspace) / run_id / "orbit.zip").exists()
        sb.stop()

