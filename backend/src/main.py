# TODO: Add settings to change password
# TODO: Implement pagination on student progress
# TODO: Add web icon
# TODO: Properly implement keep logged in
# TODO: When student rescheduled, delete entry (when previous state is "waiting", delete entry)
# LIMITATIONS: Siswa ekskul/izin

import asyncio
import base64
import datetime
import hashlib
import json
import uvicorn
import uuid
import time

from datetime import timedelta
from fastapi import FastAPI, Request, Response, status, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi_jwt_auth import AuthJWT
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from typing import cast, Any
from websockets import ConnectionClosedOK, ConnectionClosedError

from .enums import NotificationType, RealizationType
from .notifications import send_notification, fetch_notifications
from .schemas import LoginSchema, MeetingReviewSchema, MeetingTodaySchema, MeetingSchema, MeetingRejectedSchema, MeetingRescheduleSchema, MeetingDoneSchema, MeetingAcceptedSchema, UpdatePasswordSchema
from .session import JWT_ALGORITHM, JWT_PRIVATE_KEY, JWT_PUBLIC_KEY, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, ws_require_auth, RefreshMiddleware
from .utils import is_student, day_time_range
from .database import fetch, execute, get_users, fetch_people

ws_connections: dict[str, list[WebSocket]] = {}
config = json.load(open("./config.json"))

class Settings(BaseModel):
    authjwt_algorithm: str = JWT_ALGORITHM
    authjwt_decode_algorithms: list[str] = [JWT_ALGORITHM]
    authjwt_token_location: set = {"cookies", "headers"}
    authjwt_access_cookie_key: str = "__reactSessionToken__"
    authjwt_refresh_cookie_key: str = "__reactRefreshToken__"
    authjwt_cookie_csrf_protect: bool = False
    authjwt_public_key: str = base64.b64decode(JWT_PUBLIC_KEY).decode("utf-8")
    authjwt_private_key: str = base64.b64decode(JWT_PRIVATE_KEY).decode("utf-8")

@AuthJWT.load_config  # type: ignore
def get_config():
    return Settings()

main_api: FastAPI = FastAPI()
api: FastAPI = FastAPI()
api.add_middleware(RefreshMiddleware)

