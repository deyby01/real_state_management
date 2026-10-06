import Header from "../components/Header";
import Hero from "../components/properties/PropertiesHero";
import Footer from "../components/Footer";
import Feed from "../components/properties/PropertiesFeed";

function PropertiesPage() {
    return (
        <div className="min-h-screen bg-[#f7f4ef]">
            <Header />
            <main>
                <Hero />
                <Feed />
            </main>
            <Footer />
        </div>
    )
}
export default PropertiesPage;