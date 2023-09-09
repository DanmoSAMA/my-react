// ReactDOM.createRoot(root).render(<App />)

// 引入了react-reconciler中的函数，因此打包后的文件含有react-reconciler中的内容
import {
	createContainer,
	updateContainer
} from 'react-reconciler/src/fiberReconciler';
import { Container } from './hostConfig';
import { ReactElementType } from 'shared/ReactTypes';

export function createRoot(container: Container) {
	const root = createContainer(container);

	return {
		render(element: ReactElementType) {
			return updateContainer(element, root);
		}
	};
}
