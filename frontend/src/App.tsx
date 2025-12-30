import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Rooms } from './pages/Rooms';
import Room from './pages/Room';
import { Navigation } from './components/Navigation';
import NotFound from './pages/NotFound';
import withProtectedRoute from './shared/ProtectedRoute';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

const ProtectedRooms = withProtectedRoute(Rooms);
const ProtectedRoom = withProtectedRoute(Room);

function App() {
  return (
    <Router>
      <div className="text-white min-h-dvh bg-background bg-gradient-radial from-background via-background to-primary/20 flex flex-col">
        <Navigation />
        <main className="container mx-auto px-4 py-8 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<ProtectedRooms />} />
            <Route path="/room/:name" element={<ProtectedRoom />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;