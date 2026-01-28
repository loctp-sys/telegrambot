import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Offers from './pages/Offers';
import Scheduler from './pages/Scheduler';

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/scheduler" element={<Scheduler />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
