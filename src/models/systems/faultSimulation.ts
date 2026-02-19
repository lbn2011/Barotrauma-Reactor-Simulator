import log from '@/lib/utils/logger';

// 故障接口
export interface Fault {
	id: string;
	description: string;
	severity: 'low' | 'medium' | 'high' | 'critical';
	affectedSystem: string;
	probability: number;
	duration: number;
}

// 故障模拟参数接口
interface FaultSimulationParams {
	// 系统状态
	systemStatus: {
		operatingTime: number;
		maintenanceLevel: number;
		environmentalConditions: string;
	};
	
	// 故障设置
	faultSettings: {
		enableRandomFaults: boolean;
		faultProbability: number;
		maxConcurrentFaults: number;
	};
}

// 故障模拟结果接口
interface FaultSimulationResult {
	// 激活的故障
	activeFaults: Fault[];
	
	// 故障概率
	faultProbabilities: {
		system: string;
		probability: number;
	}[];
	
	// 系统影响
	systemImpact: {
		powerReduction: number;
		temperatureIncrease: number;
		pressureIncrease: number;
		coolingReduction: number;
	};
}

// 故障模拟模型
export class FaultSimulation {
	// 预定义故障列表
	private static predefinedFaults: Fault[] = [
		{
			id: 'cooling-system-failure',
			description: '冷却系统故障',
			severity: 'critical',
			affectedSystem: 'cooling',
			probability: 0.05,
			duration: 300,
		},
		{
			id: 'control-rod-malfunction',
			description: '控制棒故障',
			severity: 'high',
			affectedSystem: 'control',
			probability: 0.03,
			duration: 180,
		},
		{
			id: 'steam-generator-leak',
			description: '蒸汽发生器泄漏',
			severity: 'medium',
			affectedSystem: 'steam',
			probability: 0.04,
			duration: 240,
		},
		{
			id: 'pump-failure',
			description: '泵故障',
			severity: 'medium',
			affectedSystem: 'cooling',
			probability: 0.06,
			duration: 120,
		},
		{
			id: 'valve-stuck',
			description: '阀门卡住',
			severity: 'low',
			affectedSystem: 'steam',
			probability: 0.08,
			duration: 60,
		},
	];
	
	// 触发特定故障
	static triggerSpecificFault(faultId: string): Fault | null {
		log.info(`Triggering specific fault: ${faultId}`);
		
		const fault = this.predefinedFaults.find(f => f.id === faultId);
		if (fault) {
			log.warn(`Fault triggered: ${fault.description} (${fault.severity})`);
			return fault;
		}
		
		log.error(`Fault not found: ${faultId}`);
		return null;
	}
	
	// 生成随机故障
	static generateRandomFault(params: FaultSimulationParams): Fault | null {
		log.trace('Generating random fault...');
		
		if (!params.faultSettings.enableRandomFaults) {
			return null;
		}
		
		// 根据概率生成故障
		const random = Math.random();
		if (random > params.faultSettings.faultProbability) {
			return null;
		}
		
		// 选择一个故障
		const weightedFaults = this.predefinedFaults.map(fault => ({
			...fault,
			weightedProbability: fault.probability * (1 - params.systemStatus.maintenanceLevel / 100),
		}));
		
		const totalWeight = weightedFaults.reduce((sum, fault) => sum + fault.weightedProbability, 0);
		let randomWeight = Math.random() * totalWeight;
		
		for (const fault of weightedFaults) {
			randomWeight -= fault.weightedProbability;
			if (randomWeight <= 0) {
				log.warn(`Random fault generated: ${fault.description} (${fault.severity})`);
				return fault;
			}
		}
		
		return null;
	}
	
	// 模拟故障
	static simulateFaults(params: FaultSimulationParams): FaultSimulationResult {
		log.trace('Simulating faults...');
		
		// 生成活跃故障
		const activeFaults: Fault[] = [];
		let concurrentFaults = 0;
		
		while (concurrentFaults < params.faultSettings.maxConcurrentFaults) {
			const fault = this.generateRandomFault(params);
			if (fault) {
				activeFaults.push(fault);
				concurrentFaults++;
			} else {
				break;
			}
		}
		
		// 计算系统影响
		const systemImpact = this.calculateSystemImpact(activeFaults);
		
		// 计算故障概率
		const faultProbabilities = this.calculateFaultProbabilities(params);
		
		log.trace('Fault simulation completed');
		
		return {
			activeFaults,
			faultProbabilities,
			systemImpact,
		};
	}
	
	// 获取活跃故障
	static getActiveFaults(): Fault[] {
		// 这里应该从实际的故障状态中获取
		// 暂时返回空数组
		return [];
	}
	
	// 计算系统影响
	private static calculateSystemImpact(faults: Fault[]): FaultSimulationResult['systemImpact'] {
		let powerReduction = 0;
		let temperatureIncrease = 0;
		let pressureIncrease = 0;
		let coolingReduction = 0;
		
		// 根据故障计算系统影响
		for (const fault of faults) {
			switch (fault.severity) {
				case 'critical':
					powerReduction += 0.5;
					temperatureIncrease += 50;
					pressureIncrease += 200000;
					coolingReduction += 0.6;
					break;
				case 'high':
					powerReduction += 0.3;
					temperatureIncrease += 30;
					pressureIncrease += 100000;
					coolingReduction += 0.4;
					break;
				case 'medium':
					powerReduction += 0.15;
					temperatureIncrease += 15;
					pressureIncrease += 50000;
					coolingReduction += 0.2;
					break;
				case 'low':
					powerReduction += 0.05;
					temperatureIncrease += 5;
					pressureIncrease += 10000;
					coolingReduction += 0.1;
					break;
			}
		}
		
		return {
			powerReduction: Math.min(1, powerReduction),
			temperatureIncrease: Math.max(0, temperatureIncrease),
			pressureIncrease: Math.max(0, pressureIncrease),
			coolingReduction: Math.min(1, coolingReduction),
		};
	}
	
	// 计算故障概率
	private static calculateFaultProbabilities(params: FaultSimulationParams): FaultSimulationResult['faultProbabilities'] {
		const systemFaults = {
			cooling: 0.0,
			control: 0.0,
			steam: 0.0,
			power: 0.0,
		};
		
		// 计算各系统的故障概率
		for (const fault of this.predefinedFaults) {
			systemFaults[fault.affectedSystem as keyof typeof systemFaults] += fault.probability;
		}
		
		// 转换为数组格式
		return Object.entries(systemFaults).map(([system, probability]) => ({
			system,
			probability: probability * (1 - params.systemStatus.maintenanceLevel / 100),
		}));
	}
}
