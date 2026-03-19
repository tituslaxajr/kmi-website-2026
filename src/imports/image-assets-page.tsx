Create a full Image Asset Manager page inside Admin connected to Supabase Storage bucket "assets".

Route:
/admin/assets

Sidebar item:
Assets

Use existing admin layout and design system.

PAGE STRUCTURE

Header:
Title: Image Assets
Subtitle: Upload and manage reusable images
Button: + Upload Image

IMAGE GRID

Display images from Supabase Storage bucket "assets".

Layout:

Responsive grid

4 columns desktop

2 tablet

1 mobile

Each card:

Image preview

File name

File size

Upload date

Copy URL button

Delete button

Hover:

Slight zoom

Soft shadow

UPLOAD MODAL

Fields:

Drag and drop area

Or click to upload

Optional rename before upload

Upload to:
Bucket: assets
Path:
images/{timestamp}-{filename}

On upload success:
Show toast
Refresh grid

COPY URL FUNCTION

Each image must have:
Copy Public URL button

Generate public URL using Supabase client:

supabase.storage
.from('assets')
.getPublicUrl(path)

Copy to clipboard automatically.

Show toast:
"URL copied"

DELETE FUNCTION

Delete from storage:

supabase.storage
.from('assets')
.remove([path])

Show confirmation modal before deleting.

SEARCH & FILTER

Add:
Search by filename

Optional future:
Filter by folder

EMPTY STATE

If no images:
Illustration
Text: "No assets yet. Upload your first image."

SECURITY

Only authenticated users can:
Upload
Delete

Public cannot access this page.

Rely on existing RLS.

HOW YOU USE THIS SYSTEM

Workflow:

Upload image in /admin/assets

Click Copy URL

Paste URL into:

Story featured_image

Partner image

Media thumbnail

Inline story editor

Done.

OPTIONAL UPGRADE (Highly Recommended)

Instead of manual URL paste, I can help you:

• Add image picker inside story editor
• So you select from asset library directly
• No manual copy-paste

That is cleaner long-term.