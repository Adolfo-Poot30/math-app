'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
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
  Calculator,
  AlertCircle
} from 'lucide-react';
import { newtonRaphson, biseccion, secante, type MethodResult } from './methods';

const parseFunction = (formula: string) => {
  return (x: number) => {
    try {
      // Reemplazos para compatibilidad con eval y sintaxis matemática común
      const expr = formula
        .replace(/π/g, Math.PI.toString())
        .replace(/e/g, Math.E.toString())
        .replace(/\^/g, "**")
        .replace(/sin/g, "Math.sin")
        .replace(/cos/g, "Math.cos")
        .replace(/tan/g, "Math.tan")
        .replace(/log/g, "Math.log")
        .replace(/exp/g, "Math.exp")
        .replace(/sqrt/g, "Math.sqrt")
        // Soporte básico para 2x -> 2*x
        .replace(/(\d)(x)/g, "$1*$2");

      return eval(expr.replace(/x/g, `(${x})`));
    } catch {
      return NaN;
    }
  };
};

interface HistoryItem {
  id: string;
  method: string;
  formula: string;
  result: string;
  iterations: number;
  error: string;
  timestamp: number;
}

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
              <div className="text-3xl font-semibold text-gray-800 tracking-tight"> 
                {result?.error !== undefined ? result.error.toExponential(2) : "0"} 
              </div>
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
                      <td className="px-6 py-4 text-sm font-medium text-gray-400">{step.i}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{step.x.toFixed(8)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{step.fx.toFixed(8)}</td>
                      <td className="px-6 py-4 text-sm text-blue-600 font-medium font-mono">
                        {step.error !== null ? step.error.toExponential(4) : "---"}
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inputs dinámicos
  const [x0, setX0] = useState("0"); 
  const [x1, setX1] = useState("1"); 
  const [tol, setTol] = useState("0.0001");

  useEffect(() => {
    const savedHistory = localStorage.getItem('math_solver_history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
  }, []);

  const saveToLocalStorage = (newHistory: HistoryItem[]) => {
    localStorage.setItem('math_solver_history', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const clearHistory = () => {
    localStorage.removeItem('math_solver_history');
    setHistory([]);
  };


  const methods = [
    { id: 'newton', name: 'Newton-Raphson', icon: <FunctionSquare size={18} /> },
    { id: 'biseccion', name: 'Bisección', icon: <Layers size={18} /> },
    { id: 'secante', name: 'Secante', icon: <ChevronRight size={18} /> },
  ];

  const mathButtons = [
    ['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], ['0', '.', 'x'],
    ['+', '-', '*', '/', '(', ')'], ['^', 'sqrt', 'pi', 'e'],
    ['sin', 'cos', 'tan', 'log', 'exp']
  ];

  const addToFormula = useCallback((char: string) => {
    setErrorMsg(null);
    const functions = ['sin', 'cos', 'tan', 'exp', 'log', 'sqrt'];
    if (functions.includes(char)) setFormula(prev => prev + char + "(");
    else if (char === 'pi') setFormula(prev => prev + "π");
    else setFormula(prev => prev + char);
  }, []);

  const backspace = useCallback(() => setFormula(prev => prev.slice(0, -1)), []);

  const handleRun = () => {
    if (!formula.trim()) return;
    setErrorMsg(null);

    try {
      const fn = parseFunction(formula);
      const val0 = parseFloat(x0);
      const val1 = parseFloat(x1);
      const tolerance = parseFloat(tol);
      let result: MethodResult;

      if (activeMethod === "Newton-Raphson") {
        result = newtonRaphson(fn, val0, tolerance);
      } else if (activeMethod === "Bisección") {
        result = biseccion(fn, val0, val1, tolerance);
      } else { // Secante
        result = secante(fn, val0, val1, tolerance);
      }

      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        method: activeMethod,
        formula,
        result: result.root.toFixed(6),
        iterations: result.iterations,
        error: result.error.toExponential(2),
        timestamp: Date.now()
      };

      saveToLocalStorage([newItem, ...history].slice(0, 50));
      setComputation(result);
      setIsBoardOpen(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Error en el cálculo. Verifica la función o valores.");
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F5F7] text-[#1D1D1F] font-sans overflow-hidden">
      
      {/* Sidebar */}
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
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-500"><X size={20} /></button>
          </div>
          
          <div className="flex p-1 bg-gray-200/50 rounded-xl mb-6">
            <button onClick={() => setSidebarTab('methods')} className={`flex-1 py-1.5 text-[11px] font-bold uppercase rounded-lg ${sidebarTab === 'methods' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Métodos</button>
            <button onClick={() => setSidebarTab('history')} className={`flex-1 py-1.5 text-[11px] font-bold uppercase rounded-lg ${sidebarTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Historial</button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'methods' ? (
              <nav className="space-y-1">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setActiveMethod(m.name); setErrorMsg(null); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${activeMethod === m.name ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-200 text-gray-700'}`}
                  >
                    {m.icon} <span className="font-medium">{m.name}</span>
                  </button>
                ))}
              </nav>
            ) : (
	    <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registros recientes</h3>
                  {history.length > 0 && (
                    <button 
                      onClick={clearHistory}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Limpiar historial"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <div className="w-12 h-12 bg-gray-200/50 rounded-full flex items-center justify-center mb-3">
                      <History size={20} className="text-gray-400" />
                    </div>
                    <p className="text-xs font-medium text-gray-500">No hay cálculos previos</p>
                    <p className="text-[10px] text-gray-400 mt-1">Tus resultados aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((item) => (
                      <div key={item.id} onClick={() => { setFormula(item.formula); setActiveMethod(item.method); }} className="group relative bg-white/50 p-3 rounded-xl border border-transparent hover:border-gray-200 cursor-pointer">
                        <div className="text-[10px] font-bold text-blue-500 uppercase">{item.method}</div>
                        <div className="text-sm font-semibold truncate">{item.formula}</div>
                        <div className="text-[9px] text-gray-400 mt-1">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex flex-1 transition-all duration-500 ml-0 md:ml-64 ${isKeyboardVisible ? 'mr-0 lg:mr-80' : 'mr-0'}`}>
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-8 bg-white/70 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2"><Menu size={20} /></button>
              <h1 className="text-base font-semibold">{activeMethod}</h1>
            </div>
            <button onClick={handleRun} className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 flex items-center gap-2 transition-all active:scale-95 shadow-lg">
              <Play size={14} fill="currentColor" /> <span>Ejecutar</span>
            </button>
          </header>

          <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-start md:justify-center space-y-6 overflow-y-auto">
            {/* Mensaje de Error */}
            {errorMsg && (
              <div className="w-full max-w-2xl bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-2">
                <AlertCircle size={20} />
                <p className="text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 md:p-12">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Entrada f(x)</span>
                <button onClick={() => setFormula("")} className="text-gray-300 hover:text-red-500"><Eraser size={20} /></button>
              </div>
              <div className="text-3xl md:text-5xl font-light text-center break-all min-h-[60px] flex items-center justify-center">
                {formula || <span className="text-gray-200 italic text-2xl">f(x) = ...</span>}
                <span className="w-[3px] h-8 bg-blue-500 ml-2 animate-pulse rounded-full"></span>
              </div>
            </div>

            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* x0 siempre visible */}
              <div className="bg-white/60 p-5 rounded-3xl border border-gray-100 backdrop-blur-sm">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                  {activeMethod === "Bisección" ? "Límite Inferior (a)" : "Valor Inicial (x₀)"}
                </label>
                <input type="number" value={x0} onChange={(e) => setX0(e.target.value)} className="w-full bg-transparent border-b border-gray-100 py-1 outline-none focus:border-blue-500 text-xl font-medium" />
              </div>

              {/* x1 solo en Bisección y Secante */}
              {(activeMethod === "Bisección" || activeMethod === "Secante") && (
                <div className="bg-white/60 p-5 rounded-3xl border border-gray-100 backdrop-blur-sm">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                    {activeMethod === "Bisección" ? "Límite Superior (b)" : "Valor Inicial (x₁)"}
                  </label>
                  <input type="number" value={x1} onChange={(e) => setX1(e.target.value)} className="w-full bg-transparent border-b border-gray-100 py-1 outline-none focus:border-blue-500 text-xl font-medium" />
                </div>
              )}

              {/* Tolerancia siempre visible */}
              <div className="bg-white/60 p-5 rounded-3xl border border-gray-100 backdrop-blur-sm sm:col-span-2 md:col-span-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Tolerancia (ε)</label>
                <input type="number" value={tol} onChange={(e) => setTol(e.target.value)} className="w-full bg-transparent border-b border-gray-100 py-1 outline-none focus:border-blue-500 text-xl font-medium" />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Teclado */}
      <div className={`
        fixed transition-all duration-500 z-30 bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-3xl border-t border-gray-200
        ${isKeyboardVisible ? 'translate-y-0' : 'translate-y-full lg:translate-y-0 lg:translate-x-full'}
        lg:top-0 lg:left-auto lg:right-0 lg:w-80 lg:border-t-0 lg:border-l lg:p-8
      `}>
        <div className="flex justify-between items-center mb-6">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Teclado</span>
          <button onClick={() => setIsKeyboardVisible(false)} className="text-blue-600 text-xs font-bold">Cerrar</button>
        </div>
        <div className="grid grid-cols-4 lg:grid-cols-3 gap-2 overflow-y-auto max-h-[40vh] lg:max-h-none">
          {mathButtons.flat().map((btn) => (
            <button key={btn} onClick={() => addToFormula(btn)} className={`h-12 rounded-xl text-sm font-semibold transition-all active:scale-95 ${isNaN(Number(btn)) && btn !== '.' && btn !== 'x' ? 'bg-blue-50 text-blue-600' : 'bg-white shadow-sm border border-gray-100'}`}>
              {btn}
            </button>
          ))}
          <button onClick={backspace} className="h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100"><Delete size={20} /></button>
        </div>
      </div>

      <BoardComponent isOpen={isBoardOpen} onClose={() => setIsBoardOpen(false)} method={activeMethod} formula={formula} result={computation} />
      
      {!isKeyboardVisible && (
        <button onClick={() => setIsKeyboardVisible(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center z-40 hover:scale-110 transition-transform"><Plus size={24} /></button>
      )}
    </div>
  );
}