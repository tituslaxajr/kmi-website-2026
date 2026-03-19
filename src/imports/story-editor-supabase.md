PROMPT — BUILD SUBSTACK-LIKE STORY EDITOR CONNECTED TO SUPABASE

Upgrade the Admin Story Editor to a modern block-based writing experience similar to Substack or Medium.

Do not redesign global admin UI.
Replace plain textarea with structured rich editor.

Must store data directly in Supabase stories table.

DATABASE REQUIREMENTS

Use existing stories table:

Columns used:

id (uuid)

title (text)

slug (text)

summary (text)

content (jsonb) ← must save here

featured_image (text)

partner_id (uuid)

category (text)

published (boolean)

send_newsletter (boolean)

created_at

Content must be saved as JSON into stories.content.

Do not store HTML.
Do not store plain text.
Use structured JSON blocks.

EDITOR FEATURES

Use block-based editor (TipTap or similar modern editor).

Supported blocks:

Paragraph

H2

H3

Pull Quote

Divider

Image (from Supabase assets bucket)

YouTube Embed

Bullet List

Numbered List

WRITING EXPERIENCE

Editor layout:

Max width 720px

Centered

Generous spacing

Minimal toolbar

Clean white writing canvas

Typing behavior:

Press Enter → new paragraph
Type "/" → open block command menu

Block menu options:

Heading

Image

Quote

Divider

Embed

List

No heavy formatting bar like WordPress.
Keep it clean.

IMAGE INSERTION FLOW

When user selects "Image":

Open Asset Manager modal
Fetch images from Supabase Storage bucket assets
Allow selection
Insert image block with:

{
type: "image",
url: "...",
caption: ""
}

Allow caption editing.

CONTENT JSON STRUCTURE

Save blocks in this format:

[
{ "type": "heading", "level": 2, "content": "Title" },
{ "type": "paragraph", "content": "Text..." },
{ "type": "image", "url": "...", "caption": "Optional" },
{ "type": "quote", "content": "Pull quote text" },
{ "type": "divider" }
]

Store entire array in stories.content.

SAVE LOGIC (CRITICAL)

When user clicks:

Save Draft:
Update stories table:

title

slug

summary

content (JSON)

featured_image

partner_id

category

published = false

When user clicks Publish:
Update stories table:

same fields

published = true

If:
published = true
AND send_newsletter = true
AND no existing newsletter_logs record

Trigger newsletter logic.

SUPABASE INTEGRATION

Use Supabase client.

For new story:

insert into stories

For edit story:

update stories
where id = currentStoryId

Make sure:
content field is passed as JSON object
NOT stringified twice

Example:

supabase
.from('stories')
.update({
title,
slug,
summary,
content: editorJson,
published,
send_newsletter
})
.eq('id', storyId)

PREVIEW MODE

Add toggle:

Edit | Preview

Preview must render content using same renderer as public site.

Render by iterating over JSON blocks.

AUTOSAVE

Optional but recommended:

Autosave every 15 seconds:

If content changed

Save as draft

Show “Saving…” then “Saved”

SLUG GENERATION

Auto-generate slug from title:

Lowercase
Replace spaces with hyphens
Remove special characters

Allow manual override.

Ensure slug uniqueness.

VALIDATION

Title required
Content cannot be empty array
Slug must be unique
If publish and content empty → prevent publish

PUBLIC RENDERER COMPONENT

Create reusable StoryRenderer component:

Iterate blocks:

If type = paragraph → render <p>
If heading → render styled H2/H3
If image → responsive image
If quote → gold left border block
If divider → hr with spacing
If embed → responsive iframe

Use Inter + DM Sans.
Respect design system.

PERFORMANCE

Do not fetch entire stories list inside editor.
Fetch only current story.
Lazy load asset picker.

FINAL EXPERIENCE

Admin writer should feel:

Focused
Calm
Modern
Structured
Like publishing a field report
Not filling a CMS form

Public page should render beautifully from structured JSON.