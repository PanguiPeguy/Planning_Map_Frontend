// src/components/layout/UserNavBar.jsx
"use client";

import { Search, SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function UserListNavBar({onSearchChange, onSortChange, availableCountries, availableTowns, onFilterChange }) {
    
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState(''); 
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedTown, setSelectedTown] = useState(''); 

    useEffect(() => {
        if (onSortChange) {
            onSortChange(`${sortField}_${sortDirection}`);
        }
    }, [onSortChange, sortField, sortDirection]);

    const handleSearch = (e) => {
        const newTerm = e.target.value;
        setSearchTerm(newTerm);
        if(onSearchChange) {
            onSearchChange(newTerm);
        }
    };

    const handleFieldChange = (e) => {
        const newField = e.target.value;
        setSortField(newField);
        // La direction est déjà dans l'état, on met à jour le parent
        if (onSortChange) {
            onSortChange(`${newField}_${sortDirection}`);
        }
    };

    const handleDirectionToggle = (newDirection) => {
        setSortDirection(newDirection);
        // Mettre à jour le parent avec le champ actuel et la nouvelle direction
        if (onSortChange) {
            onSortChange(`${sortField}_${newDirection}`);
        }
    };

    const handleCountryChange = (e) => {
        const country = e.target.value;
        setSelectedCountry(country);
        if (onFilterChange) {
            onFilterChange({ country: country, town: selectedTown });
        }
    };

    const handleTownChange = (e) => {
        const town = e.target.value;
        setSelectedTown(town);
        if (onFilterChange) {
            onFilterChange({ country: selectedCountry, town: town });
        }
    };

    return (
        <nav className="shadow-md px-6 py-3 bg-white border-b border-gray-200 sticky top-20 transition-all duration-300">
            <div className="flex justify-between items-center max-w-8xl mx-auto">
                
                {/* 1. 🔍 BARRE DE RECHERCHE (EXTRÊME GAUCHE) */}
                <div className="flex items-center w-full max-w-sm border border-gray-300 rounded-lg p-2 bg-gray-50">
                    <Search className="text-gray-500 mr-2 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Rechercher un utilisateur par son nom"
                        className="w-full bg-transparent text-gray-800 focus:outline-none placeholder-gray-500"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                {/* 2. ⚙️ FILTRES ET TRI (EXTRÊME DROITE) */}
                <div className="flex items-center gap-5 flex-wrap md:flex-nowrap">
                    
                    <div className='flex items-center gap-2'>
                        <select
                            className='px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 min-w-[120px]'
                            onChange={handleCountryChange}
                            value={selectedCountry}
                        >
                            <option value="">Tous les pays</option>
                            {availableCountries && availableCountries.map(country => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 min-w-[120px]"
                            onChange={handleTownChange}
                            value={selectedTown}
                        >   
                            <option value="">Toutes les villes</option>
                            {/* ⬅️ OPTIONS DYNAMIQUES DU PARENT */}
                            {availableTowns && availableTowns.map(town => (
                                <option key={town} value={town}>{town.charAt(0).toUpperCase() + town.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sélecteur de Tri (Select) */}
                    <div className="flex items-center gap-2">
                        <select
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                            onChange={handleFieldChange}
                            value={sortField}
                        >   
                            <option value="" disabled hidden>Trier</option>
                            <option value="town">Ville</option>
                            <option value="date">Date de création</option>
                        </select>

                        {/* Boutons de Direction (ASC/DESC) */}
                        <div className="flex border-l border-gray-300">
                            
                            {/* Flèche Haut (ASC) */}
                            <div className="p-1 flex flex-col border-l border-gray-300">
                                <button
                                    onClick={() => {
                                        if (sortDirection !== 'desc') handleDirectionToggle('desc');
                                    }}
                                    title="Trie par ordre croissant"
                                    className={`p-1 transition duration-150 rounded ${
                                        sortDirection === 'desc'
                                            ? 'bg-blue-500 text-white shadow-inner'
                                            : 'text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    <ChevronUp className="h-3 w-3" />
                                </button>

                                <button
                                    onClick={() => {
                                        if (sortDirection !== 'asc') handleDirectionToggle('asc');
                                    }}
                                    title="Trie par ordre décroissant"
                                    className={`p-1 transition duration-150 rounded ${
                                        sortDirection === 'asc'
                                            ? 'bg-blue-500 text-white shadow-inner'
                                            : 'text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    <ChevronDown className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}