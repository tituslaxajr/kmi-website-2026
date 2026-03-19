MASTER PROMPT — KAPATID MINISTRY FULL WEBSITE SYSTEM (2026)

Create a modern, Christ-centered, story-driven missionary nonprofit website for Kapatid Ministry with full design system and Supabase-ready CMS architecture.

Core Identity:

Christ-centered, not organization-centered.

Focus on what God is doing.

Documentary / field-report aesthetic.

Visual-first, minimal text.

Reverent, honest, grounded.

Avoid corporate nonprofit style.

Avoid marketing tone.

Emphasize collaboration: beneficiaries, local churches, donors, and Kapatid Ministry as co-laborers in God’s work.

More imagery than paragraphs.

Include cinematic scripture moments across pages.

Typography:

Headings: Inter

Body: DM Sans

Type Scale:

H1: 56/64 Bold

H2: 40/48 SemiBold

H3: 28/36 SemiBold

H4: 20/28 Medium

Body Large: 18/28 Regular

Body: 16/26 Regular

Caption: 14/22

Spacing:

4px base grid

Section spacing:

Desktop 96px

Tablet 64px

Mobile 48px

Grid:

Desktop: 12 column

Tablet: 8 column

Mobile: 4 column

Color System (documentary inspired):

Primary:

Deep Forest #1E3A34

Olive #3F5E45

Warm Sand #EAE4D8

Off White #F7F6F2

Accent:

Muted Gold #C7A34B

Dust Blue #6E8A8F

Clay #A65C3A

Neutral:

Charcoal #1C1C1C

Warm Gray #6B6B6B

Soft Gray #E5E5E5

Create full reusable component system:

Primary / Secondary / Outline buttons

Cards (Story, Partner, Media)

Statistic block (large number + short label)

Scripture block variants (hero, inline, dark section, gold accent)

Image overlay gradients

Tag / filter pills

Section headers

Donation module

Footer system

Light mode default.
Optional dark mode toggle.

WEBSITE STRUCTURE (MULTIPAGE)

Main Public Pages:

Home

Stories

Partners

Impact

Media

Give

About

Contact

Admin (Supabase-powered CMS):

Dashboard

Stories Management

Partner Profiles

Donation Management

Media Manager

Newsletter Setup

Settings

Sticky minimal top navigation.
Transparent over hero.
Mobile hamburger.
Footer with scripture + partner churches + contact.

HOME PAGE

Hero:

Full-width cinematic field image

Dark gradient overlay

Short scripture

Verse reference

Primary button: Read Field Stories

Secondary button: Support the Work

Sections:

Latest Field Stories (3 large image cards)

What God Is Doing (large statistics grid)

Children Supported

Churches Partnered

Communities Reached

Years of Ministry

Featured Local Partner (portrait + short testimony)

How We Collaborate in God’s Work (3 columns)

Local Churches

Sponsors & Donors

Volunteers

Media Highlight (featured YouTube video preview)

Prayer Section (minimal text)

Simple Give Callout

Heavy visuals.
Minimal paragraphs.

STORIES PAGE

Layout:

Cinematic grid or masonry

Large photography

Filters:

Community

Church Partner

Year

Category

Story Card:

Image

Short headline

1-line summary

Date

Partner tag

Story Detail:

Hero image

Title

Short scripture at top

Rich text content

Inline image blocks

Pull quote block

Impact stats sidebar

Partner reference

Related stories

Tone: field reporting, not blog marketing.

PARTNERS PAGE

Grid layout:

Large portrait

Church name

Pastor name

Location

Short mission line

Partner Detail:

Hero photo

Church overview

Pastor bio

Community served

Stories from this church

Prayer needs

Support this partner button

Emphasize collaboration.
Do not glorify organization.

IMPACT PAGE

Sections:

Big Year Overview numbers

Map visualization (communities served)

Annual breakdown toggle

Funding allocation chart

Testimony highlight

Transparency section

Large numbers.
Minimal explanation.
Charts styled in brand colors.

MEDIA PAGE

Featured YouTube video embed

Video grid

Documentary clips

Photo gallery

Dark cinematic section styling

GIVE PAGE

Hero:

Calm background

Short scripture

Donation Module:

One-time

Monthly

Custom amount

Fund categories:

Child Sponsorship

Church Support

Relief

General Fund

Include:

Secure giving note

Transparency message

Impact preview

Prayer encouragement

Simple.
Trust-focused.
No emotional pressure.

ADMIN CMS (SUPABASE READY)

Dashboard:

Total donations

Active sponsors

Stories published

Recent activity

Stories Management:

Add / Edit / Delete

Rich text editor

Image upload

Tag system

Partner relation

Featured toggle

Partners:

CRUD

Upload photo

Link stories

Donations:

Table view

Filter by date

Filter by fund

Export CSV

Media:

Add YouTube link

Upload thumbnail

Categorize

Newsletter:

Email template builder

Select stories

Send test

Send campaign

Minimal, modern admin UI.
Functional.
Light mode default.

SUPABASE DATABASE STRUCTURE

Create relational structure:

Stories:

id

title

slug

summary

content

featured_image

partner_id

category

published

created_at

Partners:

id

church_name

pastor_name

location

mission_statement

bio

image

Donations:

id

donor_name

email

fund_type

amount

payment_method

date

Media:

id

title

youtube_url

category

thumbnail

Newsletter:

id

title

content

sent_date

status

Show relational diagram layout.

Build full high-fidelity UI system, reusable components, responsive layouts, and CMS-ready structures optimized for Supabase integration.