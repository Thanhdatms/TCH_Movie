import { Link } from "react-router-dom";

const HomePage = () => {
	return (
		<div className="min-h-screen bg-black text-white">
			<header className="max-w-6xl mx-auto flex items-center justify-between p-4">
				<Link to="/">
					<img src="/netflix-logo.png" alt="logo" className="w-52" />
				</Link>
				<Link to="/login" className="text-white hover:underline">
					Sign In
				</Link>
			</header>
		</div>
	);
};

export default HomePage;
