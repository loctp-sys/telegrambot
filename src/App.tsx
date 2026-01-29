import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Offers from './pages/Offers';
import Content from './pages/Content';
import Config from './pages/Config';

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/content" element={<Content />} />
                    <Route path="/scheduler" element={<Content />} /> {/* Redirect old path */}
                    <Route path="/config" element={<Config />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
