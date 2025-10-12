import Header from './components/Header'
import UploadBox from './components/UploadBox'
import MapViewer from './components/MapViewer'
import HowItWorks from "./components/HowItWorks";
import Footer from './components/Footer'

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12 space-y-12">
        <section>
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            ParkPred – Understanding parking search with AI
          </h1>
          <p className="text-gray-600 text-center mb-12">
            Upload your CSV file, analyze parking search behavior, and visualize the results on an interactive map.
          </p>
          <HowItWorks />
          <UploadBox />
        </section>

        <section>
          <MapViewer />
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default App
