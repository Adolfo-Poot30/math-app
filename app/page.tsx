'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Settings, 
  History, 
  ChevronRight, 
  Delete, 
  Eraser, 
  FunctionSquare, 
  Play, 
  Info,
  Layers,
  Menu,
  X,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trash2,
  Calculator
} from 'lucide-react';
import { newtonRaphson, biseccion, secante, type MethodResult } from './methods';

const parseFunction = (formula: string) => {
  return (x: number) => {
    try {
      const expr = formula
        .replace(/π/g, Math.PI.toString())
        .replace(/e/g, Math.E.toString())
        .replace(/\^/g, "**");

      return eval(expr);
    } catch {
      return NaN;
    }
  };
};

// --- Tipos ---
interface HistoryItem {
  id: string;
  method: string;
  formula: string;
  result: string;
  iterations: number;
  error: string;
  timestamp: number;
}

/**
 * Componente: BoardComponent
 * Modal que muestra los pasos y resultados.
 */
const BoardComponent = ({ 
  isOpen, 
  onClose, 
  method, 
  formula,
  result
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  method: string, 
  formula: string,
  result: MethodResult | null
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/20 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between bg-white/50">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Resultados</h2>
            <p className="text-sm text-gray-500 font-medium">{method} • {formula || "f(x)"}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <CheckCircle2 size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Raíz</span>
              </div>
              <div className="text-3xl font-semibold text-blue-700 tracking-tight">{result?.root.toFixed(6)}</div>
            </div>
            
            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <Clock size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Iteraciones</span>
              </div>
              <div className="text-3xl font-semibold text-gray-800 tracking-tight"> {result?.iterations}</div>
            </div>

            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <ArrowRight size={18} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Error</span>
              </div>
              <div className="text-3xl font-semibold text-gray-800 tracking-tight"> {result?.error.toExponential(2)} </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Tabla de Iteraciones</h3>
            <div className="overflow-x-auto border border-gray-100 rounded-2xl bg-white/50 shadow-sm">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">i</th>
                    <th className="px-6 py-4">x_i</th>
                    <th className="px-6 py-4">f(x_i)</th>
                    <th className="px-6 py-4">Error Rel.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {result?.steps.map((step) => (
			<tr key={step.i} className="hover:bg-blue-50/30 transition-colors">
			  <td className="px-6 py-4 text-sm font-medium text-gray-400">
			    {step.i}
			  </td>
			  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
			    {step.x.toFixed(6)}
			  </td>
			  <td className="px-6 py-4 text-sm text-gray-600 font-mono">
			    {step.fx.toFixed(6)}
			  </td>
			  <td className="px-6 py-4 text-sm text-blue-600 font-medium font-mono">
			    {step.error !== null ? step.error.toFixed(6) : "---"}
			  </td>
			</tr>                  
		))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex justify-end gap-3">
          <button onClick={onClose} className="px-8 py-2.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [formula, setFormula] = useState("");
  const [activeMethod, setActiveMethod] = useState("Newton-Raphson");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'methods' | 'history'>('methods');
  const [computation, setComputation] = useState<MethodResult | null>(null);
  const [x0, setX0] = useState("1"); // Para Newton y Secante
  const [x1, setX1] = useState("2"); // Para Bisección (límite b) o Secante
  const [tol, setTol] = useState("0.0001");
  // --- Cargar historial al iniciar ---
  useEffect(() => {
    const savedHistory = localStorage.getItem('math_solver_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error al cargar historial", e);
      }
    }
  }, []);

  // --- Guardar historial cuando cambie ---
  const saveToLocalStorage = (newHistory: HistoryItem[]) => {
    localStorage.setItem('math_solver_history', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const methods = [
    { id: 'newton', name: 'Newton-Raphson', icon: <FunctionSquare size={18} /> },
    { id: 'biseccion', name: 'Bisección', icon: <Layers size={18} /> },
    { id: 'secante', name: 'Secante', icon: <ChevronRight size={18} /> },
    { id: 'puntofijo', name: 'Punto Fijo', icon: <Plus size={18} /> },
  ];

  const mathButtons = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', '.', 'x'],
    ['+', '-', '*', '/', '(', ')'],
    ['^', 'sqrt', 'pi', 'e', 'exp', 'log'],
    ['sin', 'cos', 'tan', 'asin', 'acos', 'atan']
  ];

  const addToFormula = useCallback((char: string) => {
    const functions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'exp', 'log', 'sqrt'];
    if (functions.includes(char)) {
      setFormula(prev => prev + char + "(");
    } else if (char === 'pi') {
      setFormula(prev => prev + "π");
    } else {
      setFormula(prev => prev + char);
    }
  }, []);

  const backspace = useCallback(() => {
    setFormula(prev => prev.slice(0, -1));
  }, []);

  const clearFormula = () => setFormula("");

const handleRun = () => {
  if (!formula.trim()) return;

  const fn = parseFunction(formula);
  const val0 = parseFloat(x0);
  const val1 = parseFloat(x1);
  const tolerance = parseFloat(tol);
  let result;

  if (activeMethod === "Newton-Raphson") {
    result = newtonRaphson(fn, val0, tolerance);
  } else if (activeMethod === "Bisección") {
    result = biseccion(fn, val0, val1, tolerance);
  } else if (activeMethod === "Secante") {
    result = secante(fn, val0, val1, tolerance);
  }

  if (!result) return;

  const newItem: HistoryItem = {
    id: crypto.randomUUID(),
    method: activeMethod,
    formula,
    result: result.root.toFixed(6),
    iterations: result.iterations,
    error: result.error.toExponential(2),
    timestamp: Date.now()
  };

  const updatedHistory = [newItem, ...history].slice(0, 50);
  saveToLocalStorage(updatedHistory);

  setComputation(result);
  console.log("Resultado:", result);
  setIsBoardOpen(true);
};

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(item => item.id !== id);
    saveToLocalStorage(updatedHistory);
  };

  const clearAllHistory = () => {
    saveToLocalStorage([]);
  };

  const restoreFromHistory = (item: HistoryItem) => {
    setFormula(item.formula);
    setActiveMethod(item.method);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || isBoardOpen) return;
      const key = e.key;
      if (/^[0-9x.]$/.test(key)) addToFormula(key);
      else if (['+', '-', '*', '/', '(', ')', '^'].includes(key)) addToFormula(key);
      else if (key === 'Backspace') backspace();
      else if (key === 'Enter') handleRun();
      else if (key === 'Escape') setIsKeyboardVisible(prev => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addToFormula, backspace, formula, isBoardOpen, history]);

  return (
    <div className="flex h-screen w-full bg-[#F5F5F7] text-[#1D1D1F] font-sans overflow-hidden">
      
      {/* --- Barra Lateral (Apple Style Sidebar) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#E8E8ED]/80 backdrop-blur-3xl border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-500 hover:bg-gray-200 rounded-lg">
              <X size={20} />
            </button>
          </div>
          
          {/* Tabs de Sidebar */}
          <div className="flex p-1 bg-gray-200/50 rounded-xl mb-6">
            <button 
              onClick={() => setSidebarTab('methods')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${sidebarTab === 'methods' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              <Calculator size={14} /> Métodos
            </button>
            <button 
              onClick={() => setSidebarTab('history')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${sidebarTab === 'history' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              <History size={14} /> Historial
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 -mx-2 px-2">
            {sidebarTab === 'methods' ? (
              <nav className="space-y-1">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveMethod(m.name);
                      if (window.innerWidth < 768) setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      activeMethod === m.name && sidebarTab === 'methods'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {m.icon}
                    <span className="font-medium">{m.name}</span>
                  </button>
                ))}
              </nav>
            ) : (
              <div className="space-y-2">
                {history.length === 0 ? (
                  <div className="text-center py-10 px-4">
                    <p className="text-xs text-gray-400 font-medium">No hay cálculos recientes</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => restoreFromHistory(item)}
                      className="group relative bg-white/50 hover:bg-white p-3 rounded-xl border border-transparent hover:border-gray-200 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    >
                      <button 
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="text-[10px] font-bold text-blue-500 uppercase mb-1">{item.method}</div>
                      <div className="text-sm font-semibold text-gray-800 truncate pr-4">{item.formula}</div>
                      <div className="text-[10px] text-gray-400 mt-1">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {sidebarTab === 'history' && history.length > 0 && (
            <button 
              onClick={clearAllHistory}
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:bg-red-50 rounded-lg transition-colors"
            >
              Vaciar Historial
            </button>
          )}
        </div>
      </aside>

      {/* Overlay Móvil */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* --- Contenedor Principal --- */}
      <div className={`flex flex-1 transition-all duration-500 ease-in-out ml-0 md:ml-64 ${isKeyboardVisible ? 'mr-0 lg:mr-80' : 'mr-0'}`}>
        <main className="flex-1 flex flex-col relative min-w-0">
          <header className="h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-8 bg-white/70 backdrop-blur-md z-10">
            <div className="flex items-center gap-3 text-gray-800">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 md:hidden hover:bg-gray-100 rounded-lg">
                <Menu size={20} />
              </button>
              <h1 className="text-base md:text-lg font-semibold tracking-tight truncate">{activeMethod}</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={handleRun}
                className="bg-black text-white px-4 md:px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-black/10"
              >
                <Play size={14} fill="currentColor" />
                <span className="hidden sm:inline">Ejecutar</span>
              </button>
            </div>
          </header>

          <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center space-y-6 md:space-y-8 overflow-y-auto">
            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-12 transition-all">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] ml-1">Entrada f(x)</span>
                <button onClick={clearFormula} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                  <Eraser size={20} />
                </button>
              </div>
              <div className="text-3xl md:text-5xl font-light tracking-tight text-center break-all min-h-[80px] flex items-center justify-center text-[#1D1D1F]">
                {formula || <span className="text-gray-200 italic font-normal text-xl md:text-4xl">f(x) = ...</span>}
                <span className="w-[3px] h-8 md:h-12 bg-blue-500 ml-2 animate-pulse rounded-full"></span>
              </div>
            </div>

            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
		<div className="bg-white/60 p-6 rounded-3xl border border-gray-100 backdrop-blur-sm shadow-sm">
		  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
		    {activeMethod === "Bisección" ? "Límite Inferior (a)" : "Valor Inicial (x₀)"}
		  </label>
		  <input 
		    type="number" 
		    value={x0}
		    onChange={(e) => setX0(e.target.value)}
		    placeholder="0.0" 
		    className="w-full bg-transparent border-b border-gray-100 py-1.5 outline-none focus:border-blue-500 transition-colors text-xl font-medium" 
		  />
		</div>

		<div className="bg-white/60 p-6 rounded-3xl border border-gray-100 backdrop-blur-sm shadow-sm">
		  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
		    {activeMethod === "Bisección" ? "Límite Superior (b)" : "Tolerancia (ε)"}
		  </label>
		  <input 
		    type="number" 
		    value={activeMethod === "Bisección" ? x1 : tol}
		    onChange={(e) => activeMethod === "Bisección" ? setX1(e.target.value) : setTol(e.target.value)}
		    placeholder="0.0001" 
		    className="w-full bg-transparent border-b border-gray-100 py-1.5 outline-none focus:border-blue-500 transition-colors text-xl font-medium" 
		  />
		</div>
            </div>
          </div>
        </main>
      </div>

      {/* --- Teclado Lateral --- */}
      <div className={`
        fixed transition-all duration-500 ease-in-out z-30
        ${isKeyboardVisible ? 'translate-y-0 opacity-100' : 'translate-y-full lg:translate-y-0 lg:translate-x-full opacity-0'}
        bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-3xl border-t border-gray-200
        lg:top-0 lg:bottom-0 lg:left-auto lg:right-0 lg:w-80 lg:border-t-0 lg:border-l lg:p-8 lg:bg-[#FBFBFD]/95
      `}>
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center mb-8 px-1">
            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              <Info size={14} className="text-blue-500" />
              <span>Teclado</span>
            </div>
            <button onClick={() => setIsKeyboardVisible(false)} className="text-blue-600 text-xs font-bold hover:text-blue-800">Cerrar</button>
          </div>

          <div className="grid grid-cols-6 lg:grid-cols-3 gap-2.5 overflow-y-auto pr-1 pb-4">
            {mathButtons.flat().map((btn) => (
              <button
                key={btn}
                onClick={() => addToFormula(btn)}
                className={`
                  h-12 md:h-14 lg:h-12 rounded-2xl text-sm font-semibold transition-all active:scale-95
                  ${isNaN(Number(btn)) && btn !== '.' && btn !== 'x'
                    ? 'bg-[#F2F2F7] text-blue-600 hover:bg-[#E5E5EA]' 
                    : 'bg-white text-[#1D1D1F] shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md'}
                `}
              >
                {btn}
              </button>
            ))}
            <button 
              onClick={backspace}
              className="h-12 md:h-14 lg:h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors active:scale-95 border border-red-100"
            >
              <Delete size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Resultados */}
	<BoardComponent 
	  isOpen={isBoardOpen} 
	  onClose={() => setIsBoardOpen(false)} 
	  method={activeMethod}
	  formula={formula}
	  result={computation}
	/>
      {!isKeyboardVisible && (
        <button 
          onClick={() => setIsKeyboardVisible(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 z-40 border border-white/10 hover:scale-110 transition-transform"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}