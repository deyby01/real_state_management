import Header from './components/Header'
import Footer from './components/Footer'

function LoginPage() {
    return (
        <>
            <Header />


            <main className="min-h-screen flex items-center justify-center">
                <div className="w-full max-w-md px-6 py-10">
                    <h1 className="text-4xl font-semibold text-gray-900">Log in</h1>
                    <p className="mt-3 text-sm text-gray-700">Welcome back! Please enter your details.</p>
                </div>
            </main>
            
            <Footer />
        </>
    );
}

export default LoginPage;