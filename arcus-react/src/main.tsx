import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './pages/App';
import Home from './pages/Home';
import FullRules from './pages/FullRules';
import Wiki from './pages/Wiki';
import CharacterSheets from './pages/CharacterSheets';
import TheWorld from './pages/TheWorld';
import GMResources from './pages/GMResources';
import Blog from './pages/Blog';
import './styles/index.css';

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		children: [
			{ index: true, element: <Home /> },
			{ path: 'rules', element: <FullRules /> },
			{ path: 'wiki', element: <Wiki /> },
			{ path: 'character-sheets', element: <CharacterSheets /> },
			{ path: 'world', element: <TheWorld /> },
			{ path: 'gm', element: <GMResources /> },
			{ path: 'blog', element: <Blog /> },
		],
	},
], { basename: import.meta.env.BASE_URL });

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);



