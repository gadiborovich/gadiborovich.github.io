#!/usr/bin/env python3
"""Render the two canonical activation sequences into a shareable, read-only brief.

Messages are extracted verbatim at build time. The short presentation notes below
are editorial summaries, not a CRM mirror or a record that outreach happened.
"""

from collections import Counter
import hashlib
import json
from pathlib import Path
import re


SITE = Path(__file__).resolve().parents[1]
WORKSPACE = SITE.parents[1]
SEQUENCES = WORKSPACE / "fundraising" / "sequences"
OUT = SITE / "static" / "fund-ii-activation" / "relationships.json"


def section(text, heading, level=2):
    marker = "#" * level
    pattern = rf"^{marker} {re.escape(heading)}\s*$\n(.*?)(?=^#{{1,{level}}} |\Z)"
    match = re.search(pattern, text, re.M | re.S)
    if not match:
        raise ValueError(f"Missing source section: {heading}")
    return match.group(1).strip()


def quoted_drafts(text):
    """Remove Markdown quote markers only; retain paragraphs, links and wording."""
    blocks = re.findall(r"(?:^>[^\n]*(?:\n|$))+", text, re.M)
    return ["\n".join(re.sub(r"^> ?", "", line) for line in block.splitlines())
            for block in blocks]


def external_sources(text):
    result = []
    seen = set()
    for label, url in re.findall(r"\[([^\]]+)\]\((https?://[^\s)]+)\)", text):
        if re.match(r"https://(?:app\.)?notion\.(?:com|so)/|https://mail\.google\.com/", url):
            if url not in seen:
                result.append({"label": label, "url": url})
                seen.add(url)
    return result


def spec(id, name, channel, route, summary, context, next, *,
         heading=None, category="core", caution=None):
    value = dict(id=id, name=name, channel=channel, route=route,
                 summary=summary, context=context, next=next,
                 heading=heading or name, category=category)
    if caution:
        value["caution"] = caution
    return value


