import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Outlet } from "react-router-dom";

const Layout = () => {
  const location = useLocation();

  return (
    <div className="app-container">
      {/* 1. Sidebar/Navbar stays static (doesn't animate) */}
      <nav>Your Navigation Here</nav> 

      <main>
        <AnimatePresence mode="wait">
          {/* 2. This motion.div wraps EVERY page */}
          <motion.div
            key={location.pathname} // This is crucial: it triggers animation on route change
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Outlet /> {/* This is where your page content renders */}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;