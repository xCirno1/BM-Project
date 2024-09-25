from fastapi import status, HTTPException
from functools import wraps

from .utils import is_student

def restricted(func):
    @wraps(func)
    async def inner(*args, **kwargs):
        if (req := kwargs.get("request")) and is_student(req.state.authorization.get_jwt_subject()):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You must be a teacher to do this.")  
        ret = await func(*args, **kwargs)
        return ret
    return inner
