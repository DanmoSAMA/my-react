import React from 'react';
import ReactDOM from 'react-dom';

// const app = (
//   <div>
//     <span>my-react</span>
//   </div>
// );

function App() {
	return (
		<div>
			<Child />
		</div>
	);
}

function Child() {
	return <span>my-react</span>;
}

const root = document.querySelector('#root');
ReactDOM.createRoot(root).render(<App />);

// console.log(React, app);
// console.log(ReactDOM);
