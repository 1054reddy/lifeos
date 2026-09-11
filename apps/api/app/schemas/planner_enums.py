from enum import Enum


class PlannerBlockType(str, Enum):
    TASK = "task"
    FOCUS = "focus"
    BREAK = "break"
    PERSONAL = "personal"
