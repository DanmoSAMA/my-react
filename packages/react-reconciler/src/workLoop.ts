import { beginWork } from './beginWork';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { FiberNode, FiberRootNode, createWorkInProgress } from './fiber';
import { MutationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTags';
let workInProgress: FiberNode | null = null;

// 初始化
function prepareFreshStack(root: FiberRootNode) {
	workInProgress = createWorkInProgress(root.current, {});
}

// 连接刚创建的container，和renderRoot（串联功能）
export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// TODO：调度功能
	//
	// 无论是哪个结点触发了更新，都要向上遍历到根结点
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

// 向上遍历到根结点，并返回
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;

	while (parent) {
		node = parent;
		parent = parent.return;
	}

	if (node.tag === HostRoot) {
		// 返回FiberRootNode
		return node.stateNode;
	}
	return null;
}

function renderRoot(root: FiberRootNode) {
	prepareFreshStack(root);

	while (true) {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.warn('workLoop发生错误', e);
			}
			workInProgress = null;
		}
	}

	// 此时已经完成了beginWork和completeWork流程
	// root.current.alternate 指向构建好的一棵完整的fiber tree
	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;

	commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;

	if (!finishedWork) {
		return;
	}

	if (__DEV__) {
		console.warn('commit阶段开始', finishedWork);
	}

	// 重置
	root.finishedWork = null;

	// 判断是否存在3个子阶段需要执行的操作（使用masks）
	// Q: 因为有冒泡（bubbleProperties）操作，所以暂时不明白，为什么subtree和root都要判断flags
	const subtreeHasEffect =
		(finishedWork.subtreeFlags & MutationMask) !== NoFlags;
	const rootHasEffect = (finishedWork.subtreeFlags & MutationMask) !== NoFlags;

	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutation
		// mutations

		commitMutationEffects(finishedWork);
		root.current = finishedWork;

		// layout
	} else {
		// 没有更新发生
		root.current = finishedWork;
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
