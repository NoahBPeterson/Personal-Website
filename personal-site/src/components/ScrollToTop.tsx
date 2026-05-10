import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// Resets scroll only on Link/navigate-driven route changes. POP covers
// back/forward navigation, reloads, and the initial mount — in those cases
// we leave scroll alone so the browser's built-in restoration (and the
// user's existing position on a refresh) wins. Hash navigations skip too,
// because App.tsx scrolls to the matching id instead.
export default function ScrollToTop(): null {
	const location = useLocation();
	const navType = useNavigationType();
	useEffect(() => {
		if (navType === "POP") return;
		if (location.hash) return;
		window.scrollTo(0, 0);
	}, [location.pathname, navType]);
	return null;
}
