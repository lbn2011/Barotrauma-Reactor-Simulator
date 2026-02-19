import { writable } from 'svelte/store';

// UI状态接口
interface UIState {
  // 界面显示状态
  ui: {
    // 活动面板
    activePanel: string | null;
    // 是否显示控制面板
    showControlPanel: boolean;
    // 是否显示数据趋势图
    showDataTrend: boolean;
    // 是否显示警报CRT
    showAlarmCRT: boolean;
    // 是否显示示意图CRT
    showSchematicCRT: boolean;
  };

  // 用户交互状态
  interaction: {
    // 是否正在拖动
    isDragging: boolean;
    // 拖动的元素
    draggedElement: string | null;
    // 鼠标位置
    mousePosition: { x: number; y: number };
  };

  // 系统状态显示
  systemStatus: {
    // 是否显示系统状态面板
    showSystemStatus: boolean;
    // 系统状态消息
    statusMessage: string;
    // 系统状态级别
    statusLevel: 'info' | 'warning' | 'error' | 'success';
  };

  // 模态框状态
  modals: {
    // 是否显示使用说明模态框
    showInstructions: boolean;
    // 是否显示问题反馈模态框
    showFeedback: boolean;
    // 是否显示项目信息模态框
    showProjectInfo: boolean;
    // 是否显示确认对话框
    showConfirmation: boolean;
    // 确认对话框内容
    confirmationMessage: string;
    // 确认对话框回调
    confirmationCallback: (() => void) | null;
  };
}

// 初始状态
const initialState: UIState = {
  // 界面显示状态
  ui: {
    // 活动面板
    activePanel: null,
    // 是否显示控制面板
    showControlPanel: true,
    // 是否显示数据趋势图
    showDataTrend: false,
    // 是否显示警报CRT
    showAlarmCRT: false,
    // 是否显示示意图CRT
    showSchematicCRT: false,
  },

  // 用户交互状态
  interaction: {
    // 是否正在拖动
    isDragging: false,
    // 拖动的元素
    draggedElement: null,
    // 鼠标位置
    mousePosition: { x: 0, y: 0 },
  },

  // 系统状态显示
  systemStatus: {
    // 是否显示系统状态面板
    showSystemStatus: false,
    // 系统状态消息
    statusMessage: '',
    // 系统状态级别
    statusLevel: 'info',
  },

  // 模态框状态
  modals: {
    // 是否显示使用说明模态框
    showInstructions: false,
    // 是否显示问题反馈模态框
    showFeedback: false,
    // 是否显示项目信息模态框
    showProjectInfo: false,
    // 是否显示确认对话框
    showConfirmation: false,
    // 确认对话框内容
    confirmationMessage: '',
    // 确认对话框回调
    confirmationCallback: null,
  },
};

// 创建UI状态store
export const uiStore = writable<UIState>(initialState);

// UI状态操作函数
export function setActivePanel (panel: string | null) {
  uiStore.update((state) => ({
    ...state,
    ui: {
      ...state.ui,
      activePanel: panel,
    },
  }));
}

export function toggleControlPanel (show?: boolean) {
  uiStore.update((state) => ({
    ...state,
    ui: {
      ...state.ui,
      showControlPanel: show !== undefined ? show : !state.ui.showControlPanel,
    },
  }));
}

export function toggleDataTrend (show?: boolean) {
  uiStore.update((state) => ({
    ...state,
    ui: {
      ...state.ui,
      showDataTrend: show !== undefined ? show : !state.ui.showDataTrend,
    },
  }));
}

export function toggleAlarmCRT (show?: boolean) {
  uiStore.update((state) => ({
    ...state,
    ui: {
      ...state.ui,
      showAlarmCRT: show !== undefined ? show : !state.ui.showAlarmCRT,
    },
  }));
}

export function toggleSchematicCRT (show?: boolean) {
  uiStore.update((state) => ({
    ...state,
    ui: {
      ...state.ui,
      showSchematicCRT: show !== undefined ? show : !state.ui.showSchematicCRT,
    },
  }));
}

export function setDragging (
  isDragging: boolean,
  element: string | null = null
) {
  uiStore.update((state) => ({
    ...state,
    interaction: {
      ...state.interaction,
      isDragging,
      draggedElement: element,
    },
  }));
}

export function setMousePosition (x: number, y: number) {
  uiStore.update((state) => ({
    ...state,
    interaction: {
      ...state.interaction,
      mousePosition: { x, y },
    },
  }));
}

export function showSystemStatus (
  message: string,
  level: 'info' | 'warning' | 'error' | 'success' = 'info'
) {
  uiStore.update((state) => ({
    ...state,
    systemStatus: {
      showSystemStatus: true,
      statusMessage: message,
      statusLevel: level,
    },
  }));

  // 3秒后自动隐藏
  setTimeout(() => {
    uiStore.update((state) => ({
      ...state,
      systemStatus: {
        ...state.systemStatus,
        showSystemStatus: false,
      },
    }));
  }, 3000);
}

export function toggleInstructions (show?: boolean) {
  uiStore.update((state) => ({
    ...state,
    modals: {
      ...state.modals,
      showInstructions:
        show !== undefined ? show : !state.modals.showInstructions,
    },
  }));
}

export function toggleFeedback (show?: boolean) {
  uiStore.update((state) => ({
    ...state,
    modals: {
      ...state.modals,
      showFeedback: show !== undefined ? show : !state.modals.showFeedback,
    },
  }));
}

export function toggleProjectInfo (show?: boolean) {
  uiStore.update((state) => ({
    ...state,
    modals: {
      ...state.modals,
      showProjectInfo:
        show !== undefined ? show : !state.modals.showProjectInfo,
    },
  }));
}

export function showConfirmation (message: string, callback: () => void) {
  uiStore.update((state) => ({
    ...state,
    modals: {
      ...state.modals,
      showConfirmation: true,
      confirmationMessage: message,
      confirmationCallback: callback,
    },
  }));
}

export function hideConfirmation () {
  uiStore.update((state) => ({
    ...state,
    modals: {
      ...state.modals,
      showConfirmation: false,
      confirmationMessage: '',
      confirmationCallback: null,
    },
  }));
}

export function confirmAction () {
  uiStore.update((state) => {
    if (state.modals.confirmationCallback) {
      state.modals.confirmationCallback();
    }
    return {
      ...state,
      modals: {
        ...state.modals,
        showConfirmation: false,
        confirmationMessage: '',
        confirmationCallback: null,
      },
    };
  });
}

// 重置UI状态
export function resetUIState () {
  uiStore.set(initialState);
}
