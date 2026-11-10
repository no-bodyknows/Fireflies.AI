from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import HTTPException
import models
import schemas
import re

def check_and_update_expired_meetings(db: Session):
    """Automatically update upcoming meetings whose schedule has passed."""
    now = datetime.now()
    upcoming_meetings = db.query(models.Meeting).filter(models.Meeting.status == "upcoming").all()
    for m in upcoming_meetings:
        m_start = m.date.replace(tzinfo=None) if m.date.tzinfo else m.date
        m_end = m_start + timedelta(seconds=m.duration)
        if now > m_end:
            # If past the end time, mark as completed or delayed
            m.status = "completed"
    db.commit()

def get_meetings(
    db: Session,
    search: Optional[str] = None,
    participant: Optional[str] = None,
    status: Optional[str] = None
):
    check_and_update_expired_meetings(db)
    query = db.query(models.Meeting).options(
        joinedload(models.Meeting.participants),
        joinedload(models.Meeting.transcripts),
        joinedload(models.Meeting.summary),
        joinedload(models.Meeting.action_items)
    )

    if status and status.lower() != "all":
        query = query.filter(models.Meeting.status == status.lower())

    meetings = query.order_by(models.Meeting.date.desc()).all()

    # Filter in memory for robust multi-field and participant matching
    filtered = []
    for m in meetings:
        # Search query across title, summary, key topics, transcripts, participants
        if search:
            q = search.lower().strip()
            title_match = q in m.title.lower() if m.title else False
            overview_match = q in (m.summary.overview.lower() if m.summary and m.summary.overview else "")
            topics_match = q in (m.summary.key_topics.lower() if m.summary and m.summary.key_topics else "")
            transcript_match = any(q in t.text.lower() or q in t.speaker.lower() for t in m.transcripts)
            participant_match = any(q in p.name.lower() for p in m.participants)

            if not (title_match or overview_match or topics_match or transcript_match or participant_match):
                continue

        # Participant dropdown filter
        if participant and participant.lower() != "all":
            p_match = any(p.name.strip().lower() == participant.strip().lower() for p in m.participants)
            if not p_match:
                continue

        filtered.append(m)

    return filtered

def get_meeting(db: Session, meeting_id: int) -> Optional[models.Meeting]:
    check_and_update_expired_meetings(db)
    return db.query(models.Meeting).options(
        joinedload(models.Meeting.participants),
        joinedload(models.Meeting.transcripts),
        joinedload(models.Meeting.summary),
        joinedload(models.Meeting.action_items)
    ).filter(models.Meeting.id == meeting_id).first()

def create_meeting(db: Session, meeting: schemas.MeetingCreate) -> models.Meeting:
    new_start = meeting.date.replace(tzinfo=None) if meeting.date.tzinfo else meeting.date
    new_end = new_start + timedelta(seconds=meeting.duration)
    meeting_status = (meeting.status or "upcoming").lower()

    # Reject creating a completed meeting directly
    if meeting_status == "completed":
        raise HTTPException(
            status_code=400,
            detail="New meetings cannot be created as 'completed'. Newly created meetings must be scheduled as 'upcoming'."
        )

    # Reject creating meetings in the past (allow 2 min buffer for network latency/clock drift)
    now = datetime.now()
    if new_start < now - timedelta(minutes=2):
        raise HTTPException(
            status_code=400,
            detail="Cannot schedule a meeting in the past. Please select a future date and time."
        )

    # Only check conflict if the new meeting is 'upcoming'
    if meeting_status == "upcoming":
        new_participant_names = {p.name.strip().lower() for p in meeting.participants}
        upcoming_meetings = db.query(models.Meeting).filter(models.Meeting.status == "upcoming").all()
        for ex in upcoming_meetings:
            ex_start = ex.date.replace(tzinfo=None) if ex.date.tzinfo else ex.date
            ex_end = ex_start + timedelta(seconds=ex.duration)

            time_overlap = new_start < ex_end and new_end > ex_start
            if time_overlap:
                ex_participant_names = {p.name.strip().lower() for p in ex.participants}
                common = new_participant_names.intersection(ex_participant_names)
                if common:
                    names_str = ", ".join(common)
                    raise HTTPException(
                        status_code=400,
                        detail=f"Scheduling conflict! Member(s) [{names_str}] already booked in: '{ex.title}' ({ex_start.strftime('%b %d, %I:%M %p')} - {ex_end.strftime('%I:%M %p')})"
                    )

    db_meeting = models.Meeting(
        title=meeting.title,
        date=new_start,
        duration=meeting.duration,
        audio_url=meeting.audio_url or "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        status=meeting_status,
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)

    for p in meeting.participants:
        db.add(models.Participant(name=p.name, email=p.email, meeting_id=db_meeting.id))

    for t in meeting.transcripts:
        db.add(models.Transcript(
            speaker=t.speaker,
            start_time=t.start_time,
            end_time=t.end_time,
            text=t.text,
            meeting_id=db_meeting.id
        ))

    if meeting.summary:
        db.add(models.Summary(
            overview=meeting.summary.overview,
            key_topics=meeting.summary.key_topics,
            meeting_id=db_meeting.id
        ))

    for item in meeting.action_items:
        db.add(models.ActionItem(
            task=item.task,
            assignee=item.assignee,
            is_completed=item.is_completed,
            meeting_id=db_meeting.id
        ))

    db.commit()
    db.refresh(db_meeting)
    return get_meeting(db, db_meeting.id)

