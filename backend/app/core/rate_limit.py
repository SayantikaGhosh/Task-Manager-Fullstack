from fastapi import HTTPException, status

from app.db.redis import redis_client


def check_rate_limit(ip_address: str, endpoint: str):
    key = f"rate_limit:{endpoint}:{ip_address}"

    count = redis_client.incr(key)

    if count == 1:
        redis_client.expire(key, 60)

    if count > 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Try again later.",
        )