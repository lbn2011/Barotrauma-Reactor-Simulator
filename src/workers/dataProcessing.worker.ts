// 数据处理Web Worker

// 定义消息类型
interface WorkerMessage {
  type: string;
  data: any;
}

// 定义响应类型
interface WorkerResponse {
  type: string;
  data: any;
}

// 定义警报数据输入
interface AlarmDataInput {
  alarms: Array<{
    id: string;
    message: string;
    severity: 'info' | 'warning' | 'alarm' | 'critical';
    timestamp: number;
    acknowledged: boolean;
  }>;
  acknowledgedAlarms: string[];
}

// 定义警报数据输出
interface AlarmDataOutput {
  unacknowledgedAlarms: Array<{
    id: string;
    message: string;
    severity: 'info' | 'warning' | 'alarm' | 'critical';
    timestamp: number;
    acknowledged: boolean;
  }>;
  criticalAlarms: Array<{
    id: string;
    message: string;
    severity: 'info' | 'warning' | 'alarm' | 'critical';
    timestamp: number;
    acknowledged: boolean;
  }>;
  alarmSummary: {
    total: number;
    unacknowledged: number;
    critical: number;
    bySeverity: {
      info: number;
      warning: number;
      alarm: number;
      critical: number;
    };
  };
}

// 定义趋势数据输入
interface TrendDataInput {
  history: Array<{
    timestamp: number;
    parameterId: string;
    value: number;
  }>;
  timeWindow: number;
}

// 定义趋势数据输出
interface TrendDataOutput {
  recentHistory: Array<{
    timestamp: number;
    parameterId: string;
    value: number;
  }>;
  trends: Array<{
    parameterId: string;
    value: number;
    timestamp: number;
    trend: 'rising' | 'falling' | 'stable';
  }>;
}

// 定义报告输入
interface ReportInput {
  startTime: number;
  endTime: number;
  events: Array<{
    timestamp: number;
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'alarm' | 'critical';
  }>;
}

// 定义报告输出
interface ReportOutput {
  summary: {
    startTime: number;
    endTime: number;
    duration: number;
    totalEvents: number;
    eventsByType: Record<string, number>;
  };
  details: Array<{
    timestamp: number;
    type: string;
    message: string;
    severity: 'info' | 'warning' | 'alarm' | 'critical';
  }>;
  statistics: {
    eventsBySeverity: {
      info: number;
      warning: number;
      alarm: number;
      critical: number;
    };
    averageEventsPerHour: number;
  };
}

// 计算趋势
function calculateTrend (history: number[]): 'rising' | 'falling' | 'stable' {
  if (history.length < 2) return 'stable';

  const recent = history.slice(-5);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const change = last - first;
  const threshold = Math.abs(first) * 0.01 || 0.1;

  if (Math.abs(change) < threshold) return 'stable';
  return change > 0 ? 'rising' : 'falling';
}

// 处理警报数据
function processAlarmData (data: AlarmDataInput): AlarmDataOutput {
  const unacknowledgedAlarms = data.alarms.filter(
    (alarm) => !data.acknowledgedAlarms.includes(alarm.id)
  );

  const criticalAlarms = unacknowledgedAlarms.filter(
    (alarm) => alarm.severity === 'critical'
  );

  const alarmSummary = {
    total: data.alarms.length,
    unacknowledged: unacknowledgedAlarms.length,
    critical: criticalAlarms.length,
    bySeverity: {
      info: data.alarms.filter((a) => a.severity === 'info').length,
      warning: data.alarms.filter((a) => a.severity === 'warning').length,
      alarm: data.alarms.filter((a) => a.severity === 'alarm').length,
      critical: criticalAlarms.length,
    },
  };

  return {
    unacknowledgedAlarms,
    criticalAlarms,
    alarmSummary,
  };
}

// 处理趋势数据
function processTrendData (data: TrendDataInput): TrendDataOutput {
  const recentHistory = data.history.filter(
    (entry) => entry.timestamp >= Date.now() - data.timeWindow
  );

  // 按参数分组
  const parameterGroups: Record<
    string,
    Array<{
      timestamp: number;
      value: number;
    }>
  > = {};

  recentHistory.forEach((entry) => {
    if (!parameterGroups[entry.parameterId]) {
      parameterGroups[entry.parameterId] = [];
    }
    parameterGroups[entry.parameterId].push({
      timestamp: entry.timestamp,
      value: entry.value,
    });
  });

  // 计算每个参数的趋势
  const trends = Object.entries(parameterGroups).map(
    ([parameterId, entries]) => {
      const values = entries.map((e) => e.value);
      const trend = calculateTrend(values);
      const latestEntry = entries[entries.length - 1];

      return {
        parameterId,
        value: latestEntry.value,
        timestamp: latestEntry.timestamp,
        trend,
      };
    }
  );

  return {
    recentHistory,
    trends,
  };
}

// 生成报告
function generateReport (data: ReportInput): ReportOutput {
  const duration = data.endTime - data.startTime;

  // 按类型分组事件
  const eventsByType: Record<string, number> = {};
  data.events.forEach((event) => {
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
  });

  // 按严重性分组事件
  const eventsBySeverity = {
    info: data.events.filter((e) => e.severity === 'info').length,
    warning: data.events.filter((e) => e.severity === 'warning').length,
    alarm: data.events.filter((e) => e.severity === 'alarm').length,
    critical: data.events.filter((e) => e.severity === 'critical').length,
  };

  // 计算每小时平均事件数
  const hoursDuration = duration / (1000 * 60 * 60);
  const averageEventsPerHour =
    hoursDuration > 0 ? data.events.length / hoursDuration : 0;

  return {
    summary: {
      startTime: data.startTime,
      endTime: data.endTime,
      duration,
      totalEvents: data.events.length,
      eventsByType,
    },
    details: data.events,
    statistics: {
      eventsBySeverity,
      averageEventsPerHour,
    },
  };
}

// 处理消息
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;

  let result: any;

  switch (type) {
  case 'processAlarmData':
    result = processAlarmData(data as AlarmDataInput);
    break;

  case 'processTrendData':
    result = processTrendData(data as TrendDataInput);
    break;

  case 'generateReport':
    result = generateReport(data as ReportInput);
    break;

  default:
    console.error('Unknown message type:', type);
    return;
  }

  // 发送响应
  const response: WorkerResponse = {
    type: `${type}Result`,
    data: result,
  };

  self.postMessage(response);
};
