Extend the CMS to support automatic newsletter sending when a story is published.

Do not redesign UI.
Extend existing story editor.

STORY EDITOR UPDATE

Add new toggle switch:

Label: Send newsletter to subscribers
Description: When this story is published, email subscribers automatically.
Field: send_newsletter (boolean)

Default: OFF

Position:
Below Published toggle.

PUBLISH LOGIC

When:

Story is saved

published = true

send_newsletter = true

No existing newsletter_logs record for this story

Then:

Fetch all confirmed subscribers

Generate email template

Send email to subscribers

Insert record into newsletter_logs

If newsletter_logs already contains story_id:
Do not send again.

EMAIL TEMPLATE DESIGN

Use branded HTML template:

Header:
Kapatid Ministry logo

Hero:
Story featured image

Content:
Story title
Summary
Read More button (link to story URL)

Footer:
Unsubscribe link
Scripture line
Contact info

Tone:
Christ-centered
Field-report style
Minimal marketing tone

SUBSCRIBE FORM (PUBLIC)

Add Newsletter Subscription section:

Fields:
Email
Subscribe button

On submit:
Insert into subscribers table
Set confirmed = false (optional double opt-in later)

Show message:
Thank you for subscribing.

ADMIN — SUBSCRIBERS PAGE

Add new Admin sidebar item:
Subscribers

Page:
Table view:
Email
Confirmed
Date
Delete button

Export CSV button

EMAIL SENDING METHOD

Use one of:

Option A (Recommended):
Resend API

Option B:
Supabase Edge Function

Implement server-side email sending.
Do NOT send from frontend.

EDGE FUNCTION LOGIC

If using Supabase Edge Function:

Trigger when story is published and send_newsletter = true.

Process:

Fetch story

Fetch subscribers

Loop send email

Insert into newsletter_logs

Ensure idempotency:
Do not send twice.

SECURITY

Public:
Can subscribe

Authenticated:
Can view subscribers
Can delete subscriber

Only server:
Can send emails

ARCHITECTURE SUMMARY

User publishes story
Toggle ON
System sends email
Newsletter log prevents duplicate sending

Clean.
Automated.
Safe.

IMPORTANT RECOMMENDATION

Do NOT try to send thousands of emails directly from frontend.

Use:

Resend (simplest)