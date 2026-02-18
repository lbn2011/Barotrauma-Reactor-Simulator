// Data Processing Web Worker

// Log function
function log (
  message: string,
  level: 'info' | 'debug' | 'error' | 'warn' = 'info'
) {
  console[level](`[Data Worker] ${message}`);
}

// Initialization logs
log('Data processing worker initialized');
log('Loading data processing functions');
log('Worker ready to process data tasks');

// Define message types
interface WorkerMessage {
  type: string;
  data: any;
}

// Define response types
interface WorkerResponse {
  type: string;
  data: any;
}

// Define alarm data input
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

// Define alarm data output
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

// Define trend data input
interface TrendDataInput {
  history: Array<{
    timestamp: number;
    parameterId: string;
    value: number;
  }>;
  timeWindow: number;
}

// Define trend data output
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

// Define report input
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

// Define report output
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

// Calculate trend
function calculateTrend (history: number[]): 'rising' | 'falling' | 'stable' {
  if (history.length < 2) {
    log(
      'Insufficient data points for trend calculation, returning stable',
      'debug'
    );
    return 'stable';
  }

  log(`Calculating trend with ${history.length} data points`, 'debug');
  const recent = history.slice(-5);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const change = last - first;
  const threshold = Math.abs(first) * 0.01 || 0.1;

  log(
    `Trend calculation: first=${first}, last=${last}, change=${change}, threshold=${threshold}`,
    'debug'
  );

  if (Math.abs(change) < threshold) {
    log('Change within threshold, trend is stable', 'debug');
    return 'stable';
  }

  const trend = change > 0 ? 'rising' : 'falling';
  log(`Trend calculated: ${trend}`, 'debug');
  return trend;
}

// Process alarm data
function processAlarmData (data: AlarmDataInput): AlarmDataOutput {
  log(
    `Processing alarm data: ${data.alarms.length} total alarms, ${data.acknowledgedAlarms.length} acknowledged alarms`,
    'debug'
  );

  const unacknowledgedAlarms = data.alarms.filter(
    (alarm) => !data.acknowledgedAlarms.includes(alarm.id)
  );

  log(`Found ${unacknowledgedAlarms.length} unacknowledged alarms`, 'debug');

  const criticalAlarms = unacknowledgedAlarms.filter(
    (alarm) => alarm.severity === 'critical'
  );

  log(`Found ${criticalAlarms.length} critical unacknowledged alarms`, 'debug');

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

  log(
    `Alarm processing summary: ${alarmSummary.total} total, ${alarmSummary.unacknowledged} unacknowledged, ${alarmSummary.critical} critical`,
    'debug'
  );

  return {
    unacknowledgedAlarms,
    criticalAlarms,
    alarmSummary,
  };
}

// Process trend data
function processTrendData (data: TrendDataInput): TrendDataOutput {
  log(
    `Processing trend data: ${data.history.length} total entries, time window: ${data.timeWindow}ms`,
    'debug'
  );

  const recentHistory = data.history.filter(
    (entry) => entry.timestamp >= Date.now() - data.timeWindow
  );

  log(`Filtered to ${recentHistory.length} recent entries`, 'debug');

  // Group by parameter
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

  log(
    `Grouped data into ${Object.keys(parameterGroups).length} parameters`,
    'debug'
  );

  // Calculate trend for each parameter
  const trends = Object.entries(parameterGroups).map(
    ([parameterId, entries]) => {
      log(
        `Calculating trend for parameter ${parameterId} with ${entries.length} data points`,
        'debug'
      );
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

  log(`Calculated trends for ${trends.length} parameters`, 'debug');

  return {
    recentHistory,
    trends,
  };
}

// Generate report
function generateReport (data: ReportInput): ReportOutput {
  log(
    `Generating report: ${data.events.length} events from ${new Date(data.startTime).toISOString()} to ${new Date(data.endTime).toISOString()}`,
    'debug'
  );

  const duration = data.endTime - data.startTime;
  log(`Report duration: ${duration}ms`, 'debug');

  // Group events by type
  const eventsByType: Record<string, number> = {};
  data.events.forEach((event) => {
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
  });

  log(`Events by type: ${JSON.stringify(eventsByType)}`, 'debug');

  // Group events by severity
  const eventsBySeverity = {
    info: data.events.filter((e) => e.severity === 'info').length,
    warning: data.events.filter((e) => e.severity === 'warning').length,
    alarm: data.events.filter((e) => e.severity === 'alarm').length,
    critical: data.events.filter((e) => e.severity === 'critical').length,
  };

  log(`Events by severity: ${JSON.stringify(eventsBySeverity)}`, 'debug');

  // Calculate average events per hour
  const hoursDuration = duration / (1000 * 60 * 60);
  const averageEventsPerHour =
    hoursDuration > 0 ? data.events.length / hoursDuration : 0;

  log(`Average events per hour: ${averageEventsPerHour.toFixed(2)}`, 'debug');

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

// Process messages
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;
  log(`Received message: ${type}`, 'debug');

  let result: any;

  try {
    switch (type) {
    case 'processAlarmData':
      log('Starting to process alarm data', 'debug');
      log(
        `Processing ${(data as AlarmDataInput).alarms.length} alarms`,
        'debug'
      );
      result = processAlarmData(data as AlarmDataInput);
      log('Alarm data processing completed', 'debug');
      break;

    case 'processTrendData':
      log('Starting to process trend data', 'debug');
      log(
        `Processing ${(data as TrendDataInput).history.length} historical data entries`,
        'debug'
      );
      result = processTrendData(data as TrendDataInput);
      log('Trend data processing completed', 'debug');
      break;

    case 'generateReport':
      log('Starting to generate report', 'debug');
      log(
        `Processing ${(data as ReportInput).events.length} events`,
        'debug'
      );
      result = generateReport(data as ReportInput);
      log('Report generation completed', 'debug');
      break;

    default:
      log(`Unknown message type: ${type}`, 'error');
      return;
    }

    // Send response
    const response: WorkerResponse = {
      type: `${type}Result`,
      data: result,
    };

    log(`Sending response: ${response.type}`, 'debug');
    self.postMessage(response);
  } catch (error) {
    log(
      `Error during data processing: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'error'
    );
    const errorResponse: WorkerResponse = {
      type: `${type}Error`,
      data: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
    self.postMessage(errorResponse);
  }
};
