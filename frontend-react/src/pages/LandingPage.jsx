import Header from "../components/Header";
import Hero from "../components/landing/LandingHero";
import Footer from "../components/Footer";
import Search from "../components/landing/LandingSearch";
import Feed from "../components/landing/LandingFeed";

function LandingPage() {
    return (
        <div className="min-h-screen font-medium text-ink bg-canvas">
            <Header />
            <main>
                <Hero />
                <Search />
                <Feed />
            </main>
            <Footer />
        </div>
    )
}
export default LandingPage;
