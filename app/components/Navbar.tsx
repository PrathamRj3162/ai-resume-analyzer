import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
  const { auth } = usePuterStore();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        resumind<span>.</span>
      </Link>

      <div className="flex items-center gap-3">
        {auth.isAuthenticated ? (
          <>
            <Link to="/upload" className="btn-primary text-xs px-4 py-2">
              + new analysis
            </Link>
            <div className="flex items-center gap-2 pl-3 border-l border-stone-200">
              <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-xs font-semibold text-stone-600 uppercase">
                {auth.user?.username?.[0] ?? "U"}
              </div>
              <button
                onClick={auth.signOut}
                className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
              >
                sign out
              </button>
            </div>
          </>
        ) : (
          <Link to="/auth" className="btn-primary text-xs">
            sign in
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
