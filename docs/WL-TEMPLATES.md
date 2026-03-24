# WL Documentation Templates

Fill in this file, then hand it back to Claude to build the feature.

## How this works

When you create a **new** WL item and select a type, the sections below are
pre-loaded into the documentation body. Existing items are never affected.

Each type has a list of **sections** (the heading panels in the doc body).
For each section you can optionally add a **hint** — a short placeholder line
shown inside the empty section to guide what to write there.

---

## Rules / constraints

- Section titles must be short (1–4 words work best in the UI).
- Hints are optional — leave blank if none needed.
- Sections marked `[locked]` cannot be renamed or deleted by the user
  (use this sparingly — only for sections that must always exist, like Overview).
- All other sections are editable/deletable as normal.
- Types with no template defined keep the current default:
  Overview / Notes / Next steps.

---

## Templates

### Halo

> ITSM request or incident raised via Halo.

| # | Section title       | Hint (optional)              | Locked? |
| - | ------------------- | ---------------------------- | ------- |
| 1 | Overview            |                              | yes     |
| 2 | Investigation       | What have you found so far?  |         |
| 3 | Build/Solution      | Document what you have done. |         |
| 4 | Final Communication | The email sent to the user   |         |

---

### Sherlock

> Sherlock reporting platform work.

| # | Section title  | Hint (optional) | Locked? |
| - | -------------- | --------------- | ------- |
| 1 | Overview       |                 | yes     |
| 2 | Investigation  |                 |         |
| 3 | Build/Solution |                 |         |
| 4 |                |                 |         |

---

### Ad-hoc

> One-off analysis or ad-hoc request.

| # | Section title | Hint (optional) | Locked? |
| - | ------------- | --------------- | ------- |
| 1 | Overview      |                 | yes     |
| 2 |               |                 |         |
| 3 |               |                 |         |

---

### CMT

> CMT (Clinical Management Tool) work.

| # | Section title      | Hint (optional)                                                                               | Locked? |
| - | ------------------ | --------------------------------------------------------------------------------------------- | ------- |
| 1 | Content Management | Document Analyst and Ticket IDs<br />Ensure the check list for RW Templates, etc is followed. | yes     |
| 2 | Support            | Any questions from Analysts                                                                   |         |
| 3 | Follow-ups         | Agree dates and times to send the tickets to TST/SUP/REL/PRD.                                 |         |
| 4 |                    |                                                                                               |         |
| 5 |                    |                                                                                               |         |

---

### Nova

> Nova platform work.

| # | Section title | Hint (optional) | Locked? |
| - | ------------- | --------------- | ------- |
| 1 | Overview      |                 | yes     |
| 2 | What Changed  |                 |         |
| 3 | Build         |                 |         |

---

### Upgrade

> Epic upgrade cycle work.

| # | Section title   | Hint (optional)                                                          | Locked? |
| - | --------------- | ------------------------------------------------------------------------ | ------- |
| 1 | Version         |                                                                          | yes     |
| 2 | Allocated Novas | List of Novas and URLs to work on - link to any Nova type documentation. |         |
| 3 | Link to Nova    | Link to Epic Nova website                                                |         |

---

### Meetings

> Meeting notes and actions.

| # | Section title  | Hint (optional) | Locked? |
| - | -------------- | --------------- | ------- |
| 1 | Attendees      |                 | Yes     |
| 2 | <br />Overview |                 | yes     |
| 3 | Discussion     |                 |         |
| 4 | Follow-ups     |                 |         |

---

### Training

> Training sessions, courses, certifications.

| # | Section title    | Hint (optional)                                                                                                                          | Locked? |
| - | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1 | Certification    |                                                                                                                                          | yes     |
| 2 | Admin            | Seection to document any credentials to environments or use IDs for training.                                                            |         |
| 3 | Chapter (1 to n) | Each chapter will allow to take notes. At the end of this chapter a summary part should be there so we can summarise what we've learned) |         |
| 4 | Review and MCQ   | A Section to add MCQ to review and prepare for exams.                                                                                    |         |

---

### SOP

> Standard Operating Procedure writing.

| # | Section title | Hint (optional) | Locked? |
| - | ------------- | --------------- | ------- |
| 1 | Overview      |                 | yes     |
| 2 |               |                 |         |
| 3 |               |                 |         |

---

### Report

> Report build or configuration.

| # | Section title | Hint (optional) | Locked? |
| - | ------------- | --------------- | ------- |
| 1 | Overview      |                 | yes     |
| 2 |               |                 |         |
| 3 |               |                 |         |

---

### Research

> Background research or investigation.

| # | Section title | Hint (optional) | Locked? |
| - | ------------- | --------------- | ------- |
| 1 | Overview      |                 | yes     |
| 2 |               |                 |         |
| 3 |               |                 |         |

---

### Other / Uncategorised

> These two types share the same default template if you want to customise them.
> Leave blank to keep the app default (Overview / Notes / Next steps).

| # | Section title | Hint (optional) | Locked? |
| - | ------------- | --------------- | ------- |
| 1 |               |                 |         |
| 2 |               |                 |         |
| 3 |               |                 |         |

---

## Example — filled in

Here is an example of what a filled-in template looks like,
so you can see the format before you fill in the real ones above.

### Example: Incident

| # | Section title | Hint (optional)                        | Locked? |
| - | ------------- | -------------------------------------- | ------- |
| 1 | Overview      | What is the issue? Who reported it?    | yes     |
| 2 | Impact        | Which users / reports are affected?    |         |
| 3 | Investigation | Steps taken, findings, queries run     |         |
| 4 | Resolution    | What fixed it? Any config change made? |         |
| 5 | Next steps    | Follow-up actions or monitoring needed |         |
