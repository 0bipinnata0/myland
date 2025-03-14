import { userBlockingPriorityTimeout, lowPriorityTimeout, normalPriorityTimeout } from "../SchedulerFeatureFlags";
import { PriorityLevel, ImmediatePriority, UserBlockingPriority, IdlePriority, LowPriority, NormalPriority } from "../SchedulerPriorities";

export function getTimeout(priorityLevel: PriorityLevel) {
    // Max 31 bit integer. The max integer size in V8 for 32-bit systems.
    // Math.pow(2, 30) - 1
    // 0b111111111111111111111111111111
    const maxSigned31BitInt = 1073741823;

    switch (priorityLevel) {
        case ImmediatePriority: {
            return -1;
        }
        case UserBlockingPriority: {
            return userBlockingPriorityTimeout
        }
        case IdlePriority: {
            return maxSigned31BitInt
        }
        case LowPriority: {
            return lowPriorityTimeout
        }
        case NormalPriority:
        default: {
            return normalPriorityTimeout;
        }
    }
}