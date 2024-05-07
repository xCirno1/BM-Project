import datetime


def en_to_id_day(string: str) -> str:
    converts = {
        "sunday": "Minggu",
        "monday": "Senin",
        "tuesday": "Selasa",
        "wednesday": "Rabu",
        "thursday": "Kamis",
        "friday": "Jumat",
        "saturday": "Sabtu",
    }
    return converts[string.lower().strip()]

def is_student(username: str):
    return username.isdigit()

def day_time_range(current_date: datetime.datetime) -> tuple[int, int]:
    start_day_timestamp = int(datetime.datetime(year=current_date.year, month=current_date.month, day=current_date.day).timestamp())
    end_day_timestamp = start_day_timestamp + 86400
    return start_day_timestamp, end_day_timestamp