#!/usr/bin/env python3
"""Build the standalone partner working brief. No live CRM writes or dependencies."""
from pathlib import Path
import html, json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'static/fund-ii-working-session'
OUT.mkdir(parents=True, exist_ok=True)
def e(v): return html.escape(str(v), quote=True)
def person(name, **kw): return dict(name=name, **kw)
def notion(id): return 'https://app.notion.com/p/' + id

groups = [{'id': 'more-time',
  'section': 'returning',
  'title': 'They want more time with us',
  'short': 'More time together',
  'read': 'These LPs are signaling that more time together could be useful.',
  'objective': 'Build current Fund II conviction through a conversation or experience that addresses what '
               'they actually want to understand.',
  'work': 'Propose the interaction and what it should accomplish. Use a next step they have already '
          'suggested when there is one.',
  'align': 'Agree the right format, substance and partner involvement.',
  'people': [{'name': 'Ignacio Rosales'},
             {'name': 'Kim Bertz'},
             {'name': 'Kurt Read'},
             {'name': 'Darren Fredette'},
             {'name': 'Roberto Viviani'}]},
 {'id': 'independent',
  'section': 'returning',
  'title': 'They may decide on their own conviction',
  'short': 'Independent re-up decisions',
  'read': 'Gadi believes these LPs can evaluate Fund II without waiting for external fundraising momentum.',
  'objective': 'Open direct re-up conversations with a deliberately chosen first group.',
  'work': 'Choose the first few names, explain why now, and bring an appropriate ask backed by the current '
          'Fund II case.',
  'align': 'Choose where to start and calibrate the ask. Independence is not evidence that someone is '
           'already ready to invest.',
  'people': [{'name': 'Marc Fielding'},
             {'name': 'Charles Nelsen'},
             {'name': 'Jonathan Siegel'},
             {'name': 'Michael Bhagat'},
             {'name': 'Keith Guerin'},
             {'name': 'Nico Bistolfi'},
             {'name': 'Justin Alexander'},
             {'name': 'Jonny Price'},
             {'name': 'Casey Melcher'},
             {'name': 'Daniel Correa'},
             {'name': 'Bou Berendsen'},
             {'name': 'Thaloz'},
             {'name': 'Joshua Harvey'}]},
 {'id': 'momentum',
  'section': 'returning',
  'title': 'Momentum or timing may matter',
  'short': 'Momentum & timing',
  'read': 'Progress elsewhere may influence these LPs’ decisions. Some dependencies are stated; others '
          'remain Gadi’s working hypotheses.',
  'objective': 'Identify what would help each person decide, and what can move before that condition is met.',
  'work': 'Distinguish a stated condition from a relationship read. Name the relevant person, evidence or '
          'real milestone.',
  'align': 'Test which dependencies warrant waiting and which permit a conversation now.',
  'people': [{'name': 'Aayush Phumbhra'},
             {'name': 'Joao Pedro Vasconcellos'},
             {'name': 'Sergio Cantarovici', 'via': 'Guido Grinbaum'},
             {'name': 'Matias Colotuzzo', 'via': 'Santi Pehar'},
             {'name': 'Bernhard Gapp'}]},
 {'id': 'returning-intent',
  'section': 'returning',
  'title': 'There are indications of a yes',
  'short': 'Intent to make concrete',
  'read': 'Gadi’s “kind of soft committed” group. The statements, amounts and conditions differ.',
  'objective': 'Establish exactly what has been agreed and resolve the remaining amount, timing, condition '
               'or paperwork.',
  'work': 'Bring the latest commitment statement. Keep any proposed increase separate from an existing '
          'agreement.',
  'align': 'Decide where we need a new investment decision and where we should simply progress the one '
           'already made.',
  'people': [{'name': 'Santiago Pehar'},
             {'name': 'Alan Descoins'},
             {'name': 'Ariel Muslera'},
             {'name': 'Matthew Kruger'},
             {'name': 'Guido Grinbaum'},
             {'name': 'Ariel Arrieta'},
             {'name': 'Power Law Capital'},
             {'name': 'Daniel Jabbour'}]},
 {'id': 'signed',
  'section': 'returning',
  'title': 'Reported signed',
  'short': 'Signed',
  'read': 'Alan Brande is signed, per Gadi’s October 1 update.',
  'objective': 'Complete any remaining administration and keep the LP informed.',
  'work': 'Check the remaining fund-side process and give it an owner.',
  'align': 'Handle exceptions; signing, acceptance and funding are separate facts.',
  'people': [{'name': 'Alan Brande'}]},
 {'id': 'unclassified',
  'section': 'returning',
  'title': 'Their place in the approach is still open',
  'short': 'Still to classify',
  'read': 'Gadi has not yet settled the best approach to these relationships.',
  'objective': 'Learn enough about the most relevant names to decide whether and how to pursue them now.',
  'work': 'Identify the missing context and the simplest way to recover it. Start with the names that could '
          'change the first wave.',
  'align': 'Choose which uncertainties deserve attention now.',
  'people': [{'name': 'Guillermo Rauch'},
             {'name': 'Enzo Cavalie'},
             {'name': 'Andres Perez Soderi'},
             {'name': 'Kevin Novak'},
             {'name': 'Ro Gupta'},
             {'name': 'Susan Liu'},
             {'name': 'Zack Rosen'}]},
 {'id': 'dormant',
  'section': 'returning',
  'title': 'Paused',
  'short': 'Dormant',
  'read': 'Salomon Abauat is dormant, per Gadi.',
  'objective': 'Reopen only if there is a meaningful reason.',
  'work': 'Preserve why the relationship is paused and identify a real reopening condition, if one exists.',
  'align': 'Decide whether anything has changed enough to justify attention.',
  'people': [{'name': 'Salomon Abauat'}]},
 {'id': 'declined',
  'section': 'returning',
  'title': 'Declined Fund II',
  'short': 'Declined',
  'read': 'Juan Saavedra declined Fund II, per Gadi.',
  'objective': 'Respect the decision and maintain the relationship appropriately.',
  'work': 'Preserve the reason if known. Revisit only if relevant circumstances change.',
  'align': 'Keep this outside the active push unless new context warrants a review.',
  'people': [{'name': 'Juan Saavedra'}]},
 {'id': 'new-momentum',
  'section': 'other',
  'title': 'New relationships with momentum',
  'short': 'New momentum',
  'read': 'Gadi sees current openings worth developing.',
  'objective': 'Convert the actual investment signal into the next appropriate fund conversation or '
               'execution step.',
  'work': 'Fulfill what was requested or promised. Identify whether the open question is appetite, amount, '
          'diligence or documents.',
  'align': 'Calibrate the next ask to the evidence, not the age of the relationship.',
  'people': [{'name': 'Joao Vergacas'}, {'name': 'Doug Chertok'}, {'name': 'Arthur Costa'}]},
 {'id': 'old-intent',
  'section': 'other',
  'title': 'Older soft commitments to revisit',
  'short': 'Older intent',
  'read': 'Earlier intentions have lost momentum, in Gadi’s current assessment.',
  'objective': 'Establish whether the intention still stands and what would make it actionable now.',
  'work': 'Bring the original statement and date, then propose a direct but relationship-appropriate '
          'reconfirmation.',
  'align': 'Decide whether the work is reconfirmation, renewed conviction, or an intentional pause.',
  'people': [{'name': 'Amadeo Pellicce'}, {'name': 'Carlos Costa'}]},
 {'id': 'onboarding',
  'section': 'other',
  'title': 'A recent yes, with onboarding unanswered',
  'short': 'Onboarding unanswered',
  'read': 'Florian verbally committed recently, but is not responding to Passthrough onboarding, per Gadi.',
  'objective': 'Resolve what is preventing the agreed investment from progressing.',
  'work': 'Choose a useful personal follow-up that can surface an administrative issue, timing, an '
          'unanswered question or changed intent.',
  'align': 'Set an appropriate approach and reassessment point. Silence alone does not tell us the cause.',
  'people': [{'name': 'Florian Hagenbuch'}]},
 {'id': 'vcs',
  'section': 'other',
  'title': 'Other VCs with momentum',
  'short': 'VC relationships',
  'read': 'These relationships deserve attention, but they involve different people, vehicles and decisions.',
  'objective': 'Establish the actual investment path and keep useful collaboration distinct from capital.',
  'work': 'Identify who invests and decides, what is unresolved, and the purpose of each upcoming '
          'conversation.',
  'align': 'Resolve consequential partnership choices together and give each partner a useful role.',
  'people': [{'name': 'Ryan Bloomer'},
             {'name': 'Carla Barone'},
             {'name': 'ONEVC / Arthur', 'via': 'Next week, per Gadi'},
             {'name': 'Base10'},
             {'name': 'Long Journey Ventures'}]}]

