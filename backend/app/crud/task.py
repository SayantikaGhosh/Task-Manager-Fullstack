from uuid import UUID

from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate


def create_task(
    db: Session,
    task: TaskCreate,
    owner_id: UUID,
) -> Task:
    new_task = Task(
        title=task.title,
        description=task.description,
        due_date=task.due_date,
        owner_id=owner_id,
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


def get_tasks_by_user(
    db: Session,
    owner_id: UUID,
    status: TaskStatus | None = None,
    page: int = 1,
    limit: int = 10,
) -> list[Task]:

    query = db.query(Task).filter(
        Task.owner_id == owner_id
    )

    if status is not None:
        query = query.filter(
            Task.status == status
        )

    return (
        query
        .order_by(Task.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

def get_task_by_id(
    db: Session,
    task_id: UUID,
) -> Task | None:
    return (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )


def update_task(
    db: Session,
    task: Task,
) -> Task:
    db.commit()
    db.refresh(task)

    return task


def delete_task(
    db: Session,
    task: Task,
) -> None:
    db.delete(task)
    db.commit()

def get_task_stats(
    db: Session,
    owner_id: UUID,
):
    total = db.query(Task).filter(
        Task.owner_id == owner_id
    ).count()

    todo = db.query(Task).filter(
        Task.owner_id == owner_id,
        Task.status == TaskStatus.TODO,
    ).count()

    in_progress = db.query(Task).filter(
        Task.owner_id == owner_id,
        Task.status == TaskStatus.IN_PROGRESS,
    ).count()

    done = db.query(Task).filter(
        Task.owner_id == owner_id,
        Task.status == TaskStatus.DONE,
    ).count()

    return {
        "total": total,
        "todo": todo,
        "in_progress": in_progress,
        "done": done,
    }