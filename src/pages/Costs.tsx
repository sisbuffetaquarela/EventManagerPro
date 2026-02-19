import React, { useEffect, useState } from 'react';
import { 
  getCosts, addCost, deleteCost,
  getSettings, saveSettings,
  getBudgetCategories, saveBudgetCategory, deleteBudgetCategory
} from '../services/firestore';
import { Cost, SystemSettings, BudgetCategory, BudgetItemTemplate } from '../types';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Trash2, ChevronDown, Plus } from 'lucide-react';
import { formatCurrency } from '../utils/format';


const BudgetCategorySection: React.FC<{
  categories: BudgetCategory[];
  onSave: (category: BudgetCategory) => void;
  onDelete: (id: string) => void;
}> = ({ categories, onSave, onDelete }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [newItemForms, setNewItemForms] = useState<Record<string, { name: string, unitCost: string }>>({});

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    onSave({
      name: newCategoryName,
      items: [],
    });
    setNewCategoryName('');
  };
  
  const handleAddItem = (categoryId: string) => {
    const form = newItemForms[categoryId];
    if (!form || !form.name || !form.unitCost) return;
    
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const newItem: BudgetItemTemplate = {
      id: crypto.randomUUID(),
      name: form.name,
      unitCost: Number(form.unitCost),
    };
    
    const updatedCategory = {
      ...category,
      items: [...category.items, newItem]
    };
    onSave(updatedCategory);
    setNewItemForms(prev => ({ ...prev, [categoryId]: { name: '', unitCost: '' } }));
  };
  
  const handleDeleteItem = (categoryId: string, itemId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const updatedCategory = {
      ...category,
      items: category.items.filter(item => item.id !== itemId)
    };
    onSave(updatedCategory);
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
    if (!newItemForms[id]) {
      setNewItemForms(prev => ({ ...prev, [id]: { name: '', unitCost: '' } }));
    }
  };

  return (
    <Card>
      <CardHeader title="Grupos de Itens para Orçamentos" />
      <CardContent>
        <div className="flex gap-4 mb-6 items-end flex-wrap md:flex-nowrap p-4 bg-slate-50 rounded-lg border">
          <Input label="Nome do Novo Grupo" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="flex-1 min-w-[200px]" />
          <Button onClick={handleAddCategory}><Plus size={16} className="mr-2" />Criar Grupo</Button>
        </div>
        
        <div className="space-y-2">
          {categories.length > 0 ? categories.map(cat => (
            <div key={cat.id} className="border rounded-md overflow-hidden">
              <div className="w-full flex justify-between items-center px-4 py-3 bg-slate-50">
                <button onClick={() => toggleCategory(cat.id!)} className="flex-1 flex items-center gap-2 text-left">
                  <ChevronDown size={20} className={`transition-transform ${expandedCategories[cat.id!] ? 'rotate-180' : ''}`} />
                  <h4 className="font-medium text-slate-800">{cat.name}</h4>
                </button>
                <button onClick={() => onDelete(cat.id!)} className="text-red-600 hover:text-red-900 ml-4"><Trash2 size={16} /></button>
              </div>

              {expandedCategories[cat.id!] && (
                <div className="p-4 bg-white">
                  <div className="flex gap-4 mb-4 items-end flex-wrap md:flex-nowrap p-3 bg-slate-50 rounded-md border">
                    <Input label="Nome do Item" value={newItemForms[cat.id!]?.name || ''} onChange={e => setNewItemForms(p => ({ ...p, [cat.id!]: { ...p[cat.id!], name: e.target.value }}))} className="flex-1" />
                    <Input label="Custo Unit." type="number" value={newItemForms[cat.id!]?.unitCost || ''} onChange={e => setNewItemForms(p => ({ ...p, [cat.id!]: { ...p[cat.id!], unitCost: e.target.value }}))} className="w-32" />
                    <Button onClick={() => handleAddItem(cat.id!)} size="sm">Adicionar</Button>
                  </div>
                  
                  {cat.items.length > 0 ? (
                    <table className="min-w-full text-sm">
                      <tbody className="divide-y">
                        {cat.items.map(item => (
                          <tr key={item.id}>
                            <td className="py-2 px-2">{item.name}</td>
                            <td className="py-2 px-2 w-32">{formatCurrency(item.unitCost)}</td>
                            <td className="py-2 px-2 w-16 text-right">
                              <button onClick={() => handleDeleteItem(cat.id!, item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p className="text-center text-xs text-slate-500 py-2">Nenhum item neste grupo.</p>}
                </div>
              )}
            </div>
          )) : <p className="text-center py-4 text-slate-500">Nenhum grupo de itens cadastrado.</p>}
        </div>
      </CardContent>
    </Card>
  );
};


const CostSection: React.FC<{
  title: string;
  costs: Cost[];
  type: 'fixed' | 'variable';
  onAdd: (cost: Omit<Cost, 'id'>) => void;
  onDelete: (id: string) => void;
}> = ({ title, costs, type, onAdd, onDelete }) => {
  const [groupedCosts, setGroupedCosts] = useState<Record<string, Cost[]>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [newCost, setNewCost] = useState({ name: '', amount: '', monthYear: currentMonth });

  useEffect(() => {
    const groups: Record<string, Cost[]> = {};
    costs.forEach(cost => {
      const key = cost.monthYear || 'recorrente';
      if (!groups[key]) groups[key] = [];
      groups[key].push(cost);
    });
    setGroupedCosts(groups);
  }, [costs]);

  const handleAdd = () => {
    if (!newCost.name || !newCost.amount) return;
    onAdd({
      name: newCost.name,
      amount: Number(newCost.amount),
      monthYear: newCost.monthYear,
      type
    });
    setNewCost(prev => ({ ...prev, name: '', amount: '' }));
  };

  const formatMonthYear = (val?: string) => {
    if (!val || val === 'recorrente') return 'Custos Recorrentes';
    const [year, month] = val.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  };
  
  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <div className="flex gap-4 mb-6 items-end flex-wrap md:flex-nowrap p-4 bg-slate-50 rounded-lg border">
          <Input label="Mês/Ano (opcional)" type="month" value={newCost.monthYear} onChange={e => setNewCost({...newCost, monthYear: e.target.value})} className="md:w-56" />
          <Input label="Nome do Custo" value={newCost.name} onChange={e => setNewCost({...newCost, name: e.target.value})} className="flex-1 min-w-[200px]" />
          <Input label="Valor (R$)" type="number" value={newCost.amount} onChange={e => setNewCost({...newCost, amount: e.target.value})} className="md:w-32" />
          <Button onClick={handleAdd}>Adicionar</Button>
        </div>
        
        <div className="space-y-2">
          {Object.keys(groupedCosts).length > 0 ? Object.keys(groupedCosts).map(groupKey => (
            <div key={groupKey} className="border rounded-md overflow-hidden">
              <button onClick={() => toggleGroup(groupKey)} className="w-full flex justify-between items-center px-6 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
                <h4 className="font-medium text-slate-700 capitalize">{formatMonthYear(groupKey)}</h4>
                <ChevronDown size={20} className={`transition-transform ${expandedGroups[groupKey] ? 'rotate-180' : ''}`} />
              </button>
              {expandedGroups[groupKey] && (
                <table className="min-w-full divide-y divide-slate-200">
                  <tbody className="divide-y divide-slate-200">
                    {groupedCosts[groupKey].map(cost => (
                      <tr key={cost.id}>
                        <td className="px-6 py-3 text-sm text-slate-900">{cost.name}</td>
                        <td className="px-6 py-3 text-sm text-slate-900">{formatCurrency(cost.amount)}</td>
                        <td className="px-6 py-3 text-right w-16">
                          <button onClick={() => onDelete(cost.id!)} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )) : <p className="text-center py-4 text-slate-500">Nenhum custo cadastrado.</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export const Costs: React.FC = () => {
  const [allCosts, setAllCosts] = useState<Cost[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({ occupancyRate: 70, workingDaysPerMonth: 22 });
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [costs, st, cats] = await Promise.all([getCosts(), getSettings(), getBudgetCategories()]);
    const sortedCosts = costs.sort((a, b) => (b.monthYear || '').localeCompare(a.monthYear || ''));
    setAllCosts(sortedCosts);
    setSettings(st);
    setBudgetCategories(cats);
  };

  const handleAddCost = async (cost: Omit<Cost, 'id'>) => {
    await addCost(cost as Cost);
    loadData();
  };
  
  const handleDeleteCost = async (id: string) => {
    await deleteCost(id);
    loadData();
  };
  
  const handleSaveCategory = async (category: BudgetCategory) => {
    await saveBudgetCategory(category);
    loadData();
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteBudgetCategory(id);
    loadData();
  };

  const handleSaveSettings = async () => {
    await saveSettings(settings);
    alert('Configurações salvas!');
  };

  const fixedCosts = allCosts.filter(c => c.type === 'fixed');
  const variableCosts = allCosts.filter(c => c.type === 'variable');

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-900">Gestão de Custos e Parâmetros</h2>

      <Card>
        <CardHeader title="Parâmetros Gerais do Negócio" action={<Button onClick={handleSaveSettings} size="sm">Salvar Parâmetros</Button>} />
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Ocupação Esperada (%)" type="number" value={settings.occupancyRate} onChange={e => setSettings({...settings, occupancyRate: Number(e.target.value)})} />
          <Input label="Dias Úteis por Mês" type="number" value={settings.workingDaysPerMonth} onChange={e => setSettings({...settings, workingDaysPerMonth: Number(e.target.value)})} />
        </CardContent>
      </Card>
      
      <BudgetCategorySection categories={budgetCategories} onSave={handleSaveCategory} onDelete={handleDeleteCategory} />

      <CostSection title="Custos Fixos" costs={fixedCosts} type="fixed" onAdd={handleAddCost} onDelete={handleDeleteCost} />
      <CostSection title="Custos Variáveis" costs={variableCosts} type="variable" onAdd={handleAddCost} onDelete={handleDeleteCost} />
    </div>
  );
};