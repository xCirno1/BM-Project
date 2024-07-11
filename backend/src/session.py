import asyncio
import json

from typing import Callable, Awaitable
from datetime import timedelta
from fastapi_jwt_auth import AuthJWT
from fastapi_jwt_auth.exceptions import MissingTokenError
from fastapi import Request, status, Depends, HTTPException, WebSocket, Response, HTTPException, status
from starlette.types import ASGIApp, Message, Receive, Scope, Send
from starlette.middleware.base import BaseHTTPMiddleware

config = json.load(open("./config.json"))

ACCESS_TOKEN_EXPIRES_IN = 150
REFRESH_TOKEN_EXPIRES_IN = 600
JWT_ALGORITHM = config["JWT_ALGORITHM"]
JWT_PRIVATE_KEY = config["JWT_PRIVATE_KEY"]
JWT_PUBLIC_KEY = config["JWT_PUBLIC_KEY"]


def ws_require_auth(websocket: WebSocket, authorization: AuthJWT = Depends()):
    try:
        authorization.jwt_required(auth_from="websocket", websocket=websocket)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token is invalid or has expired')
    return authorization


class RefreshMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        try:
            await super().__call__(scope, receive, send)
        except RuntimeError as exc:
            if str(exc) == "No response returned.":
                request = Request(scope, receive=receive)
                if await request.is_disconnected():
                    return
            raise

    async def dispatch_func(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]):
        if any([request.url.path.endswith(route) for route in [
            "login", "docs"
        ]]):
            return await call_next(request)
        if request.method == "OPTIONS":
            response = Response(headers={
                "Access-Control-Allow-Origin": request.headers["referer"].rstrip("/"),
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
                "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Key, Authorization",
                "Access-Control-Allow-Credentials": "true"
            })
            return response

        authorization = AuthJWT(request)
        request.state.authorization = authorization

        try:
            authorization.jwt_required()
        except (MissingTokenError, HTTPException):
            try:
                authorization.jwt_refresh_token_required()
            except MissingTokenError:
                response = Response(status_code=status.HTTP_401_UNAUTHORIZED, content="{'detail': 'Could not refresh access token'}")
                return response

            username = authorization.get_jwt_subject()
            if not username:
                response = Response(status_code=status.HTTP_401_UNAUTHORIZED, content="{'detail': 'Could not refresh access token'}")
                return response

            access_token = authorization.create_access_token(subject=str(username), expires_time=timedelta(minutes=ACCESS_TOKEN_EXPIRES_IN))
            response = await call_next(request)
            response.set_cookie("__reactSessionToken__", access_token, expires=ACCESS_TOKEN_EXPIRES_IN * 60, httponly=True)
            return response

        else:
            return await call_next(request)