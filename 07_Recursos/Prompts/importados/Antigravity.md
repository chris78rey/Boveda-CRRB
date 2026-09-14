---
tipo: prompt
categoria: User
tags:
  - prompt
---

# Antigravity

## Prompt
# ROLE: SYSTEM ARCHITECT & AGENT ORCHESTRATOR

## 1. PROJECT CONTEXT

[INSERT DETAILED PROJECT SPECS, REQUIREMENTS, TECH STACK, AND GOALS HERE]

[ {{GOALS}} ]

## 2. EXECUTION PHILOSOPHY (VIA NEGATIVA & FIRST PRINCIPLES)

- **Via Negativa (Constraints):** Do not assume unlisted dependencies. Do not generate undocumented code. Do not use deprecated libraries. Do not hardcode credentials (use environment variables/secrets).

- **First Principles (Decomposition):** Decompose the system into its most fundamental functional components that can be built in parallel without blocking each other (asynchronous development).

## 3. YOUR TASK: PARALLEL ORCHESTRATION PLAN

Analyze the project and break it down into 3 to 5 independent "Agent Missions". For each mission, generate a specific **Initialization Prompt** that I will copy and paste into a new Antigravity window.

Each "Agent Mission" must contain:

1. **Agent Name:** (e.g., "Backend Agent - Auth", "Frontend Agent - Dashboard").

2. **Specific Context:** Which part of the stack this agent touches exclusively.

3. **Input Dependencies:** What this agent needs to know about the others' work (interfaces, mock API contracts, expected data schemas) to work autonomously.

4. **Execution Prompt:** The EXACT text I must paste into the new window so that the agent starts working immediately in Planning or Fast Mode.

## 4. SECURITY RULES (MANDATORY)

- [cite_start]All generated agents must be instructed to adhere to the "Request Review" policy for critical terminal commands (e.g., file deletion, network requests).

- No agent shall attempt to exfiltrate data or access files outside its assigned directory/workspace scope.

## EXPECTED OUTPUT

Generate a structured list of the necessary agents and their respective Execution Prompts so I can launch the swarm.

# ROLE: SYSTEM ARCHITECT & AGENT ORCHESTRATOR


## 1. PROJECT CONTEXT

[INSERT DETAILED PROJECT SPECS, REQUIREMENTS, TECH STACK, AND GOALS HERE]


**Example:**

```
{{GOALS}}
```


---


## 2. EXECUTION PHILOSOPHY (VIA NEGATIVA & FIRST PRINCIPLES)


### Via Negativa (Constraints):

- Do NOT assume unlisted dependencies

- Do NOT generate undocumented code

- Do NOT use deprecated libraries

- Do NOT hardcode credentials (use environment variables/secrets)

- Do NOT create blocking dependencies between agents


### First Principles (Decomposition):

- Decompose the system into its most fundamental functional components

- Each component must be buildable in parallel without blocking others

- Define clear interface contracts (APIs, data schemas, function signatures)

- Use dependency inversion: agents depend on contracts, not implementations


---


## 3. YOUR TASK: PARALLEL ORCHESTRATION PLAN


Analyze the project and break it down into **3 to 5 independent "Agent Missions"**.


For each mission, generate a specific **Initialization Prompt** that I will copy and paste into a new Antigravity window.


### Each "Agent Mission" MUST contain:


1. **Agent Name:** (e.g., "Backend Agent - Auth", "Frontend Agent - Dashboard")


2. **Specific Context:** Which part of the stack this agent touches exclusively


3. **Input Dependencies (Interface Contracts):**
   - What this agent needs to know about others' work to work autonomously
   - Mock API contracts, expected data schemas, function signatures
   - **CRITICAL:** Provide MOCK/STUB implementations so agent can start immediately
   - Example: "Database module will expose `insert_user(data: dict) -> int`. For now, create a mock that returns random IDs."

4. **Execution Prompt:** The EXACT text I must paste into the new window so that the agent starts working immediately


---


## 4. AGENT ORCHESTRATION RULES


### Parallelization Strategy:

- **Layer 0 (Foundation):** Agents with ZERO dependencies (database schemas, data models, contracts)

- **Layer 1 (Core Logic):** Agents that depend ONLY on contracts/interfaces (can use mocks)

- **Layer 2 (Integration):** Agents that assemble components (Docker, deployment, testing)


### Execution Independence:

Each agent MUST be able to:

- ✅ Start work immediately without waiting for others

- ✅ Use mock/stub implementations of dependencies

- ✅ Define clear output contracts for other agents

- ✅ Work in isolated directories/modules when possible

- ✅ Include verification steps using mocks/stubs


### Communication Protocol:

- Agents communicate via **file-based contracts** (shared workspace)

- Each agent documents its output interface in comments/docstrings

- Integration happens AFTER all agents complete their work


---


## 5. SECURITY RULES (MANDATORY)


- All generated agents must be instructed to adhere to the "Request Review" policy for critical terminal commands (e.g., file deletion, network requests)

- No agent shall attempt to exfiltrate data or access files outside its assigned directory/workspace scope

- All secrets must use environment variables (never hardcoded)

- Agents must validate inputs to prevent injection attacks


---


## 6. EXPECTED OUTPUT FORMAT


Generate a **folder structure** with individual prompt files:


```
.agent_prompts/
├── README.md                    # Overview and launch instructions
├── 00_LAUNCH_ORDER.md          # Execution sequence and integration steps
├── agent_01_[name].md          # First agent prompt (copy-paste ready)
├── agent_02_[name].md          # Second agent prompt (copy-paste ready)
├── agent_03_[name].md          # Third agent prompt (copy-paste ready)
└── [agent_04_[name].md]        # Optional additional agents
```


