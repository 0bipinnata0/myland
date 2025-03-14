/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export type PriorityLevel = 0 | 1 | 2 | 3 | 4 | 5;

// TODO: Use symbols?
export const NoPriority = 0 as const;
export const ImmediatePriority = 1 as const;
export const UserBlockingPriority = 2 as const;
export const NormalPriority = 3 as const;
export const LowPriority = 4 as const;
export const IdlePriority = 5 as const;