# Only the distilled, shareable briefs belong in this repository. Raw research stays local.
briefs = json.loads((ROOT / 'tools/fund_ii_relationship_briefs.json').read_text())
by_name = {p['name']: p for p in briefs}
assert len(by_name) == len(briefs) == 53

def enrich(p, id, group):
 p.update(by_name[p['name']])
 p.update(id=id, group=group, next=p['approach'])
 p['url'] = next((s['url'] for s in p['sources'] if 'notion.com' in s['url']), '')
 return p

for g in groups:
 for i,p in enumerate(g['people']):
  enrich(p, g['id'] + '-' + str(i+1), g['short'])
diego = enrich(dict(name='Diego Fleischmann'), 'earlier-map-1', 'From the earlier map')
people = [p for g in groups for p in g['people']] + [diego]
assert {p['name'] for p in people} == set(by_name)

def render_person(p):
 via=f'<span class="via">{e(p["via"])}</span>' if p.get('via') else ''
 fields=[('relationship','Relationship'),('latest','Latest'),('important','What matters'),('approach','Approach to discuss')]
 rows=''.join(f'<div class="brief-row brief-{key}"><dt>{label}</dt><dd>{e(p[key])}</dd></div>' for key,label in fields)
 sources=''.join(f'<a class="source-link" href="{e(s["url"])}" target="_blank" rel="noopener noreferrer">{e(s["label"])} ↗</a>' for s in p['sources'])
 coverage=f'<p class="coverage-note">{e(p["coverage_note"])}</p>' if p.get('coverage_note') else ''
 search=' '.join([p['name'],p.get('via',''),p['relationship']])
 return f'''<div class="person" id="{p['id']}" data-search="{e(search)}"><details><summary><span class="person-name">{e(p['name'])}{via}</span><span class="person-indicator">Brief <span aria-hidden="true">+</span></span></summary><div class="person-body"><dl class="relationship-brief">{rows}</dl><div class="brief-evidence"><p>{e(p['evidence'])}</p>{coverage}<div class="brief-sources">{sources}</div></div></div></details><label class="pick" title="Add {e(p['name'])} to the first pass"><input type="checkbox" data-pick="{p['id']}" aria-label="Add {e(p['name'])} to first pass"><span class="pick-mark" aria-hidden="true">+</span></label></div>'''

