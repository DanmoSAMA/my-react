import { Props, Key, Ref, ReactElementType } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';

export class FiberNode {
	type: any;
	// tag: 结点类型
	tag: WorkTag;
	// pendingProps: 接下来有哪些props需要改变 / 刚开始工作时的props
	pendingProps: Props;
	key: Key;
	ref: Ref;

	stateNode: any;
	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	// 同级的fiberNode有好几个，比如一个ul下有多个li，它们的index分别是0、1、2
	index: number;

	// 工作完成后 / 确定下来的props
	memoizedProps: Props | null;
	memoizedState: any;
	// 双缓冲技术，current和wip的切换
	alternate: FiberNode | null;
	// 保存标记，副作用
	flags: Flags;
	updateQueue: unknown;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		this.tag = tag;
		this.ref = null;
		this.key = key;
		// HostComponent.stateNode => div DOM
		this.stateNode = null;
		// FunctionComponent.type => Function
		this.type = null;

		this.return = null;
		this.sibling = null;
		this.child = null;
		this.index = 0;

		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.memoizedState = null;

		this.updateQueue = null;

		this.alternate = null;
		this.flags = NoFlags;
	}
}

export class FiberRootNode {
	container: Container;
	current: FiberNode;
	// 指向整个更新完成后的HostFiber
	finishedWork: FiberNode | null;

	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	// 双缓存机制，每次都获取对应的另一个fiberNode
	let wip = current.alternate;

	// 首屏渲染 mount
	if (wip === null) {
		// 从current继承
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;
		wip.alternate = current;
		current.alternate = wip;
	} else {
		wip.pendingProps = pendingProps;
		// 去除之前遗留的副作用
		wip.flags = NoFlags;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;

	return wip;
};

export function createFiberFromElement(element: ReactElementType) {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;

	if (typeof type === 'string') {
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element);
	}

	// 直接把reactElement的props，作为fiber的pendingProps
	// 所以updateHostComponent中，直接从pendingProps中获取nextChildren
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
