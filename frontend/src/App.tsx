import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Rooms } from './pages/Rooms';
import Room from './pages/Room';
import { Navigation } from './components/Navigation';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

function App() {
  return (
    <Router>
      <div className="text-white min-h-screen bg-background bg-gradient-radial from-background via-background to-primary/20">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/room/:id" element={<Room name="" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;