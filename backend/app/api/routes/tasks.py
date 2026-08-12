import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.crud.task import (
    create_task,
    delete_task,
    get_task_by_id,
    get_tasks_by_user,
    get_task_stats,
    update_task,
)
from app.db.redis import redis_client
from app.db.session import get_db
from app.models.task import TaskStatus
from app.models.user import User
from app.schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskStats,
    TaskUpdate,
)

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


def clear_task_cache(user_id):
    keys = redis_client.keys(
        f"tasks:{user_id}:*"
    )

    if keys:
        redis_client.delete(*keys)


def clear_stats_cache(user_id):
    redis_client.delete(
        f"stats:{user_id}"
    )


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_task = create_task(
        db=db,
        task=task,
        owner_id=current_user.id,
    )

    clear_task_cache(current_user.id)
    clear_stats_cache(current_user.id)

    return new_task


@router.get(
    "",
    response_model=list[TaskResponse],
)
def get_tasks(
    status: TaskStatus | None = None,
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cache_key = f"tasks:{current_user.id}:{status}:{page}:{limit}"

    cached_tasks = redis_client.get(cache_key)

    if cached_tasks:
        return json.loads(cached_tasks)

    tasks = get_tasks_by_user(
        db,
        current_user.id,
        status,
        page,
        limit,
    )
    tasks_data = [
        TaskResponse.model_validate(task).model_dump(mode="json")
        for task in tasks
    ]

    redis_client.setex(
        cache_key,
        60,
        json.dumps(tasks_data),
    )

    return tasks_data


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
)
def update_existing_task(
    task_id: UUID,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = get_task_by_id(
        db,
        task_id,
    )

    if not task or task.owner_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Task not found.",
        )

    update_data = task_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(task, key, value)

    updated_task = update_task(
        db,
        task,
    )

    clear_task_cache(current_user.id)
    clear_stats_cache(current_user.id)

    return updated_task


@router.delete(
    "/{task_id}",
    status_code=204,
)
def remove_task(
    task_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = get_task_by_id(
        db,
        task_id,
    )

    if not task or task.owner_id != current_user.id:
        raise HTTPException(
            status_code=404,
            detail="Task not found.",
        )

    delete_task(
        db,
        task,
    )

    clear_task_cache(current_user.id)
    clear_stats_cache(current_user.id)


@router.get(
    "/stats",
    response_model=TaskStats,
)
def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cache_key = f"stats:{current_user.id}"

    cached_stats = redis_client.get(cache_key)

    if cached_stats:
        return json.loads(cached_stats)

    stats = get_task_stats(
        db,
        current_user.id,
    )

    redis_client.setex(
        cache_key,
        60,
        json.dumps(stats),
    )

    return stats