def render_group(g, i):
 return f'''<article class="bucket" id="{g['id']}" data-group="{g['id']}"><header class="bucket-head"><span class="bucket-index">{i:02}</span><div><p class="eyebrow">{e(g['short'])} <span class="count">{len(g['people'])}</span></p><h3>{e(g['title'])}</h3></div></header><p class="bucket-read">{e(g['read'])}</p><div class="bucket-purpose"><span class="small-label">What the work should accomplish</span><p>{e(g['objective'])}</p></div><div class="people">{''.join(render_person(p) for p in g['people'])}</div><details class="approach"><summary>Approach to discuss <span aria-hidden="true">↗</span></summary><div><p><strong>Gadi’s preparation.</strong> {e(g['work'])}</p><p><strong>Agree together.</strong> {e(g['align'])}</p></div></details></article>'''

nav=[('purpose','The purpose'),('returning','Returning LPs'),('other','Other active relationships'),('sequence','What comes first'),('decisions','Our first pass'),('sources','Sources & scope')]
navhtml=''.join(f'<a href="#{id}"><span>{i:02}</span>{title}</a>' for i,(id,title) in enumerate(nav,1))
options=''.join(f'<option value="{id}">{title}</option>' for id,title in nav)
buckets=''.join(f'<a href="#{g["id"]}" data-group-link="{g["id"]}">{e(g["short"])} <span>{len(g["people"])}</span></a>' for g in groups)
returning=''.join(render_group(g,i) for i,g in enumerate(groups,1) if g['section']=='returning')
other=''.join(render_group(g,i) for i,g in enumerate(groups,1) if g['section']=='other')
serialized=json.dumps(people,ensure_ascii=False).replace('</','<\\/')
page=f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="referrer" content="no-referrer"><meta name="description" content="Antigravity Fund II — a working session for Gadi and Daniel."><title>Fund II — The next conversations</title><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%231d3638'/%3E%3Ctext x='32' y='46' font-size='47' text-anchor='middle' fill='%23f5f2e9' font-family='Georgia'%3Ea%3C/text%3E%3C/svg%3E"><link rel="stylesheet" href="style.css"></head>
<body><a class="skip" href="#main">Skip to the working brief</a><div class="topbar"><a class="brand" href="#top">antigravity<span> / Fund II</span></a><div class="topmeta"><span class="unlisted">Unlisted working brief</span><span>01 October 2026</span><button type="button" id="print">Print / PDF</button></div><div id="progress"></div></div>
<header class="hero" id="top"><div class="hero-inner"><div><p class="eyebrow">Gadi + Daniel / Partner working session</p><h1>The next<br><em>conversations.</em></h1><p class="hero-deck">A relationship map, an approach for each group,<br class="desktop"> and a deliberate first pass at Fund II.</p><a class="hero-link" href="#returning">Go through the relationships <span>↓</span></a></div><div class="hero-note"><span class="eyebrow">The work ahead</span><p>What’s missing between <br>this relationship <br>and an investment?</p><div class="hero-path"><span>Build conviction</span><span>Ask for a decision</span><span>Follow through</span></div><p class="hero-caption">Different next steps. One fundraising purpose.</p></div></div><div class="hero-bottom"><span>A starting point for discussion</span><span>Context → approach → sequence</span></div></header>
<div class="layout"><aside class="sidebar"><p class="eyebrow">In this session</p><nav aria-label="Chapters">{navhtml}</nav><div class="sidebar-note">The groups are Gadi’s current read. The first pass and schedule are ours to agree.</div><a class="queue-link" href="#decisions">First pass <span data-selected-count>0</span> <span aria-hidden="true">↗</span></a></aside><main id="main"><div class="mobile-nav"><label for="jump">Jump to</label><select id="jump">{options}</select></div>
<section id="purpose" class="chapter"><div class="section-heading"><span>01</span><h2>A clear purpose.<br>An appropriate ask.</h2></div><p class="lead">The goal is to raise Fund II. This session is about choosing whom we pursue first, what each conversation should accomplish, and how progress with one group can strengthen the next.</p><div class="principles"><div><span class="small-label">Context</span><h3>What is missing?</h3><p>Conviction, current appetite, an amount, timing, a condition, or unfinished paperwork.</p></div><div><span class="small-label">Approach</span><h3>What should we propose?</h3><p>A direct investment ask where it fits. A useful intermediate conversation or experience where it helps.</p></div><div><span class="small-label">Sequence</span><h3>Why this person now?</h3><p>A reason to start, a real dependency to resolve, or a deliberate reason to wait.</p></div></div><div class="working-rule"><p>“Here’s what I think is missing, why I think that, and what I’d do next.”</p><span>Gadi brings relationship context and an initial view. We test the approach, choose priorities and divide the work together.</span></div><p class="small">The map below preserves Gadi’s October 1 groupings. They can overlap; they are not CRM stages or a forecast. Expand a name for the relationship, latest exchange, important context and a proposed approach. Add names to the first pass as we decide where to focus.</p></section>
<div class="map-tools"><div><label for="search">Find a relationship</label><input id="search" type="search" placeholder="Name, firm or connection…" autocomplete="off"></div><p id="search-status" aria-live="polite">All relationships in Gadi’s map</p><button id="clear-search" type="button" hidden>Clear search</button></div>
<section id="returning" class="chapter relationship-section"><div class="section-heading"><span>02</span><h2>Start with the people<br>who already know us.</h2></div><p class="lead">Our Fund I LP base contains several different kinds of work. The grouping is a starting hypothesis; the remaining investment question determines the approach.</p><div class="bucket-nav" aria-label="Relationship groups">{''.join(f'<a href="#{g["id"]}">{e(g["short"])} <span>{len(g["people"])}</span></a>' for g in groups if g['section']=='returning')}</div><div class="buckets">{returning}</div></section>
<section id="other" class="chapter relationship-section"><div class="section-heading"><span>03</span><h2>Keep the other<br>openings moving.</h2></div><p class="lead">New interest, older intentions and VC relationships can progress alongside returning LPs. Each needs a clear read of the investment decision in front of us.</p><div class="buckets">{other}</div><article class="bucket carryover" id="earlier-map"><header class="bucket-head"><div><p class="eyebrow">From the earlier map</p><h3>One more conversation to reopen</h3></div></header><p class="bucket-read">Diego was on the earlier list. Keep him in view while we decide this first pass.</p><div class="people">{render_person(diego)}</div></article></section>
<section id="sequence" class="chapter"><div class="section-heading"><span>04</span><h2>Decide what comes first.</h2></div><p class="lead">A proposed starting sequence to test together. We can move several kinds of work at once.</p><div class="sequence-list"><article><span>01</span><div><h3>Follow the clearest openings.</h3><p>People who have said yes, asked for something specific, or already have a conversation approaching. Resolve what remains instead of reopening every question.</p><p class="examples">Examples to consider: Doug · Guido · Kim · Long Journey</p></div></article><article><span>02</span><div><h3>Choose our first independent re-ups.</h3><p>Select a manageable group who can evaluate Fund II on their own conviction. Agree why they come first and what we will ask.</p><p class="examples">Select from the independent returning-LP group.</p></div></article><article><span>03</span><div><h3>Test the supposed dependencies.</h3><p>Aayush may respond to a real decision milestone; that is Gadi’s read. Sergio explicitly linked his participation to Guido’s. Establish what each person can decide now and what actually needs to happen first.</p><p class="examples">Current appetite can be established before a later decision milestone.</p></div></article></div><div class="two-notes"><div><span class="small-label">Relationship work</span><p>Name what additional time would help the LP understand, experience or resolve. With Kim, a shared conversation is a concrete proposal worth deciding on.</p></div><div><span class="small-label">A choice to revisit</span><p>For already committed LPs, is waiting for more closing momentum before progressing signatures still the right policy? Separate our choice from an LP’s actual condition.</p></div></div></section>
<section id="decisions" class="chapter"><div class="section-heading"><span>05</span><h2>Our first pass.</h2></div><p class="lead">Choose the relationships, agree the next work, and give it an owner and a date.</p><div class="session-notice"><span class="save-dot" aria-hidden="true"></span><span id="save-status">Notes and selections save in this browser only. Export them to share or keep a copy.</span></div><div class="empty-state" id="empty-state"><span class="empty-plus">+</span><h3>Start with a few names.</h3><p>Use the + beside any relationship to bring it here.<br>Nothing has been preselected.</p><a href="#returning">Go to the relationship map ↑</a></div><div id="decision-list"></div><div class="session-fields"><label for="session-notes">Decisions from our conversation</label><textarea id="session-notes" rows="5" placeholder="The approach we agree on, dependencies to test, and anything we choose to leave for later…"></textarea><div class="review-row"><label for="review-date">Our next review<input type="date" id="review-date"></label><p>Use internal action and review dates. An LP deadline needs its own agreed basis.</p></div></div><div class="export-row"><button class="button" id="export" type="button">Download session notes ↓</button><button class="text-button" id="copy" type="button">Copy notes</button><span id="export-status" role="status"></span></div><details id="export-preview" class="export-preview" hidden><summary>Session notes as text</summary><label for="export-text" class="small">Select and copy this text if your browser does not support downloads or clipboard access.</label><textarea id="export-text" rows="12" readonly></textarea></details></section>
<section id="sources" class="chapter sources"><div class="section-heading"><span>06</span><h2>The context behind this page.</h2></div><p>Second pass · October 1, 2026. Each of the 53 relationships was researched across the CRM and linked meeting notes, Gmail, and locally available WhatsApp and iMessage history, including shared conversations. Coverage differs by person; missing messages do not establish silence. Recent voice notes without transcripts are flagged where they could change the approach.</p><div class="source-grid"><a href="https://dev.obscurely.org/fund-ii-fundraising-onvbc/#opportunities" target="_blank" rel="noopener noreferrer"><span>01 / Strategy</span>Daniel’s working briefing ↗</a><a href="https://notes.granola.ai/d/4db4da82-c07e-4ca8-97d8-99591582c910" target="_blank" rel="noopener noreferrer"><span>02 / Partner discussion</span>September 30 conversation ↗</a><a href="https://app.notion.com/p/antigravity-room/198daeb2902680a7ac19cea98fe0f919?v=23edaeb290268064af71000cc6403d5e" target="_blank" rel="noopener noreferrer"><span>03 / Operating record</span>LP CRM ↗</a></div><p class="small">The briefs are a synthesis for discussion. Dates refer to the underlying exchange, not the last CRM edit; message dates use Pacific time. Proposed approaches and Gadi’s judgments remain distinct from recorded intent. Attachments and untranscribed voice notes were not interpreted. No pipeline totals or probabilities are inferred. This page and its local notes do not update Notion or send messages. Source links require existing access.</p></section>
<footer><span>Antigravity Capital · Gadi + Daniel · October 2026</span><a href="#top">Back to top ↑</a><p>Unlisted and marked noindex. Anyone with this link can view the page.</p></footer></main></div>
<a class="floating-queue" href="#decisions">First pass <span data-selected-count>0</span> <span aria-hidden="true">↗</span></a><noscript><p class="no-js">The complete relationship map is available above. Enable JavaScript to search, select names and save session notes.</p></noscript><script id="relationship-data" type="application/json">{serialized}</script><script src="session.js" defer></script></body></html>'''
(OUT/'index.html').write_text(page)
print(f'Built {OUT}/index.html: {len(groups)} original groups, {len(people)} researched review entries.')