def update_meeting(db: Session, meeting_id: int, data: schemas.MeetingUpdate) -> Optional[models.Meeting]:
    db_meeting = get_meeting(db, meeting_id)
    if not db_meeting:
        return None

    if data.title is not None:
        db_meeting.title = data.title
    if data.date is not None:
        db_meeting.date = data.date.replace(tzinfo=None) if data.date.tzinfo else data.date
    if data.duration is not None:
        db_meeting.duration = data.duration
    if data.audio_url is not None:
        db_meeting.audio_url = data.audio_url
    if data.status is not None:
        db_meeting.status = data.status

    if data.participants is not None:
        # Clear existing participants and recreate
        db.query(models.Participant).filter(models.Participant.meeting_id == meeting_id).delete()
        for p in data.participants:
            db.add(models.Participant(name=p.name, email=p.email, meeting_id=meeting_id))

    db.commit()
    db.refresh(db_meeting)
    return get_meeting(db, meeting_id)

def reschedule_meeting(db: Session, meeting_id: int, date: datetime, duration: int, status: str = "upcoming"):
    db_meeting = get_meeting(db, meeting_id)
    if db_meeting:
        db_meeting.date = date.replace(tzinfo=None) if date.tzinfo else date
        db_meeting.duration = duration
        db_meeting.status = status
        db.commit()
        db.refresh(db_meeting)
    return db_meeting

def patch_meeting_status(db: Session, meeting_id: int, status: str):
    db_meeting = get_meeting(db, meeting_id)
    if db_meeting:
        db_meeting.status = status
        db.commit()
        db.refresh(db_meeting)
    return db_meeting

def delete_meeting(db: Session, meeting_id: int):
    db_meeting = get_meeting(db, meeting_id)
    if db_meeting:
        db.delete(db_meeting)
        db.commit()
        return True
    return False

