import os

os.environ["SECRET_KEY"] = "ci-test-secret-key"
os.environ["REDIS_URL"] = "redis://localhost:6379"

from fastapi.testclient import TestClient

from app.core.auth import create_access_token, verify_access_token
from app.core.rate_limit import check_rate_limit
from app.main import app


client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == "Task Manager API is running!"


def test_jwt_creation_and_verification():
    token = create_access_token({"sub": "test-user-id"})

    payload = verify_access_token(token)

    assert payload["sub"] == "test-user-id"
    assert "exp" in payload


def test_rate_limit():
    class FakeRedis:
        def __init__(self):
            self.count = 0

        def incr(self, key):
            self.count += 1
            return self.count

        def expire(self, key, seconds):
            pass

    from app.core import rate_limit

    fake_redis = FakeRedis()
    original_redis = rate_limit.redis_client

    rate_limit.redis_client = fake_redis

    try:
        for _ in range(5):
            check_rate_limit("127.0.0.1", "test")

        try:
            check_rate_limit("127.0.0.1", "test")
            assert False, "Expected HTTP 429"
        except Exception as exc:
            assert getattr(exc, "status_code", None) == 429

    finally:
        rate_limit.redis_client = original_redis
