import datetime
import time
import uuid

from fastapi import WebSocket
from pydantic import BaseModel
from typing import cast

from .enums import NotificationType
from .schemas import MeetingSchema
from .utils import en_to_id_day
from .database import fetch, execute

async def fetch_notifications(target: str) -> list[dict[str, uuid.UUID | str | int]]:
    rows = await fetch("SELECT id, title, content, `type`, `timestamp` FROM notifications WHERE `to`=%s ORDER BY `timestamp` DESC LIMIT 20", (target,))
    if rows is None:
        rows = []
    to_send = []
    for row in rows:
        id, title, content, _type, _time = row
        to_send.append({"id": str(uuid.UUID(bytes=bytes(cast(bytearray, id)))), "title": title, "content": content, "type": _type, "timestamp": _time})
    return to_send


async def send_notification(websocket: WebSocket | None, origin: str, notification_type: NotificationType, target: str, data: BaseModel):
    if notification_type == NotificationType.REQUEST:
        # TODO: Di kelas mana?
        data = cast(MeetingSchema, data)
        topic, _time = data.topic, data.time
        origin = origin  # TODO: Ambil dari database nama aslinya, sekarang masih id misalnya "222310034"
        day_name = datetime.datetime.fromtimestamp(int(cast(int, _time))).strftime("%A")
        params: tuple = (
            "Permintaan Tutor",
            f"Anda diminta oleh {origin} pada hari {en_to_id_day(day_name)} untuk mengikuti tutor tentang '{topic}'.",
            origin,
            target,
            int(time.time()),
            1
        )
        sql_query = "INSERT INTO notifications (title, content, `from`, `to`, `timestamp`, `type`) VALUES (%s, %s, %s, %s, %s, %s);"
        await execute(sql_query, params=params)

        if websocket is not None:
            await websocket.send_json(await fetch_notifications(target=target))