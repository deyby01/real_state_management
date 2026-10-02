import Header from "../components/LandingHeader";
import Hero from "../components/LandingHero";
import Footer from "../components/LandingFooter";
import Search from "../components/LandingSearch";

function LandingPage() {
    return (
        <div className="min-h-screen font-medium text-ink bg-canvas">
            <Header />
            <main>
                <Hero />
                <Search />
            </main>
            <Footer />
        </div>
    )
}
export default LandingPage;
