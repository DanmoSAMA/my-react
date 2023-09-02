import { ReactElementType } from 'shared/ReactTypes';
import { FiberNode, createFiberFromElement } from './fiber';
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols';
import { HostText } from './workTags';
import { Placement } from './fiberFlags';

function ChildReconciler(shouldTrackEffects: boolean) {
	function reconcileSingleElement(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		element: ReactElementType
	) {
		// 根据element创建一个fiber，并返回
		const fiber = createFiberFromElement(element);
		fiber.return = returnFiber;
		return fiber;
	}

	function reconcileSingleTextNode(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		content: string | number
	) {
		const fiber = new FiberNode(HostText, { content }, null);
		fiber.return = returnFiber;
		return fiber;
	}

	// 插入单一的结点
	function placeSingleChild(fiber: FiberNode) {
		// 传入的fiber是刚创建好的wip fiber，alternate为current
		// current === null，说明是首屏渲染的情况
		if (shouldTrackEffects && fiber.alternate === null) {
			fiber.flags |= Placement;
		}
		return fiber;
	}

	return function reconcileChildFibers(
		returnFiber: FiberNode,
		currentFiber: FiberNode | null,
		newChild?: ReactElementType | string | number
	) {
		// 单结点
		if (typeof newChild === 'object' && newChild !== null) {
			switch (newChild.$$typeof) {
				case REACT_ELEMENT_TYPE:
					const childFiber = reconcileSingleElement(
						returnFiber,
						currentFiber,
						newChild
					);
					return placeSingleChild(childFiber);
				default:
					if (__DEV__) {
						console.warn('未实现的reconcile类型', newChild);
					}
			}
		}
		// 多结点

		// 文本结点
		if (typeof newChild === 'string' || typeof newChild === 'number') {
			const childFiber = reconcileSingleTextNode(
				returnFiber,
				currentFiber,
				newChild
			);
			return placeSingleChild(childFiber);
		}
		if (__DEV__) {
			console.warn('未实现的reconcile类型', newChild);
		}
		return null;
	};
}

// 追踪副作用
export const reconcileChildFibers = ChildReconciler(true);
// 不追踪副作用，用于mount
export const mountChildFibers = ChildReconciler(false);
