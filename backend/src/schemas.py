from pydantic import BaseModel
from typing import Literal


class LoginSchema(BaseModel):
    username: str
    password: str
    remember: bool = False


class MeetingSchema(BaseModel):
    topic: str
    time: int | None = None
    meeting_class: str | None = None
    target: list[str] | None = None


class MeetingRescheduleSchema(BaseModel):
    time: int
    meeting: dict
    force: bool = False

class MeetingDoneSchema(BaseModel):
    evaluation: str

class MeetingRejectedSchema(BaseModel):
    reason: str

class MeetingAcceptedSchema(BaseModel):
    meeting_class: str

class MeetingTodaySchema(BaseModel):
    meeting_class: str

class MeetingReviewSchema(BaseModel):
    judgement: Literal["bad", "good"]
    information: str

class TimestampDifferSchema(BaseModel):
    old_time: int
    new_time: int

class UpdatePasswordSchema(BaseModel):
    old: str
    new: str
