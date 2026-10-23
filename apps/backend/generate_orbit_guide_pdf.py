"""
Generate comprehensive ORBIT Project Explanation PDF using ReportLab.
Covers all 21 sections required for Final Year Project Review, Viva Voce, Expo, and Technical Interviews.
"""
import os
import sys
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Skip header/footer on cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))

        # Running Header
        self.drawString(40, letter[1] - 30, "ORBIT — AI FOUNDER OPERATING SYSTEM")
        self.setFont("Helvetica", 8)
        self.drawRightString(letter[0] - 40, letter[1] - 30, "Project Review & Technical Dossier")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(40, letter[1] - 34, letter[0] - 40, letter[1] - 34)

        # Running Footer
        self.line(40, 42, letter[0] - 40, 42)
        self.setFont("Helvetica", 8)
        self.drawString(40, 30, "Confidential — Academic & Technical Evaluation Document")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 40, 30, page_text)
        self.restoreState()


def build_pdf(filename: str):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=46,
        bottomMargin=48,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    c_primary = colors.HexColor("#0F172A")    # Slate 900
    c_accent = colors.HexColor("#2563EB")     # Blue 600
    c_teal = colors.HexColor("#0D9488")       # Teal 600
    c_dark = colors.HexColor("#1E293B")       # Slate 800
    c_muted = colors.HexColor("#475569")      # Slate 600
    c_border = colors.HexColor("#E2E8F0")     # Slate 200
    c_bg_light = colors.HexColor("#F8FAFC")   # Slate 50

    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=34,
        textColor=c_primary,
        alignment=0,
    )

    subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        textColor=c_accent,
        alignment=0,
    )

    h1_style = ParagraphStyle(
        "Heading1_Custom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=19,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        "Heading2_Custom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=c_accent,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True,
    )

    h3_style = ParagraphStyle(
        "Heading3_Custom",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=13,
        textColor=c_dark,
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        "Body_Custom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=c_dark,
        spaceAfter=4,
    )

    body_bold = ParagraphStyle(
        "BodyBold_Custom",
        parent=body_style,
        fontName="Helvetica-Bold",
    )

    bullet_style = ParagraphStyle(
        "Bullet_Custom",
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2,
    )

    callout_style = ParagraphStyle(
        "Callout_Custom",
        parent=body_style,
        fontName="Helvetica-Oblique",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=0,
    )

    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=c_dark,
    )

    table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=table_cell_style,
        fontName="Helvetica-Bold",
        textColor=c_primary,
    )

    code_style = ParagraphStyle(
        "CodeStyle",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#0F172A"),
    )

    story = []

    def p(text, style=body_style):
        return Paragraph(text, style)

    def esc(text):
        return escape(text)

    # ─────────────────────────────────────────────────────────────────────────
    # COVER PAGE
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 40))
    story.append(
        Paragraph("PROJECT EVALUATION & TECHNICAL DOSSIER", ParagraphStyle(
            "Eyebrow", fontName="Helvetica-Bold", fontSize=10, leading=12, textColor=c_accent
        ))
    )
    story.append(Spacer(1, 8))
    story.append(Paragraph("ORBIT: AI FOUNDER OPERATING SYSTEM", title_style))
    story.append(Spacer(1, 6))
    story.append(
        Paragraph(
            "An Autonomous Multi-Agent Engineering & Strategic Execution Platform Powered by LangGraph, Google Gemini, and Next.js 15",
            subtitle_style,
        )
    )
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=2, color=c_accent, spaceBefore=4, spaceAfter=18))

    meta_table_data = [
        [
            Paragraph("<b>Target Forums:</b>", body_style),
            Paragraph("Final Year Project Review | Internal / External Viva | Project Expo | Technical Interview", body_style),
        ],
        [
            Paragraph("<b>System Role:</b>", body_style),
            Paragraph("Autonomous Co-Founding Team (Research, Validation, Architecture, Sprints, Growth)", body_style),
        ],
        [
            Paragraph("<b>Core Architecture:</b>", body_style),
            Paragraph("15 Specialist Agents orchestrated via LangGraph StateGraph Engine", body_style),
        ],
        [
            Paragraph("<b>Primary AI Model:</b>", body_style),
            Paragraph("Google Gemini 2.0 Flash (`google-genai` SDK) with 4-Layer Memory (Postgres + ChromaDB RAG)", body_style),
        ],
        [
            Paragraph("<b>Technology Stack:</b>", body_style),
            Paragraph("Next.js 15, React 19, Three.js (R3F), FastAPI, PostgreSQL 16, SQLAlchemy Async, Redis, Celery", body_style),
        ],
        [
            Paragraph("<b>Author / Presenter:</b>", body_style),
            Paragraph("Lead Systems Architect & AI Engineering Team", body_style),
        ],
    ]
    meta_table = Table(meta_table_data, colWidths=[110, 422])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), c_bg_light),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("BOX", (0, 0), (-1, -1), 1, c_border),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, c_border),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(meta_table)

    story.append(Spacer(1, 25))
    callout_box = Table(
        [[
            Paragraph(
                "<b>Executive Summary for Reviewers:</b><br/>"
                "ORBIT transforms the fragile 'prompt-and-pray' paradigm of conversational AI into a rigorous, "
                "adversarial multi-agent execution operating system. Instead of generating vague business advice, "
                "Orbit's 15 specialist agents run through formal research, Socratic reflection, cross-artifact verification, "
                "multi-agent debate, and consensus scoring to output production-ready PostgreSQL DDL schemas, OpenAPI 3.1 REST contracts, "
                "actionable 2-week sprint backlogs with measurable acceptance gates, and unit economics calculations. "
                "This document provides the exhaustive technical, architectural, and operational proof points for defense.",
                callout_style,
            )
        ]],
        colWidths=[532],
    )
    callout_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#EFF6FF")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#93C5FD")),
        ("PADDING", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(callout_box)
    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────────────────
    # SECTION 1: PROJECT INTRODUCTION
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("1. PROJECT INTRODUCTION", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    
    story.append(Paragraph("<b>1.1 What is Orbit?</b>", h2_style))
    story.append(p(
        "<b>ORBIT (AI Founder Operating System)</b> is an autonomous multi-agent software platform that executes the end-to-end "
        "lifecycle of software startup formulation. It ingests a founder's initial concept and systematically transitions it through "
        "evidence-backed problem discovery, bottom-up TAM/SAM/SOM market sizing, competitor moat benchmarking, strict MVP product requirement fencing, "
        "production PostgreSQL database modeling, OpenAPI 3.1 contract formulation, 2-week sprint task creation, and financial unit economics modeling. "
        "It acts not as a passive conversational chatbot, but as an active, persistent digital co-founding team."
    ))

    story.append(Paragraph("<b>1.2 Why was it developed?</b>", h2_style))
    story.append(p(
        "Building a technology venture requires high proficiency across disparate disciplines: product discovery, market economics, "
        "systems architecture, database normalization, agile sprint management, and venture capital fundraising. Solo founders and early collegiate "
        "teams rarely possess all these capabilities simultaneously. Traditional consulting agencies or startup advisory firms charge $25,000+ "
        "for discovery sprints that take 6 to 12 weeks. Orbit was developed to compress these months of fragmented, expensive planning into "
        "sub-2-minute deterministic, validated engineering workflows."
    ))

    story.append(Paragraph("<b>1.3 What inspired this project?</b>", h2_style))
    story.append(p(
        "The project was inspired by the critical failure modes observed in generic Large Language Models (LLMs) such as ChatGPT or Claude. "
        "When prompted for startup assistance, single-agent models suffer from sycophancy (agreeing blindly with flawed user premises), lack of technical "
        "depth, hallucinated market data, and complete context amnesia across sessions. Orbit was conceived on the principle that "
        "<b>specialized agents operating under adversarial checks and balances</b> produce vastly superior, auditable engineering outputs."
    ))

    story.append(Paragraph("<b>1.4 Why is it different from traditional startup tools?</b>", h2_style))
    diff_data = [
        [Paragraph("Feature / Capability", table_header_style), Paragraph("Traditional Tools (Notion / Jira)", table_header_style), Paragraph("Generic AI (ChatGPT)", table_header_style), Paragraph("ORBIT Founder OS", table_header_style)],
        [Paragraph("<b>Workflow Nature</b>", table_cell_bold), Paragraph("100% manual data entry", table_cell_style), Paragraph("Unstructured chat text", table_cell_style), Paragraph("Autonomous 15-Agent StateGraph", table_cell_style)],
        [Paragraph("<b>Technical Output</b>", table_cell_bold), Paragraph("Blank pages", table_cell_style), Paragraph("Generic code snippets", table_cell_style), Paragraph("Validated PostgreSQL DDL & OpenAPI specs", table_cell_style)],
        [Paragraph("<b>Validation & Critique</b>", table_cell_bold), Paragraph("None (user driven)", table_cell_style), Paragraph("Passive sycophancy", table_cell_style), Paragraph("Adversarial Reflection & Verification", table_cell_style)],
        [Paragraph("<b>Persistent Memory</b>", table_cell_bold), Paragraph("Static files", table_cell_style), Paragraph("Ephemeral session context", table_cell_style), Paragraph("4-Layer Memory (Relational + Vector RAG)", table_cell_style)],
        [Paragraph("<b>User Interface</b>", table_cell_bold), Paragraph("Flat enterprise tables", table_cell_style), Paragraph("Simple text prompt stream", table_cell_style), Paragraph("3D WebGL Orbital Universe & HUD", table_cell_style)],
    ]
    diff_table = Table(diff_data, colWidths=[100, 130, 130, 172])
    diff_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), c_primary),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, c_bg_light]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(diff_table)

    # ─────────────────────────────────────────────────────────────────────────
    # SECTION 2: PROBLEM STATEMENT
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 10))
    story.append(Paragraph("2. PROBLEM STATEMENT", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    story.append(p(
        "According to startup genome studies and CB Insights data, <b>over 90% of technology startups fail</b>. "
        "The post-mortem analysis of these failures highlights structural root causes rather than simple execution errors:"
    ))
    story.append(p("• <b>Building for No Market Need (35%):</b> Founders solve phantom problems because they validate ideas through friendly confirmation bias rather than falsification testing.", bullet_style))
    story.append(p("• <b>Premature Capital Exhaustion & Cash Burn (38%):</b> Founders lack bottom-up unit economics (CAC, LTV, payback period) and overspend on unnecessary server infrastructure.", bullet_style))
    story.append(p("• <b>The Non-Technical Founder Barrier:</b> Founders with domain knowledge cannot formulate relational database schemas, API specs, or realistic sprint backlogs, leading to severe contractor exploitation.", bullet_style))
    story.append(p("• <b>Uncontrolled Scope Creep:</b> Inability to fence an MVP leads to bloated development cycles where products take 9+ months to launch instead of 4 weeks.", bullet_style))
    story.append(p("• <b>Tool Fragmentation & Cognitive Fatigue:</b> Founders juggle 7+ disjointed tools (Notion, Google Sheets, Figma, Postman, Jira, Claude, Pitch), causing severe context switching and execution paralysis.", bullet_style))

    # ─────────────────────────────────────────────────────────────────────────
    # SECTION 3: PROPOSED SOLUTION
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 10))
    story.append(Paragraph("3. PROPOSED SOLUTION: THE 8-STAGE EXECUTION ENGINE", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    story.append(p(
        "Orbit replaces ad-hoc guesswork with a closed-loop, sequential execution pipeline that converts an abstract idea "
        "into verifiable, production-ready deliverables across 8 progressive stages:"
    ))

    stages_data = [
        [Paragraph("Stage", table_header_style), Paragraph("Input Context", table_header_style), Paragraph("Core Transformation & Agents", table_header_style), Paragraph("Concrete Engineering & Business Output", table_header_style)],
        [Paragraph("<b>1. Intake & Idea</b>", table_cell_bold), Paragraph("Raw concept, vertical, audience, budget", table_cell_style), Paragraph("Ingestion & Context Normalization", table_cell_style), Paragraph("Normalized project domain state in PostgreSQL", table_cell_style)],
        [Paragraph("<b>2. Validation</b>", table_cell_bold), Paragraph("Problem premise & audience assumptions", table_cell_style), Paragraph("Problem Discovery & Reflection Agents", table_cell_style), Paragraph("Severity score (1-10), falsification hypotheses", table_cell_style)],
        [Paragraph("<b>3. Market Research</b>", table_cell_bold), Paragraph("Industry vertical & buyer profile", table_cell_style), Paragraph("Market Research & Competitor Agents", table_cell_style), Paragraph("Bottom-up TAM/SAM/SOM, CAGR %, Moat Score (0-100)", table_cell_style)],
        [Paragraph("<b>4. Product Design</b>", table_cell_bold), Paragraph("Target users & core value proposition", table_cell_style), Paragraph("Product Strategy & UI/UX Architects", table_cell_style), Paragraph("Strict P0 MVP boundary, PRD, user personas, UI hierarchy", table_cell_style)],
        [Paragraph("<b>5. Technical Arch</b>", table_cell_bold), Paragraph("PRD functional requirements & concurrency", table_cell_style), Paragraph("Technical, Database & API Architects", table_cell_style), Paragraph("Production PostgreSQL DDL SQL & OpenAPI 3.1 specs", table_cell_style)],
        [Paragraph("<b>6. Sprint Planning</b>", table_cell_bold), Paragraph("Architecture & PRD feature list", table_cell_style), Paragraph("Sprint Planner Agent", table_cell_style), Paragraph("2-week agile sprint backlog, acceptance criteria, story points", table_cell_style)],
        [Paragraph("<b>7. Launch Strategy</b>", table_cell_bold), Paragraph("Product value & ICP channels", table_cell_style), Paragraph("Launch Agent", table_cell_style), Paragraph("Day-Zero preflight QA checklist & cold-start cohort plan", table_cell_style)],
        [Paragraph("<b>8. Growth & Capital</b>", table_cell_bold), Paragraph("Pricing tiers & marketing vectors", table_cell_style), Paragraph("Growth & Investor Readiness Agents", table_cell_style), Paragraph("CAC/LTV payback model, 10-slide pitch deck narrative", table_cell_style)],
    ]
    stages_table = Table(stages_data, colWidths=[90, 120, 150, 172])
    stages_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), c_accent),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, c_bg_light]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(stages_table)

    # ─────────────────────────────────────────────────────────────────────────
    # SECTION 4: PROJECT OBJECTIVES
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 10))
    story.append(Paragraph("4. PROJECT OBJECTIVES", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    
    obj_data = [
        [Paragraph("Project Objective", table_header_style), Paragraph("Why It Is Crucial", table_header_style), Paragraph("How Orbit Implements It", table_header_style)],
        [
            Paragraph("<b>1. Autonomous Multi-Agent Orchestration</b>", table_cell_bold),
            Paragraph("Removes the need for prompt engineering and fragmented human hand-offs.", table_cell_style),
            Paragraph("Implements LangGraph StateGraph engine connecting 15 specialist agents with typed state passing.", table_cell_style),
        ],
        [
            Paragraph("<b>2. Factual Grounding & Hallucination Defense</b>", table_cell_bold),
            Paragraph("AI hallucinations in architecture or finance lead to catastrophic project failure.", table_cell_style),
            Paragraph("Incorporates dedicated Reflection and Verification agents with automated consensus thresholds (>=75).", table_cell_style),
        ],
        [
            Paragraph("<b>3. Executable Technical Artifact Generation</b>", table_cell_bold),
            Paragraph("Non-technical founders require clear, concrete technical contracts for developers.", table_cell_style),
            Paragraph("Generates syntactically valid PostgreSQL 16+ DDL schemas with foreign keys and OpenAPI 3.1 REST specs.", table_cell_style),
        ],
        [
            Paragraph("<b>4. 4-Layer Context Memory</b>", table_cell_bold),
            Paragraph("Standard chatbots suffer from conversational amnesia across sessions.", table_cell_style),
            Paragraph("Fuses working session memory, PostgreSQL message logs, ChromaDB vector RAG, and an immutable Decision ledger.", table_cell_style),
        ],
        [
            Paragraph("<b>5. Immersive Cognitive Command Deck</b>", table_cell_bold),
            Paragraph("Reduces cognitive fatigue and clarifies complex multi-agent state telemetry.", table_cell_style),
            Paragraph("Builds a responsive Next.js 15 UI powered by a 3D WebGL Orbital Universe using Three.js and R3F.", table_cell_style),
        ],
    ]
    obj_table = Table(obj_data, colWidths=[120, 180, 232])
    obj_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), c_primary),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, c_bg_light]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(obj_table)

    # ─────────────────────────────────────────────────────────────────────────
    # SECTION 5: PROJECT VISION
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 10))
    story.append(Paragraph("5. PROJECT VISION: WHY AN 'OPERATING SYSTEM'?", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    story.append(p(
        "Operating systems manage hardware resources, schedule concurrent processes, enforce security boundaries, and provide "
        "a reliable execution environment for applications. In the startup domain, **ORBIT acts as the Operating System for Founders**:"
    ))
    story.append(p("• <b>Why NOT a 'Startup Generator'?</b> A startup is not a static output like a meme or blog post. It is an evolving, iterative entity requiring continual task tracking, decision recording, and pivot management.", bullet_style))
    story.append(p("• <b>Why NOT a 'Business Plan Generator'?</b> Traditional 50-page business plans are obsolete upon contact with real users. Orbit produces living sprint backlogs and executable code contracts.", bullet_style))
    story.append(p("• <b>Why NOT an 'AI Chatbot'?</b> Chatbots are passive reactive responders with no task accountability, no state machines, and no cross-artifact validation.", bullet_style))
    story.append(p(
        "<b>The Future Vision:</b> Orbit aims to become the foundational operating layer for modern software companies—where an idea "
        "is entered, validated, auto-scaffolded into code, deployed to cloud containers, and connected to payment processors autonomously."
    ))

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────────────────
    # SECTION 6: THE 15 SPECIALIST AGENTS IN ORBIT
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("6. AGENTS USED IN THE PROJECT (THE 15 SPECIALIST AGENTS)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    story.append(p(
        "Analyzed directly from <code>apps/backend/app/agents/specialist_agents.py</code> and <code>agent_graph.py</code>, "
        "Orbit deploys 15 specialized agents, each possessing an explicit domain boundary, typed input/output schema, and toolset:"
    ))

    agents_list = [
        {
            "name": "1. Problem Discovery Agent",
            "purpose": "Identifies core customer friction, willingness-to-pay signals, and unverified assumptions.",
            "input": "Startup concept description, target audience, industry vertical.",
            "proc": "Evaluates problem urgency, frequency, and severity; formulates falsification hypotheses.",
            "output": "ProblemDiscoveryArtifact (severity_score 1-10, core_pain_points, unresolved_assumptions, evidence_required).",
            "benefit": "Prevents founders from building solutions for imaginary or low-severity problems.",
            "ex": "Focus: Manual sync drag in B2B teams | Severity: 9/10 | Required Evidence: 10 customer interview transcripts.",
        },
        {
            "name": "2. Market Research Agent",
            "purpose": "Computes bottom-up TAM/SAM/SOM market sizing and historical CAGR growth drivers.",
            "input": "Target audience demographic, pricing assumptions, vertical.",
            "proc": "Executes MarketSizeEstimatorTool calculating total addressable market from unit pricing.",
            "output": "MarketResearchArtifact (tam_formatted, sam_formatted, som_formatted, cagr_percentage, market_drivers).",
            "benefit": "Delivers mathematically defensible, formula-backed market metrics required by venture investors.",
            "ex": "TAM: $42.5B | SAM: $8.2B | SOM: $410M | CAGR: 18.4% | Drivers: Cloud automation mandates.",
        },
        {
            "name": "3. Competitor Analysis Agent",
            "purpose": "Benchmarks incumbent platforms, evaluates switching friction, and scores defensibility moats.",
            "input": "Product description, target market, incumbent competitor list.",
            "proc": "Runs CompetitorBenchmarkTool assessing direct/indirect competitors and calculating defensibility moats.",
            "output": "CompetitorAnalysisArtifact (direct_competitors, moat_score 0-100, moat_type, competitive_advantage).",
            "benefit": "Guarantees clear strategic differentiation to prevent launching into a commoditized red ocean.",
            "ex": "Direct: Incumbent X ($49/mo) | Moat Score: 88/100 | Moat Type: Proprietary Multi-Agent Collaboration Graph.",
        },
        {
            "name": "4. Product Strategy Agent",
            "purpose": "Synthesizes the core Product Requirement Document (PRD) and enforces strict MVP boundaries.",
            "input": "Validated problem statement, market analysis, competitor moats.",
            "proc": "Applies MoSCoW prioritization to separate P0 core capabilities from P2/P3 scope-creep backlog.",
            "output": "ProductStrategyArtifact (value_proposition, mvp_scope_boundary, out_of_scope_for_mvp, core_features, personas).",
            "benefit": "Eliminates scope creep—the primary driver of startup engineering delays.",
            "ex": "MVP Boundary: [15-Agent Workflow, PostgreSQL Spec Gen, Gemini Co-Founder] | Out of Scope: [Mobile App, SSO].",
        },
        {
            "name": "5. UI/UX Architect Agent",
            "purpose": "Designs design system tokens, screen visual hierarchies, and responsive layouts.",
            "input": "PRD user stories, workflow personas, interaction models.",
            "proc": "Defines CSS variable tokens, WCAG 2.1 accessibility compliance rules, and responsive component contracts.",
            "output": "UIUXArchitectArtifact (design_system_theme, page_flow_hierarchy, responsive_breakpoints, accessibility_standards).",
            "benefit": "Enables frontend engineers to immediately implement components without design ambiguity.",
            "ex": "Theme: Cosmic Glassmorphism (Dark) | Breakpoints: 375px, 768px, 1280px | Standard: WCAG 2.1 AA (4.5:1 contrast).",
        },
        {
            "name": "6. Technical Architect Agent",
            "purpose": "Formulates system topology, service boundaries, infrastructure budget, and scalability invariants.",
            "input": "PRD features, anticipated user concurrency, and latency targets.",
            "proc": "Evaluates monolithic vs microservice trade-offs via TechStackEvaluationInput; models monthly cloud cost.",
            "output": "TechnicalArchitectArtifact (system_topology, stack, scalability_grade 0-100, infrastructure_monthly_budget_usd).",
            "benefit": "Ensures cloud cost efficiency and architectural longevity without early over-engineering.",
            "ex": "Topology: Modular Monolith (FastAPI + Next.js 15 + Redis) | Scalability Grade: 92/100 | Budget: $65.00/mo.",
        },
        {
            "name": "7. Database Architect Agent",
            "purpose": "Generates production-grade PostgreSQL 16+ DDL schemas with foreign keys, indexes, and UUID keys.",
            "input": "Entity-relationship models from PRD and technical stack parameters.",
            "proc": "Runs DDLSchemaValidationInput checking 3NF normalization, foreign key cascading, and index coverage.",
            "output": "DatabaseArchitectArtifact (database_type, ddl_schema_sql, tables, indexing_strategy, relational_validation).",
            "benefit": "Saves founders from critical technical debt caused by unindexed, unnormalized schemas.",
            "ex": "Schema: PostgreSQL 16 DDL | Tables: users, projects, artifacts, execution_plans | Index: idx_projects_user_id.",
        },
        {
            "name": "8. API Architect Agent",
            "purpose": "Constructs formal OpenAPI 3.1 RESTful endpoint specifications and authentication strategies.",
            "input": "Database schema definitions and PRD feature operations.",
            "proc": "Maps CRUD & agent actions to REST HTTP verbs, JWT authorization headers, and rate-limiting policies.",
            "output": "APIArchitectArtifact (openapi_version 3.1.0, endpoints, authentication_strategy, rate_limiting_rules).",
            "benefit": "Provides an immutable contract between frontend and backend developers, eliminating integration bugs.",
            "ex": "Endpoints: POST /api/v1/projects, POST /api/v1/execution/run | Auth: Bearer JWT | Limit: 100 req/min/IP.",
        },
        {
            "name": "9. Sprint Planner Agent",
            "purpose": "Deconstructs the MVP into an agile 2-week sprint backlog with measurable acceptance gates.",
            "input": "PRD, Technical Architecture, Database DDL, and API specifications.",
            "proc": "Estimates velocity points and breaks complex epics into discrete, testable engineer tasks.",
            "output": "SprintPlannerArtifact (sprint_duration_weeks 2, tasks, acceptance_gates, velocity_points_total).",
            "benefit": "Translates high-level strategic plans into day-to-day software development tickets.",
            "ex": "Duration: 2 Weeks | Total Points: 42 | Sample Task: 'Implement JWT Auth' (5 pts) with 'Passes 90% unit tests' gate.",
        },
        {
            "name": "10. Launch Agent",
            "purpose": "Formulates preflight launch QA checklists and Day-Zero cold-start distribution plans.",
            "input": "Product value proposition, ICP profiles, sprint deliverables.",
            "proc": "Audits production telemetry, legal disclosures, and analytics; drafts distribution channel tactics.",
            "output": "LaunchAgentArtifact (preflight_checklist, initial_cohort_size, distribution_channels, launch_day_zero_plan).",
            "benefit": "Ensures launch day is executed smoothly without broken links or missed distribution opportunities.",
            "ex": "Initial Cohort: 100 Verified Beta Users | Channels: ProductHunt, HackerNews Show, Founder Twitter/X build-in-public.",
        },
        {
            "name": "11. Growth Agent",
            "purpose": "Calculates unit economics (CAC, LTV, payback period), viral loops, and activation funnels.",
            "input": "Pricing model, customer acquisition channels, target sales conversion rates.",
            "proc": "Executes UnitEconomicsInput mathematical equations calculating LTV/CAC ratios and payback velocity.",
            "output": "GrowthAgentArtifact (north_star_metric, activation_funnel, retention_loop, unit_economics).",
            "benefit": "Guarantees that the startup's revenue and acquisition model is mathematically sustainable.",
            "ex": "Target CAC: $45 | LTV: $380 | LTV/CAC: 8.4x | Payback: 2.8 Months | Metric: Weekly Active Executing Projects.",
        },
        {
            "name": "12. Investor Readiness Agent",
            "purpose": "Evaluates startup fundability and authors a 10-slide venture capital pitch deck narrative.",
            "input": "TAM, competitor moat, unit economics, technical architecture, problem severity.",
            "proc": "Audits startup metrics against VC dealbreaker criteria; generates pre-seed valuation ranges.",
            "output": "InvestorReadinessArtifact (overall_readiness_score 0-100, valuation_pre_seed_range, pitch_deck_slides, fundability_index).",
            "benefit": "Prepares founders for investor scrutiny and eliminates common fundraising pitfalls.",
            "ex": "Readiness: 86/100 | Valuation: $3.0M - $4.5M Pre-Seed | Category: High Seed Candidate | Dealbreakers: None.",
        },
        {
            "name": "13. Reflection Agent",
            "purpose": "Acts as an adversarial Socratic devil's advocate, critiquing product and architecture decisions.",
            "input": "PRD, Technical Architecture, and Growth specifications.",
            "proc": "Executes counter-factual stress tests and falsification experiments to detect hidden blind spots.",
            "output": "ReflectionAgentArtifact (counter_factual_critiques, blind_spots, falsification_tests).",
            "benefit": "Uncovers fatal architectural, financial, or market blind spots before resources are wasted.",
            "ex": "Critique: 'What if cloud LLM API costs spike 4x?' | Blind Spot: 'Missing enterprise SOC2 compliance audit in MVP.'",
        },
        {
            "name": "14. Verification Agent",
            "purpose": "Audits cross-artifact consistency, grounding, and evidence criteria across all generated artifacts.",
            "input": "Reflection outputs, PRD, Database DDL, API specs, and Market artifacts.",
            "proc": "Performs cross-artifact reconciliation (e.g. verifying that DB columns support all PRD functional features).",
            "output": "VerificationAgentArtifact (evidence_gate_passed, verified_claims, unverified_hypotheses, cross_artifact_consistency_score).",
            "benefit": "Prevents internal contradictions between the engineering plan and the business model.",
            "ex": "Evidence Gate: PASSED | Consistency Score: 94/100 | Verified: 'All PRD entities have matching DDL tables & indexes.'",
        },
        {
            "name": "15. Risk Agent",
            "purpose": "Evaluates regulatory compliance, cybersecurity attack surfaces, and capital runway burn cliffs.",
            "input": "System architecture, regulatory vertical, and financial burn rate model.",
            "proc": "Calculates runway depletion dates, evaluates GDPR/HIPAA compliance, and formulates hedging strategies.",
            "output": "RiskAgentArtifact (high_risks, compliance_regulatory, burn_cliff_warning, recommended_hedges).",
            "benefit": "Protects the venture from sudden bankruptcy or catastrophic regulatory penalties.",
            "ex": "Warning: '6.2 Months Runway at current burn.' | Compliance: 'GDPR Right to Erasure required in User schema.'",
        },
    ]

    for ag in agents_list:
        card_data = [
            [Paragraph(f"<b>{ag['name']}</b>", ParagraphStyle("AgHead", parent=table_header_style, fontSize=9)),
             Paragraph(f"<b>Output:</b> {ag['output']}", ParagraphStyle("AgOut", parent=table_header_style, fontSize=8, alignment=2))],
            [Paragraph(f"<b>Purpose:</b> {ag['purpose']}<br/>"
                       f"<b>Input:</b> {ag['input']}<br/>"
                       f"<b>Processing:</b> {ag['proc']}<br/>"
                       f"<b>Benefit:</b> {ag['benefit']}<br/>"
                       f"<b>Concrete Example:</b> <i>{ag['ex']}</i>", table_cell_style),
             ""],
        ]
        card_table = Table(card_data, colWidths=[270, 262])
        card_table.setStyle(TableStyle([
            ("SPAN", (0, 1), (1, 1)),
            ("BACKGROUND", (0, 0), (-1, 0), c_dark),
            ("BACKGROUND", (0, 1), (-1, 1), c_bg_light),
            ("PADDING", (0, 0), (-1, -1), 4),
            ("BOX", (0, 0), (-1, -1), 1, c_border),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(card_table)
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────────────────
    # SECTION 7 & 8: AGENT COLLABORATION & COMPLETE WORKFLOW
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("7. AGENT COLLABORATION & MULTI-AGENT DEBATE ENGINE", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    story.append(p(
        "Orbit's agents do not execute in an isolated linear pipeline. They are orchestrated inside an asynchronous "
        "<b>LangGraph StateGraph</b> engine implementing a 6-phase state machine with automated debate and consensus evaluation:"
    ))

    flow_box_data = [
        [Paragraph("<b>PHASE 1: RESEARCH</b>", table_header_style), Paragraph("Problem Discovery ──► Market Research ──► Competitor Analysis", table_cell_style)],
        [Paragraph("<b>PHASE 2: STRATEGY</b>", table_header_style), Paragraph("Product Strategy (PRD) ──► UI/UX Architect ──► Tech Arch ──► DB DDL ──► API Spec", table_cell_style)],
        [Paragraph("<b>PHASE 3: REFLECTION</b>", table_header_style), Paragraph("Reflection Agent (Socratic Falsification) + Risk Agent (Burn Cliff & Compliance)", table_cell_style)],
        [Paragraph("<b>PHASE 4: VERIFICATION</b>", table_header_style), Paragraph("Verification Agent audits cross-artifact consistency & evidence grounding", table_cell_style)],
        [Paragraph("<b>PHASE 5: MULTI-AGENT DEBATE</b>", table_header_style), Paragraph("Adversarial Debate Rounds (e.g. Tech Architect vs. Finance; Product vs. VC Risk)", table_cell_style)],
        [Paragraph("<b>PHASE 6: CONSENSUS GATE</b>", table_header_style), Paragraph("Evaluates Consensus Score. If Score < 75 and Rounds < 3, re-run Debate; else proceed.", table_cell_style)],
        [Paragraph("<b>PHASE 7: EXECUTION</b>", table_header_style), Paragraph("Sprint Planner ──► Launch Agent ──► Growth Agent ──► Investor Readiness ──► HUD", table_cell_style)],
    ]
    flow_table = Table(flow_box_data, colWidths=[150, 382])
    flow_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), c_primary),
        ("BACKGROUND", (1, 0), (1, -1), c_bg_light),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(flow_table)

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>The Multi-Agent Debate & Consensus Node in Code:</b>", h2_style))
    story.append(p(
        "As implemented in <code>app/orchestration/agent_graph.py</code>, when the graph reaches <code>debate_node</code>, "
        "agents challenge competing trade-offs. For example, the <b>Technical Architect</b> advocates for dedicated PostgreSQL instances "
        "for ACID safety, while the <b>Finance Agent</b> argues this increases pre-revenue burn. The debate resolves into a consensus resolution "
        "(e.g., burstable managed tier with connection pooling). The <code>check_consensus</code> conditional edge routes the execution:"
    ))
    code_snippet = (
        "def check_consensus(state: AgentGraphState) -&gt; str:\n"
        "    score = state.get('consensus_score', 0)\n"
        "    rounds = state.get('current_debate_round', 0)\n"
        "    if score &lt; 75 and rounds &lt; 3:\n"
        "        return 'debate_node'  # Re-route for deeper debate\n"
        "    return 'execution_node'    # Consensus satisfied, proceed to execution"
    )
    story.append(Table([[Paragraph(f"<pre>{code_snippet}</pre>", code_style)]], colWidths=[532], style=[
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ("BOX", (0, 0), (-1, -1), 1, c_border),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))

    story.append(Spacer(1, 10))
    story.append(Paragraph("8. COMPLETE PROJECT WORKFLOW & REALTIME TELEMETRY", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    story.append(p(
        "The end-to-end runtime lifecycle connects the User, Frontend, Backend, Agent Graph, and Streaming Event Bus:"
    ))
    story.append(p("1. <b>User Input:</b> The founder inputs the startup idea via Next.js 15 frontend at <code>/projects/new</code>.", bullet_style))
    story.append(p("2. <b>Authenticated Dispatch:</b> Frontend issues <code>POST /api/v1/projects</code> followed by <code>POST /api/v1/execution/run</code> with a Bearer JWT.", bullet_style))
    story.append(p("3. <b>LangGraph Runner:</b> FastAPI dispatches the 15-agent state graph (either inline or queued via Celery & Redis).", bullet_style))
    story.append(p("4. <b>Real-time EventBus:</b> As agents execute, they publish events (<code>agent_started</code>, <code>evidence_gathered</code>, <code>debate_round</code>) to <code>agent_event_bus</code>.", bullet_style))
    story.append(p("5. <b>Server-Sent Events (SSE):</b> The frontend consumes <code>GET /api/v1/stream/{project_id}</code>, updating the Mission Control HUD in real time without polling.", bullet_style))
    story.append(p("6. <b>Persistence:</b> Generated DDL schemas, PRD documents, and sprint tickets are saved to PostgreSQL relational tables (<code>artifacts</code>, <code>execution_plans</code>).", bullet_style))
    story.append(p("7. <b>Vector RAG Ingestion:</b> Strategic summaries are indexed into ChromaDB for instant semantic retrieval.", bullet_style))

    # ─────────────────────────────────────────────────────────────────────────
    # SECTION 9: GEMINI AI CO-FOUNDER & 4-LAYER MEMORY
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 10))
    story.append(Paragraph("9. GEMINI AI CO-FOUNDER & 4-LAYER MEMORY ARCHITECTURE", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    story.append(p(
        "Located in <code>app/services/cofounder_service.py</code>, the <b>Gemini AI Co-Founder</b> provides persistent strategic "
        "and technical co-founder intelligence across the entire workspace."
    ))
    story.append(p("• <b>Model Choice:</b> Powered by <b>Google Gemini 2.0 Flash</b> via the official <code>google-genai</code> SDK (version &gt;= 1.60), providing sub-second token generation and a massive context window capable of ingesting full PRDs and SQL schemas without truncation.", bullet_style))
    story.append(p("• <b>Deterministic Offline Fallback:</b> If no Gemini API key is configured, Orbit gracefully shifts to a deterministic local execution co-founder with full project memory, guaranteeing 100% testability and reliability during offline reviews.", bullet_style))

    mem_table_data = [
        [Paragraph("Memory Layer", table_header_style), Paragraph("Physical Storage", table_header_style), Paragraph("Purpose & Scope", table_header_style), Paragraph("Operational Impact", table_header_style)],
        [
            Paragraph("<b>Layer 1: Working Context</b>", table_cell_bold),
            Paragraph("Transient HTTP / State", table_cell_style),
            Paragraph("Tracks active page, current task, and user viewport.", table_cell_style),
            Paragraph("Answers questions relevant to the exact screen the founder is viewing.", table_cell_style),
        ],
        [
            Paragraph("<b>Layer 2: Relational History</b>", table_cell_bold),
            Paragraph("PostgreSQL <code>cofounder_messages</code>", table_cell_style),
            Paragraph("Chronological dialogue log indexed by user and project UUID.", table_cell_style),
            Paragraph("Retains full conversational multi-turn history across browser sessions.", table_cell_style),
        ],
        [
            Paragraph("<b>Layer 3: Semantic RAG</b>", table_cell_bold),
            Paragraph("ChromaDB Vector Store", table_cell_style),
            Paragraph("Vector embeddings of PRDs, market analyses, and architecture notes.", table_cell_style),
            Paragraph("Answers queries like 'Why did we reject MongoDB?' using top-k semantic search.", table_cell_style),
        ],
        [
            Paragraph("<b>Layer 4: Strategic Decisions</b>", table_cell_bold),
            Paragraph("PostgreSQL <code>decisions</code>", table_cell_style),
            Paragraph("Structured registry of agreed constraints, pivot logs, and boundaries.", table_cell_style),
            Paragraph("Prevents AI hallucination from contradicting established strategic milestones.", table_cell_style),
        ],
    ]
    mem_table = Table(mem_table_data, colWidths=[100, 110, 150, 172])
    mem_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), c_teal),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, c_bg_light]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(mem_table)

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────────────────
    # SECTION 10 & 11: SYSTEM ARCHITECTURE & TECHNOLOGY STACK
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("10. SYSTEM ARCHITECTURE & COMPONENT RESPONSIBILITIES", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))

    arch_data = [
        [Paragraph("Architectural Layer", table_header_style), Paragraph("Component Technologies", table_header_style), Paragraph("Primary Core Responsibilities", table_header_style)],
        [
            Paragraph("<b>Frontend Tier</b>", table_cell_bold),
            Paragraph("Next.js 15, React 19, Three.js, R3F, Zustand, Tailwind", table_cell_style),
            Paragraph("Renders responsive UI, executes WebGL orbital canvas, manages client cache, consumes SSE streams.", table_cell_style),
        ],
        [
            Paragraph("<b>API Gateway Tier</b>", table_cell_bold),
            Paragraph("FastAPI, Uvicorn, Python 3.12, Pydantic v2", table_cell_style),
            Paragraph("Enforces JWT security, validates incoming schemas, exposes OpenAPI 3.1, provides SSE streaming.", table_cell_style),
        ],
        [
            Paragraph("<b>Agent Orchestrator</b>", table_cell_bold),
            Paragraph("LangGraph StateGraph, LangChain Core", table_cell_style),
            Paragraph("Executes 6-phase state machine, routes debate rounds, scores consensus, publishes telemetry.", table_cell_style),
        ],
        [
            Paragraph("<b>AI Intelligence Tier</b>", table_cell_bold),
            Paragraph("Google Gemini 2.0 Flash (`google-genai`), Claude, GPT-4o", table_cell_style),
            Paragraph("Supplies foundation model intelligence for reasoning, analysis, and strategic debate.", table_cell_style),
        ],
        [
            Paragraph("<b>Relational Persistence</b>", table_cell_bold),
            Paragraph("PostgreSQL 16, SQLAlchemy 2.0 Async, Alembic", table_cell_style),
            Paragraph("Guarantees ACID transactions for projects, artifacts, execution plans, and decision histories.", table_cell_style),
        ],
        [
            Paragraph("<b>Semantic Memory Tier</b>", table_cell_bold),
            Paragraph("ChromaDB, Vector Embeddings", table_cell_style),
            Paragraph("Performs high-speed semantic retrieval across generated artifacts and founder transcripts.", table_cell_style),
        ],
        [
            Paragraph("<b>Background Execution</b>", table_cell_bold),
            Paragraph("Celery 5.4, Redis 7", table_cell_style),
            Paragraph("Executes asynchronous, non-blocking agent workflows for complex pipeline runs.", table_cell_style),
        ],
    ]
    arch_table = Table(arch_data, colWidths=[110, 160, 262])
    arch_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), c_primary),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, c_bg_light]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(arch_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("11. TECHNOLOGY STACK ANALYSIS", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))

    tech_data = [
        [Paragraph("Layer", table_header_style), Paragraph("Technology & Version", table_header_style), Paragraph("Technical Purpose in Orbit", table_header_style), Paragraph("Architectural Rationale", table_header_style)],
        [Paragraph("Frontend Core", table_cell_bold), Paragraph("Next.js 15.0 + React 19", table_cell_style), Paragraph("App Router web framework", table_cell_style), Paragraph("Fast compilation, SSR + CSR hybrid performance.", table_cell_style)],
        [Paragraph("Language", table_cell_bold), Paragraph("TypeScript 5.6", table_cell_style), Paragraph("Frontend type safety", table_cell_style), Paragraph("Prevents schema misalignment between frontend & backend.", table_cell_style)],
        [Paragraph("3D Rendering", table_cell_bold), Paragraph("Three.js + R3F + Drei", table_cell_style), Paragraph("Hardware WebGL 3D Canvas", table_cell_style), Paragraph("Interactive astronomical galaxy & constellation rendering.", table_cell_style)],
        [Paragraph("Animations", table_cell_bold), Paragraph("Framer Motion 11 + GSAP", table_cell_style), Paragraph("60fps UI transitions & HUD", table_cell_style), Paragraph("Smooth layout shifts, modal entries, telemetry counters.", table_cell_style)],
        [Paragraph("Styling", table_cell_bold), Paragraph("Tailwind CSS 3.4 + Radix", table_cell_style), Paragraph("Design system & accessibility", table_cell_style), Paragraph("Utility-first glassmorphism, WCAG 2.1 compliant primitives.", table_cell_style)],
        [Paragraph("State Mgmt", table_cell_bold), Paragraph("Zustand + React Query v5", table_cell_style), Paragraph("Client store & server caching", table_cell_style), Paragraph("Zero-boilerplate reactive stores with automated query deduplication.", table_cell_style)],
        [Paragraph("Backend API", table_cell_bold), Paragraph("FastAPI 0.115 + Python 3.12", table_cell_style), Paragraph("Async REST API & SSE engine", table_cell_style), Paragraph("Asynchronous execution, native Pydantic v2 validation.", table_cell_style)],
        [Paragraph("Agent Graph", table_cell_bold), Paragraph("LangGraph 1.2 + LangChain", table_cell_style), Paragraph("Multi-agent orchestration", table_cell_style), Paragraph("Supports stateful cycles, debate loops, and conditional edges.", table_cell_style)],
        [Paragraph("Primary AI", table_cell_bold), Paragraph("Google Gemini 2.0 Flash", table_cell_style), Paragraph("Co-Founder & Specialist Agents", table_cell_style), Paragraph("Low latency, large context window via official `google-genai`.", table_cell_style)],
        [Paragraph("Relational DB", table_cell_bold), Paragraph("PostgreSQL 16 + AsyncPG", table_cell_style), Paragraph("System of record persistence", table_cell_style), Paragraph("ACID guarantees, JSONB flexibility, UUID primary keys.", table_cell_style)],
        [Paragraph("Vector DB", table_cell_bold), Paragraph("ChromaDB 1.5", table_cell_style), Paragraph("Semantic vector RAG memory", table_cell_style), Paragraph("Instant embedding lookup for historical strategic decisions.", table_cell_style)],
        [Paragraph("Task Queue", table_cell_bold), Paragraph("Celery 5.4 + Redis 5.0", table_cell_style), Paragraph("Distributed background worker", table_cell_style), Paragraph("Decouples long-running agent workflows from HTTP threads.", table_cell_style)],
        [Paragraph("Authentication", table_cell_bold), Paragraph("Passlib (Argon2) + JWT", table_cell_style), Paragraph("Cryptographic security", table_cell_style), Paragraph("Argon2id password hashing resistant to GPU brute-forcing.", table_cell_style)],
    ]
    tech_table = Table(tech_data, colWidths=[70, 110, 140, 212])
    tech_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), c_accent),
        ("PADDING", (0, 0), (-1, -1), 3.5),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, c_bg_light]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(tech_table)

    # ─────────────────────────────────────────────────────────────────────────
    # SECTION 12 & 13: DATABASE DESIGN & API ARCHITECTURE
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 10))
    story.append(Paragraph("12. DATABASE DESIGN & ENTITY RELATIONSHIPS", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    story.append(p(
        "Analyzed from <code>apps/backend/app/models/</code>, the PostgreSQL schema enforces strict relational integrity with UUID primary keys:"
    ))

    db_tables_data = [
        [Paragraph("Table Name", table_header_style), Paragraph("Primary & Foreign Keys", table_header_style), Paragraph("Attributes & Storage Types", table_header_style), Paragraph("Relational Purpose", table_header_style)],
        [
            Paragraph("<b>users</b>", table_cell_bold),
            Paragraph("PK: <code>id (UUID)</code>", table_cell_style),
            Paragraph("email (UNIQUE), hashed_password, full_name, is_active, is_superuser", table_cell_style),
            Paragraph("Founder identity and security principal.", table_cell_style),
        ],
        [
            Paragraph("<b>projects</b>", table_cell_bold),
            Paragraph("PK: <code>id (UUID)</code><br/>FK: <code>user_id</code> ──► users.id", table_cell_style),
            Paragraph("name, industry, target_audience, budget_usd, current_phase, status", table_cell_style),
            Paragraph("Anchor entity linking all startup artifacts and memory.", table_cell_style),
        ],
        [
            Paragraph("<b>artifacts</b>", table_cell_bold),
            Paragraph("PK: <code>id (UUID)</code><br/>FK: <code>project_id</code> ──► projects.id", table_cell_style),
            Paragraph("agent_key, artifact_type, content (JSONB), version, is_current", table_cell_style),
            Paragraph("Stores immutable outputs from all 15 agents.", table_cell_style),
        ],
        [
            Paragraph("<b>execution_plans</b>", table_cell_bold),
            Paragraph("PK: <code>id (UUID)</code><br/>FK: <code>project_id</code> ──► projects.id", table_cell_style),
            Paragraph("plan (JSONB), task_completion_status (JSONB), version, updated_at", table_cell_style),
            Paragraph("Tracks active sprint tasks, phase gates, and completion.", table_cell_style),
        ],
        [
            Paragraph("<b>cofounder_messages</b>", table_cell_bold),
            Paragraph("PK: <code>id (UUID)</code><br/>FK: <code>project_id</code>, <code>user_id</code>", table_cell_style),
            Paragraph("role ('user'/'model'), content (TEXT), page_context, created_at", table_cell_style),
            Paragraph("Persists chronological multi-turn Co-Founder conversation.", table_cell_style),
        ],
        [
            Paragraph("<b>decisions</b>", table_cell_bold),
            Paragraph("PK: <code>id (UUID)</code><br/>FK: <code>project_id</code> ──► projects.id", table_cell_style),
            Paragraph("decision_text, category, rationale, challenged_by, is_active", table_cell_style),
            Paragraph("Immutable strategic ledger grounding AI co-founder advice.", table_cell_style),
        ],
        [
            Paragraph("<b>agent_runs</b>", table_cell_bold),
            Paragraph("PK: <code>id (UUID)</code><br/>FK: <code>project_id</code> ──► projects.id", table_cell_style),
            Paragraph("phase, status, execution_time_ms, consensus_score, errors (JSONB)", table_cell_style),
            Paragraph("System telemetry log tracking performance and cost.", table_cell_style),
        ],
    ]
    db_table = Table(db_tables_data, colWidths=[100, 120, 160, 152])
    db_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), c_dark),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, c_bg_light]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(db_table)

    story.append(PageBreak())

    story.append(Paragraph("13. API ARCHITECTURE & ENDPOINT SPECIFICATIONS", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    story.append(p(
        "Orbit exposes an asynchronous, typed RESTful API under <code>/api/v1</code> with live Server-Sent Events (SSE):"
    ))

    api_data = [
        [Paragraph("Category", table_header_style), Paragraph("HTTP Method & Endpoint", table_header_style), Paragraph("Request Payload / Headers", table_header_style), Paragraph("Response Contract & Behavior", table_header_style)],
        [
            Paragraph("<b>Auth</b>", table_cell_bold),
            Paragraph("<code>POST /api/v1/auth/register</code><br/><code>POST /api/v1/auth/login</code>", table_cell_style),
            Paragraph("JSON: email, password, full_name", table_cell_style),
            Paragraph("Validates Argon2 hash, returns JWT access & refresh bearer tokens.", table_cell_style),
        ],
        [
            Paragraph("<b>Projects</b>", table_cell_bold),
            Paragraph("<code>GET  /api/v1/projects</code><br/><code>POST /api/v1/projects</code>", table_cell_style),
            Paragraph("Bearer JWT | JSON: name, industry, target_audience, budget", table_cell_style),
            Paragraph("Initializes project in DB; returns project UUID & baseline status.", table_cell_style),
        ],
        [
            Paragraph("<b>Execution</b>", table_cell_bold),
            Paragraph("<code>POST /api/v1/execution/run</code><br/><code>GET  /api/v1/execution/plan/{id}</code>", table_cell_style),
            Paragraph("Bearer JWT | JSON: project_id, execution_mode ('auto'/'queued')", table_cell_style),
            Paragraph("Launches 15-agent LangGraph pipeline; returns execution run ID.", table_cell_style),
        ],
        [
            Paragraph("<b>Telemetry</b>", table_cell_bold),
            Paragraph("<code>GET  /api/v1/stream/{project_id}</code>", table_cell_style),
            Paragraph("Accept: <code>text/event-stream</code>", table_cell_style),
            Paragraph("SSE unidirectional stream broadcasting live agent telemetry events.", table_cell_style),
        ],
        [
            Paragraph("<b>Memory</b>", table_cell_bold),
            Paragraph("<code>POST /api/v1/memory/ask</code><br/><code>POST /api/v1/memory/decision</code>", table_cell_style),
            Paragraph("Bearer JWT | JSON: message, project_id, page_context", table_cell_style),
            Paragraph("Runs 4-layer context retrieval, calls Gemini 2.0 Flash, logs answer.", table_cell_style),
        ],
    ]
    api_table = Table(api_data, colWidths=[70, 160, 140, 162])
    api_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), c_primary),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, c_bg_light]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(api_table)

    # ─────────────────────────────────────────────────────────────────────────
    # SECTION 14 & 15: UI/UX & 3D WEBGL EXPERIENCE
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 10))
    story.append(Paragraph("14. UI/UX FEATURES: THE COSMIC COMMAND DECK", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    story.append(p(
        "Orbit discards generic flat SaaS dashboards in favor of an **Integrated Cosmic Command Deck**:"
    ))
    story.append(p("• <b>Mission Control HUD:</b> Displays high-level venture telemetry (readiness score 0-100, sprint progress, active burn cliff warning, and verification status) in a single unified view.", bullet_style))
    story.append(p("• <b>Agent Workspace:</b> Dedicated inspection panels allowing founders to inspect raw generated artifacts (PostgreSQL DDL with syntax highlighting, OpenAPI contracts, PRD personas).", bullet_style))
    story.append(p("• <b>Simulation Lab & Debate HUD:</b> Visualizes real-time adversarial debate rounds between agents, displaying argumentation nodes and consensus scoring bars.", bullet_style))
    story.append(p("• <b>Investor Pitch Deck Studio:</b> Dynamic slide presentation generator converting structured artifacts into ready-to-present VC pitch narratives.", bullet_style))
    story.append(p("• <b>Floating Co-Founder Drawer:</b> Slide-over AI co-founder interface providing contextual strategic advice without requiring the user to leave their active sprint workspace.", bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("15. 3D WEBGL EXPERIENCE: THREE.JS & REACT THREE FIBER", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    story.append(p(
        "Analyzed from <code>apps/frontend/components/orbit/canvas/</code>, Orbit implements a custom 3D WebGL engine:"
    ))
    story.append(p("• <b>OrbitUniverseCanvas.tsx:</b> Mounts the WebGL canvas via React Three Fiber with antialiasing, camera frustum controls, and device pixel ratio clamping (1 to 1.5) for mobile GPU stability.", bullet_style))
    story.append(p("• <b>BlackHoleIntelligenceCore.tsx:</b> Custom GLSL vertex and fragment shaders rendering a dynamic gravitational singularity and accretion disk that pulses during agent execution.", bullet_style))
    story.append(p("• <b>AgentConstellation.tsx:</b> Renders the 15 specialist agents as glowing celestial nodes in 3D space. Dynamic bezier curve edge lines illuminate when agents exchange debate arguments.", bullet_style))
    story.append(p("• <b>PlanetarySystem.tsx:</b> Represents startup lifecycle stages (Validation, Arch, Sprints, Growth) as orbiting planetary bodies with interactive raycasting hover and selection.", bullet_style))
    story.append(p("• <b>CameraFlightRig.tsx:</b> Implements smooth 60fps cinematic camera flight transitions using linear interpolation (lerp) as founders navigate between project phases.", bullet_style))
    story.append(p("• <b>StarField.tsx & VolumetricNebula.tsx:</b> 5,000+ interactive particles with depth attenuation providing realistic spatial depth.", bullet_style))

    # ─────────────────────────────────────────────────────────────────────────
    # SECTION 16 & 17: KEY FEATURES & AUDIENCE BENEFIT
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 10))
    story.append(Paragraph("16. KEY FEATURES & REAL-WORLD VALUE", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    
    feat_data = [
        [Paragraph("Feature", table_header_style), Paragraph("Technical Mechanism", table_header_style), Paragraph("Founder Benefit", table_header_style), Paragraph("Real-World Value", table_header_style)],
        [
            Paragraph("<b>Autonomous 15-Agent Workflow</b>", table_cell_bold),
            Paragraph("LangGraph StateGraph engine with typed state passing.", table_cell_style),
            Paragraph("Replaces manual prompt juggling across disjointed tools.", table_cell_style),
            Paragraph("Compresses 6 weeks of agency discovery into &lt; 2 minutes.", table_cell_style),
        ],
        [
            Paragraph("<b>Production PostgreSQL DDL</b>", table_cell_bold),
            Paragraph("Database Architect Agent running 3NF schema validators.", table_cell_style),
            Paragraph("Non-technical founders receive production-ready SQL.", table_cell_style),
            Paragraph("Saves $10,000+ in early software consulting rework.", table_cell_style),
        ],
        [
            Paragraph("<b>Adversarial Multi-Agent Debate</b>", table_cell_bold),
            Paragraph("Round-robin trade-off debate with consensus gate (&gt;=75).", table_cell_style),
            Paragraph("Prevents sycophancy and uncovers fatal blind spots early.", table_cell_style),
            Paragraph("Stops founders from building doomed or illegal architectures.", table_cell_style),
        ],
        [
            Paragraph("<b>Realtime SSE Telemetry Feed</b>", table_cell_bold),
            Paragraph("Server-Sent Events streaming from internal EventBus.", table_cell_style),
            Paragraph("Complete transparency into AI reasoning as evidence gathers.", table_cell_style),
            Paragraph("Eliminates black-box distrust among founders and evaluators.", table_cell_style),
        ],
    ]
    feat_table = Table(feat_data, colWidths=[110, 140, 130, 152])
    feat_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), c_accent),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, c_bg_light]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(feat_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("17. HOW THE PROJECT IS USEFUL ACROSS DOMAINS", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    story.append(p("• <b>First-Time & Solo Founders:</b> Equips them with an on-demand virtual CTO, Head of Product, and Financial Analyst, leveling the playing field against venture-backed competitors.", bullet_style))
    story.append(p("• <b>University Students & Engineers:</b> Teaches engineering rigor—how to transform raw code into viable businesses with unit economics, defensible moats, and structured sprints.", bullet_style))
    story.append(p("• <b>Incubators & Accelerators:</b> Automates cohort intake screening, generating standardized readiness reports and technical feasibility audits in minutes.", bullet_style))
    story.append(p("• <b>Angel Investors & VCs:</b> Pre-audits founder submissions, verifying that claims have matching data schemas, TAM calculations, and unit economic foundations.", bullet_style))

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────────────────
    # SECTION 18, 19, 20, 21: INNOVATION, CHALLENGES, FUTURE, OUTCOMES
    # ─────────────────────────────────────────────────────────────────────────
    story.append(Paragraph("18. INNOVATION IN THE PROJECT: ORBIT VS. THE MARKET", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    story.append(p("1. <b>Adversarial Debate Architecture:</b> Orbit replaces single-prompt LLM completion with an adversarial debate network where specialized agents challenge each other's assumptions.", bullet_style))
    story.append(p("2. <b>Cross-Artifact Consistency Engine:</b> The Verification Agent cross-references database schemas, API specs, and PRD documents to ensure complete architectural alignment.", bullet_style))
    story.append(p("3. <b>4-Layer Persistent Context Stack:</b> Solves conversational amnesia by fusing relational PostgreSQL logs, ChromaDB semantic vector search, and an immutable decision ledger.", bullet_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("19. DEVELOPMENT CHALLENGES FACED & SOLUTIONS", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))

    chal_data = [
        [Paragraph("Engineering Challenge", table_header_style), Paragraph("Root Cause / Impact", table_header_style), Paragraph("Implemented Technical Solution", table_header_style)],
        [
            Paragraph("<b>LLM Non-Determinism & Hallucination</b>", table_cell_bold),
            Paragraph("Models hallucinated invalid SQL syntax and unverified market numbers.", table_cell_style),
            Paragraph("Enforced Pydantic v2 output schemas, typed agent tools, and an automated Verification Agent audit.", table_cell_style),
        ],
        [
            Paragraph("<b>Long Pipeline Timeouts</b>", table_cell_bold),
            Paragraph("Running 15 agents sequentially exceeded standard 30s HTTP request timeouts.", table_cell_style),
            Paragraph("Decoupled execution via Celery background tasks with Redis brokers and SSE streaming updates.", table_cell_style),
        ],
        [
            Paragraph("<b>Conversational Context Amnesia</b>", table_cell_bold),
            Paragraph("Chatbots lose context across browser sessions, frustrating founders.", table_cell_style),
            Paragraph("Engineered 4-layer memory fusing PostgreSQL conversation logs with ChromaDB RAG vector embeddings.", table_cell_style),
        ],
        [
            Paragraph("<b>WebGL 3D GPU Lag on Mobile</b>", table_cell_bold),
            Paragraph("Heavy particle simulations caused frame-rate drops on integrated mobile GPUs.", table_cell_style),
            Paragraph("Clamped device pixel ratio (1-1.5), applied frustum culling, and utilized lightweight custom GLSL shaders.", table_cell_style),
        ],
    ]
    chal_table = Table(chal_data, colWidths=[130, 170, 232])
    chal_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), c_dark),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, c_bg_light]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(chal_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph("20. FUTURE SCOPE & EXPANSION ROADMAP", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))
    story.append(p("• <b>Autonomous Codebase Scaffolding:</b> Automatically generate and push complete GitHub starter repositories containing the FastAPI backend, Next.js frontend, and Docker containers based on generated DDL and OpenAPI specs.", bullet_style))
    story.append(p("• <b>Real-Time Market Web Scrapers:</b> Integrate live data connectors (Google Trends, Crunchbase, SimilarWeb) to replace baseline research with live market telemetry.", bullet_style))
    story.append(p("• <b>Direct Investor Matchmaking:</b> Match validated startup projects directly with accredited angel investors and venture funds based on fundability scores and industry tags.", bullet_style))
    story.append(p("• <b>Multi-Founder Real-Time Collaboration:</b> Implement WebSockets for live, multiplayer strategy editing and co-founder task management.", bullet_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("21. PROJECT OUTCOMES (TECHNICAL, BUSINESS & LEARNING)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_border, spaceBefore=2, spaceAfter=8))

    outcomes_data = [
        [Paragraph("Category", table_header_style), Paragraph("Key Milestone Achieved", table_header_style), Paragraph("Evidence in Codebase", table_header_style)],
        [
            Paragraph("<b>Technical Outcomes</b>", table_cell_bold),
            Paragraph("Engineered a production-ready, full-stack multi-agent AI system combining FastAPI, Next.js 15, PostgreSQL 16, LangGraph, and Three.js.", table_cell_style),
            Paragraph("459-line LangGraph orchestrator (<code>agent_graph.py</code>), 15 specialist agents, 4-layer memory (<code>cofounder_service.py</code>), and custom GLSL WebGL shaders.", table_cell_style),
        ],
        [
            Paragraph("<b>Business Outcomes</b>", table_cell_bold),
            Paragraph("Proved that multi-month startup planning cycles can be compressed into under 2 minutes of validated, production-grade engineering artifacts.", table_cell_style),
            Paragraph("Automated generation of formulaic TAM/SAM/SOM sizing, 2-week agile sprint backlogs, unit economics models, and 10-slide VC pitch decks.", table_cell_style),
        ],
        [
            Paragraph("<b>Learning Outcomes</b>", table_cell_bold),
            Paragraph("Mastered state-of-the-art AI systems design: LangGraph state machines, adversarial consensus routing, async database pooling, and WebGL rendering.", table_cell_style),
            Paragraph("Deep architectural understanding of multi-agent collaboration, memory retrieval via RAG, and production SaaS security standards.", table_cell_style),
        ],
    ]
    outcomes_table = Table(outcomes_data, colWidths=[100, 200, 232])
    outcomes_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), c_teal),
        ("PADDING", (0, 0), (-1, -1), 4),
        ("GRID", (0, 0), (-1, -1), 0.5, c_border),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, c_bg_light]),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(outcomes_table)

    story.append(Spacer(1, 15))
    story.append(callout_box)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filename}")


if __name__ == "__main__":
    out_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "ORBIT_Project_Complete_Explanation_Guide.pdf")
    )
    if len(sys.argv) > 1:
        out_path = sys.argv[1]
    build_pdf(out_path)
