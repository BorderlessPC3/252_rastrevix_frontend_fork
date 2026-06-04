import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await apiService.testConnection();
      setIsConnected(connected);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
      setLastCheck(new Date());
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check connection on mount
    checkConnection();

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (isChecking) {
      return <AlertCircle size={16} className="animate-spin" />;
    }
    
    if (isConnected === null) {
      return <AlertCircle size={16} className="text-gray-400" />;
    }
    
    return isConnected ? 
      <Wifi size={16} className="text-green-500" /> : 
      <WifiOff size={16} className="text-red-500" />;
  };

  const getStatusText = () => {
    if (isChecking) return 'Verificando...';
    if (isConnected === null) return 'Desconhecido';
    return isConnected ? 'Conectado' : 'Desconectado';
  };

  const getStatusColor = () => {
    if (isChecking) return 'text-yellow-500';
    if (isConnected === null) return 'text-gray-400';
    return isConnected ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className={`connection-status flex items-center gap-2 ${className}`}>
      {getStatusIcon()}
      <span className={`connection-status__label text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      {lastCheck && (
        <span className="connection-status__time text-xs text-gray-400">
          ({lastCheck.toLocaleTimeString()})
        </span>
      )}
      <button
        type="button"
        onClick={checkConnection}
        disabled={isChecking}
        className="connection-status__refresh text-xs text-blue-500 hover:text-blue-700 disabled:opacity-50"
        title="Verificar conexão"
      >
        Atualizar
      </button>
    </div>
  );
};

export default ConnectionStatus;
