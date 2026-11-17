import { useEffect, useState } from "react";
import Header from "../components/Header";
import Hero from "../components/landing/LandingHero";
import Footer from "../components/Footer";
import Search from "../components/landing/LandingSearch";
import Feed from "../components/landing/LandingFeed";
import { listarCatalogo } from "../services/catalogo.service";

/**
 * Home page. Loads the public catalog once and shares it: the search box takes
 * the comunas from it and the showcase (Feed) takes the cards and the featured ones.
 */
function LandingPage() {
    const [catalogo, setCatalogo] = useState({ propiedades: null, error: "" });

    useEffect(() => {
        listarCatalogo()
            .then((propiedades) => setCatalogo({ propiedades, error: "" }))
            .catch((error) => setCatalogo({ propiedades: [], error: error.message }));
    }, []);

    return (
        <div className="min-h-screen font-medium text-ink bg-canvas">
            <Header />
            <main>
                <Hero />
                <Search propiedades={catalogo.propiedades ?? []} />
                <Feed propiedades={catalogo.propiedades} error={catalogo.error} />
            </main>
            <Footer />
        </div>
    )
}
export default LandingPage;
