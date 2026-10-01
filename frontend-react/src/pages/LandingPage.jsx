import Header from "../components/LandingHeader";
import Hero from "../components/LandingHero";
import Footer from "../components/LandingFooter";

function LandingPage() {
    return (
        <div className="min-h-screen font-medium text-ink bg-canvas">
            <Header />
            <main>
                <Hero />
            </main>
            <Footer />
        </div>
    )
}
export default LandingPage;
