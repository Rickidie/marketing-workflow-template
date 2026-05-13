# Platform Reference

**Template note**: This file provides operational specificity about your product — modules, nodes, workflow templates, user roles, and integrations. It is loaded when content needs to be operationally precise about product capabilities, rather than relying on high-level descriptions. Replace every placeholder with your actual product details.

---

## Platform Architecture Overview

[2-3 sentences describing how your product is structured at a high level — e.g. is it a workflow engine, a data platform, a modular suite? What is the core unit of work?]

---

## Modules

List each major module with its name as it appears in the product UI, a brief description, and the primary user of that module.

| Module name (as in UI) | What it does | Primary user |
|------------------------|-------------|-------------|
| [Module 1] | [Description] | [Role who uses it] |
| [Module 2] | [Description] | [Role who uses it] |
| [Module 3] | [Description] | [Role who uses it] |
| [Module 4] | [Description] | [Role who uses it] |
| [Module 5] | [Description] | [Role who uses it] |

---

## Workflow Nodes / Building Blocks

[If your product uses a node-based or composable workflow builder, list the available node types here. These names should be used verbatim in product content.]

| Node / component name | Type | What it does |
|----------------------|------|-------------|
| [Node 1] | [Trigger / Action / Condition / etc.] | [Description] |
| [Node 2] | [Type] | [Description] |
| [Node 3] | [Type] | [Description] |

---

## Workflow Templates

[List the pre-built workflow templates your platform ships with, or that you commonly configure for clients.]

| Template name | Use case | Primary audience |
|--------------|---------|-----------------|
| [Template 1] | [What problem it solves] | [Who uses it] |
| [Template 2] | [What problem it solves] | [Who uses it] |
| [Template 3] | [What problem it solves] | [Who uses it] |

---

## User Roles and Permissions

| Role | What they can do | Typical job title |
|------|-----------------|------------------|
| [Role 1, e.g. Admin] | [Permissions summary] | [e.g. IT Admin, Ops Lead] |
| [Role 2, e.g. Analyst] | [Permissions summary] | [e.g. Compliance Analyst] |
| [Role 3, e.g. Reviewer] | [Permissions summary] | [e.g. Senior Manager] |
| [Role 4, if applicable] | [Permissions summary] | [Job title] |

---

## Integrations (technical detail)

For each integration, provide the technical method and any notable constraints.

| Integration | Method | Data direction | Notes |
|-------------|--------|---------------|-------|
| [Integration 1] | [REST API / Webhook / Native connector / SFTP] | [Inbound / Outbound / Bidirectional] | [Any constraint or setup note] |
| [Integration 2] | [Method] | [Direction] | [Notes] |
| [Integration 3] | [Method] | [Direction] | [Notes] |

---

## Data Model

[Describe the core data entities in your platform — what the system stores and how they relate. This is used when content needs to be precise about how data flows or is structured.]

| Entity | Description | Key fields |
|--------|-------------|-----------|
| [Entity 1, e.g. Case] | [What it represents] | [Key fields — e.g. status, assigned_to, risk_score] |
| [Entity 2, e.g. Alert] | [What it represents] | [Key fields] |
| [Entity 3] | [What it represents] | [Key fields] |

---

## AI / Automation Components

[List the specific AI or automation components in the platform — named as they appear in the product or documentation.]

| Component | What it does | Input | Output |
|-----------|-------------|-------|--------|
| [AI component 1] | [Description] | [What data it consumes] | [What it produces] |
| [AI component 2] | [Description] | [Input] | [Output] |

---

## Proprietary Concepts / Frameworks

[If your platform has proprietary methodology names (e.g. your own framework, a named scoring system, a governance model), define them here so content uses them consistently.]

### [Framework / Concept Name 1]

[2-3 sentence definition. What it is, what problem it solves, and why it is distinct from a generic alternative.]

### [Framework / Concept Name 2]

[2-3 sentence definition.]
