import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
  const { auth } = usePuterStore();

  return (
    <nav className="navbar">
      <Link to="/">
        <p className="text-2xl font-bold text-gradient">RESUMIND</p>
      </Link>
      <div className="flex items-center gap-4">
        {auth.isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {auth.user?.username}
            </span>
            <button
              onClick={auth.signOut}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
