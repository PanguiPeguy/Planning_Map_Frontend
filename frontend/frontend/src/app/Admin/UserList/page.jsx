'use client';

import UserListNavBar from "@/src/components/layout/UserListNavBar";
import LoadingScreen from "@/src/components/layout/Loading";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { ClipboardList, XCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/src/services/userService';

export default function UserList() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCriteria, setSortCriteria] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedTown, setSelectedTown] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAll();
            setUsers(response.data || response);
            setError(null);
        } catch (err) {
            console.error('Erreur:', err);
            setError('Impossible de charger les utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await userService.delete(id);
            setUsers(users.filter(user => user.id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Erreur:', err);
            alert("Erreur lors de la suppression de l'utilisateur");
        }
    };

    const handleEdit = (id) => {
        router.push(`/Admin/UserList/edit/${id}`);
    };

    const handleSearchChange = (term) => {
        setSearchTerm(term);
    }

    const handleSortChange = (criteria) => {
        setSortCriteria(criteria);
    }

    const handleFilterChange = ({ country, town }) => {
        setSelectedCountry(country);
        setSelectedTown(town);
    };

    const filteredAndSortedUsers = useMemo(() => {
        let results = [...users];

        if (searchTerm) {
            const lowerCaseTerm = searchTerm.toLowerCase();
            results = results.filter(user => 
                user.username?.toLowerCase().includes(lowerCaseTerm) ||
                user.email?.toLowerCase().includes(lowerCaseTerm)
            );
        }

        if (selectedCountry) {
            results = results.filter(user => 
                user.role?.toLowerCase() === selectedCountry.toLowerCase()
            );
        }
        
        if (selectedTown) {
            results = results.filter(user => 
                user.city?.toLowerCase() === selectedTown.toLowerCase()
            );
        }

        return results;
    }, [users, searchTerm, selectedCountry, selectedTown, sortCriteria]);

    const { availableCountries, availableTowns } = useMemo(() => {
        const countries = [...new Set(users.map(user => user.role))].sort();
        const towns = [...new Set(users.map(user => user.city))].sort();
        return { availableCountries: countries, availableTowns: towns };
    }, [users]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <UserListNavBar 
                onSearchChange={handleSearchChange}
                onSortChange={handleSortChange}
                onFilterChange={handleFilterChange}
                availableCountries={availableCountries}
                availableTypes={availableTowns}
            />
            <div className="min-h-screen bg-white py-8 mt-20">  
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-blue-100 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                                Utilisateurs ({filteredAndSortedUsers.length})
                            </h1>
                        </div>

                        {error && (
                            <div className="rounded-md p-2 mb-4 w-full text-red-500 bg-red-100 flex flex-col items-center">
                                <XCircle size={96} />
                                <span className="mb-4">{error}</span>
                            </div>
                        )}

                        {!error && (filteredAndSortedUsers.length === 0 ? (
                            <div className="text-center py-12 flex flex-col items-center">
                                <div className="rounded-md p-2 mb-4 w-full text-red-500 flex flex-col items-center">
                                    <ClipboardList size={96} />
                                    <p className="mb-4 font-bold">
                                        Aucun résultat trouvé.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="text-left py-4 px-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Utilisateur</th>
                                            <th className="text-left py-4 px-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Email</th>
                                            <th className="text-left py-4 px-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Rôle</th>
                                            <th className="text-left py-4 px-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Ville</th>
                                            <th className="text-center py-4 px-6 font-bold text-gray-400 uppercase text-xs tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    
                                    <tbody>
                                        {filteredAndSortedUsers.map((user) => (
                                            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="py-3 px-4 font-medium text-gray-800">{user.username}</td>
                                                <td className="py-3 px-4 text-gray-600 text-sm">{user.email}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600 text-sm">{user.city || '-'}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => setDeleteConfirm(user.id)}
                                                            className="text-red-500 hover:text-red-700"
                                                            title="Supprimer"
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modal de confirmation de suppression */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-999">
                        <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full z-1000">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">
                                Confirmer la suppression
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action ne peut pas être annulée.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}