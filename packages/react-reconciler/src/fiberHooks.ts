import { FiberNode } from './fiber';

export function renderWithHooks(wip: FiberNode) {
	const Component = wip.type;
	const props = wip.pendingProps;
	// children是函数式组件的返回结果
	const children = Component(props);

	return children;
}
