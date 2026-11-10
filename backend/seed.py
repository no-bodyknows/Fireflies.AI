from database import SessionLocal, engine
import models
from datetime import datetime, timezone, timedelta

def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)

def seed_data():
    print("Resetting database tables...")
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    print("Seeding diverse realistic meetings into SQLite database...")

    # =========================================================================
    # MEETING 1: Q4 Product Strategy & Architecture Sync (Completed)
    # =========================================================================
    m1 = models.Meeting(
        title="Q4 Product Strategy & Architecture Sync",
        date=utc_now() - timedelta(days=2, hours=3),
        duration=1860,  # 31 mins
        audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        status="completed"
    )
    db.add(m1)
    db.commit()
    db.refresh(m1)

    for name, email in [
        ("Love Kumar", "love@fireflies.ai"),
        ("Sarah Chen", "sarah.chen@techcorp.io"),
        ("David Miller", "david.m@techcorp.io"),
        ("Elena Rostova", "elena.r@techcorp.io")
    ]:
        db.add(models.Participant(name=name, email=email, meeting_id=m1.id))

    transcripts_1 = [
        ("Love Kumar", 0.0, 8.5, "Good morning team, thanks for hopping on. Today's agenda is finalizing our Q4 architecture roadmap and addressing the transcription pipeline latency."),
        ("Sarah Chen", 9.0, 22.0, "Thanks Love. On the backend, we migrated our ingestion worker to an asynchronous FastAPI microservice. Initial benchmarks show transcript processing time dropped by nearly 40%."),
        ("David Miller", 23.0, 38.0, "That's a huge improvement. From the database side, we added composite indexes on meeting IDs and speaker timestamps, which makes seeking during audio playback near instantaneous."),
        ("Elena Rostova", 39.0, 55.0, "On the frontend side, the new Fireflies purple theme and the interactive seek bar are ready. When a user clicks any transcript block, the audio player smoothly jumps to that exact second."),
        ("Love Kumar", 56.0, 72.0, "That UX is critical for our users. What about the action item extraction? Are we persisting completed states reliably in SQLite?"),
        ("Sarah Chen", 73.0, 91.0, "Yes, we implemented optimistic UI updates with immediate PATCH requests to the backend. The checkboxes toggle seamlessly and persist across page refreshes."),
        ("David Miller", 92.0, 110.0, "We also prepared the AskFred AI assistant endpoint. It extracts context from transcripts, summaries, and participant lists to answer free-form questions accurately."),
        ("Elena Rostova", 111.0, 130.0, "I tested AskFred with 'What are our action items?' and 'Draft an email recap', and the generated responses were spot on."),
        ("Love Kumar", 131.0, 152.0, "Awesome. Let's make sure we also support transcript export into Markdown, TXT, and PDF before our demo review on Thursday."),
        ("Sarah Chen", 153.0, 170.0, "Understood. I will handle the export formatting utility and write comprehensive unit tests for our CRUD endpoints."),
        ("David Miller", 171.0, 188.0, "I'll do an audit of the sample seed data to make sure we have realistic meetings across engineering, sales, and design."),
        ("Elena Rostova", 189.0, 205.0, "And I will polish the responsive layout so the split-view transcript and notes look flawless on both desktop and mobile."),
        ("Love Kumar", 206.0, 220.0, "Fantastic progress everyone. Let's wrap up and reconvene at our standup tomorrow morning. Great work!")
    ]

    for spk, st, et, txt in transcripts_1:
        db.add(models.Transcript(speaker=spk, start_time=st, end_time=et, text=txt, meeting_id=m1.id))

    db.add(models.Summary(
        overview="The engineering team aligned on Q4 architecture milestones, reviewing a 40% latency reduction in the transcription pipeline, indexed playback seeking, and successful integration of the AskFred AI assistant.",
        key_topics="FastAPI Microservice Migration, Latency Optimization, Interactive Transcript Seeking, AskFred AI Integration, Export Utilities",
        meeting_id=m1.id
    ))

    action_items_1 = [
        ("Implement transcript export for Markdown, TXT, and PDF", "Sarah Chen", False),
        ("Verify database indexing on transcript timestamps for audio seeking", "David Miller", True),
        ("Finalize responsive split-view layout for mobile and tablet screens", "Elena Rostova", False),
        ("Conduct end-to-end regression testing on meeting CRUD workflows", "Love Kumar", True)
    ]
    for task, assignee, comp in action_items_1:
        db.add(models.ActionItem(task=task, assignee=assignee, is_completed=comp, meeting_id=m1.id))

    # =========================================================================
    # MEETING 2: Enterprise Client Discovery & Sales Demo (Completed)
    # =========================================================================
    m2 = models.Meeting(
        title="Enterprise Client Discovery - GlobalLogistics Corp",
        date=utc_now() - timedelta(days=4, hours=6),
        duration=2100,  # 35 mins
        audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        status="completed"
    )
    db.add(m2)
    db.commit()
    db.refresh(m2)

    for name, email in [
        ("Love Kumar", "love@fireflies.ai"),
        ("Marcus Vance", "marcus.v@globallogistics.com"),
        ("Priya Patel", "priya.p@fireflies.ai")
    ]:
        db.add(models.Participant(name=name, email=email, meeting_id=m2.id))

    transcripts_2 = [
        ("Love Kumar", 0.0, 10.0, "Hi Marcus, welcome to the demo. Today Priya and I will show you how Fireflies automates meeting notes across your 200-person logistics operations team."),
        ("Marcus Vance", 10.5, 25.0, "Thanks Love. Our main bottleneck is that operations managers spend 45 minutes after every carrier briefing typing up manual dispatch notes."),
        ("Priya Patel", 25.5, 42.0, "That is precisely where Fireflies shines. As you can see on screen, our AI automatically breaks the conversation into chapters, bulleted highlights, and actionable tasks with assignees."),
        ("Marcus Vance", 42.5, 58.0, "Can our regional directors search across all past carrier meetings for specific contract terms or route delays?"),
        ("Love Kumar", 58.5, 76.0, "Absolutely. We offer universal cross-meeting search. You can search 'Route 66 frost delay' and immediately see the exact timestamp and audio soundbite across any call."),
        ("Marcus Vance", 76.5, 92.0, "That would save our team hundreds of hours each month. What does security and compliance look like regarding SOC2 and data retention?"),
        ("Priya Patel", 92.5, 110.0, "We are SOC2 Type II certified with end-to-end encryption at rest and in transit. You also have full control over data deletion and retention policies."),
        ("Marcus Vance", 111.0, 128.0, "That meets our IT requirements. Please send over an enterprise proposal for 150 seats with single sign-on included.")
    ]
    for spk, st, et, txt in transcripts_2:
        db.add(models.Transcript(speaker=spk, start_time=st, end_time=et, text=txt, meeting_id=m2.id))

    db.add(models.Summary(
        overview="High-impact enterprise discovery call with GlobalLogistics VP of Operations. Demonstrated automatic dispatch notes, cross-meeting keyword search, and enterprise SOC2 compliance. Client requested a 150-seat commercial proposal.",
        key_topics="Logistics Operations Bottlenecks, Cross-Meeting Search, SOC2 Compliance, Enterprise Pricing",
        meeting_id=m2.id
    ))

    action_items_2 = [
        ("Draft custom enterprise proposal for 150 seats with SSO", "Priya Patel", False),
        ("Share SOC2 Type II security whitepaper with Marcus", "Love Kumar", True),
        ("Schedule follow-up security review with GlobalLogistics IT Director", "Priya Patel", False)
    ]
    for task, assignee, comp in action_items_2:
        db.add(models.ActionItem(task=task, assignee=assignee, is_completed=comp, meeting_id=m2.id))

    # =========================================================================
    # MEETING 3: UX/UI Design Critique & Design System Review (Completed)
    # =========================================================================
    m3 = models.Meeting(
        title="Fireflies UI/UX Design Critique & Brand Consistency",
        date=utc_now() - timedelta(days=6, hours=1),
        duration=1500,  # 25 mins
        audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        status="completed"
    )
    db.add(m3)
    db.commit()
    db.refresh(m3)

    for name, email in [
        ("Elena Rostova", "elena.r@techcorp.io"),
        ("Alex Mercer", "alex.m@designstudio.io"),
        ("Love Kumar", "love@fireflies.ai")
    ]:
        db.add(models.Participant(name=name, email=email, meeting_id=m3.id))

    transcripts_3 = [
        ("Elena Rostova", 0.0, 12.0, "Welcome everyone. Today we're reviewing the visual fidelity of our Fireflies clone against the production fireflies.ai platform."),
        ("Alex Mercer", 12.5, 30.0, "I reviewed the color tokens. We've anchored the design around the signature Fireflies purple (#5832E6) and deep slate dark mode palette (#0B0D17)."),
        ("Love Kumar", 30.5, 48.0, "The contrast looks great. Let's make sure our buttons, search bars, and modal overlays feel snappy with smooth hover states and accessible focus rings."),
        ("Alex Mercer", 48.5, 66.0, "I also designed the AskFred chat drawer with quick suggestion chips like 'Draft Follow-up Email' and 'Key Decisions' to maximize engagement."),
        ("Elena Rostova", 66.5, 84.0, "The transcript timeline now features color-coded speaker avatars with clear start timestamps. Hovering any row highlights the soundbite copy button.")
    ]
    for spk, st, et, txt in transcripts_3:
        db.add(models.Transcript(speaker=spk, start_time=st, end_time=et, text=txt, meeting_id=m3.id))

    db.add(models.Summary(
        overview="Design critique session establishing pixel-perfect parity with Fireflies.ai design guidelines, focusing on royal purple accent tokens, dark mode elevation, and interactive transcript hover actions.",
        key_topics="Design Tokens, Purple PaletteParity, AskFred Chat Drawer, Transcript Micro-interactions",
        meeting_id=m3.id
    ))

    action_items_3 = [
        ("Update SVG icon set with Fireflies glowing sparkles logo", "Alex Mercer", True),
        ("Test color contrast ratios for WCAG AA compliance in dark mode", "Elena Rostova", True),
        ("Verify keyboard accessibility for transcript navigation", "Love Kumar", False)
    ]
    for task, assignee, comp in action_items_3:
        db.add(models.ActionItem(task=task, assignee=assignee, is_completed=comp, meeting_id=m3.id))

    # =========================================================================
    # MEETING 4: Customer Success Quarterly Review & Churn Analysis (Completed)
    # =========================================================================
    m4 = models.Meeting(
        title="Q3 Customer Success Review & Feature Feedback",
        date=utc_now() - timedelta(days=9, hours=4),
        duration=2400,  # 40 mins
        audio_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        status="completed"
    )
    db.add(m4)
    db.commit()
    db.refresh(m4)

    for name, email in [
        ("Love Kumar", "love@fireflies.ai"),
        ("Jessica Taylor", "jessica.t@fireflies.ai"),
        ("Michael Chang", "michael.c@fireflies.ai")
    ]:
        db.add(models.Participant(name=name, email=email, meeting_id=m4.id))

    transcripts_4 = [
        ("Jessica Taylor", 0.0, 14.0, "Good afternoon everyone. Our Net Promoter Score for Q3 reached 71, driven primarily by user love for the automatic AI action item extraction."),
        ("Michael Chang", 14.5, 31.0, "Our churn rate among enterprise cohorts dropped by 1.8%. Customers love that they can search across team meetings rather than re-listening to hour-long audio files."),
        ("Love Kumar", 31.5, 49.0, "What were the most requested feature requests from our enterprise customer advisory board?"),
        ("Jessica Taylor", 49.5, 68.0, "Top requests are: 1) One-click Markdown/PDF summary export, 2) Rescheduling past and upcoming meetings with conflict checks, and 3) Custom prompt templates for AskFred."),
        ("Michael Chang", 68.5, 85.0, "We've already delivered the conflict validation engine and export tools in our latest sprint release.")
    ]
    for spk, st, et, txt in transcripts_4:
        db.add(models.Transcript(speaker=spk, start_time=st, end_time=et, text=txt, meeting_id=m4.id))

    db.add(models.Summary(
        overview="Quarterly customer success retrospective highlighting an NPS increase to 71 and a 1.8% drop in enterprise churn. Prioritized customer requests for document export, rescheduling tools, and custom AskFred prompts.",
        key_topics="NPS Metrics, Enterprise Retention, User Feedback Trends, Export Demands",
        meeting_id=m4.id
    ))

    action_items_4 = [
        ("Publish CS customer satisfaction report to executive dashboard", "Jessica Taylor", True),
        ("Synthesize customer feedback on AskFred prompt templates", "Michael Chang", False)
    ]
    for task, assignee, comp in action_items_4:
        db.add(models.ActionItem(task=task, assignee=assignee, is_completed=comp, meeting_id=m4.id))

    # =========================================================================
    # MEETING 5: 2027 AI Product Innovation Roadmap (Upcoming)
    # =========================================================================
    m5 = models.Meeting(
        title="2027 AI Product Innovation & Autonomous Agents Sync",
        date=utc_now() + timedelta(days=2, hours=4),
        duration=1800,  # 30 mins
        audio_url="",
        status="upcoming"
    )
    db.add(m5)
    db.commit()
    db.refresh(m5)

    for name, email in [
        ("Love Kumar", "love@fireflies.ai"),
        ("Sarah Chen", "sarah.chen@techcorp.io"),
        ("David Miller", "david.m@techcorp.io")
    ]:
        db.add(models.Participant(name=name, email=email, meeting_id=m5.id))

    db.add(models.Summary(
        overview="Upcoming strategic planning session to architect autonomous post-meeting action item dispatching and integrations with Jira, Linear, and Slack.",
        key_topics="Autonomous Agent Workflows, Jira/Linear Integrations, Multi-modal Audio Ingestion",
        meeting_id=m5.id
    ))

    action_items_5 = [
        ("Prepare 2027 AI capabilities research slide deck", "Love Kumar", False),
        ("Draft preliminary technical spec for real-time WebRTC audio streamer", "David Miller", False)
    ]
    for task, assignee, comp in action_items_5:
        db.add(models.ActionItem(task=task, assignee=assignee, is_completed=comp, meeting_id=m5.id))

    # =========================================================================
    # MEETING 6: Cloud Infrastructure Security & Latency Audit (Delayed)
    # =========================================================================
    m6 = models.Meeting(
        title="Cloud Infrastructure Security & Latency Audit",
        date=utc_now() - timedelta(days=1, hours=8),
        duration=2700,  # 45 mins
        audio_url="",
        status="missed"
    )
    db.add(m6)
    db.commit()
    db.refresh(m6)

    for name, email in [
        ("Love Kumar", "love@fireflies.ai"),
        ("Security Lead", "sec@techcorp.io")
    ]:
        db.add(models.Participant(name=name, email=email, meeting_id=m6.id))

    db.add(models.Summary(
        overview="This security audit was missed due to an upstream datacenter maintenance window. Awaiting rescheduling with the DevSecOps team.",
        key_topics="Infrastructure Security, VPC Peering, Datacenter Latency",
        meeting_id=m6.id
    ))

    action_items_6 = [
        ("Reschedule security audit once network maintenance completes", "Love Kumar", False)
    ]
    for task, assignee, comp in action_items_6:
        db.add(models.ActionItem(task=task, assignee=assignee, is_completed=comp, meeting_id=m6.id))

    db.commit()
    db.close()
    print("Database successfully seeded with 6 diverse meetings, transcripts, and action items!")

if __name__ == "__main__":
    seed_data()
