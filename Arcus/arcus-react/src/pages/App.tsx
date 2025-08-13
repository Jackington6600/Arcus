import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';

export default function App() {
	const { pathname } = useLocation();
	const isHome = pathname === '/';
	return (
		<div>
			<Navbar />
			<main className={isHome ? 'main--home' : 'main'}>
				<Outlet />
			</main>
		</div>
	);
}



