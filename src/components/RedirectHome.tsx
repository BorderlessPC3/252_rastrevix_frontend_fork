import { Navigate } from 'react-router-dom';

/** Redireciona rotas descontinuadas (placeholders) para o dashboard */
const RedirectHome: React.FC = () => <Navigate to="/" replace />;

export default RedirectHome;
