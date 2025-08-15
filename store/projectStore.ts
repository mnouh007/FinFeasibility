import { create } from 'zustand';
import { 
    ProjectData, 
    CalculatedOutputs,
    initialProjectData,
    initialCalculatedOutputs,
    CapitalInvestmentItem,
    Partner,
    OperatingCostItem,
    RevenueItem,
    Loan,
    Task,
    Scenario,
    EstimationBasis,
    MonteCarloResults,
    MonteCarloVariable
} from '../types';
import { calculateFinancialOutputs } from '../lib/financial';

interface ProjectState {
  projectData: ProjectData;
  calculatedOutputs: CalculatedOutputs;
  isDataLoaded: boolean;
  activeScenarioName: string;
  activeModule: string;
  
  // M13 Monte Carlo State
  simulationStatus: 'idle' | 'running' | 'done';
  simulationProgress: number;
  simulationResults: MonteCarloResults | null;
  simulationRawData: Record<string, number[]> | null;

  // Actions
  setProjectData: (data: ProjectData) => void;
  updateField: <M extends keyof ProjectData>(
    module: M, 
    field: keyof ProjectData[M], 
    value: ProjectData[M][keyof ProjectData[M]]
  ) => void;
  startNewStudy: () => void;
  setActiveModule: (moduleId: string) => void;
  recalculateOutputs: () => void;

  // M01 Partner Actions
  addPartner: () => void;
  updatePartner: (id: string, updates: Partial<Omit<Partner, 'id'>>) => void;
  removePartner: (id: string) => void;
  addStakeholder: (stakeholder: string) => void;
  removeStakeholder: (stakeholder: string) => void;


  // M03 Capital Investment Actions
  addCapitalItem: (category: CapitalInvestmentItem['category']) => void;
  updateCapitalItem: (id: string, updates: Partial<Omit<CapitalInvestmentItem, 'id' | 'category'>>) => void;
  removeCapitalItem: (id: string) => void;

  // M04 Timeline Actions
  addTask: () => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  removeTask: (id: string) => void;

  // M05 Operating Inputs Actions
  addOperatingCostItem: (category: 'Raw Materials' | 'Labor' | 'General & Admin') => void;
  updateOperatingCostItem: (id: string, updates: Partial<OperatingCostItem>) => void;
  removeOperatingCostItem: (id: string) => void;
  addRevenueItem: () => void;
  updateRevenueItem: (id: string, updates: Partial<Omit<RevenueItem, 'id'>>) => void;
  removeRevenueItem: (id: string) => void;

  // M06 Financing Actions
  addLoan: () => void;
  updateLoan: (id: string, updates: Partial<Omit<Loan, 'id'>>) => void;
  removeLoan: (id: string) => void;

  // M12 Sensitivity Analysis Actions
  addScenario: () => void;
  removeScenario: (id: string) => void;
  updateScenarioName: (id: string, name: string) => void;
  updateScenarioModifications: (id: string, modifications: Partial<EstimationBasis>) => void;
  
