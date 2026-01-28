import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Offers from './pages/Offers';
import Scheduler from './pages/Scheduler';
import Config from './pages/Config';

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/scheduler" element={<Scheduler />} />
                    <Route path="/config" element={<Config />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
