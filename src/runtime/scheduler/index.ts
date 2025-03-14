import { peek, pop, push } from './heap';
import { ImmediatePriority, UserBlockingPriority, NoPriority, IdlePriority, LowPriority, NormalPriority } from './SchedulerPriorities'
import type { PriorityLevel } from './SchedulerPriorities'
import { Callback, Task } from './types';
import { getTimeout } from './utils/getTimeout';
import { getCurrentTime } from './utils/index';

let currentTask: Task | null = null;

let currentPriorityLevel: PriorityLevel = NoPriority;

const taskQueue: Array<Task> = []
const timerQueue: Array<Task> = [];

let isHostCallbackScheduled = false;
let isHostTimeOutScheduled = false;

function generateScheduleCallback() {
    let taskIdCounter = 1;
    function scheduleCallback(priorityLevel: PriorityLevel, callback: Callback, options?: { delay: number }) {
        const currentTime = getCurrentTime();
        const startTime = currentTime + (typeof options?.delay === 'number' ? options.delay : 0);

        const timeout = getTimeout(priorityLevel);
        const expirationTime = startTime + timeout;
        const newTask: Task = {
            id: taskIdCounter++,
            callback,
            priorityLevel,
            sortIndex: expirationTime,
            startTime,
            expirationTime
        }
        if (startTime > currentTime) {
            newTask.sortIndex = startTime;
            push(timerQueue, newTask);
            if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
                if (isHostTimeOutScheduled) {
                    cancelHostTimeout();
                } else {
                    isHostTimeOutScheduled = true;
                }
                requestHostTimeout(handleTimeout, startTime - currentTime);
            }
        } else {
            push(taskQueue, newTask);
            if (!isHostCallbackScheduled && !isPerformingWork) {
                isHostCallbackScheduled = true;
                requestHostCallback();
            }
        }
    }
    return scheduleCallback;
}

let taskTimeoutID: number | NodeJS.Timeout = -1;

function requestHostTimeout(callback: (currentTime: number) => void, ms: number) {
    taskTimeoutID = setTimeout(() => {
        callback(getCurrentTime());
    }, ms);
}

function cancelHostTimeout() {
    clearTimeout(taskTimeoutID);
}

function advanceTimers(currentTime: number) {
    let nextTask = peek(timerQueue);
    while (nextTask) {
        if (nextTask.callback === null) {
            pop(timerQueue);
        } else if (nextTask.startTime <= currentTime) {
            pop(timerQueue);
            nextTask.sortIndex = nextTask.expirationTime;
            push(taskQueue, nextTask);
        } else {
            break;
        }
        nextTask = peek(timerQueue);
    }
}

function handleTimeout(currentTime: number) {
    isHostCallbackScheduled = false;
    advanceTimers(currentTime)
    if (isHostCallbackScheduled) {
        return;
    }
    if (peek(taskQueue) !== null) {
        isHostCallbackScheduled = true;
        requestHostCallback();
    } else {
        const firstTimer = peek(timerQueue);
        if (firstTimer) {
            requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
        }
    }
}

/**
 * scheduleCallback
 *  创建task
 *  插入最小堆
 * requestHostCallback -> schedulePerformWorkUntilDeadLine ->channel.port2.postMessage
 *  发送消息(宏任务)
 * -> channel.port1.onmessage -> performWorkUntilDeadLine
 *  执行消息
 * flushWork -> workLoop
 *  循环执行任务
 * 判断任务残留 -> schedulePerformWorkUntilDeadLine
 */

const scheduleCallback = generateScheduleCallback();

let isMessageLoopRunning = false;
function requestHostCallback() {
    if (!isMessageLoopRunning) {
        isMessageLoopRunning = true;
        schedulePerformWorkUntilDeadLine();
    }
}

const channel = new MessageChannel();
// 接受消息

function schedulePerformWorkUntilDeadLine() {
    // 发送消息
    channel.port2.postMessage(null);
}

channel.port1.onmessage = performWorkUntilDeadLine;

function performWorkUntilDeadLine() {
    if (isMessageLoopRunning) {
        const currentTime = getCurrentTime();
        startTime = currentTime;
        let hasMoreTask = true;
        try {
            hasMoreTask = flushWork(currentTime)
        } finally {
            if (hasMoreTask) {
                schedulePerformWorkUntilDeadLine();
            } else {
                isMessageLoopRunning = false;
            }
        }
    }
}



function flushWork(initialTime: number): boolean {
    isHostCallbackScheduled = false;
    isPerformingWork = true

    // ???
    let previousePriorityLevel = currentPriorityLevel;
    try {
        return workLoop(initialTime)
    } finally {
        // ???为什么要还原优先级
        currentPriorityLevel = previousePriorityLevel;
        currentTask = null;
        isPerformingWork = false;
    }
}


function cancelCallback() {
    if (currentTask) {
        // 最小堆无法删除，只能设置为null;
        currentTask.callback = null;
    }
}

function getCurrentPriorityLevel(): PriorityLevel {
    return currentPriorityLevel;
}

let startTime = -1;

let frameInterval = 5;

let isPerformingWork = false;

function shouldYieldToHost() {
    let timeElapsed = getCurrentTime() - startTime;

    if (timeElapsed < frameInterval) {
        return false;
    }
    return true;
}

function workLoop(initialTime: number): boolean {
    let currentTime = initialTime;
    advanceTimers(currentTime);
    currentTask = peek(taskQueue);
    while (currentTask) {
        // 过期任务必须执行
        if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
            break
        }
        const callback = currentTask.callback;
        if (callback) {
            currentTask.callback = null;
            currentPriorityLevel = currentTask.priorityLevel;
            // 明明前面判断过了，为什么还要再判断一次
            const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
            const continuationCallback = callback(didUserCallbackTimeout)
            currentTime = getCurrentTime();
            if (continuationCallback) {
                currentTask.callback = continuationCallback;
                advanceTimers(currentTime);
                return true;
            } else {
                // 对于这步很困惑，感觉多次一举，可以直接删除
                if (currentTask === peek(taskQueue)) {
                    pop(taskQueue)
                }
                advanceTimers(currentTime);
            }
        } else {
            pop(taskQueue)
        }
        currentTask = peek(taskQueue);
    }

    if (currentTask) {
        return true;
    } else {
        advanceTimers(currentTime);
        return false;
    }
}


const Scheduler = {
    ImmediatePriority,
    UserBlockingPriority,
    NormalPriority,
    IdlePriority,
    LowPriority,
    scheduleCallback,
    cancelCallback,
    getCurrentPriorityLevel,
    shouldYield: shouldYieldToHost
}
export default Scheduler;