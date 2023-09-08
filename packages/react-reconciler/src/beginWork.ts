import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode } from './fiber';
import { Update, UpdateQueue, processUpdateQueue } from './updateQueue';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTags';
import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { renderWithHooks } from './fiberHooks';

// 递 计算状态最新值 + 创造子fiberNode
export const beginWork = (wip: FiberNode) => {
	// 比较，返回子fiberNode

	switch (wip.tag) {
		case HostRoot: {
			return updateHostRoot(wip);
		}
		case HostComponent: {
			return updateHostComponent(wip);
		}
		case HostText: {
			// 没有子结点，所以返回null
			return null;
		}
		case FunctionComponent: {
			return updateFunctionComponent(wip);
		}
		default: {
			if (__DEV__) {
				console.warn('beginWork未实现的类型');
			}
		}
	}
	return null;
};

function updateFunctionComponent(wip: FiberNode) {
	const nextChildren = renderWithHooks(wip);
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;
	const pending = updateQueue.shared.pending as Update<Element>;
	// 计算完，之前的update就没用了，清除
	updateQueue.shared.pending = null;
	const { memoizedState } = processUpdateQueue(baseState, pending);
	wip.memoizedState = memoizedState;

	// 子对应的Element
	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	// 对比子结点的current fiberNode和子结点的reactElement，生成子结点对应的wip fiberNode
	const current = wip.alternate;

	// 性能优化策略：先构建屏的DOM树，最后把根结点插入页面，只做一次插入操作

	// 挂载的组件树的所有fiber会走 mount，没有副作用

	// 在更新刚开始时，为hostRootFiber创建了wip（见prepareFreshStack）
	// 在首屏渲染时，只有这一个结点同时存在current和wip
	// 所以hostRootFiber会走update，被插入Placement的flags，最终执行一次DOM插入操作
	if (current) {
		// update
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		// mount
		wip.child = mountChildFibers(wip, null, children);
	}
}
