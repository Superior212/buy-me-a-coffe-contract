import { Web3Provider } from "./providers/Web3Provider";
import { Header } from "./components/Header";
import { BuyMeACoffee } from "./components/BuyMeACoffee";

function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          <BuyMeACoffee />
        </main>
      </div>
    </Web3Provider>
  );
}

export default App;