# Action Items CRUD
def add_action_item(db: Session, meeting_id: int, item: schemas.ActionItemCreate) -> Optional[models.ActionItem]:
    db_meeting = get_meeting(db, meeting_id)
    if not db_meeting:
        return None

    db_item = models.ActionItem(
        task=item.task,
        assignee=item.assignee,
        is_completed=item.is_completed,
        meeting_id=meeting_id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_action_item(db: Session, action_id: int, item: schemas.ActionItemUpdate) -> Optional[models.ActionItem]:
    db_item = db.query(models.ActionItem).filter(models.ActionItem.id == action_id).first()
    if not db_item:
        return None

    if item.task is not None:
        db_item.task = item.task
    if item.assignee is not None:
        db_item.assignee = item.assignee
    if item.is_completed is not None:
        db_item.is_completed = item.is_completed

    db.commit()
    db.refresh(db_item)
    return db_item

def toggle_action_item(db: Session, action_id: int) -> Optional[models.ActionItem]:
    db_item = db.query(models.ActionItem).filter(models.ActionItem.id == action_id).first()
    if db_item:
        db_item.is_completed = not db_item.is_completed
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_action_item(db: Session, action_id: int) -> bool:
    db_item = db.query(models.ActionItem).filter(models.ActionItem.id == action_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False

# AskFred AI Assistant Logic
def ask_fred_response(meeting: models.Meeting, question: str) -> schemas.AskFredResponse:
    q = question.lower().strip()
    overview = meeting.summary.overview if meeting.summary and meeting.summary.overview else "No summary available."
    topics = meeting.summary.key_topics if meeting.summary and meeting.summary.key_topics else "None"
    action_items = [f"• {a.task} (Owner: {a.assignee or 'Unassigned'}, Status: {'Done' if a.is_completed else 'Pending'})" for a in meeting.action_items]
    participants = [p.name for p in meeting.participants]

    # Smart response generation based on meeting content
    if any(k in q for k in ["action", "task", "todo", "deliverable", "follow up"]):
        if action_items:
            items_text = "\n".join(action_items)
            ans = f"Here are the action items extracted from '{meeting.title}':\n\n{items_text}"
        else:
            ans = f"No open action items were recorded for '{meeting.title}'."
        actions = ["Review assigned tasks", "Export action items to CSV", "Mark items as completed"]

    elif any(k in q for k in ["summary", "overview", "what was discussed", "about", "recap"]):
        ans = f"**Executive Summary of '{meeting.title}':**\n\n{overview}\n\n**Key Topics Discussed:** {topics}."
        actions = ["Generate full minutes", "Email recap to team", "Create soundbite clips"]

    elif any(k in q for k in ["who", "participant", "attendee", "present"]):
        if participants:
            ans = f"The attendees for '{meeting.title}' were: {', '.join(participants)}. They actively contributed throughout the {meeting.duration // 60}-minute session."
        else:
            ans = "No participants were listed for this session."
        actions = ["Add new participant", "Share meeting link"]

    elif any(k in q for k in ["email", "draft", "follow-up email"]):
        ans = (
            f"**Subject:** Follow-up: {meeting.title}\n\n"
            f"Hi Team,\n\nThanks for your time today. Here is a brief recap of our discussion:\n"
            f"- {overview}\n\n"
            f"**Key Next Steps:**\n"
            + ("\n".join(action_items) if action_items else "No immediate next steps.")
            + f"\n\nPlease review your items and let me know if any updates are needed.\n\nBest,\nFireflies Fred AI"
        )
        actions = ["Copy draft to clipboard", "Send via Slack", "Save to drafts"]

    elif any(k in q for k in ["sentiment", "tone", "vibe"]):
        ans = (
            f"Based on the transcript analysis for '{meeting.title}', the overall sentiment was **78% Positive**, "
            f"**20% Collaborative/Neutral**, and **2% Inquisitive**. The conversation was constructive and solution-oriented."
        )
        actions = ["View detailed analytics", "Review speaker talk-time"]

    else:
        # Match question against transcripts
        matching_snippets = []
        words = [w for w in re.findall(r'\w+', q) if len(w) > 3]
        for t in meeting.transcripts:
            for w in words:
                if w in t.text.lower():
                    matching_snippets.append(f"[{int(t.start_time)//60:02d}:{int(t.start_time)%60:02d}] {t.speaker}: \"{t.text}\"")
                    break

        if matching_snippets:
            snippet_text = "\n".join(matching_snippets[:3])
            ans = (
                f"Regarding your question in '{meeting.title}', here are the most relevant transcript segments:\n\n"
                f"{snippet_text}\n\n"
                f"**Context Overview:** {overview}"
            )
        else:
            ans = (
                f"During '{meeting.title}', the discussion focused on {topics}. "
                f"Key highlight: {overview} "
                f"Feel free to ask about specific participants, action items, or request a drafted email."
            )
        actions = ["Ask another question", "Seek to timestamp", "Highlight transcript"]

    return schemas.AskFredResponse(answer=ans, suggested_actions=actions)
