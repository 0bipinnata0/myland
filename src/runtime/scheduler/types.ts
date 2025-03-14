import type { PriorityLevel } from "./SchedulerPriorities";

export type Callback = (arg: boolean) => Callback | void | undefined | null;

export interface Task {
    id: number
    sortIndex: number
    callback: Callback | null
    priorityLevel: PriorityLevel;
    startTime: number,
    expirationTime: number
}
