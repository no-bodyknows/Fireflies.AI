from pydantic import BaseModel, ConfigDict, field_serializer
from datetime import datetime, timezone
from typing import List, Optional

# Participant Schemas
class ParticipantBase(BaseModel):
    name: str
    email: Optional[str] = None

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantResponse(ParticipantBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Transcript Schemas
class TranscriptBase(BaseModel):
    speaker: str
    start_time: float
    end_time: Optional[float] = None
    text: str

class TranscriptCreate(TranscriptBase):
    pass

class TranscriptResponse(TranscriptBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Summary Schemas
class SummaryBase(BaseModel):
    overview: Optional[str] = None
    key_topics: Optional[str] = None

class SummaryCreate(SummaryBase):
    pass

class SummaryResponse(SummaryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Action Item Schemas
class ActionItemBase(BaseModel):
    task: str
    assignee: Optional[str] = None
    is_completed: bool = False

class ActionItemCreate(ActionItemBase):
    pass

class ActionItemUpdate(BaseModel):
    task: Optional[str] = None
    assignee: Optional[str] = None
    is_completed: Optional[bool] = None

class ActionItemResponse(ActionItemBase):
    id: int
    meeting_id: int
    model_config = ConfigDict(from_attributes=True)

# Meeting Schemas
class MeetingBase(BaseModel):
    title: str
    date: datetime
    duration: int
    audio_url: Optional[str] = None
    status: Optional[str] = "upcoming"

class MeetingCreate(MeetingBase):
    participants: List[ParticipantCreate] = []
    transcripts: List[TranscriptCreate] = []
    summary: Optional[SummaryCreate] = None
    action_items: List[ActionItemCreate] = []

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[datetime] = None
    duration: Optional[int] = None
    audio_url: Optional[str] = None
    status: Optional[str] = None
    participants: Optional[List[ParticipantCreate]] = None

class MeetingReschedule(BaseModel):
    date: datetime
    duration: int
    status: Optional[str] = "upcoming"

class MeetingResponse(MeetingBase):
    id: int
    created_at: datetime
    participants: List[ParticipantResponse] = []
    transcripts: List[TranscriptResponse] = []
    summary: Optional[SummaryResponse] = None
    action_items: List[ActionItemResponse] = []
    model_config = ConfigDict(from_attributes=True)

    @field_serializer("date", "created_at", when_used="json")
    def serialize_datetime(self, dt: datetime, _info):
        if dt.tzinfo is None:
            # SQLite stores naive UTC; serialize with explicit UTC timezone so browsers parse correctly
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()

# AskFred AI Assistant Schemas
class AskFredQuery(BaseModel):
    question: str

class AskFredResponse(BaseModel):
    answer: str
    suggested_actions: Optional[List[str]] = None