LP_SPECS = [
    spec("kurt-read", "Kurt Read", "iMessage", "Direct conversation",
         "An invitation with a useful reason to catch up: the Fund I numbers.",
         "Kurt asked to go over the Fund I numbers after missing them at the September recap. Gadi sent the slides; a current personal Fund II invitation was not found in the reviewed sources.",
         "If he takes the call, bring reconciled Fund I figures and the Fund II case. He can also continue asynchronously.",
         caution="October 12 at 2pm PT was free for both partners when checked October 5. The slot is not held; recheck before offering."),
    spec("darren-fredette", "Darren Fredette", "iMessage", "Existing conversation with Daniel",
         "A close backer whose tentative interest needs a current invitation.",
         "Darren helped with Fund I diligence and recently praised Puentes. In July he said he was probably comfortable writing a Fund II check; no amount or investment next step followed.",
         "Learn his current appetite and address the returns questions that matter to him. His separate Halluminate pass does not settle Fund II."),
    spec("nico-bistolfi", "Nico Bistolfi", "WhatsApp", "Direct conversation",
         "Build on his recap engagement and invite him into the next fund.",
         "Nico engaged with the Fund I recap and received its recording. A Puentes invitation is still open in the reviewed exchange; the fund invitation can proceed independently.",
         "Discuss participation and his actual questions. Another dinner or Q&A is optional, not a condition.",
         caution="This is Nico Bistolfi, distinct from Nicolás Bevacqua in the Puentes group."),
    spec("jonathan-siegel", "Jonathan Siegel", "Email", "New private email; cc Daniel",
         "A warm recent exchange makes the Fund II invitation natural.",
         "Jonathan enthusiastically thanked us for including him in Halluminate on October 1. He knows both partners and is comfortable continuing by email.",
         "Discuss Fund II on its own terms. His Halluminate request concerned the SPV and does not establish a fund allocation."),
    spec("marc-fielding", "Marc Fielding", "WhatsApp", "Direct conversation",
         "An ordinary returning-LP invitation, grounded in an ongoing founder relationship.",
         "Marc knows the Puentes hiring work and previously welcomed a general fund catch-up. No personal invitation into the current Fund II raise was found.",
         "If he wants to go deeper, connect the Puentes work he has seen to the investment case."),
    spec("michael-bhagat", "Michael Bhagat", "Email", "New private email; cc Daniel",
         "Use the investment thinking he already engaged with as the opening for more depth.",
         "The picks-and-shovels case for Halluminate resonated with Michael. That provides a concrete starting point if he wants to understand the next fund.",
         "Connect that example to portfolio construction and investment judgment; establish his Fund II appetite independently of his Fund I ticket."),
    spec("keith-guerin", "Keith Guerin", "iMessage", "Direct conversation",
         "Invite him directly; the recap does not need to become homework.",
         "Keith helped think about LP Day and received the Fund I recording. A current personal Fund II invitation was not found in the reviewed conversation.",
         "Follow the investment question he raises. Use concrete production examples if they help answer it."),
    spec("zack-rosen", "Zack Rosen", "WhatsApp", "Direct conversation",
         "Answer the question he already asked: we are raising Fund II now.",
         "Zack asked in July whether Fund II was raising; Gadi said soon. His later Puentes travel conflict and Flai pass were separate matters.",
         "Learn his current personal appetite for Fund II. This is his LP relationship, not an assumed Ribbit allocation."),
    spec("josh-harvey", "Josh Harvey", "Email", "New private email; cc Daniel",
         "Give the catch-up invitation the investment purpose it was missing.",
         "Josh received the Fund I replay and a general catch-up offer on September 25. That note did not invite him to participate in Fund II.",
         "If he replies with questions by email, answer them there instead of turning the exchange back into scheduling."),
    spec("bou-berendsen", "Bou Berendsen", "Email", "New private email; cc Daniel",
         "Share the fund case and make an asynchronous conversation easy.",
         "Bou received the recap replay and a general catch-up invitation. A current Fund II invitation was not found; his location has also changed since older CRM notes.",
         "Continue over email if useful. If he wants a call, offer times in his actual timezone."),
    spec("justin-alexander", "Justin Alexander", "Email", "New private email; cc Daniel",
         "A possible addition with a simple, direct re-up invitation.",
         "The bounded email review found no current personal Fund II invitation. Justin previously flagged replies leaking through the LP mailing list.",
         "If selected for this pass, start a new private email and continue from his answer.",
         category="candidate", caution="Off-channel history was not fully recovered; confirm the current context before sending."),
    spec("jonny-price", "Jonny Price", "iMessage", "Direct conversation",
         "A short familiar note can open the current investment conversation.",
         "The recent exchange concerns Wefunder and Kai paperwork. The reviewed texts and email did not establish a current Fund II invitation.",
         "If selected, invite him personally and learn his appetite; his Wefunder role does not determine the investing vehicle.",
         category="candidate"),
    spec("casey-melcher", "Casey Melcher", "Email", "New private email; cc Daniel",
         "A possible addition; keep the fund invitation distinct from past recording requests.",
         "Recent email concerns the recap. Casey previously requested the Halluminate recording, but its delivery was not established in this review.",
         "If selected, invite him into Fund II and resolve any still-owed recording separately.",
         category="candidate"),
    spec("kim-andy", "Kim / Andy", "iMessage", "Existing conversation with Kim and Daniel",
         "Continue the Fund II conversation Kim already asked to have.",
         "Kim requested a deeper Fund II discussion after the September 16 Spotlight. Gadi offered LP conversations and Daniel shared the SOI; a re-up decision has not been established.",
         "Make participation explicit, then offer real times if she wants a conversation with Andy. A shared Q&A is not a prerequisite.",
         heading="Kim / Andy — continuation", category="continuation",
         caution="Andy is not in this iMessage group. Address Kim and refer to both; this is outside the new-invitation count."),
]


