import json
from re import T
from mysql.connector.aio import connect
from mysql.connector.types import RowType, RowItemType
from typing import overload, Literal, cast, Any

config = json.load(open("./config.json"))
cached_users = {}

@overload
async def fetch(query: str, params: tuple | dict[str, Any] = tuple(), fetchone: Literal[False] = False) -> list[RowType]: ...
@overload
async def fetch(query: str, params: tuple | dict[str, Any] = tuple(), fetchone: Literal[True] = True) -> RowType | None: ...
@overload
async def fetch(query: str, params: tuple | dict[str, Any] = tuple(), fetchone: bool = ...) -> RowType | list[RowType] | None: ...

async def fetch(query: str, params: tuple | dict[str, Any] = tuple(), fetchone: bool = False):
    async with await connect(host=config["DB_HOST"], port=config["DB_PORT"], user=config["DB_USERNAME"], password=config["DB_PASSWORD"], database=config['DB_NAME']) as con:
        async with await con.cursor(buffered=True) as cur:
            await cur.execute(query, params=params)
            if fetchone:
                result = await cur.fetchone()
            else:
                result = await cur.fetchall()
    return result

async def execute(query: str, params: tuple | dict[str, Any]):
    async with await connect(host=config["DB_HOST"], port=config["DB_PORT"], user=config["DB_USERNAME"], password=config["DB_PASSWORD"], database=config['DB_NAME']) as con:
        async with await con.cursor() as cur:
            await cur.execute(query, params=params)
        await con.commit()


async def get_users(user_ids: list[str] | str, use_cache: bool = False) -> dict[str, dict[str, str]]:
    if not user_ids:
        return {}
    distinct_user_ids = set(user_ids) if isinstance(user_ids, list) else set([user_ids])
    # If cache is incomplete, then fallback to the database and complete the cache
    if use_cache and all((ret := {id_: cached_users.get(id_, False) for id_ in distinct_user_ids}).values()):
        return ret

    # Works by putting n amount of %s from n amount of user_ids in the IN clause
    format_strings = ','.join(["%s"] * len(distinct_user_ids))
    
    sql_query = "SELECT id, `name`, class, `type`, `password` FROM accounts WHERE id in (%s);" % format_strings

    datas = await fetch(sql_query, tuple(distinct_user_ids))
    ret = {}
    for data in datas:
        entry = {
            "id": data[0],
            "name": data[1],
            "class": data[2],
            "type": data[3]
        }
        cached_users[data[0]] = ret[data[0]] = entry

    return ret

async def fetch_people(account_type: str, group_by: Literal["class", "id"] = "class") -> dict[str, dict[str, str]]:
    query = "SELECT `id`, `name`, `class` FROM accounts WHERE `type`= %s;"
    datas = await fetch(query, (account_type,))
    if group_by == "class":
        if datas is None:
            return {}
        to_send = {}
        for data in datas:
            id_, name, class_ = data
            to_send[class_] = to_send.get(class_, []) + [{"id": id_, "name": name}]
        return to_send
    if group_by == "id":
        return {cast(str, entry[0]): {"name": cast(str, entry[1]), "class": cast(str, entry[2])} for entry in datas} 