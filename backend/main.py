from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
import models
import schemas
import crud
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fireflies.ai Clone API",
    description="Backend API for meeting transcription, AI notes, action items, and AskFred assistant",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "app": "Fireflies.ai Clone API",
        "status": "online",
        "docs_url": "/docs"
    }

# ----------------- MEETINGS ENDPOINTS -----------------

@app.get("/api/meetings", response_model=List[schemas.MeetingResponse])
def get_meetings_endpoint(
    search: Optional[str] = Query(None, description="Search by title, overview, transcript, or participant"),
    participant: Optional[str] = Query(None, description="Filter by participant name"),
    status: Optional[str] = Query(None, description="Filter by status (all, completed, upcoming, missed, live)"),
    db: Session = Depends(get_db)
):
    return crud.get_meetings(db=db, search=search, participant=participant, status=status)

@app.get("/api/meetings/{meeting_id}", response_model=schemas.MeetingResponse)
def get_meeting_endpoint(meeting_id: int, db: Session = Depends(get_db)):
    db_meeting = crud.get_meeting(db=db, meeting_id=meeting_id)
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return db_meeting

@app.post("/api/meetings", response_model=schemas.MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting_endpoint(meeting: schemas.MeetingCreate, db: Session = Depends(get_db)):
    return crud.create_meeting(db=db, meeting=meeting)

@app.put("/api/meetings/{meeting_id}", response_model=schemas.MeetingResponse)
def update_meeting_endpoint(meeting_id: int, data: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    updated = crud.update_meeting(db=db, meeting_id=meeting_id, data=data)
    if not updated:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return updated

@app.put("/api/meetings/{meeting_id}/reschedule", response_model=schemas.MeetingResponse)
def reschedule_meeting_endpoint(meeting_id: int, data: schemas.MeetingReschedule, db: Session = Depends(get_db)):
    updated = crud.reschedule_meeting(db=db, meeting_id=meeting_id, date=data.date, duration=data.duration, status=data.status or "upcoming")
    if not updated:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return updated

@app.patch("/api/meetings/{meeting_id}/status", response_model=schemas.MeetingResponse)
def patch_meeting_status_endpoint(meeting_id: int, status: str, db: Session = Depends(get_db)):
    updated = crud.patch_meeting_status(db=db, meeting_id=meeting_id, status=status)
    if not updated:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return updated

@app.delete("/api/meetings/{meeting_id}")
def delete_meeting_endpoint(meeting_id: int, db: Session = Depends(get_db)):
    success = crud.delete_meeting(db=db, meeting_id=meeting_id)
    if not success:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {"message": "Meeting deleted successfully", "id": meeting_id}

# ----------------- ACTION ITEMS ENDPOINTS -----------------

@app.post("/api/meetings/{meeting_id}/action-items", response_model=schemas.ActionItemResponse, status_code=status.HTTP_201_CREATED)
def add_action_item_endpoint(meeting_id: int, item: schemas.ActionItemCreate, db: Session = Depends(get_db)):
    new_item = crud.add_action_item(db=db, meeting_id=meeting_id, item=item)
    if not new_item:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return new_item

@app.put("/api/action-items/{action_id}", response_model=schemas.ActionItemResponse)
def update_action_item_endpoint(action_id: int, item: schemas.ActionItemUpdate, db: Session = Depends(get_db)):
    updated = crud.update_action_item(db=db, action_id=action_id, item=item)
    if not updated:
        raise HTTPException(status_code=404, detail="Action item not found")
    return updated

@app.patch("/api/action-items/{action_id}", response_model=schemas.ActionItemResponse)
def toggle_action_item_endpoint(action_id: int, db: Session = Depends(get_db)):
    updated = crud.toggle_action_item(db=db, action_id=action_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Action item not found")
    return updated

@app.delete("/api/action-items/{action_id}")
def delete_action_item_endpoint(action_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_action_item(db=db, action_id=action_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Action item not found")
    return {"message": "Action item deleted successfully", "id": action_id}

# ----------------- ASK FRED AI ENDPOINT -----------------

@app.post("/api/meetings/{meeting_id}/ask-fred", response_model=schemas.AskFredResponse)
def ask_fred_endpoint(meeting_id: int, query: schemas.AskFredQuery, db: Session = Depends(get_db)):
    db_meeting = crud.get_meeting(db=db, meeting_id=meeting_id)
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return crud.ask_fred_response(meeting=db_meeting, question=query.question)

if __name__ == "__main__":
    import uvicorn
    print("Starting Fireflies.ai Clone FastAPI backend on http://127.0.0.1:8000 ...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

