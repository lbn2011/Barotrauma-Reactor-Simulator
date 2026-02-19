// 系统模型导出文件

// 导入反应堆堆芯模型
import { ReactorCore } from './reactorCore';

// 导入故障模拟模型
import { FaultSimulation, type Fault } from './faultSimulation';

// 导出系统模型
export {
	ReactorCore,
	FaultSimulation,
	type Fault
};

// 系统模型命名空间
export namespace systems {
	export const reactorCore = ReactorCore;
	export const faultSimulation = FaultSimulation;
}