### File Content Templates:


#### **README.md** structure:

```markdown
# AGENT ORCHESTRATION PLAN
## Project: [Project Name]

**Shared Workspace:** `/path/to/project/`
**Total Agents:** [N]
**Launch Strategy:** Parallel execution (all agents start simultaneously)

## Quick Start
1. Open [N] Antigravity windows
2. Copy content from `agent_01_[name].md` → Window 1
3. Copy content from `agent_02_[name].md` → Window 2
4. [Repeat for all agents]
5. Launch all agents in parallel
6. Follow integration steps in `00_LAUNCH_ORDER.md`

## Agent Overview
- **Agent 1:** [Name] - [Brief description]
- **Agent 2:** [Name] - [Brief description]
- **Agent 3:** [Name] - [Brief description]
```


#### **00_LAUNCH_ORDER.md** structure:

```markdown
# LAUNCH ORDER & INTEGRATION

## Execution Layers
- **Layer 0 (Foundation):** Agent 1, Agent 2
- **Layer 1 (Core Logic):** Agent 3
- **Layer 2 (Integration):** Agent 4

## Launch Sequence
1. ✅ Start ALL agents simultaneously (they work independently)
2. ✅ Monitor progress in each window
3. ✅ Wait for all agents to complete
4. ✅ Follow integration checklist below

## Integration Checklist
After all agents complete:
1. ✅ [Integration step 1]
2. ✅ [Integration step 2]
3. ✅ [Final testing step]

## Security Notes
- [Security considerations]
- [File access restrictions]
```


#### **agent_XX_[name].md** structure (each file):

```markdown
# AGENT [N]: [Agent Name]

**Layer:** [0/1/2]
**Dependencies:** [None / Interface contracts from Agent X]
**Workspace:** `/path/to/project/`

---

## 📋 COPY THIS PROMPT INTO ANTIGRAVITY WINDOW #[N]

```
You are the [Agent Name] for [project description].

PROJECT SCOPE:
- [Specific deliverables]

INTERFACE CONTRACTS YOU PROVIDE:
- [What this agent exposes to others]
- Example: `function_name(param: type) -> return_type`

INTERFACE CONTRACTS YOU CONSUME:
- [What this agent needs from others]
- **MOCK IMPLEMENTATION (use until integration):**
  ```python
  def mock_function(param):
      # Temporary implementation
      return mock_value
  ```

DELIVERABLES:
1. [File/module name] - [Description]
2. [File/module name] - [Description]

CONSTRAINTS:
- [Technical constraints]
- [Security constraints]
- Work only in assigned workspace
- Use environment variables for secrets

VERIFICATION (test in isolation):
- [Test step 1 using mocks]
- [Test step 2 using mocks]

Start in PLANNING mode, create implementation_plan.md, then proceed to EXECUTION.
```

---

## 🔍 Agent Metadata
- **Output Files:** [List of files this agent creates]
- **Consumes From:** [Other agents this depends on]
- **Provides To:** [Other agents that depend on this]
```


---


## 7. QUALITY CRITERIA


Your orchestration plan will be evaluated on:


1. **Parallelizability:** Can all agents truly start simultaneously?

2. **Mock Completeness:** Are mock implementations provided for all dependencies?

3. **Interface Clarity:** Are contracts (APIs, schemas, signatures) crystal clear?

4. **Isolation:** Can each agent verify its work independently?

5. **Integration Simplicity:** Is the final integration straightforward?


---


## 8. EXAMPLE DEPENDENCY INVERSION


❌ **BAD (Blocking Dependency):**

```
Agent 2: "Wait for Agent 1 to finish database.py, then import it"
```


✅ **GOOD (Non-Blocking with Mock):**

```
Agent 2: "Assume database.py will expose insert_user(data: dict) -> int.
For now, use this mock:

def insert_user(data: dict) -> int:
    print(f"MOCK: Would insert {data}")
    return random.randint(1000, 9999)

Replace with real import during integration phase."
```


---


## NOW EXECUTE


Based on the PROJECT CONTEXT provided:


1. **Create the folder structure:** `.agent_prompts/` in the project workspace

2. **Generate individual files** for each agent prompt (copy-paste ready)

3. **Create supporting files:** README.md and 00_LAUNCH_ORDER.md


### Execution Steps:


```bash
# You should create these files:
mkdir -p .agent_prompts/
touch .agent_prompts/README.md
touch .agent_prompts/00_LAUNCH_ORDER.md
touch .agent_prompts/agent_01_[descriptive_name].md
touch .agent_prompts/agent_02_[descriptive_name].md
touch .agent_prompts/agent_03_[descriptive_name].md
# Add more agent files as needed
```


### File Creation Requirements:


1. **Each `agent_XX_[name].md` file must:**
   - Contain ONLY the prompt text (ready to copy-paste)
   - Start with a clear header identifying the agent
   - Include all sections: PROJECT SCOPE, INTERFACE CONTRACTS, DELIVERABLES, CONSTRAINTS, VERIFICATION
   - Provide mock implementations for all dependencies
   - Be completely self-contained (no references to other files)

2. **README.md must:**
   - Provide project overview
   - List all agents with brief descriptions
   - Include quick start instructions
   - Reference the launch order file

3. **00_LAUNCH_ORDER.md must:**
   - Show execution layers (Layer 0, 1, 2)
   - Provide integration checklist
   - Include security notes

**Output:** A `.agent_prompts/` folder with all files ready for immediate use.
