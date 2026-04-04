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
  X
} from 'lucide-react';

export default function Home() {
  const [formula, setFormula] = useState("");
  const [activeMethod, setActiveMethod] = useState("Newton-Raphson");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // Manejador de teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evitar interferir con comandos del sistema (como Ctrl+R)
      if (e.ctrlKey || e.metaKey) return;

      const key = e.key;
      
      if (/^[0-9x.]$/.test(key)) {
        addToFormula(key);
      } else if (['+', '-', '*', '/', '(', ')', '^'].includes(key)) {
        addToFormula(key);
      } else if (key === 'Backspace') {
        backspace();
      } else if (key === 'Enter') {
        console.log("Ejecutando método para:", formula);
      } else if (key === 'Escape') {
        setIsKeyboardVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addToFormula, backspace, formula]);

  return (
    <div className="flex h-screen w-full bg-[#F5F5F7] text-[#1D1D1F] font-sans overflow-hidden">
      
      {/* --- Sidebar (Escritorio y Móvil) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#E8E8ED]/80 backdrop-blur-2xl border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-gray-500">
              <X size={20} />
            </button>
          </div>
          
          <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6 ml-1">Métodos Numéricos</h2>
          <nav className="space-y-1">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMethod(m.name);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeMethod === m.name 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                {m.icon}
                <span className="font-medium">{m.name}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-gray-200">
          <button className="flex items-center gap-3 text-sm text-gray-500 hover:text-black transition-colors w-full">
            <History size={18} />
            Historial
          </button>
        </div>
      </aside>

      {/* --- Overlay móvil para sidebar --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- Contenedor Principal (Layout dinámico) --- */}
      <div className={`flex flex-1 transition-all duration-500 ease-in-out ml-0 md:ml-64 ${isKeyboardVisible ? 'mr-0 lg:mr-80' : 'mr-0'}`}>
        
        <main className="flex-1 flex flex-col relative min-w-0">
          {/* Navegación Superior */}
          <header className="h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-8 bg-white/70 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 md:hidden hover:bg-gray-100 rounded-lg"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-base md:text-lg font-semibold tracking-tight truncate">
                {activeMethod}
              </h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button className="bg-black text-white px-4 md:px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2">
                <Play size={14} fill="currentColor" />
                <span className="hidden sm:inline">Ejecutar</span>
              </button>
            </div>
          </header>

          {/* Área de Trabajo Central */}
          <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center space-y-6 md:space-y-8 overflow-y-auto">
            
            {/* Visualización de la Función */}
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 p-6 md:p-10 transition-all">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] ml-1">Entrada Matemática</span>
                <button onClick={clearFormula} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                  <Eraser size={20} />
                </button>
              </div>
              
              <div className="relative">
                <div className="text-2xl md:text-5xl font-light tracking-tight text-center break-all min-h-[60px] md:min-h-[80px] flex items-center justify-center text-[#1D1D1F]">
                  {formula || <span className="text-gray-200 italic font-normal text-xl md:text-4xl">f(x) = ...</span>}
                  <span className="w-[2px] h-8 md:h-12 bg-blue-500 ml-2 animate-pulse"></span>
                </div>
              </div>
            </div>

            {/* Parámetros */}
            <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/60 p-5 rounded-2xl border border-gray-100 backdrop-blur-sm shadow-sm">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Valor Inicial (x₀)</label>
                <input 
                  type="text" 
                  placeholder="0.0" 
                  className="w-full bg-transparent border-b border-gray-100 py-1.5 outline-none focus:border-blue-500 transition-colors text-lg font-medium" 
                />
              </div>
              <div className="bg-white/60 p-5 rounded-2xl border border-gray-100 backdrop-blur-sm shadow-sm">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Tolerancia (ε)</label>
                <input 
                  type="text" 
                  placeholder="0.0001" 
                  className="w-full bg-transparent border-b border-gray-100 py-1.5 outline-none focus:border-blue-500 transition-colors text-lg font-medium" 
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* --- Teclado Adaptativo (Bottom en Móvil / Side en Escritorio) --- */}
      <div className={`
        fixed transition-all duration-500 ease-in-out z-30
        ${isKeyboardVisible ? 'translate-y-0 opacity-100' : 'translate-y-full lg:translate-y-0 lg:translate-x-full opacity-0'}
        /* Móvil: Abajo */
        bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-3xl border-t border-gray-200
        /* Escritorio: Lateral Derecho */
        lg:top-0 lg:bottom-0 lg:left-auto lg:right-0 lg:w-80 lg:border-t-0 lg:border-l lg:p-6 lg:bg-[#FBFBFD]/95
      `}>
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center mb-6 px-1">
            <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              <Info size={14} className="text-blue-500" />
              <span>Teclado Matemático</span>
            </div>
            <button 
              onClick={() => setIsKeyboardVisible(false)}
              className="text-blue-600 text-xs font-bold hover:text-blue-800"
            >
              Cerrar
            </button>
          </div>

          <div className={`
            grid gap-2 overflow-y-auto pr-1
            grid-cols-6 lg:grid-cols-3
          `}>
            {mathButtons.flat().map((btn) => (
              <button
                key={btn}
                onClick={() => addToFormula(btn)}
                className={`
                  h-12 md:h-14 lg:h-12 rounded-xl text-sm font-medium transition-all active:scale-95
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
              className="h-12 md:h-14 lg:h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors active:scale-95 border border-red-100 lg:col-span-1"
            >
              <Delete size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Botón flotante para reabrir teclado */}
      {!isKeyboardVisible && (
        <button 
          onClick={() => setIsKeyboardVisible(true)}
          className="fixed bottom-6 right-6 w-12 h-12 bg-black text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 hover:scale-105 transition-all z-40 border border-white/10"
        >
          <Plus size={20} />
        </button>
      )}
    </div>
  );
}