  // M13 Monte Carlo Actions
  updateMonteCarloIterations: (iterations: number) => void;
  updateMonteCarloParameter: (id: string, updates: Partial<MonteCarloVariable>) => void;
  setSimulationStatus: (status: 'idle' | 'running' | 'done') => void;
  setSimulationProgress: (progress: number) => void;
  setSimulationResults: (results: MonteCarloResults | null) => void;
  setSimulationRawData: (data: Record<string, number[]> | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projectData: initialProjectData,
  calculatedOutputs: initialCalculatedOutputs,
  isDataLoaded: false,
  activeScenarioName: 'Base Case',
  activeModule: 'm14', // Default to Dashboard

  // M13 State
  simulationStatus: 'idle',
  simulationProgress: 0,
  simulationResults: null,
  simulationRawData: null,
  
  recalculateOutputs: () => {
    const projectData = get().projectData;
    const newCalculatedOutputs = calculateFinancialOutputs(projectData);
    set({ calculatedOutputs: newCalculatedOutputs });
  },

  setProjectData: (data) => {
    // Ensure nested objects exist
    if (!data.sensitivityAnalysis) {
        data.sensitivityAnalysis = { scenarios: [] };
    }
    // Migration for old Monte Carlo data structure
    if (!data.monteCarlo || !data.monteCarlo.variables) {
        data.monteCarlo = initialProjectData.monteCarlo;
    }
    set({
      projectData: data,
      isDataLoaded: true,
    });
    get().recalculateOutputs();
  },
  
  updateField: (module, field, value) => {
    set(state => ({
      projectData: {
          ...state.projectData,
          [module]: {
              ...state.projectData[module],
              [field]: value,
          },
      },
    }));
    get().recalculateOutputs();
  },

  startNewStudy: () => set({
    projectData: initialProjectData,
    calculatedOutputs: initialCalculatedOutputs,
    isDataLoaded: true,
    activeModule: 'm1',
    simulationStatus: 'idle',
    simulationProgress: 0,
    simulationResults: null,
    simulationRawData: null,
  }),

  setActiveModule: (moduleId) => set({ activeModule: moduleId }),

  // M01 Partner Actions
  addPartner: () => {
    set(state => {
        const newPartner: Partner = {
            id: `partner-${Date.now()}`,
            name: '',
            share: 0,
        };
        return {
            projectData: {
                ...state.projectData,
                definition: {
                    ...state.projectData.definition,
                    partners: [...state.projectData.definition.partners, newPartner]
                }
            }
        };
    });
    get().recalculateOutputs();
  },
  updatePartner: (id, updates) => {
    set(state => ({
        projectData: {
            ...state.projectData,
            definition: {
                ...state.projectData.definition,
                partners: state.projectData.definition.partners.map(p => p.id === id ? { ...p, ...updates } : p),
            }
        }
    }));
    get().recalculateOutputs();
  },
  removePartner: (id) => {
    set(state => ({
        projectData: {
            ...state.projectData,
            definition: {
                ...state.projectData.definition,
                partners: state.projectData.definition.partners.filter(p => p.id !== id),
            }
        }
    }));
    get().recalculateOutputs();
  },
  addStakeholder: (stakeholder) => {
    set(state => ({
        projectData: {
            ...state.projectData,
            definition: {
                ...state.projectData.definition,
                stakeholders: [...state.projectData.definition.stakeholders, stakeholder]
            }
        }
    }));
  },
  removeStakeholder: (stakeholder) => {
    set(state => ({
        projectData: {
            ...state.projectData,
            definition: {
                ...state.projectData.definition,
                stakeholders: state.projectData.definition.stakeholders.filter(s => s !== stakeholder)
            }
        }
    }));
  },
  
  // M03 Capital Investment Actions
  addCapitalItem: (category) => {
    set(state => {
      const newItem: CapitalInvestmentItem = {
          id: `item-${Date.now()}-${Math.random()}`,
          category,
          item: '',
          cost: 0,
      };
      return {
          projectData: {
              ...state.projectData,
              capitalInvestment: {
                  ...state.projectData.capitalInvestment,
                  items: [...state.projectData.capitalInvestment.items, newItem]
              }
          }
      };
    });
    get().recalculateOutputs();
  },

  updateCapitalItem: (id, updates) => {
    set(state => ({
      projectData: {
          ...state.projectData,
          capitalInvestment: {
              ...state.projectData.capitalInvestment,
              items: state.projectData.capitalInvestment.items.map(item => 
                  item.id === id ? { ...item, ...updates } : item
              ),
          },
      },
    }));
    get().recalculateOutputs();
  },

  removeCapitalItem: (id) => {
    set(state => ({
      projectData: {
          ...state.projectData,
          capitalInvestment: {
              ...state.projectData.capitalInvestment,
              items: state.projectData.capitalInvestment.items.filter(item => item.id !== id),
          },
      },
    }));
    get().recalculateOutputs();
  },

  // M04 Timeline Actions
  addTask: () => {
    set(state => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const newTask: Task = {
            id: `task-${Date.now()}`,
            name: '',
            startDate: today.toISOString().split('T')[0],
            endDate: tomorrow.toISOString().split('T')[0],
            progress: 0,
            dependencies: [],
        };
        return {
            projectData: {
                ...state.projectData,
                timeline: {
                    tasks: [...state.projectData.timeline.tasks, newTask]
                }
            }
        };
    });
  },
  updateTask: (id, updates) => {
    set(state => ({
        projectData: {
            ...state.projectData,
            timeline: {
                tasks: state.projectData.timeline.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
            }
        }
    }));
  },
  removeTask: (id) => {
    set(state => ({
        projectData: {
            ...state.projectData,
            timeline: {
                tasks: state.projectData.timeline.tasks.filter(t => t.id !== id)
            }
        }
    }));
  },


  // M05 Operating Inputs Actions
  addOperatingCostItem: (category) => {
      set(state => {
        const base = { id: `opcost-${Date.now()}-${Math.random()}`, item: '' };
        let newItem: OperatingCostItem;

        if (category === 'Raw Materials') {
            newItem = { ...base, category, unitCost: 0, quantity: 0 };
        } else if (category === 'Labor') {
            newItem = { ...base, category, count: 1, monthlySalary: 0 };
        } else { // General & Admin
            newItem = { ...base, category, cost: 0 };
        }
        
        return {
            projectData: {
                ...state.projectData,
                operatingInputs: {
                    ...state.projectData.operatingInputs,
                    costs: [...state.projectData.operatingInputs.costs, newItem]
                }
            }
        };
      });
      get().recalculateOutputs();
  },
  updateOperatingCostItem: (id, updates) => {
      set(state => ({
          projectData: {
              ...state.projectData,
              operatingInputs: {
                  ...state.projectData.operatingInputs,
                  costs: state.projectData.operatingInputs.costs.map(c =>
                      c.id === id ? { ...c, ...updates } : c
                  ) as OperatingCostItem[],
              }
          }
      }));
      get().recalculateOutputs();
  },
  removeOperatingCostItem: (id) => {
      set(state => ({
          projectData: {
              ...state.projectData,
              operatingInputs: { ...state.projectData.operatingInputs, costs: state.projectData.operatingInputs.costs.filter(c => c.id !== id) }
          }
      }));
      get().recalculateOutputs();
  },
  addRevenueItem: () => {
      set(state => {
        const newItem: RevenueItem = {
            id: `revenue-${Date.now()}`,
            item: '',
            unitPrice: 0,
            quantity: 0,
        };
        return {
            projectData: {
                ...state.projectData,
                operatingInputs: { ...state.projectData.operatingInputs, revenues: [...state.projectData.operatingInputs.revenues, newItem] }
            }
        };
      });
      get().recalculateOutputs();
  },
  updateRevenueItem: (id, updates) => {
      set(state => ({
          projectData: {
              ...state.projectData,
              operatingInputs: { ...state.projectData.operatingInputs, revenues: state.projectData.operatingInputs.revenues.map(r => r.id === id ? { ...r, ...updates } : r) }
          }
      }));
      get().recalculateOutputs();
  },
  removeRevenueItem: (id) => {
      set(state => ({
          projectData: {
              ...state.projectData,
              operatingInputs: { ...state.projectData.operatingInputs, revenues: state.projectData.operatingInputs.revenues.filter(r => r.id !== id) }
          }
      }));
      get().recalculateOutputs();
  },

