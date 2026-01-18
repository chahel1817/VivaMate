import { useLocation } from "react-router-dom";
import Footer from "./Footer";

export default function Layout({ children }) {
    const location = useLocation();

    // Pages where footer should NOT be shown
    const hideFooterPaths = [
        "/interview",
        "/interview-processing",
        "/interview/select",
        "/interview/config"
    ];

    const shouldHideFooter = hideFooterPaths.includes(location.pathname);

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1">
                {children}
            </main>
            {!shouldHideFooter && <Footer />}
        </div>
    );
}
