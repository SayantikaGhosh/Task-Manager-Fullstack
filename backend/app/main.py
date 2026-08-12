from fastapi import FastAPI
from app.api.routes.auth import router as auth_router
from app.api.routes.tasks import router as task_router


app = FastAPI(
    title="Task Manager API"
)

app.include_router(auth_router)
app.include_router(task_router)

@app.get("/")
def root():
    return {
        "message": "Task Manager API is running!"
    }