  // M06 Financing Actions
  addLoan: () => {
      set(state => {
        const newLoan: Loan = {
            id: `loan-${Date.now()}`,
            source: '',
            principal: 10000,
            interestRate: 5,
            term: 10,
            startYear: 1,
        };
        return {
            projectData: {
                ...state.projectData,
                financing: { ...state.projectData.financing, loans: [...state.projectData.financing.loans, newLoan] }
            }
        };
      });
      get().recalculateOutputs();
  },
  updateLoan: (id, updates) => {
      set(state => ({
          projectData: {
              ...state.projectData,
              financing: { ...state.projectData.financing, loans: state.projectData.financing.loans.map(l => l.id === id ? { ...l, ...updates } : l) }
          }
      }));
      get().recalculateOutputs();
  },
  removeLoan: (id) => {
      set(state => ({
          projectData: {
              ...state.projectData,
              financing: { ...state.projectData.financing, loans: state.projectData.financing.loans.filter(l => l.id !== id) }
          }
      }));
      get().recalculateOutputs();
  },

  // M12 Sensitivity Analysis Actions
  addScenario: () => {
    set(state => {
        const newScenario: Scenario = {
            id: `scenario-${Date.now()}`,
            name: `Scenario ${state.projectData.sensitivityAnalysis.scenarios.length + 1}`,
            modifications: {},
        };
        return {
            projectData: {
                ...state.projectData,
                sensitivityAnalysis: {
                    ...state.projectData.sensitivityAnalysis,
                    scenarios: [...state.projectData.sensitivityAnalysis.scenarios, newScenario],
                },
            },
        };
    });
  },
  removeScenario: (id) => {
    set(state => ({
        projectData: {
            ...state.projectData,
            sensitivityAnalysis: {
                ...state.projectData.sensitivityAnalysis,
                scenarios: state.projectData.sensitivityAnalysis.scenarios.filter(s => s.id !== id),
            },
        },
    }));
  },
  updateScenarioName: (id, name) => {
    set(state => ({
        projectData: {
            ...state.projectData,
            sensitivityAnalysis: {
                ...state.projectData.sensitivityAnalysis,
                scenarios: state.projectData.sensitivityAnalysis.scenarios.map(s => s.id === id ? { ...s, name } : s),
            },
        },
    }));
  },
  updateScenarioModifications: (id, modifications) => {
    set(state => ({
        projectData: {
            ...state.projectData,
            sensitivityAnalysis: {
                ...state.projectData.sensitivityAnalysis,
                scenarios: state.projectData.sensitivityAnalysis.scenarios.map(s => s.id === id ? { ...s, modifications: { ...s.modifications, ...modifications } } : s),
            },
        },
    }));
  },
  
  // M13 Monte Carlo Actions
  updateMonteCarloIterations: (iterations: number) => {
    set(state => ({
        projectData: {
            ...state.projectData,
            monteCarlo: {
                ...state.projectData.monteCarlo,
                iterations,
            }
        }
    }));
  },
  updateMonteCarloParameter: (id, updates) => {
    set(state => {
        const existingVar = state.projectData.monteCarlo.variables[id];
        const defaultVar = { distribution: 'None' as const, param1: 0, param2: 0 };
        const newVar = { ...(existingVar || defaultVar), ...updates };

        return {
            projectData: {
                ...state.projectData,
                monteCarlo: {
                    ...state.projectData.monteCarlo,
                    variables: {
                        ...state.projectData.monteCarlo.variables,
                        [id]: newVar,
                    }
                }
            }
        };
    });
  },
  setSimulationStatus: (status) => set({ simulationStatus: status }),
  setSimulationProgress: (progress) => set({ simulationProgress: progress }),
  setSimulationResults: (results) => set({ simulationResults: results }),
  setSimulationRawData: (data) => set({ simulationRawData: data }),

}));