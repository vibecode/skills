---
name: take-the-wheel
description: Lead conversations autonomously by gathering information one question at a time, actively researching (web search, codebase exploration, file reading) after each response, self-assessing clarity on a 1-10 scale, and only executing final work once understanding is complete. Use when user says "take the wheel", "you lead", "drive this", "lead this", "you drive", "take over", "run this", "you're in charge", or asks to be guided through a task step by step. Supports any task type including writing, coding, planning, research, and project setup. Do NOT use for simple one-shot questions, quick lookups, or when the user is clearly directing the work themselves.
---

# Take the Wheel

## Critical Rules

- **One question per reply.** Never ask two questions. Never present a list of questions.
- **Every reply ends with the next question** (until clarity reaches 10/10).
- **Questions must be specific and answerable.** "Who's the target audience — beginners or experienced devs?" not "What are your thoughts on this?"
- **Structure before details.** Ask about goals, audience, and scope before style, formatting, or edge cases.
- **Gather before you build.** Do not start final execution until you have enough clarity. Rate your understanding after each answer.
- **Research proactively.** After every user response, use tool calls to gather context before asking the next question. Don't just ask — investigate.

## Active Research

After every user response, before asking the next question, proactively use tools to build context and inform better questions. This is not optional — always look before you ask.

**What to do after each response:**
- **Web search**: Look up relevant context, best practices, competitor examples, documentation, or current trends related to the task. Use WebSearch for broad discovery and WebFetch for specific URLs the user mentions.
- **Codebase exploration**: Use Explore subagents (Agent tool with subagent_type "Explore") to understand existing code structure, patterns, conventions, and dependencies. Read relevant files directly when you know what to look for.
- **File reading**: Read config files, existing docs, READMEs, package.json, or any files that inform the task.
- **Run commands**: Check installed tools, versions, project structure, git history — anything that gives you context.

**Why:** Better research leads to better questions. Instead of asking "what framework are you using?", read `package.json` and ask "I see you're using Next.js 14 with the app router — should this new page follow the same pattern as `app/dashboard/page.tsx`?"

**How to show it:** Briefly share what you found before asking the next question:

> "I checked the codebase — you're using Express with TypeScript and Prisma for the ORM. Clarity: 6/10. Next: should this new endpoint follow the same controller/service pattern I see in `src/controllers/`?"

## Clarity Rating

After each user answer (and your research), assess: "On a scale of 1-10, how clear is my understanding of what needs to be done?"

- **1-6/10**: Keep asking. You're missing critical information (goal, audience, scope, or key constraints).
- **7-8/10**: You have the big picture but may need 1-2 more questions on specifics. State your clarity rating and what's still unclear.
- **9-10/10**: You have everything you need. Stop asking. State your rating, summarize your understanding, and begin executing.

Display the rating to the user after each answer:

> "Got it. Clarity: 7/10 — I know the goal and audience, but I'm not sure about [X]. Next: [question]"

## Flow

1. User triggers with "take the wheel" (or variant), optionally with a task description
2. **Immediate research**: Read relevant files, search the web, explore the codebase to understand context before even asking question #1
3. **Gather phase**: Ask questions one at a time. After each answer, research again, then rate clarity and ask the next question
4. **Execute phase** (clarity 9-10/10): Summarize your full understanding, confirm it, then do the work
5. Show results. If follow-up decisions arise during execution, ask one question at a time again
6. Summarize: what was done, link to artifacts, confirm completion

## Question Priority

Ask in this order. Skip any question whose answer is obvious from context or your research.

1. **Goal**: What is the desired outcome?
2. **Audience**: Who is this for?
3. **Scope**: What's in and what's out? Any constraints?
4. **Structure**: How should this be organized?
5. **Content**: Specific details, preferences, requirements
6. **Polish**: Tone, formatting, final adjustments

## Task-Specific Guidance

### Code Tasks
- **Research first**: Read the codebase (Explore subagent), check package.json, tsconfig, existing patterns
- First question: clarify what the code should do, informed by what you already found
- Gather: requirements, edge cases, integration points
- Execute: write actual code matching existing patterns, run tests or type checks

### Content Tasks (blog posts, docs, emails, proposals)
- **Research first**: Web search for similar content, competitor examples, current discourse on the topic
- First question: identify the audience, informed by what you found
- Gather: angle, key message, tone, length
- Execute: create the full document once clarity is high

### Planning Tasks (architecture, project plans, strategies)
- **Research first**: Explore existing architecture, read docs, check current state of the project
- First question: clarify the goal and constraints
- Gather: timeline, stakeholders, priorities, dependencies
- Execute: build the full plan with concrete recommendations

### Research Tasks
- **Research first**: Web search to understand the landscape before asking what specifically the user needs
- First question: clarify what decisions the research will inform
- Gather: scope, depth, specific angles
- Execute: comprehensive summary with sources and recommendations

## Handling Edge Cases

- **User gives a vague answer**: Research what they might mean, then rephrase with concrete options. "I searched for X and found two common approaches — [A] and [B]. Which fits better?"
- **Task scope is too large**: Break it into phases. "This is a big one. Let's tackle it in phases. Phase 1: [X]. Sound right?"
- **User goes off-track**: Acknowledge, then steer back. "Good point — I'll factor that in. Back to the main thread: [next question]."
- **User says "just do it" or "you decide"**: Make the decision, state it clearly, and move on.
- **User wants execution sooner**: If the user says "just start" or "that's enough questions", bump clarity to 10/10, state your assumptions, and begin.
- **Research turns up critical info**: Share it proactively. "Heads up — I found [important thing] while researching. This might change the approach. [question about it]"
- **Task is complete**: Don't force more questions. Summarize and wrap up cleanly.

## Examples

Note: These examples are simplified for brevity. Real tasks are typically more complex and require more rounds of research and questioning before reaching 10/10 clarity.

**Example 1: Blog Post**

User: "Take the wheel on this blog post about vibe coding"

Response: [Searches web for recent vibe coding discourse, top articles, common takes] "I did some research — the current conversation is split between 'vibe coding will replace junior devs' hot takes and more nuanced 'it's great for prototyping' perspectives. Most articles target beginners. Clarity: 3/10. First: who's your target reader — are we joining the beginner conversation or writing for experienced devs who are skeptical?"

**Example 2: Code Task**

User: "You lead — I need a new API endpoint for user preferences"

Response: [Reads package.json, explores src/ structure, reads existing controller and route files] "I explored the codebase — you're running Express + TypeScript with Prisma. Routes are in `src/routes/`, controllers in `src/controllers/`, and I see a `user.controller.ts` already. The Prisma schema has a `User` model but no `Preferences` table yet. Clarity: 5/10. First question: should preferences be a separate table with a one-to-one relation to User, or a JSON column on the existing User table?"

**Example 3: Planning Task**

User: "Drive this — we need to migrate from REST to GraphQL"

Response: [Explores codebase for all REST endpoints, checks dependencies, reads existing API structure] "I scanned the codebase. You have 23 REST endpoints across 6 controller files, all using Express. No GraphQL dependencies installed yet. The endpoints are a mix of simple CRUD and a few complex aggregation queries. Clarity: 3/10. First: what's driving this migration — is it frontend performance (over-fetching), developer experience, or something else?"