PUENTES_SPECS = [
    spec("elias-torres", "Elias Torres", "WhatsApp", "Existing direct conversation",
         "Support the fellow conversations already underway and complete the investment handoff.",
         "Elias is already speaking with fellows. Gadi's October 4 message recaps an investment discussion and promises onboarding; that message is not proof of signing.",
         "Share the fellows page, make the introductions he requests, and verify the existing onboarding handoff separately.",
         category="current", caution="Personal timing makes remote introductions the useful default. Follow the current thread rather than setting an automatic nudge."),
    spec("devan-malhotra", "Devan Malhotra", "WhatsApp", "Existing direct conversation",
         "Deliver the fellows page he is expecting, connect Rumi, and open the fund conversation.",
         "Devan confirmed he will be in SF and received dinner links on October 5. Gadi promised the fellows page; Rumi supplies a concrete hiring connection.",
         "Settle the role, relevant fellow and dinner guest. Make the separate Fund II invitation as the exchange resumes; neither dinner nor a hire must happen first.",
         category="current"),
    spec("nicolas-bevacqua", "Nicolás Bevacqua / Ramp", "WhatsApp", "Existing direct conversation",
         "Offer Ana's introduction and pick up the fund invitation already made.",
         "The relationship connects Ramp's engineering and talent work with Puentes. Gadi has already said he would love Nico as an LP; Nico's answer is not established in the retained sources.",
         "Confirm mutual interest in Ana's introduction, resolve the existing Will Koh route for a Ramp guest, and follow the actual response to the Fund II invitation.",
         category="current", caution="The local chat history is incomplete. Read the latest conversation before using either draft; do not assume Nico will be in SF."),
    spec("max-zang", "Max Zang / Audacious", "WhatsApp", "Existing direct conversation",
         "Turn his dinner yes into a chosen night and a relevant guest.",
         "Max said he would join a dinner after receiving the September links. No night was selected in the reviewed exchange, and no Fund II interest is established.",
         "If included in this pass, settle the night and ask which portfolio team might benefit from meeting the fellows.",
         heading="Proposed additions", category="candidate"),
]


