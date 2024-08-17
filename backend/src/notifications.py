import datetime
import time
import uuid

from fastapi import WebSocket
from pydantic import BaseModel
from typing import cast

from .enums import NotificationType
from .schemas import MeetingSchema
from .utils import en_to_id_day, is_student
from .database import fetch, execute, get_users

async def fetch_notifications(target: str) -> list[dict[str, uuid.UUID | str | int]]:
    rows = await fetch("SELECT id, title, content, `type`, `timestamp` FROM notifications WHERE `to`=%s ORDER BY `timestamp` DESC LIMIT 20", (target,))
    if rows is None:
        rows = []
    to_send = []
    for row in rows:
        id, title, content, _type, _time = row
        to_send.append({"id": str(uuid.UUID(bytes=bytes(cast(bytearray, id)))), "title": title, "content": content, "type": _type, "timestamp": _time})
    return to_send


async def send_notification(websockets: list[WebSocket] | None, origin: str, notification_type: NotificationType, target: str, data: BaseModel | dict):
    origin = (await get_users(origin, use_cache=False))[origin]["name"]
    entry_id = bytearray(uuid.uuid4().bytes)

    if notification_type == NotificationType.REQUEST:
        data = cast(MeetingSchema, data)
        topic, _time = data.topic, data.time
        date = datetime.datetime.fromtimestamp(int(cast(int, _time)))
        params: tuple = (
            entry_id,
            "Permintaan Tutor",
            f"Anda diminta oleh {origin} pada {en_to_id_day(date.strftime('%A'))}{date.strftime(', %d %B %Y')} untuk mengikuti tutor tentang '{topic}'" + 
            (" di kelas {data.meeting_class}." if is_student(origin) else ". Silahkan tentukan kelas tutor pada entri yang tersedia."),
            origin,
            target,
            int(time.time()),
            NotificationType.REQUEST.value
        )
        sql_query = "INSERT INTO notifications (id, title, content, `from`, `to`, `timestamp`, `type`) VALUES (%s, %s, %s, %s, %s, %s, %s);"
        await execute(sql_query, params=params)

    elif notification_type == NotificationType.REARRANGED:
        data = cast(dict, data)
        origin_date = datetime.datetime.fromtimestamp(int(cast(int, data["old_time"])))
        new_date = datetime.datetime.fromtimestamp(int(cast(int, data["new_time"])))
        params: tuple = (
            entry_id,
            "Penjadwalan Ulang",
            f"Tutor anda bersama {origin} yang sebelumnya {en_to_id_day(origin_date.strftime('%A'))}{origin_date.strftime(', %d %B %Y')} diubah menjadi {en_to_id_day(new_date.strftime('%A'))}{new_date.strftime(', %d %B %Y')}.",
            origin,
            target,
            int(time.time()),
            NotificationType.REARRANGED.value
        )
        sql_query = "INSERT INTO notifications (id, title, content, `from`, `to`, `timestamp`, `type`) VALUES (%s, %s, %s, %s, %s, %s, %s);"
        await execute(sql_query, params=params)

    elif notification_type == NotificationType.REJECTED:
        data = cast(dict, data)
        date = datetime.datetime.fromtimestamp(int(cast(int, data["time"])))
        params: tuple = (
            entry_id,
            f"{'Penolakan' if not data['cancel'] else 'Pembatalan'} Tutor",
            f"Permintaan tutor anda bersama {origin} pada {en_to_id_day(date.strftime('%A'))}{date.strftime(', %d %B %Y')} {'ditolak' if not data['cancel'] else 'dibatalkan'} karena '{data['reason']}'.",
            origin,
            target,
            int(time.time()),
            NotificationType.REJECTED.value
        )
        sql_query = "INSERT INTO notifications (id, title, content, `from`, `to`, `timestamp`, `type`) VALUES (%s, %s, %s, %s, %s, %s, %s);"
        await execute(sql_query, params=params)

    elif notification_type == NotificationType.CONFIRMED:
        data = cast(dict, data)
        date = datetime.datetime.fromtimestamp(int(cast(int, data["time"])))
        params: tuple = (
            entry_id,
            "Konfirmasi Tutor",
            f"Permintaan tutor anda bersama {origin} pada {en_to_id_day(date.strftime('%A'))}{date.strftime(', %d %B %Y')} telah dikonfirmasi di kelas {data['class']}.",
            origin,
            target,
            int(time.time()),
            NotificationType.CONFIRMED.value
        )
        sql_query = "INSERT INTO notifications (id, title, content, `from`, `to`, `timestamp`, `type`) VALUES (%s, %s, %s, %s, %s, %s, %s);"
        await execute(sql_query, params=params)

    elif notification_type == NotificationType.WARNING:
        data = cast(dict, data)
        date = datetime.datetime.fromtimestamp(int(cast(int, data["time"])))
        params: tuple = (
            entry_id,
            "Penolakan Tutor",
            f"Permintaan tutor anda bersama {origin} pada {en_to_id_day(date.strftime('%A'))}{date.strftime(', %d %B %Y')} ditolak karena {data['reason']}.",
            origin,
            target,
            int(time.time()),
            NotificationType.WARNING.value
        )
        sql_query = "INSERT INTO notifications (id, title, content, `from`, `to`, `timestamp`, `type`) VALUES (%s, %s, %s, %s, %s, %s, %s);"
        await execute(sql_query, params=params)

    if websockets is not None:
        for websocket in websockets:
            await websocket.send_json(await fetch_notifications(target=target))
