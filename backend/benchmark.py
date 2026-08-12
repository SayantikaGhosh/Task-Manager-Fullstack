import time
import requests

URL = "http://127.0.0.1:8000/tasks"

TOKEN = "your_json_token"
headers = {
    "Authorization": f"Bearer {TOKEN}"
}

requests.get(
    URL,
    headers=headers
)

times = []

for i in range(50):
    start = time.perf_counter()

    response = requests.get(
        URL,
        headers=headers,
    )

    end = time.perf_counter()

    if response.status_code != 200:
        print("Request failed:", response.status_code)
        break

    times.append(
        (end - start) * 1000
    )

times.sort()

average = sum(times) / len(times)

p50 = times[len(times) // 2]

p95 = times[int(len(times) * 0.95) - 1]

print(f"Requests: {len(times)}")
print(f"Average: {average:.2f} ms")
print(f"P50: {p50:.2f} ms")
print(f"P95: {p95:.2f} ms")