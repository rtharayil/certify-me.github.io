# SkillStory asset inventory

## Permission and product relationship

The owner identifies skillstory.org as their website and authorizes its public content and visual assets as source material for CertifyMe. SkillStory is the first-party product experience supporting this institutional Skill Passport solution. Public media is not relabeled as a third-party service or rebuilt as a fabricated interface. This inventory is an internal document, excluded from the Jekyll public build.

## Research coverage

The final crawl inspected 60 distinct public URLs across 61 requests, including all six required pages, attestation, institutional licensing, CV and portfolio templates, resource articles, sitemap/navigation links, image references and two first-party stylesheets. All requested pages returned HTTP 200. Full source findings and original image references are retained privately under .local/reports/skill-passport/.

## Downloaded product assets

All 17 selected assets were downloaded from the original SkillStory URLs before implementation. Dimensions were inspected from decoded files. Original images retain their content and proportions; WebP encoding was optimized at high quality. Product assets are displayed as supplied media, not simulated live verification or institutional results.

| Filename / original URL | Original dimensions | Local dimensions | Used on page / purpose | Reuse method | UI / background suitability |
| --- | --- | --- | --- | --- | --- |
| [student-learner-record-ananya.webp](https://skillstory.org/assets/images/student-learner-record-ananya.webp) | 1178 × 1335 | 1178 × 1335 | Research candidate only; not referenced by the page | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original product illustration or workflow; use as foreground media |
| [student-skill-passport-overview.webp](https://skillstory.org/assets/images/student-skill-passport-overview.webp) | 800 × 916 | 800 × 916 | Seven contents of a learner record | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original product illustration or workflow; use as foreground media |
| [skill-passport-card-phone.webp](https://skillstory.org/assets/images/skill-passport-card-phone.webp) | 887 × 887 | 887 × 887 | Research candidate only; not referenced by the page | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original UI/product or template composition; not a background |
| [skill-passport-left.webp](https://skillstory.org/assets/images/skill-passport-left.webp) | 800 × 916 | 800 × 916 | Research candidate only; not referenced by the page | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original product illustration or workflow; use as foreground media |
| [skill-passport-right.webp](https://skillstory.org/assets/images/skill-passport-right.webp) | 800 × 900 | 800 × 900 | Definition: connected learner record | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original product illustration or workflow; use as foreground media |
| [skill-passport-attestation-workflow.webp](https://skillstory.org/assets/images/skill-passport-attestation-workflow.webp) | 800 × 902 | 800 × 902 | Attestation and educator approval | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original product illustration or workflow; use as foreground media |
| [attestation-right.webp](https://skillstory.org/assets/images/attestation-right.webp) | 800 × 902 | 800 × 902 | Public record verification | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original product illustration or workflow; use as foreground media |
| [cv-portfolio-showcase.webp](https://skillstory.org/assets/images/cv-portfolio-showcase.webp) | 900 × 591 | 900 × 591 | Projects and evidence | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original UI/product or template composition; not a background |
| [skills-showcase.webp](https://skillstory.org/assets/images/skills-showcase.webp) | 900 × 604 | 900 × 604 | Research candidate only; not referenced by the page | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original product illustration or workflow; use as foreground media |
| [clr-learner-record.webp](https://skillstory.org/assets/images/clr-learner-record.webp) | 800 × 600 | 800 × 600 | Comprehensive Learner Record | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original product illustration or workflow; use as foreground media |
| [cv-template-1.webp](https://skillstory.org/assets/images/cv-template-1.webp) | 600 × 849 | 600 × 849 | CV and full-size CV template | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original UI/product or template composition; not a background |
| [portfolio-tpl-classic-light.webp](https://skillstory.org/assets/images/portfolio-tpl-classic-light.webp) | 680 × 440 | 680 × 440 | Portfolio presentation and CV context | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original UI/product or template composition; not a background |
| [learner-journey.webp](https://skillstory.org/assets/images/learner-journey.webp) | 836 × 941 | 836 × 941 | Learner ownership and lifelong record | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original product illustration or workflow; use as foreground media |
| [skill-passport-career-opportunities.webp](https://skillstory.org/assets/images/skill-passport-career-opportunities.webp) | 800 × 918 | 800 × 918 | Learning to workforce opportunity | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original product illustration or workflow; use as foreground media |
| [skillstory-open-standards.webp](https://skillstory.org/assets/images/skillstory-open-standards.webp) | 834 × 821 | 834 × 821 | Research candidate only; not referenced by the page | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original product illustration or workflow; use as foreground media |
| [certifyme-hero.webp](https://skillstory.org/assets/images/certifyme-hero.webp) | 544 × 669 | 544 × 669 | Research candidate only; not referenced by the page | No crop or resizing; aspect ratio preserved; high-quality local WebP | Original product illustration or workflow; use as foreground media |
| [skill-passport-mobile.webp](https://skillstory.org/assets/images/skill-passport-card-phone.webp) | 887 × 887 | 416 × 755 | Hero: mobile learner-record UI | Crop of mobile product UI from original SkillStory composition; no interface alteration; 430,108 to 846,863: phone UI extracted, all phone content retained | Original UI/product or template composition; not a background |

The hero phone crop removes surrounding globe/marketing callouts so the mobile UI is readable. It retains the entire phone and underlying interface content, without editing its fields, labels, identity markers, counts or branding. No screenshot was stretched. Public UI images retain their supplied branding. The standards image with embedded numeric claims and certification labels was researched but not used.

## Product-media access

The hero phone, attestation workflow, portfolio and CV include keyboard-accessible full-size asset links. Non-hero images are lazy-loaded and all images have intrinsic dimensions and informative alternative text. No replacement illustrations, stock photos or generated screenshots were introduced.

## Videos and other resources

The public markup and first-party main.js exposed a YouTube channel link, but no specific Skill Passport video, video embed or MP4. Google Tag Manager was the only iframe. No unrelated video was substituted and no unverified product-video URL was invented. CV PDF resources and portfolio/CV templates were inspected as resources; the institution-facing page does not copy consumer prices or promise universal template acceptance.
