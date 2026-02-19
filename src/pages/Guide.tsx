import React from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { LayoutDashboard, Settings, Calendar, FileText, DollarSign, Calculator } from 'lucide-react';

export const Guide: React.FC = () => {
  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Manual do Sistema</h2>
        <p className="text-slate-500 text-lg">Guia completo para utilização do EventManager Pro.</p>
      </div>

      <Card>
        <CardHeader title="Fluxo de Trabalho Ideal" icon={<LayoutDashboard />} />
        <CardContent>
          <p className="mb-6 text-slate-700 leading-relaxed">
            O <strong>EventManager Pro</strong> foi projetado para garantir a saúde financeira da sua empresa de eventos.
            Para obter os melhores resultados, recomendamos seguir esta ordem de operação:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-center">
              <div className="font-bold text-indigo-600 mb-1">1. Configuração</div>
              <div className="text-slate-600">Defina taxas, dias úteis e cadastre seus <strong>grupos de itens</strong> padrão.</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-center">
              <div className="font-bold text-indigo-600 mb-1">2. Custos Mensais</div>
              <div className="text-slate-600">Lance seus custos fixos (aluguel, equipe fixa) para o cálculo de rateio.</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-center">
              <div className="font-bold text-indigo-600 mb-1">3. Orçamentos</div>
              <div className="text-slate-600">Carregue um grupo e crie propostas com margem de lucro exata.</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-center">
              <div className="font-bold text-indigo-600 mb-1">4. Relatórios</div>
              <div className="text-slate-600">Acompanhe o DRE e o resultado real após a execução dos eventos.</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader title="1. Custos & Configurações" icon={<Settings />} />
          <CardContent className="space-y-4 text-sm text-slate-700">
            <p>
              Esta tela é o coração da inteligência financeira do sistema.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Parâmetros Gerais:</strong> A "Taxa de Ocupação" e "Dias Úteis" definem quantos eventos você espera fazer. O sistema usa isso para dividir seus custos fixos. Se você paga R$ 5.000 de aluguel e espera 10 eventos, cada evento "custa" R$ 500 de aluguel.
              </li>
              <li>
                <strong>Grupos de Itens Padrão:</strong> Em vez de itens avulsos, agora você pode criar "Grupos" para tipos de eventos (ex: "Festa Infantil", "Casamento Completo"). Dentro de cada grupo, você adiciona os itens e serviços padrão. Isso permite montar um orçamento completo com apenas um clique.
              </li>
              <li>
                <strong>Custos Fixos e Variáveis da Empresa:</strong> Cadastre todas as despesas da estrutura do negócio. Você pode usar a data "Recorrente" para custos que se repetem todo mês (ex: Internet).
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader title="2. Criando Orçamentos" icon={<Calendar />} />
          <CardContent className="space-y-4 text-sm text-slate-700">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Dados do Evento:</strong> Preencha data e local. A data é importante para o sistema saber qual tabela de custos mensais utilizar no cálculo.
              </li>
              <li>
                <strong>Carregar Grupo Padrão:</strong> Use o seletor de "Grupos" para importar uma lista completa de itens de um modelo de evento pré-cadastrado. Depois, apenas ajuste as quantidades e valores conforme a necessidade.
              </li>
              <li>
                <strong>Resumo Financeiro:</strong> O sistema mostra o "Custo Total do Evento" (soma dos itens + rateio de custo fixo).
              </li>
              <li>
                <strong>Status:</strong> Mantenha atualizado. Apenas eventos "Realizados" contam como receita nos relatórios. "Agendados" contam como previsão.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader title="3. Como o Preço é Calculado" icon={<Calculator />} />
          <CardContent className="space-y-4 text-sm text-slate-700">
            <p>
              O sistema utiliza o conceito de <strong>Margem sobre a Receita</strong> (e não Markup simples).
            </p>
            <div className="bg-slate-100 p-3 rounded-md font-mono text-xs">
              Preço Venda = Custo Total / (1 - (Margem% / 100))
            </div>
            <p>
              <strong>Exemplo Prático:</strong><br/>
              Se o evento custa R$ 8.000 e você quer 20% de lucro líquido:<br/>
              O sistema cobrará <strong>R$ 10.000</strong>.<br/>
              (R$ 10.000 - R$ 8.000 de custo = R$ 2.000 de lucro, que é exatamente 20% de R$ 10.000).
            </p>
            <p className="text-xs text-slate-500">
              Isso garante que, ao final do mês, a porcentagem que sobra no bolso seja realmente a que você planejou.
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader title="4. Relatórios e DRE" icon={<FileText />} />
          <CardContent className="space-y-4 text-sm text-slate-700">
            <p>
              Acesse a tela de Relatórios para ver o resultado consolidado do mês.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Receita Bruta:</strong> Soma dos orçamentos "Realizados" no mês.
              </li>
              <li>
                <strong>Custos Variáveis:</strong> Soma dos itens gastos nos eventos.
              </li>
              <li>
                <strong>Lucro Bruto:</strong> Quanto sobrou dos eventos para pagar a estrutura da empresa.
              </li>
              <li>
                <strong>Resultado Líquido:</strong> O lucro real (Lucro Bruto - Custos Fixos Reais do mês).
              </li>
            </ul>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
