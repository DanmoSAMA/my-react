import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode } from './fiber';
let workInProgress: FiberNode | null = null;

// 初始化
function prepareFreshStack(fiber: FiberNode) {
	workInProgress = fiber;
}

function renderRoot(root: FiberNode) {
	prepareFreshStack(root);

	while (true) {
		try {
			workLoop();
			break;
		} catch (e) {
			console.warn('workLoop发生错误', e);
			workInProgress = null;
		}
	}
}

function workLoop() {
	while (workInProgress) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	// next可能是子fiber，也可能是null
	const next = beginWork(fiber);
	// 工作完成
	fiber.memoizedProps = fiber.pendingProps;

	if (next === null) {
		// 归
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	// 没有子结点，遍历兄弟结点
	let node: FiberNode | null = fiber;

	while (node) {
		completeWork(node);
		const sibling = node.sibling;

		if (sibling) {
			// 有兄弟，找兄弟
			workInProgress = sibling;
			return;
		}
		// 找父结点
		node = node.return;
		workInProgress = node;
	}
}