EMAIL_SPECS = [
    spec("micky-malka", "Micky Malka", "Email", "New personal email; proposed cc Daniel",
         "Bring the new fellows to someone who already knows Puentes, with a fintech connection.",
         "The recent exchange is in Spanish. Ana and Ricardo provide specific reasons this cohort could interest Micky and Ribbit founders.",
         "Agree a dinner night and identify any hiring founder who should join. Make relevant introductions before the fellows arrive.",
         heading="1. Micky Malka", category="dinner"),
    spec("ryan-felipe", "Ryan Bloomer + Felipe Levi Gurgel", "Email", "New joint email; proposed cc Daniel",
         "Repeat a useful collaboration: involve Actions founders who are hiring.",
         "Ryan forwarded the earlier invitation to Actions founders; Felipe also received an invitation. Prior attendance is not established.",
         "Choose their night, identify the companies hiring now, and suggest introductions before arrival.",
         heading="2. Ryan Bloomer + Felipe Levi Gurgel", category="dinner"),
    spec("tracy-utkarsh", "Tracy Fong + Utkarsh Bajpai", "Email", "New joint email; proposed cc Daniel",
         "Invite Tracy back and build on Utkarsh's earlier company introduction.",
         "Tracy attended the May dinner and Utkarsh introduced Kasim at a1mobile. This is the selected joint invitation; current GC investment interest is not established.",
         "Ask which GC teams are hiring now, including whether a1mobile should rejoin, and coordinate the guests' night.",
         heading="3. Tracy Fong + Utkarsh Bajpai", category="dinner"),
    spec("lotti-santi", "Lotti Siniscalco + Santi Subotovsky", "Email", "New joint email; proposed cc Daniel",
         "Give them an easy way to connect specific fellows with Emergence founders.",
         "Lotti visited and later asked for forwardable individual introductions. Santi offered to review fellows for portfolio matches but was unavailable for the earlier fireside.",
         "Use the companies or roles they name to prepare short, forwardable introductions and coordinate a night at the house.",
         heading="4. Lotti Siniscalco + Santi Subotovsky", category="dinner"),
    spec("james-gabriel", "James da Costa + Gabriel Vasquez", "Email", "New joint email; proposed cc Daniel",
         "Invite both into the new cohort and connect the fellows with hiring teams.",
         "Both have received prior invitations according to Gadi. Gabriel's invitation and acceptance are documented; shared attendance is not established.",
         "Learn which a16z founders should meet the group and arrange relevant introductions before the visit.",
         heading="5. James da Costa + Gabriel Vasquez", category="dinner"),
    spec("tomas-alvarez-belon", "Tomas Alvarez Belon", "Email", "New personal email; proposed cc Daniel",
         "Build on the Fig and Mercator introductions with current hiring needs.",
         "Tomas connected Fig and Mercator in the last round. The next invitation asks whether those teams or other Innovation Endeavors companies are hiring now.",
         "Get a couple of companies or roles, suggest specific fellows, and coordinate the dinner invitation.",
         heading="6. Tomas Alvarez Belon", category="dinner"),
    spec("matt-caroline-rak", "Matt Stephenson + Caroline Toch Docal + Rak Garg", "Email", "New joint email; proposed cc Daniel",
         "Bring BCV companies back, including founding engineers when founders cannot join.",
         "Rak previously introduced Echelon's founding engineer while the founders were unavailable. That is a useful model for inviting the right person from a hiring team.",
         "Match the fellows to named companies or roles and coordinate founders or engineering leads at a dinner.",
         heading="7. Matt Stephenson + Caroline Toch Docal + Rak Garg", category="dinner"),
    spec("anna-pinol", "Anna Piñol", "Email", "New personal email; proposed cc Daniel",
         "Ask Anna to share with hiring NFX founders while inviting her personally.",
         "Anna posted the prior invitation and made a Neon Health hiring introduction. The current note builds directly on that help.",
         "Suggest relevant fellows for the teams she identifies and settle her own visit if she can join.",
         heading="8. Anna Piñol", category="dinner"),
    spec("pedro-franceschi", "Pedro Franceschi", "Email", "New personal email; proposed cc founder office and Daniel",
         "Invite another conversation with the fellows, using the format that works for Pedro.",
         "Pedro hosted the May group at Brex. The invitation proposes a 45-minute fireside at the house and keeps a daytime Brex visit available.",
         "Find his availability, confirm a program slot, then arrange the visit and the relevant dinner link.",
         heading="9. Pedro Franceschi — fireside", category="fireside"),
    spec("victor-cardenas", "Victor Cardenas", "Email", "New personal email; proposed cc Daniel",
         "Invite a fireside with the notice Victor previously requested.",
         "Victor asked for roughly two weeks' notice. His earlier fireside acceptance is documented; the current note is a new availability request.",
         "Agree a feasible 45-minute conversation and dinner plan. Email is the chosen draft route; WhatsApp is an alternative, not a duplicate send.",
         heading="10. Victor Cardenas — fireside", category="fireside"),
    spec("rodrigo-schmidt", "Rodrigo Schmidt", "Email", "New personal email; proposed cc Daniel",
         "Invite Rodrigo back to meet builders whose work connects to his interests.",
         "Rodrigo's prior visit is confirmed by Samuel's follow-up. Bauti and Santi give this invitation concrete examples of the new group's work.",
         "Find an evening for the fireside and dinner, or a daytime alternative, then confirm the program slot.",
         heading="11. Rodrigo Schmidt — fireside", category="fireside",
         caution="English is a working choice; the original direct invitation prose was not recovered."),
    spec("allen-taylor", "Allen Taylor", "Email", "New personal email; proposed cc Daniel",
         "A personal invitation to spend time with the new fellows.",
         "Allen knows Puentes and previously offered support for the first cohort's flights. The current invitation is simply to join the group at the house.",
         "Choose a dinner night and reconnect through the fellows; no new sponsorship request is attached.",
         heading="12. Allen Taylor — dinner at the house", category="dinner"),
]


