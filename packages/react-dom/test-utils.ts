import { ReactElementType } from 'shared/ReactTypes';

// 不希望把react-dom打包到test-utils里面，所以react-dom作为外部依赖
// @ts-ignore
import { createRoot } from 'react-dom';

export function renderIntoDocument(element: ReactElementType) {
	const div = document.createElement('div');
	return createRoot(div).render(element);
}
