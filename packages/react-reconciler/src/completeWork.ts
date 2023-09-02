import {
	appendInitialChild,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { FiberNode } from './fiber';
import { HostComponent, HostRoot, HostText } from './workTags';
import { NoFlags } from './fiberFlags';

// 归
export const completeWork = (wip: FiberNode) => {
	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		case HostComponent: {
			if (current && wip.stateNode) {
				// update
			} else {
				// 1. 构建DOM
				const instance = createInstance(wip.type, newProps);
				// 2. 将DOM插入到DOM树中

				// 因为是归的过程，创建的instance在当前dom树中是最靠上的，所以把剩余部分插在它下面
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		}
		case HostText: {
			if (current && wip.stateNode) {
				// update
			} else {
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
			}
			bubbleProperties(wip);
			return null;
		}
		case HostRoot: {
			bubbleProperties(wip);
			return null;
		}
		default: {
			if (__DEV__) {
				console.warn('未处理的completeWork情况', wip);
			}
		}
	}
};

function appendAllChildren(parent: FiberNode, wip: FiberNode) {
	let node = wip.child;
	while (node) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node.stateNode);
		} else if (node.child) {
			// 当前node对应函数组件（或其他），不能直接插入dom结点，找孩子，即“递”
			node.child.return = node;
			node = node.child;
			continue;
		}

		// 这段代码目前感觉没有必要，先留着
		if (node === wip) {
			return;
		}

		// node.child === null，走到底了，此时找sibling
		// 如果找不到sibling，就往上“归”
		while (!node.sibling) {
			if (!node.return || node.return === wip) {
				return;
			}
			node = node.return;
		}

		node.sibling.return = node.return;
		node = node.sibling;
	}
}

// flags分布在不同的fiberWork中，为了快速找到它们
// 可以利用归的流程，把子fiber的flags冒泡到父
function bubbleProperties(wip: FiberNode) {
	let subtreeFlags = NoFlags;
	let child = wip.child;

	while (child) {
		subtreeFlags |= child.subtreeFlags;
		subtreeFlags |= child.flags;

		child.return = wip;
		child = child.sibling;
	}
	wip.subtreeFlags |= subtreeFlags;
}