def build():
    texts = {name: (SEQUENCES / name).read_text() for name in ("existing-lps.md", "puentes.md")}
    people = []
    extraction_checks = []
    for definitions, filename, group in ((LP_SPECS, "existing-lps.md", "lps"),
                                         (PUENTES_SPECS, "puentes.md", "puentes")):
        for definition in definitions:
            card = definition.copy()
            body = section(texts[filename], card.pop("heading"))
            messages = quoted_drafts(body)
            labels = (["Puentes follow-through", "Fund II invitation"] if card["id"] == "devan-malhotra"
                      else ["Puentes follow-through", "Fund II follow-up"] if card["id"] == "nicolas-bevacqua"
                      else ["Working message"])
            if len(messages) != len(labels):
                raise ValueError(f"Unexpected draft count for {card['id']}: {len(messages)}")
            card.update(group=group, drafts=[dict(label=label, text=message)
                                           for label, message in zip(labels, messages)],
                        sources=external_sources(body))
            if group == "lps" and card["channel"] == "Email":
                subject = re.search(r"\*\*Subject: ([^*]+)\*\*", texts[filename])
                if not subject:
                    raise ValueError("Existing-LP shared email subject missing")
                card["subject"] = subject.group(1)
            extraction_checks.extend((card["id"], message) for message in messages)
            people.append(card)

    for definition in EMAIL_SPECS:
        card = definition.copy()
        body = section(texts["puentes.md"], card.pop("heading"), level=3)
        # Explicit anchors for the following email are outside the current draft.
        body = re.split(r"\n---\s*\n", body, maxsplit=1)[0].strip()
        subject = re.search(r"^\*\*Subject:\*\* (.+)$", body, re.M)
        if not subject or "**Draft body:**\n" not in body:
            raise ValueError(f"Draft or subject missing for {card['id']}")
        message = body.split("**Draft body:**\n", 1)[1].strip()
        card.update(group="puentes", subject=subject.group(1).strip(),
                    drafts=[dict(label="Working email", text=message)], sources=external_sources(body))
        extraction_checks.append((card["id"], message))
        people.append(card)

    result = dict(prepared="October 6, 2026", sourceHashes={
        name: hashlib.sha256(text.encode()).hexdigest() for name, text in texts.items()}, people=people)
    counts = Counter(p["group"] for p in people)
    categories = Counter(f"{p['group']}:{p['category']}" for p in people)
    assert counts == {"lps": 14, "puentes": 16}, counts
    assert len({p["id"] for p in people}) == len(people) == 30
    assert len(extraction_checks) == 32, len(extraction_checks)
    assert all(p["drafts"] and all(d["text"].strip() for d in p["drafts"]) for p in people)
    assert all(not re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", json.dumps(p)) for p in people)
    assert all(not re.search(r"\+\d[\d ()-]{8,}\d|\bchat \d+\b", json.dumps(p), re.I) for p in people)
    assert all(not re.search(r"\b(surgery|ACL|hospital|medical)\b", json.dumps(p), re.I) for p in people)
    assert all(not re.search(r"(?:\]\(|href=)[\"']?(?:\.\./|/Users/)", json.dumps(p)) for p in people)
    expected = {(id, text) for id, text in extraction_checks}
    actual = {(p["id"], d["text"]) for p in people for d in p["drafts"]}
    assert actual == expected
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    readback = json.loads(OUT.read_text())
    assert readback == result
    print(json.dumps({"output": str(OUT), "people": len(people), "groups": counts,
                      "categories": categories, "drafts": len(extraction_checks),
                      "verbatim_extractions": len(extraction_checks),
                      "sourceHashes": result["sourceHashes"],
                      "checks": ["unique ids", "exact expected groups and draft counts",
                                 "verbatim extraction", "no raw email addresses, phone numbers or chat ids",
                                 "no clinical details", "no local analysis links", "JSON readback equal"]}, indent=2))


if __name__ == "__main__":
    build()