api.add_middleware(
    CORSMiddleware,
    allow_origins=config["ORIGINS"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_group_id(meeting_class: str | None, time_range: tuple[int, int]):
    sql_query = f"SELECT group_id FROM meetings WHERE meeting_class=%s AND meeting_timestamp BETWEEN {time_range[0]} AND {time_range[1]};"
    res = await fetch(sql_query, (meeting_class,), fetchone=True)
    group_id = bytearray(uuid.uuid4().bytes)
    if res is not None:
        group_id = cast(bytearray, res[0])
    return group_id

@main_api.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, authorization: AuthJWT | None = Depends(ws_require_auth)) -> None:
    if authorization is not None:
        username = cast(str, authorization.get_jwt_subject())
    try:
        await websocket.accept()
        if authorization is None:
            print("Unauthorized source trying to access the websocket.")
            return await websocket.close(code=3000, reason="You are unathorized to connect to the websocket.")
        print(f"WebSocket connection accepted for {username}.")
        ws_connections[username] = ws_connections.get(username, []) + [websocket]
        while True:
            data = await websocket.receive_json()
            if data["s"] == 1:
                datas = await fetch_notifications(target=username)
                await websocket.send_json(datas)
    except WebSocketDisconnect:
        # Tab closed / no connection
        print(f"WebSocket disconnected for {username}.")
    except ConnectionClosedOK:
        print(f"WebSocket connection closed OK for {username}.")
    except asyncio.CancelledError:
        # Task was interrupted
        print(f"WebSocket connection cancelled for {username}.")
    except ConnectionClosedError as e:
        print(f"Connection closed with error {e} for {username}.")
        if e.code != 1012:
            raise e
    except Exception as e:
        print(f"Unhandled exception in WebSocket connection for {username}: {e}")
    finally:
        try:
            ws_connections[username].remove(websocket)
        except (KeyError, UnboundLocalError):
            pass

@api.get("/meetings/personal")
async def get_personal_meetings():
    current_date = datetime.datetime.now()
    start_day_timestamp = int(datetime.datetime(year=current_date.year, month=current_date.month, day=current_date.day).timestamp())
    end_day_timestamp = start_day_timestamp + 86400
    sql_query = f"SELECT id, group_id, meeting_timestamp, student, topic, realization, meeting_class, arrangement_timestamp, evaluation, description FROM meetings WHERE teacher is null AND (meeting_timestamp BETWEEN {start_day_timestamp} AND {end_day_timestamp})"
    meetings = await fetch(sql_query)
    people = await fetch_people(account_type="student", group_by="id")
    # {"class": {"id": "", "attend": False, "reviewed": False, "name": "", "class": ""}}
    to_send: dict[str, list[dict[str, str | bool | dict[str, str] | None]]] = {}
    for entry in meetings:  # Users who attend meeting today
        try:
            person: dict[str, str] = people[cast(str, entry[3])]
        except KeyError:  # User doesn't exist in database or there are multiple entries
            continue
        person["id"] = cast(str, entry[3])
        to_send[person["class"]] = to_send.get(person["class"], []) + [{"id": str(uuid.UUID(bytes=bytes(cast(bytearray, entry[0])))), "attend": True, "reviewed": bool(entry[8]), "student": person, "topic": cast(str, entry[4])}]
        del people[cast(str, entry[3])]

    for key in people:  # Users who doesn't attend meeting today
        person = people[key]
        person["id"] = key
        to_send[person["class"]] = to_send.get(person["class"], []) + [{"id": None, "attend": False, "reviewed": False, "student": person, "topic": None}]
    
    for key in to_send:
        to_send[key].sort(key=lambda k: cast(dict[str, str], k["student"])["name"])
    return to_send

@api.post("/meetings/today")
async def post_meetings_today(body: MeetingTodaySchema | None = None):
    time_range = day_time_range(current_date=datetime.datetime.now())
    sql_query = f"SELECT id, group_id, meeting_timestamp, teacher, student, topic, realization, meeting_class, arrangement_timestamp, evaluation, description, created_by FROM meetings WHERE teacher is not NULL AND meeting_timestamp BETWEEN {time_range[0]} AND {time_range[1]};"
    res = await fetch(sql_query)
    usernames: list[str] = []
    for i in res:
        usernames.append(cast(str, i[3]))
        usernames.append(cast(str, i[4]))

    acc_info = await get_users(usernames)
    to_send: list[dict[str, Any]] = []
    for meeting in res:
        if body is not None and meeting[7] != body.meeting_class and meeting[6] != RealizationType.PENDING:
            continue
        format = {
            "id": str(uuid.UUID(bytes=bytes(cast(bytearray, meeting[0])))),
            "teacher": acc_info[cast(str, meeting[3])],
            "student": acc_info[cast(str, meeting[4])],
            "topic": meeting[5],
            "meeting_class": meeting[7]
        }
        to_send.append(format)
    return to_send


@api.get("/meetings/done/{target}")
async def get_meetings_done_target(target: str, request: Request):
    # Personal (every unrated tutors) & Private meetings (Done)
    if target == "@me":
        target = cast(str, request.state.authorization.get_jwt_subject())
    print(target)
    sql_query = "SELECT id, meeting_timestamp, teacher, student, topic, realization, meeting_class, arrangement_timestamp, evaluation, `description`, created_by FROM meetings WHERE (realization=%s OR teacher=NULL) AND student=%s"
    res = await fetch(sql_query, params=(RealizationType.DONE.value, target))
    to_send = []
    usernames: list[str] = []
    for i in res:
        usernames.append(cast(str, i[2]))
        usernames.append(cast(str, i[3]))

    acc_info = await get_users(usernames)

    for meeting in res:
        to_send.append({
            "id": str(uuid.UUID(bytes=bytes(cast(bytearray, meeting[0])))),
            "meeting_timestamp": meeting[1],
            "teacher": (teacher) if (teacher := meeting[2]) is None else acc_info[cast(str, meeting[2])],
            "student": acc_info[cast(str, meeting[3])],
            "topic": meeting[4],
            "realization": meeting[5],
            "meeting_class": meeting[6],
            "arrangement_timestamp": meeting[7],
            "evaluation": meeting[8],
            "description": meeting[9],
            "created_by": cb if (cb := cast(str, meeting[10])) in ("student", "teacher", "") else (await get_users(cb, use_cache=True)).get(cb, "CANNOT RETRIEVE USERNAME")
        })
    return to_send

@api.get("/meetings")
async def get_meetings(request: Request):
    username = cast(str, request.state.authorization.get_jwt_subject())
    sql_query = f"SELECT id, group_id, meeting_timestamp, teacher, student, topic, realization, meeting_class, arrangement_timestamp, evaluation, description, created_by FROM meetings WHERE {'student' if is_student(username) else 'teacher'}=%s;"
    meetings = await fetch(sql_query, params=(username, ))
    if meetings is None:
        meetings = []
    to_send: dict[str, list[dict[str, Any]]] = {}
    usernames = [cast(str, i[3 if is_student(username) else 4]) for i in meetings]
    acc_info = await get_users(usernames)
    for meeting in meetings:
        key = str(uuid.UUID(bytes=bytes(cast(bytearray, meeting[1]))))
        format = {
            "id": str(uuid.UUID(bytes=bytes(cast(bytearray, meeting[0])))),
            "meeting_timestamp": meeting[2],
            "teacher": None if (teacher := meeting[3]) is None else (acc_info[cast(str, teacher)] if is_student(username) else teacher),
            "student": acc_info[cast(str, meeting[4])] if not is_student(username) else meeting[4],
            "topic": meeting[5],
            "realization": meeting[6],
            "meeting_class": meeting[7],
            "arrangement_timestamp": meeting[8],
            "evaluation": meeting[9],
            "description": meeting[10],
            "created_by": meeting[11]
        }

        to_send[key] = to_send.get(key, []) + [format]
    return to_send

@api.post("/meetings")
async def post_meetings(request: Request, body: MeetingSchema):
    username = cast(str, request.state.authorization.get_jwt_subject())
    current_date = datetime.datetime.fromtimestamp(body.time) if body.time is not None else datetime.datetime.now()
    time_range = day_time_range(current_date=current_date)

    # Personal meetings
    if body.target is None or body.time is None:
        class_ = (await get_users(username, use_cache=True))[username]["class"]  # We use cache here because class shouln't change 
        sql_query = f"SELECT group_id FROM meetings WHERE teacher is null AND meeting_class=%s AND (meeting_timestamp BETWEEN {time_range[0]} AND {time_range[1]});"
        res = await fetch(sql_query, (class_,), fetchone=True)

        group_id = bytearray(uuid.uuid4().bytes)
        if res is not None:
            raise HTTPException(status_code=403, detail="Cannot create multiple personal meetings in one day.")
        sql_query = "INSERT INTO meetings (id, group_id, meeting_timestamp, teacher, student, topic, realization, meeting_class, arrangement_timestamp, evaluation, created_by)"\
            "VALUES (%(id)s, %(gid)s, %(mt)s, null, %(student)s, %(topic)s, %(rt)s, %(mc)s, %(at)s, %(ev)s, %(cb)s);"
        await execute(sql_query, params={
            "id": bytearray(uuid.uuid4().bytes),
            "gid": group_id, 
            "mt": int(time.time()),
            "student": username, 
            "topic": body.topic,
            "rt": RealizationType.PENDING.value,
            "mc": class_, 
            "at": int(time.time()), 
            "ev": "",
            "cb": username
        })
        return
    string = ','.join(["%s"] * len(body.target))
    sql_query = f"SELECT {'teacher' if is_student(username) else 'student'} FROM meetings WHERE {'teacher' if is_student(username) else 'student'} in ({string}) AND {'student' if is_student(username) else 'teacher'}=%s AND (meeting_timestamp BETWEEN {time_range[0]} AND {time_range[1]});"
    duplicates = cast(list[tuple[str]], await fetch(sql_query, tuple(body.target) + (username,)))
    if duplicates:
        raise HTTPException(status_code=403, detail={"conflicts": await get_users([d[0] for d in duplicates])})
    for person in body.target:
        # Select group id where meeting_class and meeting timestamp is the same
        sql_query = "INSERT INTO meetings (id, group_id, meeting_timestamp, teacher, student, topic, realization, meeting_class, arrangement_timestamp, evaluation, created_by)"\
            "VALUES (%(id)s, %(gid)s, %(mt)s, %(teacher)s, %(student)s, %(topic)s, %(rz)s, %(mc)s, %(at)s, %(ev)s, %(cb)s);"
        await execute(sql_query, params={
            "id": bytearray(uuid.uuid4().bytes),
            "gid": await get_group_id(body.meeting_class, time_range=day_time_range(current_date)), 
            "mt": int(body.time),
            "teacher": person if is_student(username) else username, 
            "student": username if is_student(username) else person, 
            "topic": body.topic,
            "rz": str(RealizationType.WAITING.value if is_student(username) else RealizationType.PENDING.value),
            "mc": body.meeting_class, 
            "at": int(time.time()), 
            "ev": "No details provided.",
            "cb": "student" if is_student(username) else "teacher"
        })
        await send_notification(websockets=ws_connections.get(person), origin=username, notification_type=NotificationType.REQUEST, target=person, data=body)

@api.post("/meetings/{meeting_id}/accept")
async def post_meeting_accept(request: Request, meeting_id: str, body: MeetingAcceptedSchema):
    if body is not None:
        data = await fetch("SELECT student, meeting_timestamp FROM meetings WHERE id=%s", (uuid.UUID(meeting_id).bytes,), fetchone=True)
        assert data is not None
        group_id = await get_group_id(body.meeting_class, time_range=day_time_range(datetime.datetime.fromtimestamp(cast(int, data[1]))))
    additional = ', `meeting_class`=%s, group_id=%s' if body else ''
    sql_query = f"UPDATE `meetings` SET `realization`=2{additional} WHERE id=%s;"
    await execute(sql_query, ((body.meeting_class, group_id) if body is not None else tuple()) + (uuid.UUID(meeting_id).bytes, ))
    obj = {
        "time": data[1],
        "class": body.meeting_class
    }
    await send_notification(websockets=ws_connections.get(cast(str, data[0])), origin=request.state.authorization.get_jwt_subject(), notification_type=NotificationType.CONFIRMED, target=cast(str, data[0]), data=obj)
    return {"status": "success", "message": "Meeting accepted successfully."}


@api.post("/meetings/{meeting_id}/reject")
async def post_meeting_reject(request: Request, body: MeetingRejectedSchema, meeting_id: str):
    username = cast(str, request.state.authorization.get_jwt_subject())
    sql_query = "UPDATE `meetings` SET `realization`=4, `description`=%s WHERE id=%s;"
    await execute(sql_query, (body.reason, uuid.UUID(meeting_id).bytes))
    res = await fetch("SELECT student, meeting_timestamp FROM meetings WHERE id=%s;", (uuid.UUID(meeting_id).bytes,), fetchone=True)
    assert res is not None
    data = {
        "student": res[0],
        "time": res[1],
        "reason": body.reason,
        "cancel": False
    }
    await send_notification(websockets=ws_connections.get(cast(str, res[0])), origin=username, notification_type=NotificationType.REJECTED, target=cast(str, res[0]), data=data)
    return {"status": "success", "message": "Meeting rejected successfully."}

@api.post("/meetings/{meeting_id}/reschedule")
async def post_meeting_reschedule(request: Request, body: MeetingRescheduleSchema, meeting_id: str):
    username = cast(str, request.state.authorization.get_jwt_subject())
    # Get old meetings details
    sql_query = f"SELECT teacher, student, topic, meeting_class, evaluation, meeting_timestamp, id FROM meetings WHERE teacher=%s AND student=%s AND topic=%s;"
    res = await fetch(sql_query, (body.meeting["teacher"], body.meeting["student"]["id"], body.meeting["topic"]))
    assert res is not None
    for entry in res:
        time_range = day_time_range(datetime.datetime.fromtimestamp(cast(int, entry[5])))
        if time_range[0] < body.time < time_range[1]:
            if body.force:
                await execute("DELETE FROM meetings WHERE id=%s;", (entry[6],))
                break
            raise HTTPException(status_code=406, detail="Timestamp not acceptable.")  
    
    # Set old meeting's realization to be rescheduled
    sql_query = "UPDATE meetings SET realization=%s, `description`=%s WHERE id=%s;"
    await execute(sql_query, params=(RealizationType.RESCHEDULED.value, f"Rescheduled to {datetime.datetime.fromtimestamp(body.time).strftime('%A, %e %B %Y')}", uuid.UUID(meeting_id).bytes))
    g_id = await get_group_id(cast(str, res[0][3]), day_time_range(datetime.datetime.fromtimestamp(body.time)))  
    sql_query = "INSERT INTO meetings (id, group_id, meeting_timestamp, teacher, student, topic, realization, meeting_class, arrangement_timestamp, evaluation, created_by)"\
        "VALUES (%(id)s, %(gid)s, %(mt)s, %(teacher)s, %(student)s, %(topic)s, %(rz)s, %(mc)s, %(at)s, %(ev)s, %(cb)s);"
    await execute(sql_query, params={
        "id": bytearray(uuid.uuid4().bytes),
        "gid": g_id, 
        "mt": int(body.time),
        "teacher": res[0][0],
        "student": res[0][1],
        "topic": res[0][2],
        "rz": RealizationType.WAITING.value if is_student(username) else RealizationType.PENDING.value,
        "mc": res[0][3],
        "at": int(time.time()), 
        "ev": res[0][4],
        "cb": username
    })
    data = {
        "old_time": res[0][5],
        "new_time": body.time
    }
    await send_notification(websockets=ws_connections.get(cast(str, res[0][1])), origin=username, notification_type=NotificationType.REARRANGED, target=cast(str, res[0][1]), data=data)

    return {"status": "success", "message": "Meeting rescheduled successfully."}

@api.post("/meetings/{meeting_id}/done")
async def post_meeting_done(body: MeetingDoneSchema, meeting_id: str):
    time_range = day_time_range(datetime.datetime.now())
    sql_query = f"UPDATE `meetings` SET `evaluation`=%s, `realization`=%s WHERE id=%s AND meeting_timestamp <= {time_range[0]};"
    await execute(sql_query, (body.evaluation, RealizationType.DONE.value, uuid.UUID(meeting_id).bytes))
    return {"status": "success", "message": "Meeting marked as done."}

@api.post("/meetings/{meeting_id}/cancel")
async def post_meeting_cancel(request: Request, body: MeetingRejectedSchema, meeting_id: str):
    username = cast(str, request.state.authorization.get_jwt_subject())
    sql_query = "UPDATE `meetings` SET `realization`=%s, `description`=%s WHERE id=%s;"
    await execute(sql_query, (RealizationType.FAILED.value, body.reason, uuid.UUID(meeting_id).bytes))
    res = await fetch("SELECT student, meeting_timestamp FROM meetings WHERE id=%s;", (uuid.UUID(meeting_id).bytes,), fetchone=True)
    assert res is not None
    data = {
        "student": res[0],
        "time": res[1],
        "reason": body.reason,
        "cancel": True
    }
    await send_notification(websockets=ws_connections.get(cast(str, res[0])), origin=username, notification_type=NotificationType.REJECTED, target=cast(str, res[0]), data=data)

    return {"status": "success", "message": "Meeting cancelled successfully."}

@api.post("/meetings/{meeting_id}/review")
async def post_meeting_review(request: Request, body: MeetingReviewSchema, meeting_id: str):
    username = cast(str, request.state.authorization.get_jwt_subject())

    time_range = day_time_range(datetime.datetime.now())
    sql_query = f"UPDATE `meetings` SET `evaluation`=%s, `realization`=%s, `created_by`=%s WHERE id=%s AND meeting_timestamp BETWEEN {time_range[0]} AND {time_range[1]};"

    await execute(sql_query, (f"{body.judgement}:{body.information}", RealizationType.DONE.value, username, uuid.UUID(meeting_id).bytes))
    return {"status": "success", "message": "Meeting marked as done."}

@api.get("/people")
async def get_people(request: Request):
    username = cast(str, request.state.authorization.get_jwt_subject())
    return await fetch_people("teacher" if is_student(username) else "student")

@api.get("/me")
async def get_me(request: Request):
    username = cast(str, request.state.authorization.get_jwt_subject())
    data = (await get_users(username))[username]
    if data is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Record is not found on the database.")
    return {"username": username, "display_name": data["name"], "class": data["class"], "type": data["type"]}

@api.post("/reset-password")
async def post_reset_password(request: Request, body: UpdatePasswordSchema):
    username = cast(str, request.state.authorization.get_jwt_subject())
    if len(body.old) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password should be longer than 8 characters.")

    pass_hash = await fetch("SELECT `password` FROM accounts WHERE id=%s;", (username,), fetchone=True)
    assert pass_hash is not None
    if (pass_hash[0] == hashlib.sha512(body.old.encode('utf-8')).digest()) or (pass_hash[0] is None and body.old == username):
        await execute("UPDATE accounts SET `password`=%s WHERE id=%s;", (
            (hashlib.sha512(body.new.encode('utf-8')).digest(), username)
        ))
        return {"status": "success", "message": "Password changed."}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid old password.")

@api.post("/login")
async def login(request: Request, body: LoginSchema, response: Response):
    authorization = AuthJWT()
    account = await fetch("SELECT password FROM accounts WHERE id=%s;", (body.username,), fetchone=True)
    if account:
        password = account[0] if account[0] else body.username
    else:
        raise HTTPException(status_code=401, detail="Invalid password or username.")
    if body.password == password:  # TODO: Harusnya hash disini
        access_token = authorization.create_access_token(subject=str(body.username), expires_time=timedelta(seconds=ACCESS_TOKEN_EXPIRES_IN))
        refresh_token = authorization.create_refresh_token(subject=str(body.username), expires_time=timedelta(seconds=REFRESH_TOKEN_EXPIRES_IN))

        response.set_cookie('__reactSessionToken__', access_token, expires=ACCESS_TOKEN_EXPIRES_IN, httponly=True)
        response.set_cookie('__reactRefreshToken__', refresh_token, expires=REFRESH_TOKEN_EXPIRES_IN, httponly=True)
        return {'status': 'success', 'sessionToken': access_token, 'refreshToken': refresh_token}
    else:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password or username.")

@api.post("/refresh")
async def post_refresh(request: Request, response: Response):
    try:
        request.state.authorization.jwt_refresh_token_required()
        username = request.state.authorization.get_jwt_subject()
        if not username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not refresh access token')
        access_token = request.state.authorization.create_access_token(subject=str(username), expires_time=timedelta(seconds=ACCESS_TOKEN_EXPIRES_IN))
    except Exception as e:
        error = e.__class__.__name__
        if error == 'MissingTokenError':
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Please provide refresh token')
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    response.set_cookie('__reactSessionToken__', access_token, expires=ACCESS_TOKEN_EXPIRES_IN, httponly=True)
    return {'sessionToken': access_token}

main_api.mount("/api", api, name="tutor")


@api.post("/logout")
def post_logout(request: Request, response: Response):
    response.delete_cookie("__reactSessionToken__")
    response.delete_cookie("__reactRefreshToken__")
    return


def backend() -> None:
    uvicorn.run("src.main:main_api", host=config["HOST"], port=config["PORT"], log_level="info", reload=True)
