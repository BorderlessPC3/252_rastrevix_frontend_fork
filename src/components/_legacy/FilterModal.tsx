import React, { useState } from 'react';
import type { MaquinaFilters } from '../../types';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: MaquinaFilters) => void;
    currentFilters: MaquinaFilters;
}

const FilterModal: React.FC<FilterModalProps> = ({
    isOpen,
    onClose,
    onApplyFilters,
    currentFilters
}) => {
    const [filters, setFilters] = useState<MaquinaFilters>(currentFilters);

    React.useEffect(() => {
        setFilters(currentFilters);
    }, [currentFilters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value || undefined
        }));
    };

    const handleApply = () => {
        onApplyFilters(filters);
        onClose();
    };

    const handleClear = () => {
        const clearedFilters: MaquinaFilters = {};
        setFilters(clearedFilters);
        onApplyFilters(clearedFilters);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Filtrar Máquinas</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label htmlFor="search">Buscar</label>
                        <input
                            type="text"
                            id="search"
                            name="search"
                            placeholder="Buscar por código, nome, fabricante..."
                            value={filters.search || ''}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={filters.status || ''}
                            onChange={handleFilterChange}
                        >
                            <option value="">Todos os status</option>
                            <option value="ativa">Ativa</option>
                            <option value="inativa">Inativa</option>
                            <option value="manutencao">Manutenção</option>
                            <option value="calibracao">Calibração</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="tipo">Tipo</label>
                        <select
                            id="tipo"
                            name="tipo"
                            value={filters.tipo || ''}
                            onChange={handleFilterChange}
                        >
                            <option value="">Todos os tipos</option>
                            <option value="torno">Torno</option>
                            <option value="fresa">Fresa</option>
                            <option value="soldadora">Soldadora</option>
                            <option value="prensa">Prensa</option>
                            <option value="cnc">CNC</option>
                            <option value="outras">Outras</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="localizacao">Localização</label>
                        <input
                            type="text"
                            id="localizacao"
                            name="localizacao"
                            placeholder="Ex: Galpão A, Setor 1..."
                            value={filters.localizacao || ''}
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={handleClear}>
                        Limpar Filtros
                    </button>
                    <button className="btn btn-primary" onClick={handleApply}>
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;