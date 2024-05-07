from enum import Enum


class NotificationType(Enum):
    REQUEST = 1
    REARRANGED = 2
    REJECTED = 3
    REMINDER = 4
    WARNING = 5


class RealizationType(Enum):
    DONE = 1
    PENDING = 2
    RESCHEDULED = 3
    FAILED = 4
    WAITING = 5