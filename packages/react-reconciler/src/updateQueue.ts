import { Dispatch } from 'react/src/currentDispatcher';
import { Action } from 'shared/ReactTypes';

export interface Update<State> {
	action: Action<State>;
}

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
	// 保存hooks的dispatch
	dispatch: Dispatch<State> | null;
}

// 创建Update实例
export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

// 初始化UpdateQueue
export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		},
		dispatch: null
	} as UpdateQueue<State>;
};

// 将update插入到updateQueue
export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
};

// 消费update
// baseState: 初始状态；pendingUpdate: 要消费的update
// 返回全新的状态
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State>
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};
	if (pendingUpdate) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// baseState 1 + update (x) => 4x -> memoizedState 4
			result.memoizedState = action(baseState);
		} else {
			// baseState 1 + update 2 -> memoizedState 2
			result.memoizedState = action;
		}
	}
	return result;
};
