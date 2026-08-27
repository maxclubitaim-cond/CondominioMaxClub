import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PackageSearch,
    Plus,
    History,
    Save,
    Loader2,
    X,
    AlertTriangle,
    ArrowDownToLine,
    ArrowUpFromLine,
    Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDate } from '../utils/dateUtils';
import Pagination from '../components/common/Pagination';

function AdminEstoque() {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState('itens'); // 'itens', 'historico'
    const [itens, setItens] = useState([]);
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Modals
    const [isNovoItemOpen, setIsNovoItemOpen] = useState(false);
    const [isEntradaOpen, setIsEntradaOpen] = useState(false);
    
    // Form Novo Item
    const [nomeItem, setNomeItem] = useState('');
    const [categoria, setCategoria] = useState('Manutenção Geral');
    const [qtdInicial, setQtdInicial] = useState(0);
    const [qtdMinima, setQtdMinima] = useState(0);
    const [unidade, setUnidade] = useState('un');
    const [savingItem, setSavingItem] = useState(false);

    // Form Nova Entrada
    const [selectedItemForEntrada, setSelectedItemForEntrada] = useState(null);
    const [qtdEntrada, setQtdEntrada] = useState('');
    const [obsEntrada, setObsEntrada] = useState('');
    const [savingEntrada, setSavingEntrada] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    async function fetchData() {
        setLoading(true);
        try {
            if (activeTab === 'itens') {
                const { data, error } = await supabase
                    .from('estoque_itens')
                    .select('*')
                    .order('nome');
                if (error) throw error;
                setItens(data || []);
            } else {
                const { data, error } = await supabase.rpc('listar_movimentacoes_estoque');
                if (error) throw error;
                setMovimentacoes(data || []);
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao buscar dados do estoque.');
        } finally {
            setLoading(false);
        }
    }

    const handleSalvarNovoItem = async (e) => {
        e.preventDefault();
        if (!nomeItem) {
            toast.error('O nome do item é obrigatório');
            return;
        }

        setSavingItem(true);
        try {
            const { data: novoItem, error: errItem } = await supabase.from('estoque_itens').insert([{
                nome: nomeItem,
                categoria,
                quantidade_atual: parseInt(qtdInicial),
                quantidade_minima: parseInt(qtdMinima),
                unidade_medida: unidade
            }]).select().single();

            if (errItem) throw errItem;

            if (parseInt(qtdInicial) > 0) {
                const { error: errMov } = await supabase.from('estoque_movimentacoes').insert([{
                    item_id: novoItem.id,
                    quantidade: parseInt(qtdInicial),
                    tipo: 'ENTRADA',
                    responsavel_id: profile?.id,
                    observacao: 'Saldo Inicial de Cadastro'
                }]);
                if (errMov) throw errMov;
            }

            toast.success('Item cadastrado com sucesso!');
            setIsNovoItemOpen(false);
            
            setNomeItem('');
            setQtdInicial(0);
            setQtdMinima(0);
            
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error('Erro ao cadastrar item.');
        } finally {
            setSavingItem(false);
        }
    };

    const handleSalvarEntrada = async (e) => {
        e.preventDefault();
        if (!qtdEntrada || parseInt(qtdEntrada) <= 0) {
            toast.error('Informe uma quantidade válida.');
            return;
        }

        setSavingEntrada(true);
        try {
            const { error: errMov } = await supabase.from('estoque_movimentacoes').insert([{
                item_id: selectedItemForEntrada.id,
                quantidade: parseInt(qtdEntrada),
                tipo: 'ENTRADA',
                responsavel_id: profile?.id,
                observacao: obsEntrada || 'Entrada avulsa'
            }]);

            if (errMov) throw errMov;

            const { error: errUpdate } = await supabase.from('estoque_itens')
                .update({ quantidade_atual: selectedItemForEntrada.quantidade_atual + parseInt(qtdEntrada) })
                .eq('id', selectedItemForEntrada.id);

            if (errUpdate) throw errUpdate;

            toast.success('Entrada registrada com sucesso!');
            setIsEntradaOpen(false);
            setQtdEntrada('');
            setObsEntrada('');
            setSelectedItemForEntrada(null);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error('Erro ao registrar entrada.');
        } finally {
            setSavingEntrada(false);
        }
    };

    const filteredItens = itens.filter(i => i.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    const paginatedItens = filteredItens.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    const paginatedMovimentacoes = movimentacoes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <PackageSearch className="text-primary" /> Gestão de Estoque
                    </h1>
                    <p className="text-slate-500 text-sm">Controle de materiais, ferramentas e insumos</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsNovoItemOpen(true)}
                        className="bg-primary hover:bg-blue-600 text-white px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus size={18} /> Novo Item
                    </button>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex gap-2">
                <button
                    onClick={() => { setActiveTab('itens'); setCurrentPage(1); }}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'itens' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <PackageSearch size={18} /> Inventário Atual
                </button>
                <button
                    onClick={() => { setActiveTab('historico'); setCurrentPage(1); }}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'historico' ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <History size={18} /> Histórico de Movimentação
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative min-h-[400px]">
                {loading ? (
                    <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center backdrop-blur-sm rounded-xl">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : activeTab === 'itens' ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 w-full sm:w-96">
                            <Search className="text-slate-400 ml-2" size={20} />
                            <input 
                                type="text"
                                placeholder="Buscar itens no estoque..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="bg-transparent border-none outline-none flex-1 text-sm text-slate-800"
                            />
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="p-4">Item</th>
                                        <th className="p-4">Categoria</th>
                                        <th className="p-4 text-right">Saldo Atual</th>
                                        <th className="p-4 text-center">Status</th>
                                        <th className="p-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedItens.length > 0 ? paginatedItens.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-semibold text-slate-800">{item.nome}</td>
                                            <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded-md text-xs">{item.categoria}</span></td>
                                            <td className="p-4 text-right font-bold">
                                                {item.quantidade_atual} {item.unidade_medida}
                                            </td>
                                            <td className="p-4 text-center">
                                                {item.quantidade_atual <= item.quantidade_minima ? (
                                                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded-md text-xs font-bold border border-red-100">
                                                        <AlertTriangle size={12} /> Comprar
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-xs font-bold border border-emerald-100">
                                                        OK
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => { setSelectedItemForEntrada(item); setIsEntradaOpen(true); }}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-1 border border-transparent hover:border-emerald-200 text-xs font-bold"
                                                >
                                                    <ArrowDownToLine size={14} /> Repor
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-500">
                                                Nenhum item encontrado no inventário.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {filteredItens.length > ITEMS_PER_PAGE && (
                            <Pagination 
                                totalItems={filteredItens.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="p-4">Data/Hora</th>
                                        <th className="p-4">Item</th>
                                        <th className="p-4">Tipo</th>
                                        <th className="p-4 text-right">Quantidade</th>
                                        <th className="p-4">Responsável</th>
                                        <th className="p-4">Observação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedMovimentacoes.length > 0 ? paginatedMovimentacoes.map(mov => (
                                        <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4">{formatDate(mov.data_movimentacao, true)}</td>
                                            <td className="p-4 font-semibold text-slate-800">{mov.item_nome}</td>
                                            <td className="p-4">
                                                {mov.tipo === 'ENTRADA' ? (
                                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md text-xs font-bold border border-emerald-100">
                                                        <ArrowDownToLine size={12} /> ENTRADA
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-md text-xs font-bold border border-orange-100">
                                                        <ArrowUpFromLine size={12} /> SAÍDA
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right font-bold">
                                                {mov.quantidade} {mov.unidade_medida}
                                            </td>
                                            <td className="p-4">{mov.responsavel_nome || 'Sistema'}</td>
                                            <td className="p-4 text-xs italic">{mov.observacao}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="p-8 text-center text-slate-500">
                                                Nenhuma movimentação registrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {movimentacoes.length > ITEMS_PER_PAGE && (
                            <Pagination 
                                totalItems={movimentacoes.length}
                                itemsPerPage={ITEMS_PER_PAGE}
                                currentPage={currentPage}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Modal Novo Item */}
            <AnimatePresence>
                {isNovoItemOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="text-xl font-bold text-slate-800">Cadastrar Novo Item</h3>
                                <button onClick={() => setIsNovoItemOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSalvarNovoItem} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Nome do Item</label>
                                    <input
                                        type="text"
                                        required
                                        value={nomeItem}
                                        onChange={e => setNomeItem(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="Ex: Lâmpada LED 9W"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
                                        <select
                                            value={categoria}
                                            onChange={e => setCategoria(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            <option>Elétrica</option>
                                            <option>Hidráulica</option>
                                            <option>Limpeza</option>
                                            <option>Piscina</option>
                                            <option>Ferramentas</option>
                                            <option>Manutenção Geral</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Unidade</label>
                                        <select
                                            value={unidade}
                                            onChange={e => setUnidade(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            <option value="un">Unidade (un)</option>
                                            <option value="cx">Caixa (cx)</option>
                                            <option value="kg">Quilo (kg)</option>
                                            <option value="litro">Litro (l)</option>
                                            <option value="metro">Metro (m)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Estoque Inicial</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={qtdInicial}
                                            onChange={e => setQtdInicial(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Estoque Mínimo</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={qtdMinima}
                                            onChange={e => setQtdMinima(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsNovoItemOpen(false)}
                                        className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={savingItem}
                                        className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                                    >
                                        {savingItem ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={18} />}
                                        Salvar Item
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Entrada Estoque */}
            <AnimatePresence>
                {isEntradaOpen && selectedItemForEntrada && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50">
                                <h3 className="text-xl font-bold text-emerald-800">Reposição de Estoque</h3>
                                <button onClick={() => setIsEntradaOpen(false)} className="text-emerald-500 hover:text-emerald-700">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSalvarEntrada} className="p-6 space-y-4">
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <p className="text-sm font-semibold text-slate-800">{selectedItemForEntrada.nome}</p>
                                    <p className="text-xs text-slate-500 mt-1">Saldo atual: {selectedItemForEntrada.quantidade_atual} {selectedItemForEntrada.unidade_medida}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Quantidade Adicionada</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={qtdEntrada}
                                            onChange={e => setQtdEntrada(e.target.value)}
                                            className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none text-lg font-bold"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{selectedItemForEntrada.unidade_medida}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Observação (Opcional)</label>
                                    <input
                                        type="text"
                                        value={obsEntrada}
                                        onChange={e => setObsEntrada(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-200 outline-none"
                                        placeholder="Ex: Nota Fiscal nº 1234"
                                    />
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                                    <button
                                        type="submit"
                                        disabled={savingEntrada}
                                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                                    >
                                        {savingEntrada ? <Loader2 className="animate-spin w-4 h-4" /> : <ArrowDownToLine size={18} />}
                                        Confirmar Reposição
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminEstoque;
