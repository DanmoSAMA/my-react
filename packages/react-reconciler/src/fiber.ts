import { Props, Key, Ref } from 'shared/ReactTypes';
import { WorkTag } from './workTags';
import { Flags, NoFlags } from './fiberFlags';

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
	index: number;

	// 工作完成后 / 确定下来的props
	memoizedProps: Props | null;
	// 双缓冲技术，current和wip的切换
	alternate: FiberNode | null;
	// 保存标记，副作用
	flags: Flags;

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
		// 同级的fiberNode有好几个，比如一个ul下有多个li，它们的index分别是0、1、2
		this.index = 0;

		this.pendingProps = pendingProps;
		this.memoizedProps = null;

		this.alternate = null;
		this.flags = NoFlags;
	}
}
