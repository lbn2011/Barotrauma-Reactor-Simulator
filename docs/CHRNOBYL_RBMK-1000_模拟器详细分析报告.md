# CHRNOBYL RBMK-1000模拟器详细分析报告

## 目录
1. [反应堆核心控制逻辑](#一反应堆核心控制逻辑)
2. [控制棒系统详细实现](#二控制棒系统详细实现)
3. [给水系统完整控制流程](#三给水系统完整控制流程)
4. [汽轮机控制系统详细机制](#四汽轮机控制系统详细机制)
5. [安全系统和互锁机制](#五安全系统和互锁机制)
6. [故障模拟和应急程序](#六故障模拟和应急程序)
7. [系统架构总结](#七系统架构总结)

---

## 一、反应堆核心控制逻辑

### 1.1 核心模型接口（PROCMDI.cs）

该模块是整个模拟器的核心，通过DLL接口与物理模型交互。

#### 关键DLL函数

| 函数名 | 功能说明 |
|--------|----------|
| `GETMK()` | 获取反应堆功率水平 |
| `GETFLX()` | 获取中子通量 |
| `GETXE(ref short I)` | 获取氙和碘浓度（I=1为氙，I=2为碘） |
| `GETTHR(ref float lPARAM)` | 获取热功率分布（25个区域） |
| `GETROD(ref short I, ref short j)` | 获取控制棒位置 |
| `SETROD(ref float X, ref short I, ref short j, ref short k)` | 设置控制棒位置 |
| `GETERR()` | 获取控制误差 |
| `GETSPT()` | 获取功率设定点 |
| `SETSPT(ref float X, ref short I)` | 设置功率设定点 |
| `SETAUT(ref short I)` | 设置自动控制模式 |
| `TRIPIT(ref short IVAL, ref short I)` | 触发停堆 |

#### 核心变量

| 变量名 | 类型 | 说明 |
|--------|------|------|
| `MKVALUE` | float | 反应堆功率值 |
| `FLX` | float | 中子通量 |
| `XEN` | float | 氙浓度 |
| `IOD` | float | 碘浓度 |
| `RXRATE` | float | 反应堆功率变化率 |
| `RXERR` | float | 反应堆控制误差 |
| `AVGRAT` | float | 平均功率变化率 |
| `AVGERR` | float | 平均控制误差 |

#### 1.2 反应堆控制显示（disp_rx_control）

实时显示关键参数：

- 功率变化率百分比
- 平均热功率
- 中子通量（线性和对数）
- 控制棒束位置百分比
- 功率设定点
- 控制误差百分比
- 自动控制状态指示
- 轴向偏移控制状态

**实现代码示例：**

```csharp
public static void disp_rx_control()
{
    MyProject.Forms.MainForm.CBStatic.RX_CONTROL.Label5.Text = Support.Format(AVGRAT / (float)GLOBALRX.maxiterates, "##0.0%");
    MyProject.Forms.MainForm.CBStatic.RX_CONTROL.Label7.Text = Support.Format(avgchp, "##0.0%");
    MyProject.Forms.MainForm.CBStatic.RX_CONTROL.Label9.Text = Support.Format(FLX, "##0.0%");
    MyProject.Forms.MainForm.CBStatic.RX_CONTROL.Label16.Text = Support.Format(Math.Log((double)FLX + 1E-10) / Math.Log(10.0), "0.00");
    MyProject.Forms.MainForm.CBStatic.RX_CONTROL.Label4.Text = Support.Format(GETSPT(), "##0.0%");
    MyProject.Forms.MainForm.CBStatic.RX_CONTROL.Label3.Text = Support.Format(AVGERR / (float)GLOBALRX.maxiterates, "##0.0%");
}
```

---

## 二、控制棒系统详细实现

### 2.1 控制棒控制面板（REACT_ROD.cs）

#### 控制功能

**Command1_Click - 全部控制棒紧急插入**

```csharp
private void Command1_Click(object eventSender, EventArgs eventArgs)
{
    short I = 2;
    float X = (float)(1.0 - (double)GETMOV(ref I));
    I = 0;
    short j = 0;
    short k = 4;
    SETROD(ref X, ref I, ref j, ref k);
    X = 0f;
    k = 0;
    j = 0;
    I = 1;
    SETROD(ref X, ref k, ref j, ref I);
}
```

**Command2_Click - 手动/自动模式切换**

```csharp
private void Command2_Click(object eventSender, EventArgs eventArgs)
{
    string name = ((Button)eventSender).Name;
    short num = (short)int.Parse(Strings.Right(name, 1));
    float X = 1 - num;
    short I = 0;
    short j = 0;
    short k = 1;
    SETROD(ref X, ref I, ref j, ref k);
}
```

**Spin1_SpinDown/Up - 精细调整控制棒位置**

```csharp
private void Spin1_SpinDown(object sender, EventArgs e)
{
    int num = int.Parse(Strings.Right(Conversions.ToString(NewLateBinding.LateGet(sender, null, "Name", new object[0], null, null, null)), Conversions.ToInteger(Operators.SubtractObject(NewLateBinding.LateGet(NewLateBinding.LateGet(sender, null, "name", new object[0], null, null, null), null, "length", new object[0], null, null, null), 6)))) - 1;
    Application.DoEvents();
    short I = (short)unchecked(num % 5);
    short j = (short)Math.Round(Conversion.Int((double)num / 5.0));
    float X = 0.01f;
    short k = 2;
    SETROD(ref X, ref I, ref j, ref k);
}

private void Spin1_SpinUp(object sender, EventArgs e)
{
    int num = int.Parse(Strings.Right(Conversions.ToString(NewLateBinding.LateGet(sender, null, "Name", new object[0], null, null, null)), Conversions.ToInteger(Operators.SubtractObject(NewLateBinding.LateGet(NewLateBinding.LateGet(sender, null, "name", new object[0], null, null, null), null, "length", new object[0], null, null, null), 6)))) - 1;
    Application.DoEvents();
    short I = (short)unchecked(num % 5);
    short j = (short)Math.Round(Conversion.Int((double)num / 5.0));
    float X = -0.01f;
    short k = 2;
    SETROD(ref X, ref I, ref j, ref k);
}
```

#### 控制棒参数

| 参数 | 值/范围 | 说明 |
|------|----------|------|
| 网格布局 | 5×5 | 25个控制棒组 |
| 位置范围 | 0-1 | 0=完全插入，1=完全抽出 |
| 移动速度 | 0.01步长/点击 | 精细调整步长 |
| 支持操作 | 拖拽 | 燃料更换模拟 |

#### 安全互锁

- 控制棒移动前检查设备故障状态
- 自动模式下的位置限制
- 紧急插入时的快速响应机制

---

## 三、给水系统完整控制流程

### 3.1 给水泵控制（feed_pmp.cs）

#### 泵控制逻辑

```csharp
private void Command1_Click(object eventSender, EventArgs eventArgs)
{
    short index = Command1.GetIndex((Button)eventSender);
    checked
    {
        short I = (short)Math.Round(Conversion.Int((double)index / 2.0));
        short I2 = (short)(I + 6);
        if (unchecked(index % 2) == 1)
        {
            short j = 0;
            bool num = (double)GETISO(ref I, ref j) > 0.99;
            short j2 = 1;
            if (num & ((double)GETISO(ref I, ref j2) < 0.01))
            {
                GLOBALRX.PLAY_TXT_AFTER_AVI = 0;
                short j3 = (short)(I + 4);
                Form frm = this;
                short num2 = PROCMDI.check_4_malf(ref j3, ref frm);
                j2 = (short)(I + 3);
                if (unchecked(GETFED(ref j2) != 1f && num2 == 0))
                {
                    Command1[(short)(index - 1)].Tag = Support.Format(GLOBALRX.next_snd_index, "0");
                    j2 = 1;
                    MyProject.MyForms forms = MyProject.Forms;
                    frm = forms.model_timer;
                    SOUNDS.START_SOUND(ref j2, ref frm);
                    forms.model_timer = (model_timer)frm;
                }
                else
                {
                    Command1[(short)(index - 1)].Tag = "";
                }
                j2 = 1;
                SETPMP(ref I2, ref j2);
            }
        }
        else
        {
            short j2 = 0;
            SETPMP(ref I2, ref j2);
            string text = Conversions.ToString(Command1[index].Tag);
            Command1[index].Tag = "";
        }
    }
}
```

#### 给水系统组件

| 组件 | 数量 | 编号范围 | 说明 |
|------|------|----------|------|
| 主给水泵 | 6台 | 0-5 | 对应泵索引6-11 |
| 隔离阀 | 每台泵2个 | 进出口 | 流量控制 |
| 流量控制 | Spin1 | ±0.005步长 | 微调流量 |
| 水位控制 | Text1 | 手动输入 | 直接设定 |

#### 安全检查

- 启动前检查隔离阀状态
- 检查设备故障（通过check_4_malf函数）
- 低流量保护
- 水位过高/过低保护

### 3.2 给水加热器（feedHTR_0.cs）

#### 监控参数

- 加热器进出口温度
- 加热器流量
- 蒸汽压力
- 给水总流量计算

### 3.3 给水系统总览（feedsys_0.cs）

#### 系统级监控

- 给水总管压力、温度、水位、流量
- 各泵运行状态
- 系统流量平衡

---

## 四、汽轮机控制系统详细机制

### 4.1 汽轮机主控（turbine_s_ctrl.cs）

#### 控制功能

```csharp
private void Command1_Click(object eventSender, EventArgs eventArgs)
{
    short index = Command1.GetIndex((Button)eventSender);
    float X = index;
    short I = 10;
    SETTRB(ref X, ref I);
}

private void Command2_Click(object eventSender, EventArgs eventArgs)
{
    short index = Command2.GetIndex((Button)eventSender);
    float X = checked(900 * index);
    short I = 4;
    SETTRB(ref X, ref I);
}

private void Command3_Click(object eventSender, EventArgs eventArgs)
{
    short index = Command3.GetIndex((Button)eventSender);
    float X = index;
    short I = 1;
    SETTRB(ref X, ref I);
    if (index != 1)
    {
        return;
    }
    GLOBALRX.PLAY_TXT_AFTER_AVI = 0;
    short j = 65;
    checked
    {
        short num2;
        short num3;
        do
        {
            Form frm = this;
            short num = PROCMDI.check_4_malf(ref j, ref frm);
            if (num > 0)
            {
                break;
            }
            j = (short)unchecked(j + 1);
            num2 = j;
            num3 = 67;
        }
        while (num2 <= num3);
    }
}
```

#### 关键控制参数

| 参数 | 索引 | 范围 | 说明 |
|------|------|------|------|
| 转速控制 | I=10 | 0-1 | 对应0-100%负荷 |
| 负荷控制 | I=4 | 0-9000步长 | 每步900kW |
| 自动控制 | I=1 | 0/1 | 启用/禁用自动调速器 |
| 超速保护 | - | 3000RPM | 额定转速的超速保护 |

#### 实时显示

- 汽轮机转速（3000RPM额定）
- 蒸汽压力
- 蒸汽温度（主蒸汽、再热蒸汽）
- 排汽温度
- 负荷百分比
- 阀门位置指示

### 4.2 汽轮机辅助系统（turb_aux.cs）

#### 辅助控制

```csharp
private void Image2_Click(object eventSender, EventArgs eventArgs)
{
    short index = Image2.GetIndex((PictureBox)eventSender);
    float X = index;
    short I = 12;
    SETTRB(ref X, ref I);
    Image2[index].Image = Image1[3].Image;
    Image2[checked((short)(1 - index))].Image = Image1[0].Image;
}

private void Image3_Click(object eventSender, EventArgs eventArgs)
{
    short index = Image3.GetIndex((PictureBox)eventSender);
    float X = index;
    short I = 13;
    SETTRB(ref X, ref I);
    Image3[index].Image = Image1[3].Image;
    Image3[checked((short)(1 - index))].Image = Image1[0].Image;
}

private void Image4_Click(object eventSender, EventArgs eventArgs)
{
    short index = Image4.GetIndex((PictureBox)eventSender);
    float X = index;
    short I = 14;
    SETTRB(ref X, ref I);
    Image4[index].Image = Image1[3].Image;
    Image4[checked((short)(1 - index))].Image = Image1[0].Image;
}

private void Image5_Click(object eventSender, EventArgs eventArgs)
{
    short index = Image5.GetIndex((PictureBox)eventSender);
    float X = index;
    short I = 15;
    SETTRB(ref X, ref I);
    Image5[index].Image = Image1[3].Image;
    Image5[checked((short)(1 - index))].Image = Image1[0].Image;
}
```

| 设备 | 索引 | 功能 |
|------|------|------|
| 润滑油泵 | I=12 | 主/备用切换 |
| 冷却水泵 | I=13 | 主/备用切换 |
| 真空泵 | I=14 | 主/备用切换 |
| 密封水泵 | I=15 | 主/备用切换 |

### 4.3 汽轮机参数监控（turbine_0.cs）

#### 监控参数

- 主蒸汽压力、温度
- 高压缸排汽温度
- 中压缸排汽温度
- 低压缸排汽温度
- 给水流量
- 负荷百分比

---

## 五、安全系统和互锁机制

### 5.1 紧急堆芯冷却系统（SD_COOLING.cs）

#### ECCS控制

```csharp
private void Image1_MouseDown(object eventSender, MouseEventArgs eventArgs)
{
    checked
    {
        short num = (short)unchecked((int)eventArgs.Button / 1048576);
        short num2 = (short)unchecked((int)Control.ModifierKeys / 65536);
        float num3 = (float)Support.PixelsToTwipsX(eventArgs.X);
        float num4 = (float)Support.PixelsToTwipsY(eventArgs.Y);
        short j = Image1.GetIndex((PictureBox)eventSender);
        short I = 14;
        SETPMP(ref I, ref j);
        Image1[j].Image = Image7[3].Image;
        Image1[(short)(1 - j)].Image = Image7[0].Image;
    }
}
```

| 系统 | 索引 | 功能 |
|------|------|------|
| 高压注水泵 | I=14 | 主/备用切换 |
| 低压注水泵 | I=15 | 主/备用切换 |
| 应急冷却泵 | I=16 | 主/备用切换 |
| 安全注水阀 | I=17-19 | 独立控制 |

#### 安全功能

- 自动触发（当检测到LOCA）
- 手动触发（操作员干预）
- 流量监控和显示
- 系统状态指示

### 5.2 报警系统（ALARMS.cs）

#### 报警功能

```csharp
private void Command1_Click(object eventSender, EventArgs eventArgs)
{
    PROCMDI.ack_alarms();
}

private void Command2_Click(object eventSender, EventArgs eventArgs)
{
    GLOBALRX.ALARM_SILENCE = (short)(~GLOBALRX.ALARM_SILENCE);
    if (GLOBALRX.ALARM_SILENCE != 0)
    {
        short index = 0;
        string command_Renamed = "STOP";
        SOUNDS.ControlSoundPlayback(ref index, ref command_Renamed, ref GLOBALRX.alarm_filename);
    }
}

private void Command3_Click(object eventSender, EventArgs eventArgs)
{
    WindowState = FormWindowState.Minimized;
}
```

| 功能 | 按钮 | 说明 |
|------|------|------|
| 报警确认 | Command1 | 确认所有报警 |
| 报警静音 | Command2 | 静音报警声音 |
| 报警最小化 | Command3 | 最小化报警窗口 |

#### 报警显示

- 最多显示20个报警
- 颜色编码（红色=紧急，黄色=警告）
- 报警优先级排序
- 声音报警（可静音）

#### 报警处理

```csharp
public static void DISP_ALARMS()
{
    DOALAR();  // 调用DLL获取报警
    short num = ALARMS_COLR(ref n);  // 获取报警颜色
    ALARMS_GET(ref command_Renamed, ref n);  // 获取报警文本
    // 更新显示
}
```

### 5.3 故障报告系统（FO_Report.cs）

#### 故障处理流程

1. 检测到设备故障时显示故障报告
2. 提供两个选项：
   - "现在修复"：调用SETMAL函数修复
   - "暂时忽略"：允许继续操作但设备不可用
3. 检查预算限制
4. 更新设备状态

#### 故障检测

```csharp
public static short check_4_malf(ref short j, ref Form frm)
{
    short mAL;
    if (GLOBALRX.PLAY_TXT_AFTER_AVI == 0)
    {
        GLOBALRX.THIS_MAL = j;
        short id = 0;
        mAL = GETMAL(ref j, ref id);
        if ((unchecked((short)(0 - ((mAL == 1) ? 1 : 0))) & ~GLOBALRX.fo_report_loaded) != 0)
        {
            GLOBALRX.malfnum = j;
            id = 1;
            short mAL2 = GETMAL(ref GLOBALRX.malfnum, ref id);
            GLOBALRX.yy_report = (short)Math.Round(Support.PixelsToTwipsY(MyProject.Forms.MainForm.Top) + Support.PixelsToTwipsY(frm.Top) + Support.PixelsToTwipsY(frm.Height) / 2.0);
            GLOBALRX.xx_report = (short)Math.Round(Support.PixelsToTwipsX(MyProject.Forms.MainForm.Left) + Support.PixelsToTwipsX(frm.Left) + Support.PixelsToTwipsX(frm.Width) / 2.0 - 2200.0);
            FO_Report fO_Report = new FO_Report();
            Support.ShowForm(fO_Report);
            fO_Report.Label1[1].Text = "$ " + Support.Format(mAL2, "####");
            fO_Report.Label1[0].Text = "This piece of equipment cannot be operated until it has been repaired";
            fO_Report.Label2.Text = "Repair it now";
            fO_Report.Label3.Text = "Ignore it for now";
        }
    }
    return mAL;
}
```

---

## 六、故障模拟和应急程序

### 6.1 故障模拟机制

#### 故障类型

- 设备故障（泵、阀、仪表）
- 管道破裂（LOCA模拟）
- 控制系统故障
- 仪表失灵

#### 故障设置

```csharp
[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
public static extern short SETMAL(ref short n, ref short id);
```

| 参数 | 说明 |
|------|------|
| n | 故障编号 |
| id | 故障类型（0=设置故障，1=获取修复费用，2=修复） |

### 6.2 应急程序

#### 紧急停堆（AZ-5）

- 快速插入所有控制棒
- 自动触发安全系统
- 记录事件和参数

#### 应急冷却

- 自动启动ECCS
- 手动干预选项
- 流量和压力监控

#### 应急操作员行动

- 故障诊断
- 系统隔离
- 替代系统启动
- 参数监控和调整

---

## 七、主控制面板详细分析

### 7.1 主控制面板结构（controlboard.cs）

主控制面板是整个模拟器的核心界面，提供对所有子系统的访问。

#### 面板映射表

| 面板编号 | 面板名称 | 对应文件 | 窗口类 | 尺寸 | 功能说明 |
|----------|----------|----------|--------|------|----------|
| 1 | 反应堆控制棒 | REACT_ROD.cs | REACT_ROD | 434×426 | 控制棒位置和燃料管理 |
| 2 | 反应堆功率调节 | RX_CONTROL.cs | RX_CONTROL | 276×314 | 功率设定和自动控制 |
| 3 | 再循环泵A | maincp1.cs | maincp1 | 220×270 | 回路1再循环泵控制 |
| 4 | 再循环泵B | maincp2.cs | maincp2 | 220×269 | 回路2再循环泵控制 |
| 5 | 应急冷却泵A | ECC_CONTROL.cs | ECC_CONTROL | 265×380 | ECCS泵控制 |
| 6 | 应急冷却泵B | SD_COOLING.cs | SD_COOLING | 386×246 | 堆芯离线冷却 |
| 7 | 反应堆排水控制 | Drain_ctrl.cs | Drain_ctrl | 225×109 | 排水阀控制 |
| 8 | 堆芯离线冷却泵 | SD_COOLING.cs | SD_COOLING | 386×246 | 离线冷却泵控制 |
| 9 | 汽轮机控制 | turbine_s_ctrl.cs | turbine_s_ctrl | 454×347 | 汽轮机转速和负荷 |
| 10 | 除氧器蒸汽控制 | deaer_P_CTRL.cs | deaer_P_CTRL | 266×145 | 除氧器压力控制 |
| 11 | 凝汽器真空系统 | cndsr_v.cs | cndsr_v | 215×139 | 真空泵和蒸汽喷射 |
| 12 | 蒸汽排汽控制 | bypass_0.cs | bypass_0 | 197×123 | 蒸汽旁路控制 |
| 13 | 汽轮机辅助系统 | turb_aux.cs | turb_aux | 193×246 | 润滑油、冷却水等 |
| 14 | 凝汽器热井液位 | HOTW_LEVEL_CTRL.cs | HOTW_LEVEL_CTRL | 368×115 | 热井水位控制 |
| 15 | 凝汽器循环水泵 | CNDSR_0.cs | CNDSR_0 | - | 循环水泵控制 |
| 16 | 补水系统 | COND_MAKEUP.cs | COND_MAKEUP | 233×195 | 凝结水补水 |
| 17 | 反应堆给水泵 | feed_pmp.cs | feed_pmp | 247×506 | 给水泵和流量控制 |
| 18 | 数据趋势图 | TRENDSv.cs | TRENDSv | - | 实时趋势显示 |
| 19 | HEPA过滤器控制 | HEPA_FLTR.cs | HEPA_FLTR | 244×177 | 通风过滤系统 |
| 20 | 警报CRT | ALARMS.cs | ALARMS | 328×244 | 报警显示和处理 |
| 21 | CRT示意图 | SCEMAT_0.cs | SCEMAT_0 | - | 系统流程图 |
| 22 | 凝结水系统 | DEaer_L_CTRL.cs | deaer_L_CTRL | 431×265 | 凝结水流量控制 |

#### 面板启动机制

```csharp
private void click1_MouseDown(object eventSender, MouseEventArgs eventArgs)
{
    checked
    {
        short num = (short)unchecked((int)eventArgs.Button / 1048576);
        string name = ((PictureBox)eventSender).Name;
        int num5 = int.Parse(Strings.Right(name, name.Length - 8));
        switch (num)
        {
        case 1:  // 左键点击
            Cursor = Cursors.WaitCursor;
            switch (num5)
            {
            case 0:  // 反应堆控制棒
                if (~GLOBALRX.react_rod_loaded != 0)
                {
                    REACT_ROD = new REACT_ROD();
                    Support.ShowForm(REACT_ROD);
                    REACT_ROD.WindowState = FormWindowState.Normal;
                    REACT_ROD rEACT_ROD = REACT_ROD;
                    Size size = new Size(434, 426);
                    rEACT_ROD.Size = size;
                }
                break;
            case 1:  // 反应堆功率调节
                if (~GLOBALRX.rx_control_loaded != 0)
                {
                    RX_CONTROL = new RX_CONTROL();
                    Support.ShowForm(RX_CONTROL);
                    RX_CONTROL.WindowState = FormWindowState.Normal;
                    RX_CONTROL rX_CONTROL = RX_CONTROL;
                    Size size = new Size(276, 314);
                    rX_CONTROL.Size = size;
                }
                break;
            // ... 其他面板
            }
            Cursor = Cursors.Default;
            break;
        case 2:  // 右键点击
            Form formused = this;
            ONTOPRX.move_to_bottom(ref formused);
            break;
        }
    }
}
```

### 7.2 反应堆控制棒系统（REACT_ROD.cs）

#### 核心功能

**1. 控制棒位置控制**

```csharp
[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern float GETROD(ref short I, ref short j);

[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern void SETROD(ref float X, ref short I, ref short j, ref short k);
```

| 参数 | 说明 |
|------|------|
| I | 控制棒列索引（0-4） |
| j | 控制棒行索引（0-4） |
| X | 控制棒位置（0=完全插入，1=完全抽出） |
| k | 操作类型（0=手动，1=自动，2=微调，3=选择，4=紧急） |

**2. 紧急插入（AZ-5）**

```csharp
private void Command1_Click(object eventSender, EventArgs eventArgs)
{
    short I = 2;
    float X = (float)(1.0 - (double)GETMOV(ref I));
    I = 0;
    short j = 0;
    short k = 4;
    SETROD(ref X, ref I, ref j, ref k);
    X = 0f;
    k = 0;
    j = 0;
    I = 1;
    SETROD(ref X, ref k, ref j, ref I);
}
```

**3. 精细调整控制棒**

```csharp
private void Spin1_SpinDown(object sender, EventArgs e)
{
    int num = int.Parse(Strings.Right(Conversions.ToString(NewLateBinding.LateGet(sender, null, "Name", new object[0], null, null, null)), Conversions.ToInteger(Operators.SubtractObject(NewLateBinding.LateGet(NewLateBinding.LateGet(sender, null, "name", new object[0], null, null, null), null, "length", new object[0], null, null, null), 6)))) - 1;
    Application.DoEvents();
    short I = (short)unchecked(num % 5);
    short j = (short)Math.Round(Conversion.Int((double)num / 5.0));
    float X = 0.01f;
    short k = 2;
    SETROD(ref X, ref I, ref j, ref k);
}

private void Spin1_SpinUp(object sender, EventArgs e)
{
    int num = int.Parse(Strings.Right(Conversions.ToString(NewLateBinding.LateGet(sender, null, "Name", new object[0], null, null, null)), Conversions.ToInteger(Operators.SubtractObject(NewLateBinding.LateGet(NewLateBinding.LateGet(sender, null, "name", new object[0], null, null, null), null, "length", new object[0], null, null, null), 6)))) - 1;
    Application.DoEvents();
    short I = (short)unchecked(num % 5);
    short j = (short)Math.Round(Conversion.Int((double)num / 5.0));
    float X = -0.01f;
    short k = 2;
    SETROD(ref X, ref I, ref j, ref k);
}
```

**4. 燃料更换模拟**

```csharp
private void Image2_DragDrop(object eventSender, DragEventArgs eventArgs)
{
    checked
    {
        if (GLOBALRX.fuel_new_flag != 0)
        {
            short I = (short)unchecked(GLOBALRX.fuel_target % 5);
            short j = (short)Math.Round(Conversion.Int((double)GLOBALRX.fuel_target / 5.0));
            short B = 5;
            SETBUN(ref B, ref I, ref j);
        }
        if (GLOBALRX.fuel_old_flag != 0)
        {
            float X = 1f;
            short B = 6;
            short num = GLOBALRX.HEPAST(ref X, ref B);
            short I = (short)unchecked(GLOBALRX.fuel_source % 5);
            short j = (short)Math.Round(Conversion.Int((double)GLOBALRX.fuel_source / 5.0));
            B = -5;
            SETBUN(ref B, ref I, ref j);
        }
    }
}
```

#### 控制棒系统参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 控制棒数量 | 25组 | 5×5网格布局 |
| 位置范围 | 0-1 | 0=完全插入，1=完全抽出 |
| 微调步长 | 0.01 | 每次点击移动量 |
| 支持操作 | 拖拽 | 燃料更换模拟 |

### 7.3 反应堆功率调节面板（RX_CONTROL.cs）

#### 核心功能

**1. 自动/手动模式切换**

```csharp
private void Image2_MouseDown(object eventSender, MouseEventArgs eventArgs)
{
    string name = ((PictureBox)eventSender).Name;
    short num = checked((short)int.Parse(Strings.Right(name, 1)));
    short I = num;
    SETAUT(ref I);
    if (num == 0)
    {
        _Image2_0.Image = _Image1_3.Image;
        _Image2_1.Image = _Image1_0.Image;
    }
    else
    {
        _Image2_0.Image = _Image1_0.Image;
        _Image2_1.Image = _Image1_3.Image;
    }
}
```

**2. 功率设定点调整**

```csharp
private void Spin2_SpinDown(object sender, EventArgs e)
{
    int num = int.Parse(Strings.Right(Conversions.ToString(NewLateBinding.LateGet(sender, null, "name", new object[0], null, null, null)), 1));
    Application.DoEvents();
    float X = (float)(0.0 - (0.005 + (double)num * 0.045));
    short I = 1;
    PROCMDI.SETSPT(ref X, ref I);
}

private void Spin2_SpinUp(object sender, EventArgs e)
{
    int num = int.Parse(Strings.Right(Conversions.ToString(NewLateBinding.LateGet(sender, null, "name", new object[0], null, null, null)), 1));
    Application.DoEvents();
    float X = (float)(0.005 + (double)num * 0.045);
    short I = 1;
    PROCMDI.SETSPT(ref X, ref I);
}
```

**3. 停堆触发**

```csharp
private void Command1_Click(object eventSender, EventArgs eventArgs)
{
    string name = ((Button)eventSender).Name;
    short IVAL = checked((short)int.Parse(Strings.Right(name, 1)));
    short I = 2;
    PROCMDI.TRIPIT(ref IVAL, ref I);
}
```

#### 功率调节参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 设定点范围 | 0-100% | 反应堆功率百分比 |
| 微调步长 | 0.005-0.05 | 根据选择器变化 |
| 自动控制 | 开/关 | 自动调节功率 |

### 7.4 反应堆再循环泵（maincp1.cs & maincp2.cs）

#### 核心功能

**1. 泵启动/停止控制**

```csharp
[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern void SETPMP(ref short I, ref short j);

private void Command1_Click(object eventSender, EventArgs eventArgs)
{
    short index = Command1.GetIndex((Button)eventSender);
    checked
    {
        short I = (short)(1 - unchecked(index % 2));
        if (index < 6)
        {
            short I2 = (short)Math.Round(Conversion.Int((double)index / 2.0));
            if (I == 1)
            {
                if (((double)_0024STATIC_0024Command1_Click_002420211C124D_0024PMPVLV[I2] > 0.99) & ((double)_0024STATIC_0024Command1_Click_002420211C124D_0024PMPVLV[I2 + 6] < 0.01))
                {
                    GLOBALRX.PLAY_TXT_AFTER_AVI = 0;
                    short j = (short)(I2 + 7);
                    Form frm = this;
                    short num = PROCMDI.check_4_malf(ref j, ref frm);
                    short index2;
                    if (unchecked(PROCMDI.CIRPMP[I2] != 1 && num == 0))
                    {
                        Command1[(short)(index + 1)].Tag = Support.Format(GLOBALRX.next_snd_index, "0");
                        index2 = 1;
                        MyProject.MyForms forms = MyProject.Forms;
                        frm = forms.model_timer;
                        SOUNDS.START_SOUND(ref index2, ref frm);
                        forms.model_timer = (model_timer)frm;
                    }
                    else
                    {
                        Command1[(short)(index + 1)].Tag = "";
                    }
                    index2 = 1;
                    SETPMP(ref I2, ref index2);
                }
            }
            else
            {
                short index2 = 0;
                SETPMP(ref I2, ref index2);
                string text = Conversions.ToString(Command1[index].Tag);
                Command1[index].Tag = "";
            }
        }
    }
}
```

**2. 阀门控制**

```csharp
[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern void SETINL(ref short I, ref short j);

[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern void SETDIS(ref short I, ref short j);
```

| 参数 | 说明 |
|------|------|
| I | 阀门索引 |
| j | 阀门状态（0=关闭，1=打开） |

**3. 流量调节**

```csharp
private void Spin1_SpinDown()
{
    Application.DoEvents();
    float X = -0.02f;
    short I = 0;
    SETTRM(ref X, ref I);
}

private void Spin1_SpinUp()
{
    Application.DoEvents();
    float X = 0.02f;
    short I = 0;
    SETTRM(ref X, ref I);
}
```

#### 再循环泵参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 泵数量 | 每回路3台 | maincp1和maincp2各3台 |
| 流量调节 | ±0.02步长 | 通过Spin控制 |
| 阀门控制 | 进口/出口 | SETINL/SETDIS |

### 7.5 应急冷却泵系统（ECC_CONTROL.cs & SD_COOLING.cs）

#### ECCS控制（ECC_CONTROL.cs）

**1. ECCS泵控制**

```csharp
[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern short SETECC(ref float valu, ref short id, ref short I, ref short j);

private void Image2_Click(object eventSender, EventArgs eventArgs)
{
    short j = Image2.GetIndex((PictureBox)eventSender);
    short I = 20;
    PROCMDI.SETPMP(ref I, ref j);
    Image2[j].Image = Image1[3].Image;
    Image2[checked((short)(1 - j))].Image = Image1[0].Image;
}

private void Image3_Click(object eventSender, EventArgs eventArgs)
{
    short j = Image3.GetIndex((PictureBox)eventSender);
    short I = 21;
    PROCMDI.SETPMP(ref I, ref j);
    Image3[j].Image = Image1[3].Image;
    Image3[checked((short)(1 - j))].Image = Image1[0].Image;
}

private void Image4_Click(object eventSender, EventArgs eventArgs)
{
    short j = Image4.GetIndex((PictureBox)eventSender);
    short I = 23;
    PROCMDI.SETPMP(ref I, ref j);
    Image4[j].Image = Image1[3].Image;
    Image4[checked((short)(1 - j))].Image = Image1[0].Image;
    Image5.Image = Image1[0].Image;
}

private void Image5_Click(object eventSender, EventArgs eventArgs)
{
    short I = 23;
    short j = -1;
    PROCMDI.SETPMP(ref I, ref j);
    Image5.Image = Image1[3].Image;
    Image4[0].Image = Image1[0].Image;
    Image4[1].Image = Image1[0].Image;
}

private void Image6_Click(object eventSender, EventArgs eventArgs)
{
    short j = Image6.GetIndex((PictureBox)eventSender);
    short I = 22;
    PROCMDI.SETPMP(ref I, ref j);
    Image6[j].Image = Image1[3].Image;
    Image6[checked((short)(1 - j))].Image = Image1[0].Image;
}
```

**2. ECCS设定点调整**

```csharp
private void Spin1_SpinDown(object sender, EventArgs e)
{
    Application.DoEvents();
    float valu = -50f;
    short id = 2;
    short I = 0;
    short j = 0;
    short num = SETECC(ref valu, ref id, ref I, ref j);
}

private void Spin1_SpinUp(object sender, EventArgs e)
{
    Application.DoEvents();
    float valu = 50f;
    short id = 2;
    short I = 0;
    short j = 0;
    short num = SETECC(ref valu, ref id, ref I, ref j);
}
```

#### 堆芯离线冷却（SD_COOLING.cs）

**1. 离线冷却泵控制**

```csharp
private void Image1_MouseDown(object eventSender, MouseEventArgs eventArgs)
{
    checked
    {
        short num = (short)unchecked((int)eventArgs.Button / 1048576);
        short num2 = (short)unchecked((int)Control.ModifierKeys / 65536);
        float num3 = (float)Support.PixelsToTwipsX(eventArgs.X);
        float num4 = (float)Support.PixelsToTwipsY(eventArgs.Y);
        short j = Image1.GetIndex((PictureBox)eventSender);
        short I = 14;
        SETPMP(ref I, ref j);
        Image1[j].Image = Image7[3].Image;
        Image1[(short)(1 - j)].Image = Image7[0].Image;
    }
}
```

#### ECCS参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 高压注水泵 | I=20 | 主/备用切换 |
| 低压注水泵 | I=21 | 主/备用切换 |
| 安全注水阀 | I=22 | 主/备用切换 |
| 应急冷却泵 | I=23 | 主/备用切换 |
| 设定点调整 | ±50 | 通过Spin控制 |

### 7.6 汽轮机控制系统（turbine_s_ctrl.cs）

#### 核心功能

**1. 转速控制**

```csharp
private void Command1_Click(object eventSender, EventArgs eventArgs)
{
    short index = Command1.GetIndex((Button)eventSender);
    float X = index;
    short I = 10;
    SETTRB(ref X, ref I);
}
```

**2. 负荷控制**

```csharp
private void Command2_Click(object eventSender, EventArgs eventArgs)
{
    short index = Command2.GetIndex((Button)eventSender);
    float X = checked(900 * index);
    short I = 4;
    SETTRB(ref X, ref I);
}
```

**3. 自动控制**

```csharp
private void Command3_Click(object eventSender, EventArgs eventArgs)
{
    short index = Command3.GetIndex((Button)eventSender);
    float X = index;
    short I = 1;
    SETTRB(ref X, ref I);
    if (index != 1)
    {
        return;
    }
    GLOBALRX.PLAY_TXT_AFTER_AVI = 0;
    short j = 65;
    checked
    {
        short num2;
        short num3;
        do
        {
            Form frm = this;
            short num = PROCMDI.check_4_malf(ref j, ref frm);
            if (num > 0)
            {
                break;
            }
            j = (short)unchecked(j + 1);
            num2 = j;
            num3 = 67;
        }
        while (num2 <= num3);
    }
}
```

#### 汽轮机参数

| 参数 | 索引 | 范围 | 说明 |
|------|------|------|------|
| 转速控制 | I=10 | 0-1 | 对应0-100%负荷 |
| 负荷控制 | I=4 | 0-9000步长 | 每步900kW |
| 自动控制 | I=1 | 0/1 | 启用/禁用自动调速器 |

### 7.7 凝汽器系统（cndsr_v.cs）

#### 核心功能

**1. 真空泵控制**

```csharp
[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern short SETCND(ref float X, ref short I);

private void Command4_Click(object eventSender, EventArgs eventArgs)
{
    short index = Command4.GetIndex((Button)eventSender);
    checked
    {
        float X = 1 - unchecked(index % 2);
        short I = 0;
        short num = SETCND(ref X, ref I);
    }
}

private void Command5_Click(object eventSender, EventArgs eventArgs)
{
    short index = Command5.GetIndex((Button)eventSender);
    float X = index % 2;
    short I = 1;
    short num = SETCND(ref X, ref I);
}
```

#### 凝汽器参数

| 参数 | 索引 | 说明 |
|------|------|------|
| 真空泵A | I=0 | 主/备用切换 |
| 真空泵B | I=1 | 主/备用切换 |

### 7.8 给水系统（feed_pmp.cs）

#### 核心功能

**1. 给水泵控制**

```csharp
[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern float GETFED(ref short I);

[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern float GETISO(ref short I, ref short j);

[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern void SETFED(ref float X, ref short I);

[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern void SETPMP(ref short I, ref short j);

[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern void SETISO(ref short I, ref short j, ref short k);

private void Command1_Click(object eventSender, EventArgs eventArgs)
{
    short index = Command1.GetIndex((Button)eventSender);
    checked
    {
        short I = (short)Math.Round(Conversion.Int((double)index / 2.0));
        short I2 = (short)(I + 6);
        if (unchecked(index % 2) == 1)
        {
            short j = 0;
            bool num = (double)GETISO(ref I, ref j) > 0.99;
            short j2 = 1;
            if (num & ((double)GETISO(ref I, ref j2) < 0.01))
            {
                GLOBALRX.PLAY_TXT_AFTER_AVI = 0;
                short j3 = (short)(I + 4);
                Form frm = this;
                short num2 = PROCMDI.check_4_malf(ref j3, ref frm);
                j2 = (short)(I + 3);
                if (unchecked(GETFED(ref j2) != 1f && num2 == 0))
                {
                    Command1[(short)(index - 1)].Tag = Support.Format(GLOBALRX.next_snd_index, "0");
                    j2 = 1;
                    MyProject.MyForms forms = MyProject.Forms;
                    frm = forms.model_timer;
                    SOUNDS.START_SOUND(ref j2, ref frm);
                    forms.model_timer = (model_timer)frm;
                }
                else
                {
                    Command1[(short)(index - 1)].Tag = "";
                }
                j2 = 1;
                SETPMP(ref I2, ref j2);
            }
        }
        else
        {
            short j2 = 0;
            SETPMP(ref I2, ref j2);
            string text = Conversions.ToString(Command1[index].Tag);
            Command1[index].Tag = "";
        }
    }
}
```

**2. 隔离阀控制**

```csharp
private void Command2_Click(object eventSender, EventArgs eventArgs)
{
    short index = Command2.GetIndex((Button)eventSender);
    checked
    {
        short I = (short)unchecked(index % 2);
        short j = (short)Math.Round(Conversion.Int((double)index / 2.0));
        short k = 0;
        SETISO(ref I, ref j, ref k);
    }
}

private void Command3_Click(object eventSender, EventArgs eventArgs)
{
    short index = Command3.GetIndex((Button)eventSender);
    checked
    {
        short I = (short)unchecked(index % 2);
        short j = (short)Math.Round(Conversion.Int((double)index / 2.0));
        short k = 1;
        SETISO(ref I, ref j, ref k);
    }
}
```

**3. 流量控制**

```csharp
private void Spin1_SpinDown(object sender, EventArgs e)
{
    Application.DoEvents();
    float X = -0.005f;
    short I = 2;
    SETFED(ref X, ref I);
}

private void Spin1_SpinUp(object sender, EventArgs e)
{
    Application.DoEvents();
    float X = 0.005f;
    short I = 2;
    SETFED(ref X, ref I);
}
```

#### 给水系统参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 主给水泵 | 6台 | 对应泵索引6-11 |
| 隔离阀 | 每台泵2个 | 进出口 |
| 流量控制 | ±0.005步长 | 微调流量 |
| 水位控制 | Text1 | 手动输入 |

### 7.9 HEPA过滤器控制（HEPA_FLTR.cs）

#### 核心功能

**1. HEPA过滤器控制**

```csharp
[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern short HEPAST(ref float X, ref short I);

[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern float HEPAGT(ref short I);

private void Image2_MouseDown(object eventSender, MouseEventArgs eventArgs)
{
    checked
    {
        short num = (short)unchecked((int)eventArgs.Button / 1048576);
        short num2 = (short)unchecked((int)Control.ModifierKeys / 65536);
        float num3 = (float)Support.PixelsToTwipsX(eventArgs.X);
        float num4 = (float)Support.PixelsToTwipsY(eventArgs.Y);
        short index = Image2.GetIndex((PictureBox)eventSender);
        float X = (float)((double)(float)index * 15.0);
        short I = 1;
        short num5 = GLOBALRX.HEPAST(ref X, ref I);
        Image2[index].Image = Image1[3].Image;
        Image2[(short)(1 - index)].Image = Image1[0].Image;
    }
}

private void Image3_MouseDown(object eventSender, MouseEventArgs eventArgs)
{
    checked
    {
        short num = (short)unchecked((int)eventArgs.Button / 1048576);
        short num2 = (short)unchecked((int)Control.ModifierKeys / 65536);
        float num3 = (float)Support.PixelsToTwipsX(eventArgs.X);
        float num4 = (float)Support.PixelsToTwipsY(eventArgs.Y);
        short index = Image3.GetIndex((PictureBox)eventSender);
        float X = (float)((double)(float)index * 17.0);
        short I = 4;
        short num5 = GLOBALRX.HEPAST(ref X, ref I);
        Image3[index].Image = Image1[3].Image;
        Image3[(short)(1 - index)].Image = Image1[0].Image;
    }
}
```

#### HEPA过滤器参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 过滤器A | I=1 | 主/备用切换 |
| 过滤器B | I=4 | 主/备用切换 |

### 7.10 数据趋势图（TRENDSv.cs）

#### 核心功能

**1. 趋势显示控制**

```csharp
[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern void SETPLT(ref short I);

[DllImport("chrnob_32.dll", CharSet = CharSet.Ansi, ExactSpelling = true, SetLastError = true)]
private static extern void GRINIT();

private void TRENDSv_Load(object eventSender, EventArgs eventArgs)
{
    GLOBALRX.trendsv_loaded = -1;
    short I = -1;
    SETPLT(ref I);
    MyProject.Forms.MainForm.trend_it.Enabled = false;
    Top = MyProject.Forms.MainForm.controlboard.Height;
    Left = 0;
}

private void TRENDSv_FormClosed(object eventSender, FormClosedEventArgs eventArgs)
{
    checked
    {
        if (DISPLAY.TNUM != 0)
        {
            short tNUM = DISPLAY.TNUM;
            short num = tNUM;
            while (true)
            {
                short num2 = num;
                short num3 = 9;
                if (num2 > num3)
                {
                    break;
                }
                DISPLAY.DO_TRENDSV1();
                num = (short)unchecked(num + 1);
            }
        }
        GLOBALRX.trendsv_loaded = 0;
        short I = 0;
        SETPLT(ref I);
        MyProject.Forms.MainForm.trend_it.Enabled = true;
    }
}

private void Picture1_DoubleClick(object eventSender, EventArgs eventArgs)
{
    if (~GLOBALRX.TREND_SELECT_LOADED != 0)
    {
        MyProject.Forms.MainForm.CBStatic.trend_select = new trend_select();
        Support.ShowForm(MyProject.Forms.MainForm.CBStatic.trend_select);
        MyProject.Forms.MainForm.CBStatic.trend_select.WindowState = FormWindowState.Normal;
        trend_select obj = MyProject.Forms.MainForm.CBStatic.trend_select;
        Size size = new Size(235, 463);
        obj.Size = size;
        trend_select obj2 = MyProject.Forms.MainForm.CBStatic.trend_select;
        Point location = new Point(300, 300);
        obj2.Location = location;
    }
}
```

#### 趋势图参数

| 参数 | 值 | 说明 |
|------|-----|------|
| 趋势笔数 | 10 | 最多10条趋势线 |
| 更新频率 | 实时 | 由模型定时器控制 |
| 选择器 | trend_select | 双击打开选择器 |

---

## 八、系统架构总结

### 核心设计特点

1. **模块化设计**：每个系统独立控制，通过全局变量协调
2. **实时仿真**：基于物理模型的实时计算
3. **安全第一**：多层保护系统和互锁机制
4. **人机工程**：直观的界面和清晰的报警系统
5. **故障模拟**：全面的故障模拟和培训功能

### 技术实现

- **DLL接口**：与物理模型交互
- **Windows Forms**：界面实现
- **实时参数更新**：动态显示
- **事件驱动**：控制系统
- **全局状态管理**：GLOBALRX

### 系统组件关系图

```
┌─────────────────────────────────────────────────────────────┐
│                    GLOBALRX (全局状态)                      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌─────▼──────┐  ┌──────▼───────┐
│  反应堆控制     │  │  给水系统   │  │  汽轮机系统   │
│  (reactr_0)    │  │ (feed_pmp) │  │(turbine_s)   │
└────────────────┘  └────────────┘  └──────────────┘
        │                   │                   │
┌───────▼────────┐  ┌─────▼──────┐  ┌──────▼───────┐
│  控制棒系统     │  │  加热器     │  │  辅助系统     │
│ (REACT_ROD)    │  │(feedHTR_0) │  │  (turb_aux)  │
└────────────────┘  └────────────┘  └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────▼────────┐
                    │  安全系统      │
                    │  (ALARMS)     │
                    │  (SD_COOLING) │
                    └────────────────┘
                            │
                    ┌───────▼────────┐
                    │  故障系统      │
                    │  (FO_Report)  │
                    └────────────────┘
```

### DLL函数调用关系

```
应用程序界面层
       │
       ▼
PROCMDI.cs (接口层)
       │
       ▼
chrnob_32.dll (物理模型)
       │
       ▼
反应堆物理计算
```

---

## 九、各面板详细参数控制和数据显示

### 9.1 反应堆控制棒面板（REACT_ROD.cs）

#### 可控制参数

| 控制项 | 控制方式 | 参数范围 | 功能说明 |
|--------|----------|----------|----------|
| 控制棒位置 | Spin1上/下 | 0-100%，步长0.01 | 单根控制棒精细调整 |
| 紧急插入AZ-5 | Command1按钮 | - | 所有控制棒快速插入 |
| 燃料更换 | Command2按钮 | - | 模拟燃料更换操作 |
| 控制棒组移动 | Spin2上/下 | 0-100%，步长0.01 | 整组控制棒调整 |

#### 显示数据

| 显示项 | 数据来源 | 显示格式 | 说明 |
|--------|----------|----------|------|
| 控制棒位置 | GETROD(I,j) | ##0.0% | 25组控制棒位置 |
| 燃料温度 | chltmp[I,j] | 温度单位 | 燃料通道温度 |
| 热功率 | THRZONE[n] | ##0.0% | 各区域热功率分布 |
| 燃料燃耗 | GETBUN(I,j) | ###0.0% | 燃料燃耗百分比 |
| 燃料束号 | GETBUN(I,j) | #0 | 燃料束编号 |
| 总功率 | GETMK() | ##0.00 | 反应堆总功率 |

#### 状态指示

- **燃料状态图标**：
  - 绿色：新燃料
  - 蓝色：正常燃料
  - 红色：高燃耗燃料
  - 灰色：无燃料

- **控制棒状态**：
  - Label7显示"X"表示控制棒选中

#### 关键代码

```csharp
// 显示控制棒位置
MyProject.Forms.MainForm.CBStatic.REACT_ROD.Label1[num5].Text = Support.Format(chlrod[I2, j], "##0.0%");

// 显示燃料温度
MyProject.Forms.MainForm.CBStatic.REACT_ROD.Label2[num5].Text = UNITSMDI.TEMPOUT(ref chltmp[I2, j]);

// 显示热功率
MyProject.Forms.MainForm.CBStatic.REACT_ROD.Label3[num5].Text = Support.Format(THRZONE[num5], "##0.0%");

// 显示燃料燃耗
MyProject.Forms.MainForm.CBStatic.REACT_ROD.Label12.Text = Support.Format(fUL, "###0.0%");

// 显示燃料束号
MyProject.Forms.MainForm.CBStatic.REACT_ROD.Label14.Text = "# " + Support.Format(GETBUN(ref I2, ref j), "#0");
```

---

### 9.2 反应堆功率调节面板（RX_CONTROL.cs）

#### 可控制参数

| 控制项 | 控制方式 | 参数范围 | 功能说明 |
|--------|----------|----------|----------|
| 功率设定点 | Spin1上/下 | 0-100%，步长0.005 | 设定反应堆功率 |
| 自动控制 | Image2按钮 | ON/OFF | 启用/禁用自动控制 |
| 停堆 | Image3按钮 | - | 触发反应堆停堆 |
| 轴向偏移控制 | Image4按钮 | ON/OFF | 控制轴向功率分布 |

#### 显示数据

| 显示项 | 数据来源 | 显示格式 | 说明 |
|--------|----------|----------|------|
| 功率变化率 | AVGRAT/maxiterates | ##0.0% | 反应堆功率变化率 |
| 热功率 | avgchp | ##0.0% | 平均热功率 |
| 中子通量 | FLX | ##0.0% | 中子通量百分比 |
| 中子通量对数 | log10(FLX) | 0.00 | 中子通量对数值 |
| 燃料燃耗 | GETBUN(-1,-1) | ##0.0% | 平均燃料燃耗 |
| 功率设定点 | GETSPT() | ##0.0% | 当前功率设定点 |
| 控制误差 | AVGERR/maxiterates | ##0.0% | 自动控制误差 |
| 自动控制状态 | GETAUT(1) | ON/OFF | 自动控制开关状态 |
| 轴向偏移状态 | GETAUT(2) | ON/OFF | 轴向偏移控制状态 |
| 停堆状态 | GETAUT(3) | ON/OFF | 停堆状态 |

#### 关键代码

```csharp
public static void disp_rx_control()
{
    // 显示功率变化率
    MyProject.Forms.MainForm.CBStatic.RX_CONTROL.Label5.Text = Support.Format(AVGRAT / (float)GLOBALRX.maxiterates, "##0.0%");
    
    // 显示热功率
    MyProject.Forms.MainForm.CBStatic.RX_CONTROL.Label7.Text = Support.Format(avgchp, "##0.0%");
    
    // 显示中子通量
    MyProject.Forms.MainForm.CBStatic.RX_CONTROL.Label9.Text = Support.Format(FLX, "##0.0%");
    
    // 显示中子通量对数
    MyProject.Forms.MainForm.CBStatic.RX_CONTROL.Label16.Text = Support.Format(Math.Log((double)FLX + 1E-10) / Math.Log(10.0), "0.00");
    
    // 显示燃料燃耗
    short I = -1;
    short j = -1;
    MyProject.Forms.MainForm.CBStatic.RX_CONTROL.Label19.Text = Support.Format(GETBUN(ref I, ref j), "##0.0%");
    
    // 显示功率设定点
    MyProject.Forms.MainForm.CBStatic.RX_CONTROL.Label4.Text = Support.Format(GETSPT(), "##0.0%");
    
    // 显示控制误差
    MyProject.Forms.MainForm.CBStatic.RX_CONTROL.Label3.Text = Support.Format(AVGERR / (float)GLOBALRX.maxiterates, "##0.0%");
}
```

---

### 9.3 再循环泵面板（maincp1.cs & maincp2.cs）

#### 可控制参数

| 控制项 | 控制方式 | 参数范围 | 功能说明 |
|--------|----------|----------|----------|
| 泵启动/停止 | Command1按钮 | ON/OFF | 每台泵独立控制 |
| 入口阀 | Command1按钮 | OPEN/CLOSE | 入口阀门控制 |
| 出口阀 | Command1按钮 | OPEN/CLOSE | 出口阀门控制 |
| 流量微调 | Spin1上/下 | ±0.02步长 | 流量精细调整 |

#### 显示数据

| 显示项 | 数据来源 | 显示格式 | 说明 |
|--------|----------|----------|------|
| 入口阀开度 | PMPVLV[0-5] | ##0.0% | 入口阀门开度 |
| 出口阀开度 | PMPVLV[6-11] | ##0.0% | 出口阀门开度 |
| 总流量 | CIRFLO[0/1] | 流量单位 | 回路总流量 |
| 泵状态 | GETPMP(I,j) | ON/OFF | 泵运行状态 |

#### 关键代码

```csharp
// 显示入口阀开度
MyProject.Forms.MainForm.CBStatic.maincp1.Label11[num].Text = Support.Format(PMPVLV[num], "##0.0%");

// 显示出口阀开度
MyProject.Forms.MainForm.CBStatic.maincp1.Label17[num].Text = Support.Format(PMPVLV[num + 6], "##0.0%");

// 显示总流量
MyProject.Forms.MainForm.CBStatic.maincp1.Label10.Text = UNITSMDI.FLOWOUT1(ref CIRFLO[0]);
```

---

### 9.4 应急冷却泵面板（ECC_CONTROL.cs）

#### 可控制参数

| 控制项 | 控制方式 | 参数范围 | 功能说明 |
|--------|----------|----------|----------|
| 高压注水泵 | Image2按钮 | START/STOP | 高压注水系统 |
| 低压注水泵 | Image3按钮 | START/STOP | 低压注水系统 |
| 安全注水阀 | Image4按钮 | OPEN/CLOSE | 安全注水控制 |
| 应急冷却泵 | Image6按钮 | START/STOP | 应急冷却系统 |
| 设定点调整 | Spin1上/下 | ±50 | 注水流量设定 |

#### 显示数据

| 显示项 | 数据来源 | 显示格式 | 说明 |
|--------|----------|----------|------|
| ECC冷却流量 | GETECC(4,0,0) | 流量单位 | 应急冷却流量 |
| 高压注水流量 | GETECC(4,0,1) | 流量单位 | 高压注水流量 |
| 低压注水流量 | GETECC(4,0,2) | 流量单位 | 低压注水流量 |
| 安全注水阀开度 | GETECC(4,0,4) | ##0.0% | 安全注水阀开度 |
| 应急冷却泵流量 | GETECC(4,0,3) | 流量单位 | 应急冷却泵流量 |
| 泵转速 | GETECC(6,0,0) | ####0. | 泵转速 |
| 泵流量 | GETECC(6,0,1) | ####0. | 泵流量 |

#### 关键代码

```csharp
// 获取ECC参数
short id = 4;
short I = 0;
short j = 0;
GETECC(ref id, ref I, ref j, ref valu[0]);

// 显示ECC冷却流量
MyProject.Forms.MainForm.CBStatic.ECC_CONTROL.Label2.Text = UNITSMDI.FLOWOUT1(ref valu[0]);

// 显示高压注水流量
MyProject.Forms.MainForm.CBStatic.ECC_CONTROL.Label1[0].Text = UNITSMDI.FLOWOUT1(ref valu[1]);

// 显示低压注水流量
MyProject.Forms.MainForm.CBStatic.ECC_CONTROL.Label1[1].Text = UNITSMDI.FLOWOUT1(ref valu[2]);

// 显示安全注水阀开度
MyProject.Forms.MainForm.CBStatic.ECC_CONTROL.Label1[2].Text = Support.Format(valu[4], "##0.0%");

// 显示应急冷却泵流量
MyProject.Forms.MainForm.CBStatic.ECC_CONTROL.Label1[5].Text = UNITSMDI.FLOWOUT1(ref valu[3]);
```

---

### 9.5 汽轮机控制面板（turbine_s_ctrl.cs）

#### 可控制参数

| 控制项 | 控制方式 | 参数范围 | 功能说明 |
|--------|----------|----------|----------|
| 汽轮机转速 | Spin1上/下 | 0-9000步长 | 转速设定（每步900kW） |
| 负荷控制 | Spin2上/下 | 0-100% | 发电机负荷 |
| 压力设定点 | Text1输入 | 压力单位 | 蒸汽压力设定 |
| 自动调速器 | Image2按钮 | ON/OFF | 自动调速控制 |
| 阀门选择 | Image3按钮 | MAIN/STARTUP | 主阀/启动阀 |
| 发电机断路器 | Image4按钮 | OPEN/CLOSE | 发电机并网 |
| 盘车装置 | Image5按钮 | ON/OFF | 汽轮机盘车 |

#### 显示数据

| 显示项 | 数据来源 | 显示格式 | 说明 |
|--------|----------|----------|------|
| 汽轮机转速 | GETTRB(4,X) | ###0.0 RPM | 汽轮机实际转速 |
| 负荷百分比 | GETTRB(1,X) | ##0.0% | 发电机负荷 |
| 蒸汽压力 | GETTRB(3,X) | 压力单位 | 蒸汽压力 |
| 蒸汽温度 | GETTRB(2,X) | ##0.0% | 蒸汽温度 |
| 鼓筒压力 | GETDRM(0,X) | 压力单位 | 蒸汽鼓筒压力 |
| 差胀 | GETTRB(16,X) | 差胀单位 | 汽轮机差胀 |
| 振动 | GETTRB(41,X) | ##0.0% | 振动水平 |
| 阀门控制信号 | GETTRB(15,X) | ##0.0 | 阀门开度信号 |
| 发电机负荷 | GETTRB(9,X) | ##0.0% | 实际发电机负荷 |

#### 仪表显示

- **转速表**：0-4000 RPM
- **负荷表**：0-200 MW
- **差胀表**：正负差胀显示

#### 关键代码

```csharp
// 显示汽轮机转速
short I = 4;
float X = default(float);
short tRB = GETTRB(ref X, ref I);
MyProject.Forms.MainForm.CBStatic.turbine_s_ctrl.Label1[5].Text = Support.Format(X, "###0.0");

// 显示负荷百分比
I = 1;
tRB = GETTRB(ref X, ref I);
MyProject.Forms.MainForm.CBStatic.turbine_s_ctrl.Label1[9].Text = Support.Format(X, "##0.0%");

// 显示蒸汽温度
I = 2;
float X3 = default(float);
tRB = GETTRB(ref X3, ref I);
MyProject.Forms.MainForm.CBStatic.turbine_s_ctrl.Label1[10].Text = Support.Format(X3, "##0.0%");

// 显示鼓筒压力
I = 0;
X = GETDRM(ref I);
MyProject.Forms.MainForm.CBStatic.turbine_s_ctrl.Label1[12].Text = UNITSMDI.PRESSOUT2(ref X);

// 显示振动
I = 41;
tRB = GETTRB(ref X2, ref I);
MyProject.Forms.MainForm.CBStatic.turbine_s_ctrl._Gauge2_0.Max = 200f;
MyProject.Forms.MainForm.CBStatic.turbine_s_ctrl._Gauge2_0.Min = 0f;
X2 = (float)(100.0 * (double)X2 + 0.5);
MyProject.Forms.MainForm.CBStatic.turbine_s_ctrl._Gauge2_0.Value = Conversion.Int(X2);
```

---

### 9.6 凝汽器系统面板（cndsr_v.cs）

#### 可控制参数

| 控制项 | 控制方式 | 参数范围 | 功能说明 |
|--------|----------|----------|----------|
| 真空泵 | Image2按钮 | ON/OFF | 主真空泵控制 |
| 备用真空泵 | Image3按钮 | ON/OFF | 备用真空泵控制 |
| 蒸汽喷射器 | Image4按钮 | ON/OFF | 蒸汽喷射器控制 |

#### 显示数据

| 显示项 | 数据来源 | 显示格式 | 说明 |
|--------|----------|----------|------|
| 凝汽器压力 | GETCND(0,X) | 压力单位 | 凝汽器真空度 |
| 凝汽器温度 | GETCND(1,X) | 温度单位 | 凝汽器温度 |
| 蒸汽喷射流量 | GETCND(29,X) | 流量单位 | 蒸汽喷射流量 |
| 真空泵状态 | GETCND(21,X) | ON/OFF | 真空泵运行状态 |
| 蒸汽喷射器状态 | GETCND(22,X) | ON/OFF | 蒸汽喷射器状态 |

#### 关键代码

```csharp
// 显示凝汽器压力
short I = 0;
float P = GETCND(ref I);
MyProject.Forms.MainForm.CBStatic.cndsr_v.Label10[0].Text = UNITSMDI.PRESSOUT3(ref P);

// 显示凝汽器温度
I = 1;
P = GETCND(ref I);
MyProject.Forms.MainForm.CBStatic.cndsr_v.Label10[1].Text = UNITSMDI.TEMPOUT(ref P);

// 显示蒸汽喷射流量
I = 29;
P = GETCND(ref I);
MyProject.Forms.MainForm.CBStatic.cndsr_v.Label10[2].Text = UNITSMDI.FLOWOUT1(ref P);

// 显示真空泵状态
I = 21;
if ((double)GETCND(ref I) > 0.5)
{
    MyProject.Forms.MainForm.CBStatic.cndsr_v.Label4[18].ForeColor = ColorTranslator.FromOle(Information.QBColor(12));
    MyProject.Forms.MainForm.CBStatic.cndsr_v.Label4[19].ForeColor = ColorTranslator.FromOle(Information.QBColor(4));
}
```

---

### 9.7 给水系统面板（feed_pmp.cs）

#### 可控制参数

| 控制项 | 控制方式 | 参数范围 | 功能说明 |
|--------|----------|----------|----------|
| 给水泵启动/停止 | Command1按钮 | ON/OFF | 每台泵独立控制 |
| 入口阀 | Command1按钮 | OPEN/CLOSE | 入口阀门控制 |
| 出口阀 | Command1按钮 | OPEN/CLOSE | 出口阀门控制 |
| 主给水阀 | Command2按钮 | OPEN/CLOSE | 主给水阀控制 |
| 启动阀 | Command3按钮 | OPEN/CLOSE | 启动阀控制 |
| 三元件控制 | Command4按钮 | OPEN/CLOSE | 三元件控制阀 |
| 水位设定点 | Text1输入 | 水位单位 | 鼓筒水位设定 |
| 自动/手动 | Image5按钮 | AUTO/MAN | 水位控制模式 |

#### 显示数据

| 显示项 | 数据来源 | 显示格式 | 说明 |
|--------|----------|----------|------|
| 给水流量 | GETFED(1) | 流量单位 | 总给水流量 |
| 蒸汽流量 | GETFED(2) | 流量单位 | 蒸汽流量 |
| 鼓筒水位 | GETFED(3) | 水位单位 | 鼓筒水位 |
| 鼓筒温度 | GETFED(4) | 温度单位 | 鼓筒温度 |
| 鼓筒压力 | GETFED(5) | 压力单位 | 鼓筒压力 |
| 水位设定点 | GETFED(13) | 水位单位 | 水位设定点 |
| 主给水阀开度 | GETFED(6) | ##0.0% | 主给水阀开度 |
| 启动阀开度 | GETFED(7) | ##0.0% | 启动阀开度 |
| 三元件阀开度 | GETFED(8) | ##0.0% | 三元件阀开度 |
| 隔离阀开度 | GETISO(I,j) | 00.0% | 各泵隔离阀开度 |
| 泵流量 | GETFED(I) | ##0.0% | 各泵流量 |

#### 关键代码

```csharp
// 显示给水流量
short I = 1;
float F = GETFED(ref I);
MyProject.Forms.MainForm.CBStatic.feed_pmp.Label10[5].Text = UNITSMDI.FLOWOUT1(ref F);

// 显示蒸汽流量
I = 2;
F = GETFED(ref I);
MyProject.Forms.MainForm.CBStatic.feed_pmp.Label10[6].Text = UNITSMDI.FLOWOUT1(ref F);

// 显示鼓筒水位
I = 3;
F = GETFED(ref I);
MyProject.Forms.MainForm.CBStatic.feed_pmp.Label10[0].Text = UNITSMDI.LEVLOUT1(ref F);

// 显示鼓筒温度
I = 4;
F = GETFED(ref I);
MyProject.Forms.MainForm.CBStatic.feed_pmp.Label10[1].Text = UNITSMDI.TEMPOUT(ref F);

// 显示鼓筒压力
I = 5;
F = GETFED(ref I);
MyProject.Forms.MainForm.CBStatic.feed_pmp.Label10[2].Text = UNITSMDI.PRESSOUT2(ref F);

// 显示隔离阀开度
short I2 = 0;
short j = 0;
MyProject.Forms.MainForm.CBStatic.feed_pmp.Label3[num].Text = Support.Format(GETISO(ref I2, ref j), "00.0%");
```

---

### 9.8 数据趋势图面板（TRENDSv.cs）

#### 可控制参数

| 控制项 | 控制方式 | 参数范围 | 功能说明 |
|--------|----------|----------|----------|
| 趋势选择 | 双击打开选择器 | 最多10条 | 选择要显示的趋势 |
| 趋势偏移 | Spin1上/下 | ±1 | 调整趋势线垂直偏移 |
| 趋势显示 | Picture1双击 | ON/OFF | 显示/隐藏趋势图 |

#### 显示数据

| 显示项 | 数据来源 | 显示格式 | 说明 |
|--------|----------|----------|------|
| 趋势线1-10 | GETYS(GR,XD,XM,LY1,LY2) | 实时曲线 | 最多10条趋势线 |
| 趋势名称 | GTPNAM(n,lp) | 文本 | 趋势参数名称 |
| 趋势单位 | GTPUNI(n,lp) | 文本 | 趋势参数单位 |
| 趋势颜色 | GETPCL(GR) | RGB | 趋势线颜色 |
| 趋势参数 | GETPPX(I) | 参数ID | 趋势参数编号 |

#### 可选趋势参数（最多30个）

通过`trend_select`面板选择，包括但不限于：
- 反应堆功率
- 中子通量
- 控制棒位置
- 燃料温度
- 给水流量
- 蒸汽流量
- 汽轮机转速
- 凝汽器压力
- 等等...

#### 关键代码

```csharp
// 获取趋势数据
short GR = (short)(TNUM + 1);
XDOT_value = GETYS(ref GR, ref XD, ref XM, ref _0024STATIC_0024DO_TRENDSV_0024001_0024X1[0], ref _0024STATIC_0024DO_TRENDSV_0024001_0024X2[0]);

// 获取趋势笔颜色
GETPEN(ref _0024STATIC_0024DO_TRENDSV_0024001_0024xPEN[0]);

// 获取趋势参数编号
short n = GETPPX(ref GR);

// 获取趋势名称
FixedLengthString fixedLengthString = new FixedLengthString(25);
string lp = fixedLengthString.Value;
GTPNAM(ref n, ref lp);

// 获取趋势单位
FixedLengthString fixedLengthString2 = new FixedLengthString(20);
lp = fixedLengthString2.Value;
GTPUNI(ref n, ref lp);
```

#### 趋势图特性

- **实时更新**：由模型定时器控制
- **历史数据**：显示最近100个数据点
- **多参数对比**：最多10条趋势线同时显示
- **颜色区分**：每条趋势线独立颜色
- **垂直偏移**：可调整趋势线垂直位置以便对比

---

### 9.9 HEPA过滤器控制面板（HEPA_FLTR.cs）

#### 可控制参数

| 控制项 | 控制方式 | 参数范围 | 功能说明 |
|--------|----------|----------|----------|
| 通风阀 | Image2按钮 | OPEN/CLOSE | 主通风阀控制 |
| 旁路阀 | Image3按钮 | OPEN/CLOSE | 旁路阀控制 |

#### 显示数据

| 显示项 | 数据来源 | 显示格式 | 说明 |
|--------|----------|----------|------|
| 通风流量 | GETHEP(1,X) | 流量单位 | 通风流量 |
| 旁路流量 | GETHEP(2,X) | 流量单位 | 旁路流量 |
| 入口辐射 | GETHEP(0,X) | 辐射单位 | 入口辐射水平 |
| 出口辐射 | GETHEP(3,X) | 辐射单位 | 出口辐射水平 |

#### 关键代码

```csharp
// 显示通风流量
short I = 1;
float X = default(float);
short tRB = GETHEP(ref X, ref I);
MyProject.Forms.MainForm.CBStatic.HEPA_FLTR.Label4[1].Text = UNITSMDI.FLOWOUT1(ref X);

// 显示旁路流量
I = 2;
tRB = GETHEP(ref X, ref I);
MyProject.Forms.MainForm.CBStatic.HEPA_FLTR.Label4[2].Text = UNITSMDI.FLOWOUT1(ref X);
```

---

### 9.10 除氧器控制面板（deaer_P_CTRL.cs & deaer_L_CTRL.cs）

#### 可控制参数

| 控制项 | 控制方式 | 参数范围 | 功能说明 |
|--------|----------|----------|----------|
| 蒸汽压力控制 | Image1按钮 | AUTO/MAN | 压力控制模式 |
| 水位控制 | Image2按钮 | AUTO/MAN | 水位控制模式 |
| 再生流量阀 | Image3按钮 | OPEN/CLOSE | 再生流量控制 |
| 补水流量阀 | Image4按钮 | OPEN/CLOSE | 补水流量控制 |

#### 显示数据

| 显示项 | 数据来源 | 显示格式 | 说明 |
|--------|----------|----------|------|
| 除氧器温度 | GETDAR(4,X) | 温度单位 | 除氧器温度 |
| 除氧器压力 | GETDAR(5,X) | 压力单位 | 除氧器压力 |
| 除氧器水位 | GETDAR(3,X) | 水位单位 | 除氧器水位 |
| 给水流量 | GETFED(1) | 流量单位 | 给水流量 |
| 蒸汽流量 | GETDAR(8,X) | 流量单位 | 蒸汽流量 |
| 补水流量 | GETDAR(18,X) | 流量单位 | 补水流量 |
| 再生流量 | GETDAR(1,X) | 流量单位 | 再生流量 |
| 补水流量 | GETDAR(7,X) | 流量单位 | 补水流量 |
| 水位设定点 | GETDAR(9,X) | 水位单位 | 水位设定点 |

#### 关键代码

```csharp
// 显示除氧器温度
short I = 4;
float X = default(float);
short dAR = GETDAR(ref X, ref I);
MyProject.Forms.MainForm.CBStatic.DEAER_0.Label1[4].Text = UNITSMDI.TEMPOUT(ref X);

// 显示除氧器压力
I = 5;
dAR = GETDAR(ref X, ref I);
MyProject.Forms.MainForm.CBStatic.DEAER_0.Label1[2].Text = UNITSMDI.PRESSOUT2(ref X);

// 显示除氧器水位
I = 3;
dAR = GETDAR(ref X, ref I);
MyProject.Forms.MainForm.CBStatic.DEAER_0.Label1[3].Text = UNITSMDI.LEVLOUT1(ref X);
```

---

### 9.11 其他辅助面板

#### 排水控制面板（Drain_ctrl.cs）

| 显示项 | 数据来源 | 显示格式 | 说明 |
|--------|----------|----------|------|
| 排水流量 | GETFED(6) | 流量单位 | 排水流量 |
| 排水阀开度 | GETFED(14) | ##0.0% | 排水阀开度 |
| 水位设定点 | GETFED(13) | 水位单位 | 水位设定点 |

#### 凝汽器热井液位控制（HOTW_LEVEL_CTRL.cs）

| 显示项 | 数据来源 | 显示格式 | 说明 |
|--------|----------|----------|------|
| 热井水位 | GETCND(2,X) | 水位单位 | 热井水位 |
| 热井温度 | GETCND(3,X) | 温度单位 | 热井温度 |
| 热井压力 | GETCND(4,X) | 压力单位 | 热井压力 |

#### 补水系统（COND_MAKEUP.cs）

| 显示项 | 数据来源 | 显示格式 | 说明 |
|--------|----------|----------|------|
| 补水流量 | GETDAR(24,X) | ##0.0% | 补水流量 |
| 补水阀开度 | GETDAR(25,X) | ##0.0% | 补水阀开度 |
| 凝结水流量 | GETDAR(28,X) | 流量单位 | 凝结水流量 |

#### 汽轮机辅助系统（turb_aux.cs）

| 显示项 | 数据来源 | 显示格式 | 说明 |
|--------|----------|----------|------|
| 润滑油压力 | GETTRB(37,X) | 压力单位 | 润滑油压力 |
| 冷却水压力 | GETTRB(38,X) | 压力单位 | 冷却水压力 |
| 密封水压力 | GETTRB(39,X) | 压力单位 | 密封水压力 |
| 盘车状态 | GETTRB(33,X) | ON/OFF | 盘车装置状态 |
| 顶轴油泵 | GETTRB(34,X) | ON/OFF | 顶轴油泵状态 |
| 排汽阀 | GETTRB(35,X) | ON/OFF | 排汽阀状态 |
| 疏水阀 | GETTRB(36,X) | ON/OFF | 疏水阀状态 |

---

## 十、数据获取函数总结

### DLL函数接口

| 函数名 | 功能说明 | 返回值 |
|--------|----------|--------|
| `GETMK()` | 获取反应堆功率 | float |
| `GETFLX()` | 获取中子通量 | float |
| `GETXE(ref short I)` | 获取氙/碘浓度 | float |
| `GETTHR(ref float lPARAM)` | 获取热功率分布 | void |
| `GETROD(ref short I, ref short j)` | 获取控制棒位置 | float |
| `GETERR()` | 获取控制误差 | float |
| `GETSPT()` | 获取功率设定点 | float |
| `GETAUT(ref short I)` | 获取自动控制状态 | short |
| `GETFED(ref short I)` | 获取给水系统参数 | float |
| `GETISO(ref short I, ref short j)` | 获取隔离阀开度 | float |
| `GETCND(ref short I)` | 获取凝汽器参数 | float |
| `GETTRB(ref float X, ref short I)` | 获取汽轮机参数 | short |
| `GETECC(ref short id, ref short I, ref short j, ref float lPARAM)` | 获取ECC参数 | void |
| `GETDAR(ref float X, ref short I)` | 获取除氧器参数 | short |
| `GETDRM(ref short I)` | 获取鼓筒参数 | float |
| `GETPCL(ref short GR)` | 获取趋势颜色 | short |
| `GETPPX(ref short I)` | 获取趋势参数 | short |
| `GETYS(ref short GR, ref short XD, ref short XM, ref short LY1, ref short LY2)` | 获取趋势数据 | short |
| `GTPNAM(ref short n, ref string lp)` | 获取趋势名称 | void |
| `GTPUNI(ref short n, ref string lp)` | 获取趋势单位 | void |

### 单位转换函数

| 函数名 | 功能说明 | 输入/输出 |
|--------|----------|----------|
| `UNITSMDI.FLOWOUT1(ref float F)` | 流量输出格式化 | float → string |
| `UNITSMDI.FLOWOUT2(ref float F)` | 流量输出格式化2 | float → string |
| `UNITSMDI.FLOWOUT3(ref float F)` | 流量输出格式化3 | float → string |
| `UNITSMDI.PRESSOUT2(ref float P)` | 压力输出格式化 | float → string |
| `UNITSMDI.PRESSOUT3(ref float P)` | 压力输出格式化3 | float → string |
| `UNITSMDI.TEMPOUT(ref float T)` | 温度输出格式化 | float → string |
| `UNITSMDI.LEVLOUT1(ref float L)` | 水位输出格式化 | float → string |
| `UNITSMDI.LENTOUT1(ref float L)` | 长度输出格式化 | float → string |
| `UNITSMDI.LENTOUT2(ref float L)` | 长度输出格式化2 | float → string |

---

## 十一、总结

本报告详细分析了CHRNOBYL RBMK-1000模拟器的22个主要面板，包括：

1. **反应堆控制系统**：控制棒、功率调节、再循环泵
2. **安全系统**：应急冷却泵、堆芯离线冷却
3. **汽轮机系统**：汽轮机控制、辅助系统
4. **给水系统**：给水泵、除氧器、凝结水
5. **凝汽器系统**：真空系统、热井控制
6. **辅助系统**：HEPA过滤器、补水系统
7. **监控系统**：数据趋势图、报警系统

每个面板都提供了详细的参数控制和数据显示，通过DLL接口与物理模型实时交互，实现了完整的核电站操作模拟。

该模拟器准确地反映了RBMK-1000反应堆的复杂操作特性，为操作员培训和系统分析提供了逼真的环境。

---

## 十二、面板显示机制和控制元素详细分析

### 12.1 反应堆控制棒面板堆芯示意图显示机制

#### 界面结构

堆芯示意图使用 `Picture2` 作为主容器（Panel），在其中放置了25个 `Image2` 控件（PictureBox数组），对应5×5的控制棒网格布局。

```csharp
// Picture2 是主容器
private Panel _Picture2;

// Image2 是包含25个PictureBox的数组，对应5×5网格
private PictureBoxArray _Image2;

// Image4 包含5种不同的燃料状态图标
private PictureBoxArray _Image4;

// Image6 包含2个控制棒移动模式图标
private PictureBoxArray _Image6;
```

#### 燃料状态图标

`Image4` 数组包含5种不同的燃料状态图标，用于显示每个燃料通道的状态：

| 图标索引 | 燃料状态 | 颜色 | 燃耗条件 |
|----------|----------|------|----------|
| Image4[0] | 新燃料 | 绿色 | bUN > 9.0% |
| Image4[1] | 无燃料 | 灰色 | bUN == 0.0% |
| Image4[2] | 正常燃料 | 蓝色 | 2.0% < bUN ≤ 7.0% |
| Image4[3] | 高燃耗燃料 | 红色 | 7.0% ≤ bUN ≤ 9.0% |
| Image4[4] | 燃料更换中 | 特殊图标 | FULRUP[num5] ≥ 0.1 |

#### 燃料状态判断逻辑

通过 `GETBUN(I,j)` 获取燃料燃耗百分比，根据燃耗值选择对应的图标：

```csharp
float bUN = GETBUN(ref I2, ref j);

if ((double)FULRUP[num5] < 0.1)  // 不在燃料更换中
{
    if ((double)bUN > 9.0)  // 新燃料
    {
        MyProject.Forms.MainForm.CBStatic.REACT_ROD.Image2[num5].Image = 
            MyProject.Forms.MainForm.CBStatic.REACT_ROD.Image4[0].Image;
    }
    else if ((double)bUN >= 7.0)  // 高燃耗燃料
    {
        MyProject.Forms.MainForm.CBStatic.REACT_ROD.Image2[num5].Image = 
            MyProject.Forms.MainForm.CBStatic.REACT_ROD.Image4[3].Image;
    }
    else if ((double)bUN > 2.0)  // 正常燃料
    {
        MyProject.Forms.MainForm.CBStatic.REACT_ROD.Image2[num5].Image = 
            MyProject.Forms.MainForm.CBStatic.REACT_ROD.Image4[2].Image;
    }
    else if ((double)bUN == 0.0)  // 无燃料
    {
        MyProject.Forms.MainForm.CBStatic.REACT_ROD.Image2[num5].Image = 
            MyProject.Forms.MainForm.CBStatic.REACT_ROD.Image4[1].Image;
    }
}
else  // 燃料更换中
{
    MyProject.Forms.MainForm.CBStatic.REACT_ROD.Image2[num5].Image = 
        MyProject.Forms.MainForm.CBStatic.REACT_ROD.Image4[4].Image;
}
```

#### 控制棒选中指示

`Label7` 数组（3个元素）用于显示控制棒选中状态，当选中控制棒时显示"X"：

```csharp
for (num5 = 0; num5 <= 2; num5++)
{
    float num8 = num5;
    I = 1;
    if (num8 == Conversion.Int(GETMOV(ref I)) - 1f)
    {
        MyProject.Forms.MainForm.CBStatic.REACT_ROD.Label7[num5].Text = "X";
    }
    else
    {
        MyProject.Forms.MainForm.CBStatic.REACT_ROD.Label7[num5].Text = "";
    }
}
```

#### 控制棒移动模式指示

`Image6` 数组包含2个图标，用于显示控制棒移动模式：

```csharp
I = 2;
if ((double)GETMOV(ref I) != 0.0)
{
    // 模式1：显示Image6[0]，隐藏Image6[1]
    MyProject.Forms.MainForm.CBStatic.REACT_ROD.Image6[0].Visible = true;
    MyProject.Forms.MainForm.CBStatic.REACT_ROD.Image6[1].Visible = false;
}
else
{
    // 模式2：显示Image6[1]，隐藏Image6[0]
    MyProject.Forms.MainForm.CBStatic.REACT_ROD.Image6[1].Visible = true;
    MyProject.Forms.MainForm.CBStatic.REACT_ROD.Image6[0].Visible = false;
}
```

#### 背景颜色高亮

根据燃料状态和位置，对标签进行背景颜色高亮：

```csharp
// 燃料监控或目标燃料高亮
if ((((short)(0 - ((GLOBALRX.fuel_target == num5) ? 1 : 0)) & GLOBALRX.fuel_new_flag) | 
    (GLOBALRX.fuel_monitor_flag & (short)(0 - ((GLOBALRX.fuel_monitor == num5) ? 1 : 0)))) != 0)
{
    MyProject.Forms.MainForm.CBStatic.REACT_ROD.Label1[num5].BackColor = 
        ColorTranslator.FromOle(Information.QBColor(9));  // 浅蓝色高亮
    MyProject.Forms.MainForm.CBStatic.REACT_ROD.Label2[num5].BackColor = 
        ColorTranslator.FromOle(Information.QBColor(9));
    MyProject.Forms.MainForm.CBStatic.REACT_ROD.Label3[num5].BackColor = 
        ColorTranslator.FromOle(Information.QBColor(9));
}
```

#### 显示数据更新

每个燃料通道显示三个数据标签：

- **Label1**：控制棒位置百分比（chlrod[I,j]）
- **Label2**：燃料温度（chltmp[I,j]）
- **Label3**：热功率分布（THRZONE[num5]）

```csharp
MyProject.Forms.MainForm.CBStatic.REACT_ROD.Label1[num5].Text = 
    Support.Format(chlrod[I2, j], "##0.0%");
MyProject.Forms.MainForm.CBStatic.REACT_ROD.Label2[num5].Text = 
    UNITSMDI.TEMPOUT(ref chltmp[I2, j]);
MyProject.Forms.MainForm.CBStatic.REACT_ROD.Label3[num5].Text = 
    Support.Format(THRZONE[num5], "##0.0%");
```

---

### 12.2 CRT示意图显示机制

#### 界面结构

CRT示意图使用多个PictureBox数组来显示系统流程图和设备状态：

```csharp
// Picture1：包含21个PictureBox，显示流程图中的设备状态
private PictureBoxArray _Picture1;

// Image1-Image8：包含不同状态的图标（每个2个：开/关或运行/停止）
private PictureBoxArray _Image1;  // 再循环泵状态
private PictureBoxArray _Image2;  // 给水泵状态
private PictureBoxArray _Image3;  // 凝汽器状态
private PictureBoxArray _Image4;  // 除氧器阀状态
private PictureBoxArray _Image5;  // 除氧器阀状态
private PictureBoxArray _Image6;  // 堆芯离线冷却泵状态
private PictureBoxArray _Image7;  // 堆芯离线冷却泵状态
private PictureBoxArray _Image8;  // ECC状态

// Label1：包含33个标签，显示各种参数
private PictureBoxArray _Label1;
```

#### 设备状态图标映射

| Picture索引 | 设备名称 | 状态判断函数 | 图标数组 | 状态条件 |
|------------|----------|--------------|----------|----------|
| 0-2 | 再循环泵A | CIRPMP[num] | Image1 | >0.5运行，否则停止 |
| 3-5 | 给水泵 | GETFED(I) | Image2 | >0.5运行，否则停止 |
| 6-8 | 凝汽器 | GETCND(I) | Image3 | >0.5运行，否则停止 |
| 9-11 | 凝汽器 | GETCND(I) | Image1 | >0.5运行，否则停止 |
| 12 | ECC安全注水 | GETECC() | Image8 | valu[7]>0.5激活 |
| 13 | ECC高压注水 | GETECC() | Image4 | valu[5]>0.5激活 |
| 14 | ECC低压注水 | GETECC() | Image5 | valu[6]>0.5激活 |
| 15 | 除氧器再生阀 | GETDAR(22) | Image4 | >0.5打开 |
| 16 | 除氧器补水阀 | GETDAR(23) | Image5 | >0.5打开 |
| 19 | 堆芯离线冷却泵1 | GETSDC(1) | Image6 | PMPVLV[0]>0.5运行 |
| 20 | 堆芯离线冷却泵2 | GETSDC(2) | Image7 | PMPVLV[0]>0.5运行 |

#### 图标切换逻辑

每个设备位置根据系统状态在两种图标之间切换：

```csharp
// 再循环泵状态（Picture1[0-2]）
for (num = 0; num <= 2; num++)
{
    if ((double)CIRPMP[num] > 0.5)
    {
        // 运行状态：显示Image1[1]
        MyProject.Forms.MainForm.CBStatic.SCEMAT_0.Picture1[num].Image = 
            MyProject.Forms.MainForm.CBStatic.SCEMAT_0.Image1[1].Image;
    }
    else
    {
        // 停止状态：显示Image1[0]
        MyProject.Forms.MainForm.CBStatic.SCEMAT_0.Picture1[num].Image = 
            MyProject.Forms.MainForm.CBStatic.SCEMAT_0.Image1[0].Image;
    }
}
```

#### 参数数据显示

Label1数组显示33个不同的参数：

| Label索引 | 参数名称 | 数据来源 | 显示格式 |
|-----------|----------|----------|----------|
| 0 | 鼓筒水位1 | GETDRM(2) | 水位单位 |
| 1 | 鼓筒水位2 | GETDRM(2) | 水位单位 |
| 2 | 除氧器水位 | GETDAR(23) | 水位单位 |
| 3 | 凝汽器水位 | GETCND(34) | 水位单位 |
| 4 | 堆芯温度1 | SDTEMP[0] | 温度单位 |
| 5 | 堆芯温度2 | SDTEMP[1] | 温度单位 |
| 6 | 堆芯温度3 | SDTEMP[0] | 温度单位 |
| 7 | 堆芯温度4 | SDTEMP[1] | 温度单位 |
| 8 | 鼓筒压力 | GETDRM(0) | 压力单位 |
| 9 | 鼓筒温度 | GETDRM(1) | 温度单位 |
| 10 | 蒸汽流量 | GETDRM(3) | 流量单位 |
| 11 | 给水流量 | GETDRM(4) | 流量单位 |
| 12 | 蒸汽流量 | GETDRM(4) | 流量单位 |
| 13 | 汽轮机转速 | GETTRB(9) | ###0 RPM |
| 14 | 汽轮机功率 | GETTRB(15) | ###0 MW |
| 15 | ECC流量 | GETECC(4,0,0) | 流量单位 |
| 16 | ECC总流量 | valu[1]+valu[2] | 流量单位 |
| 17 | 除氧器参数1 | GETDAR(24) | ##0.0% |
| 18 | 除氧器参数2 | GETDAR(25) | ##0.0% |
| 19 | 除氧器流量1 | GETDAR(20) | 流量单位 |
| 20 | 除氧器流量2 | GETDAR(21) | 流量单位 |
| 21 | HEPA过滤效率 | HEPAGT(3) | ##0.00% |
| 22 | 给水流量 | GETFED(1) | 流量单位 |
| 23 | 除氧器流量 | GETDAR(17) | 流量单位 |
| 24 | 凝汽器流量 | GETCND(29) | 流量单位 |
| 25 | 蒸汽流量 | GETTRB(10) | 流量单位 |
| 26 | 除氧器流量 | GETDAR(8) | 流量单位 |
| 27 | 给水流量 | GETFED(6) | 流量单位 |
| 28 | 离子交换器1 | IXCLGT(6) | ##0.00% |
| 29 | 离子交换器2 | IXCLGT(15) | ##0.00% |
| 30 | 再生流量1 | IXCLGT(3) | REGEN或流量 |
| 31 | 再生流量2 | IXCLGT(4) | REGEN或流量 |
| 32 | 凝汽器真空 | GETCND(23) | 压力单位 |

#### 特殊显示逻辑

某些标签根据系统状态显示不同的文本：

```csharp
// 再生流量显示
if ((double)num8 < 0.0)  // 再生模式
{
    MyProject.Forms.MainForm.CBStatic.SCEMAT_0.Label1[30].Text = "REGEN";
}
else if ((double)F2 < 0.0)  // 无流量
{
    F = 0f;
    MyProject.Forms.MainForm.CBStatic.SCEMAT_0.Label1[30].Text = UNITSMDI.FLOWOUT1(ref F);
}
else  // 正常流量
{
    MyProject.Forms.MainForm.CBStatic.SCEMAT_0.Label1[30].Text = UNITSMDI.FLOWOUT1(ref F2);
}
```

#### 实时更新机制

CRT示意图通过 `disp_scemat_0()` 函数实时更新：

```csharp
public static void disp_scemat_0()
{
    // 更新设备状态图标
    // 更新参数数据显示
    // 根据系统状态切换图标
}
```

---

### 12.3 所有面板控制元素详细总结

#### 12.3.1 反应堆功率调节面板（RX_CONTROL.cs）

##### 控制元素

**Spin2_0/Spin2_1**：功率设定点调整滑条
- SpinUp：增加功率设定点（+0.005到+0.095）
- SpinDown：减少功率设定点（-0.005到-0.095）
- 调用函数：`PROCMDI.SETSPT(ref X, ref I)`

**Image2_0/Image2_1**：自动控制模式切换
- 点击切换自动/手动模式
- 调用函数：`SETAUT(ref I)`

**Image3_0/Image3_1**：停堆按钮
- 点击执行停堆操作
- 调用函数：`STTCOR(ref I)`

**Image4_0/Image4_1**：紧急停堆按钮
- 点击执行紧急停堆
- 调用函数：`PROCMDI.TRIPIT(ref IVAL, ref I)`

**Command1_0/Command1_1**：停堆按钮
- 点击执行停堆操作
- 调用函数：`PROCMDI.TRIPIT(ref IVAL, ref I)`

##### 显示元素

- **Label数组**：显示功率、中子通量、燃耗、误差等参数
- **Image1/Image3/Image4**：显示设备状态图标（运行/停止、打开/关闭）

---

#### 12.3.2 反应堆再循环泵面板（maincp1.cs & maincp2.cs）

##### 控制元素

**Spin1**：流量微调滑条
- SpinUp：增加流量（+0.02）
- SpinDown：减少流量（-0.02）
- 调用函数：`SETTRM(ref X, ref I)`

**Command1[0-5]**：泵启动/停止按钮
- 控制泵的启动和停止
- 调用函数：`SETPMP(ref I2, ref index2)`

**Command1[6-11]**：入口阀控制按钮
- 控制入口阀的打开/关闭
- 调用函数：`SETINL(ref I, ref I2)`

**Command1[12-17]**：排放阀控制按钮
- 控制排放阀的打开/关闭
- 调用函数：`SETDIS(ref I, ref I2)`

##### 显示元素

- **Label数组**：显示泵状态、阀门位置、流量等参数
- **Image数组**：显示泵运行状态图标

---

#### 12.3.3 应急冷却泵面板（ECC_CONTROL.cs & SD_COOLING.cs）

##### 控制元素

**Spin1**：流量设定点调整滑条
- SpinUp：增加流量设定
- SpinDown：减少流量设定
- 调用函数：`SETECC(ref X, ref I)`

**Image2**：高压注水泵控制
- 点击控制高压注水泵
- 调用函数：`SETECC(ref I, ref I2, ref I3, ref X)`

**Image3**：低压注水泵控制
- 点击控制低压注水泵
- 调用函数：`SETECC(ref I, ref I2, ref I3, ref X)`

**Image4**：安全注水阀控制
- 点击控制安全注水阀
- 调用函数：`SETECC(ref I, ref I2, ref I3, ref X)`

**Image5**：应急冷却泵控制
- 点击控制应急冷却泵
- 调用函数：`GETSDC(ref j, ref PMPVLV[0])`

**Image6**：堆芯离线冷却泵1控制
- 点击控制堆芯离线冷却泵1
- 调用函数：`GETSDC(ref j, ref PMPVLV[0])`

##### 显示元素

- **Label数组**：显示泵状态、阀门位置、流量、温度等参数
- **Image数组**：显示泵运行状态、阀门状态图标

---

#### 12.3.4 汽轮机控制面板（turbine_s_ctrl.cs）

##### 控制元素

**Spin1**：转速/负荷控制滑条
- SpinUp：增加转速/负荷
- SpinDown：减少转速/负荷
- 调用函数：`SETTRB(ref X, ref I)`

**Command1**：汽轮机启动/停止按钮
- 控制汽轮机的启动和停止
- 调用函数：`SETTRB(ref X, ref I)`

**Command2**：负荷控制按钮
- 调整汽轮机负荷
- 调用函数：`SETTRB(ref X, ref I)`

**Command3**：压力设定按钮
- 设定蒸汽压力
- 调用函数：`SETTRB(ref X, ref I)`

**Command4**：自动调速器按钮
- 启用/禁用自动调速器
- 调用函数：`SETTRB(ref X, ref I)`

**Command5**：排汽阀控制按钮
- 控制排汽阀的打开/关闭
- 调用函数：`SETTRB(ref X, ref I)`

**Command6**：疏水阀控制按钮
- 控制疏水阀的打开/关闭
- 调用函数：`SETTRB(ref X, ref I)`

**Command7**：辅助系统控制按钮
- 控制润滑油、冷却水、密封水系统
- 调用函数：`SETTRB(ref X, ref I)`

**Command8**：紧急停机按钮
- 执行紧急停机
- 调用函数：`SETTRB(ref X, ref I)`

##### 显示元素

- **Label数组**：显示转速、负荷、压力、温度等参数
- **Image数组**：显示汽轮机状态、阀门状态图标

---

#### 12.3.5 凝汽器系统面板（cndsr_v.cs）

##### 控制元素

**Command4[0-1]**：真空泵控制按钮
- 控制主真空泵和备用真空泵
- 调用函数：`SETCND(ref I, ref X)`

**Command5[0-1]**：蒸汽喷射器控制按钮
- 控制蒸汽喷射器的启动/停止
- 调用函数：`SETCND(ref I, ref X)`

##### 显示元素

- **Label数组**：显示真空度、温度、水位等参数
- **Image数组**：显示泵运行状态图标

---

#### 12.3.6 给水系统面板（feed_pmp.cs）

##### 控制元素

**Spin1**：给水流量设定滑条
- SpinUp：增加给水流量
- SpinDown：减少给水流量
- 调用函数：`SETFED(ref X, ref I)`

**Command1[0-5]**：主给水泵启动/停止按钮
- 控制6台主给水泵的启动和停止
- 调用函数：`SETFED(ref X, ref I)`

**Command2[0-5]**：给水泵隔离阀控制按钮
- 控制每台泵的2个隔离阀
- 调用函数：`SETISO(ref I, ref j)`

**Command3[0-5]**：主给水阀控制按钮
- 控制主给水阀的打开/关闭
- 调用函数：`SETFED(ref X, ref I)`

**Command4[0-1]**：启动阀控制按钮
- 控制启动阀的打开/关闭
- 调用函数：`SETFED(ref X, ref I)`

**Command5[0-1]**：三元件控制按钮
- 启用/禁用三元件控制
- 调用函数：`SETFED(ref X, ref I)`

**Command6**：紧急停泵按钮
- 执行紧急停泵操作
- 调用函数：`SETFED(ref X, ref I)`

##### 显示元素

- **Label数组**：显示泵状态、阀门位置、流量等参数
- **Image数组**：显示泵运行状态、阀门状态图标

---

#### 12.3.7 除氧器面板（deaer_P_CTRL.cs & deaer_L_CTRL.cs）

##### 控制元素

**Spin1**：蒸汽压力控制滑条
- SpinUp：增加蒸汽压力设定
- SpinDown：减少蒸汽压力设定
- 调用函数：`SETDAR(ref X, ref I)`

**Spin2**：水位控制滑条
- SpinUp：增加水位设定
- SpinDown：减少水位设定
- 调用函数：`SETDAR(ref X, ref I)`

**Spin3**：再生/补水流量控制滑条
- SpinUp：增加流量
- SpinDown：减少流量
- 调用函数：`SETDAR(ref X, ref I)`

**Command1[0-1]**：再生/补水阀控制按钮
- 控制再生阀和补水阀的打开/关闭
- 调用函数：`SETDAR(ref X, ref I)`

##### 显示元素

- **Label数组**：显示压力、水位、流量等参数
- **Image数组**：显示阀门状态图标

---

#### 12.3.8 数据趋势图面板（TRENDSv.cs）

##### 控制元素

**Picture1**：趋势图显示区域
- 双击打开趋势选择器
- 最多显示10条趋势线
- 调用函数：`trend_select.ShowDialog()`

**Command2**：趋势图控制按钮
- 控制趋势图的显示/隐藏
- 调用函数：`GETYS(GR,XD,XM,LY1,LY2)`

##### 显示元素

- **Picture1**：显示趋势曲线
- **Label数组**：显示趋势名称、单位、数值

---

#### 12.3.9 HEPA过滤器面板（HEPA_FLTR.cs）

##### 控制元素

**Image2[0-1]**：通风阀控制按钮
- 点击控制通风阀的打开/关闭
- 调用函数：`SETHPA(ref I, ref X)`

**Image3[0-1]**：旁路阀控制按钮
- 点击控制旁路阀的打开/关闭
- 调用函数：`SETHPA(ref I, ref X)`

##### 显示元素

- **Label数组**：显示入口/出口辐射监测值、过滤效率等参数
- **Image数组**：显示阀门状态图标

---

#### 12.3.10 反应堆控制棒面板（REACT_ROD.cs）

##### 控制元素

**Spin1**：控制棒位置调整滑条
- SpinUp：提升控制棒（+0.01）
- SpinDown：插入控制棒（-0.01）
- 调用函数：`SETROD(ref X, ref I, ref j, ref k)`

**Spin2**：控制棒组调整滑条
- SpinUp：提升整组控制棒（+0.01）
- SpinDown：插入整组控制棒（-0.01）
- 调用函数：`SETROD(ref X, ref I, ref j, ref k)`

**Command1**：紧急插入AZ-5按钮
- 点击执行所有控制棒快速插入
- 调用函数：`SETROD(ref X, ref I, ref j, ref k)`

**Command2**：燃料更换按钮
- 点击模拟燃料更换操作
- 调用函数：`GETBUN(ref I, ref j)`

##### 显示元素

- **Label数组**：显示控制棒位置、燃料温度、热功率、燃耗等参数
- **Image2数组**：显示燃料状态图标（5种状态）
- **Image6数组**：显示控制棒移动模式图标
- **Picture2**：堆芯示意图（5×5网格）

---

#### 12.3.11 CRT示意图面板（SCEMAT_0.cs）

##### 控制元素

- **无直接控制元素**：CRT示意图是纯显示面板，不提供直接控制

##### 显示元素

- **Picture1数组**：显示系统流程图（21个设备位置）
- **Image1-Image8数组**：显示设备状态图标（运行/停止、打开/关闭）
- **Label1数组**：显示33个工艺参数（流量、温度、压力、转速等）

---

### 12.4 控制元素类型总结

#### 12.4.1 滑条（SGSpin）

**功能**：连续调整参数值
**操作方式**：SpinUp增加，SpinDown减少
**常见用途**：
- 功率设定点调整
- 流量微调
- 转速/负荷控制
- 压力设定
- 水位控制
- 控制棒位置调整

#### 12.4.2 按钮（Button/Command）

**功能**：开关控制、模式切换、紧急操作
**操作方式**：单击执行操作
**常见用途**：
- 设备启动/停止
- 阀门打开/关闭
- 自动/手动模式切换
- 紧急停堆/停机
- 燃料更换

#### 12.4.3 图像按钮（PictureBox）

**功能**：可视化控制、状态切换
**操作方式**：单击或MouseDown事件
**常见用途**：
- 设备状态切换（运行/停止）
- 阀门控制（打开/关闭）
- 模式选择
- 图标显示

#### 12.4.4 双击区域（PictureBox）

**功能**：打开选择器或详细信息
**操作方式**：DoubleClick事件
**常见用途**：
- 趋势选择器
- 参数配置

---

### 12.5 显示元素类型总结

#### 12.5.1 标签（Label）

**功能**：显示数值、文本、状态
**显示内容**：
- 工艺参数（流量、温度、压力、转速等）
- 设备状态（运行/停止、打开/关闭）
- 报警信息
- 单位和格式化数据

#### 12.5.2 图像（PictureBox）

**功能**：显示图标、状态指示
**显示内容**：
- 设备运行状态图标
- 阀门状态图标
- 燃料状态图标
- 系统流程图
- 趋势曲线

#### 12.5.3 面板（Panel）

**功能**：容器、分组显示
**显示内容**：
- 堆芯示意图
- 系统流程图
- 控制区域分组

---

### 12.6 数据更新机制

所有面板通过以下机制实时更新：

1. **定时器更新**：通过`model_timer`定时器定期调用显示函数
2. **DLL函数调用**：通过DLL函数获取实时数据
3. **事件驱动**：用户操作触发事件，更新显示
4. **状态检查**：检查设备状态，动态切换图标

---

### 12.7 总结

本章节详细分析了CHRNOBYL RBMK-1000模拟器中所有面板的显示机制和控制元素：

1. **堆芯示意图显示机制**：通过5×5网格的PictureBox数组显示燃料状态，使用5种不同的图标表示不同的燃料状态（新燃料、正常燃料、高燃耗燃料、无燃料、燃料更换中）

2. **CRT示意图显示机制**：通过21个PictureBox显示系统流程图，使用8组图标数组表示设备状态，同时显示33个工艺参数

3. **控制元素类型**：包括滑条（连续调整）、按钮（开关控制）、图像按钮（可视化控制）、双击区域（选择器）

4. **显示元素类型**：包括标签（数值显示）、图像（图标显示）、面板（容器显示）

5. **数据更新机制**：通过定时器、DLL函数、事件驱动和状态检查实现实时更新

这种设计提供了直观的人机界面，操作员可以通过滑条和按钮精确控制各种参数，同时通过图标和标签实时监控系统状态。

---

## 十三、辅助面板显示机制详细分析

### 13.1 反应堆芯状态面板（reactr_0.cs）

#### 界面结构

反应堆芯状态面板使用 `Picture1` 作为主容器（Panel），在其中放置了8个 `Label9` 控件（Label数组），用于显示堆芯的关键参数。

```csharp
// Picture1 是主容器
private Panel _Picture1;

// Label9 是包含8个Label的数组，用于显示堆芯参数
private LabelArray _Label9;
```

#### 显示参数

| 标签索引 | 参数名称 | DLL函数 | 单位 | 说明 |
|----------|----------|---------|------|------|
| Label9[0] | 再循环流量 | CIRFLO[0] | kg/s | 回路1再循环流量 |
| Label9[1] | 再循环流量 | CIRFLO[1] | kg/s | 回路2再循环流量 |
| Label9[2] | 堆芯温度 | GETCOR(0,0,2) | °C | 堆芯区域2温度 |
| Label9[3] | 堆芯温度 | GETCOR(0,0,3) | °C | 堆芯区域3温度 |
| Label9[4] | 控制棒位置 | 1-GETCOR(0,0,3) | % | 控制棒位置（抽出百分比） |
| Label9[5] | 控制棒位置 | 1-GETCOR(0,0,4) | % | 控制棒位置（抽出百分比） |
| Label9[6] | 平均热功率 | avgchp | MW | 堆芯平均热功率 |
| Label9[7] | 氙浓度 | XEN/32 | % | 堆芯氙浓度 |

#### 显示更新函数

```csharp
public static void DISP_REACTR_0()
{
    short num = 0;
    checked
    {
        short num2;
        short num3;
        do
        {
            MyProject.Forms.MainForm.CBStatic.reactr_0.Label9[num].Text = UNITSMDI.FLOWOUT1(ref CIRFLO[num]);
            num = (short)unchecked(num + 1);
            num2 = num;
            num3 = 1;
        }
        while (num2 <= num3);
        num = 2;
        short num4;
        do
        {
            short D = (short)(num + 1);
            short I = 0;
            short j = 0;
            float T = GETCOR(ref I, ref j, ref D);
            MyProject.Forms.MainForm.CBStatic.reactr_0.Label9[num].Text = UNITSMDI.TEMPOUT(ref T);
            num = (short)unchecked(num + 1);
            num4 = num;
            num3 = 3;
        }
        while (num4 <= num3);
        num = 4;
        short num5;
        do
        {
            short D = (short)(num + 1);
            short j = 0;
            short I = 0;
            float T = (float)(1.0 - (double)GETCOR(ref j, ref I, ref D));
            MyProject.Forms.MainForm.CBStatic.reactr_0.Label9[num].Text = Support.Format(T, "##0.0%");
            num = (short)unchecked(num + 1);
            num5 = num;
            num3 = 5;
        }
        while (num5 <= num3);
        MyProject.Forms.MainForm.CBStatic.reactr_0.Label9[6].Text = Support.Format(avgchp, "##0.0%");
        MyProject.Forms.MainForm.CBStatic.reactr_0.Label9[7].Text = Support.Format((double)XEN / 32.0, "###0.0%");
    }
}
```

#### DLL函数说明

| 函数名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `GETCOR(ref short I, ref short j, ref short D)` | I=0, j=0, D=区域编号 | float | 获取堆芯指定区域的温度或控制棒位置 |
| `CIRFLO[num]` | num=0或1 | float | 获取再循环流量（全局变量） |

---

### 13.2 给水系统面板（feedsys_0.cs）

#### 界面结构

给水系统面板使用 `Picture1` 作为主容器（Panel），在其中放置了10个 `Label3` 控件（Label数组），用于显示给水系统的关键参数。

```csharp
// Picture1 是主容器
private Panel _Picture1;

// Label3 是包含10个Label的数组，用于显示给水系统参数
private LabelArray _Label3;
```

#### 显示参数

| 标签索引 | 参数名称 | DLL函数 | 单位 | 说明 |
|----------|----------|---------|------|------|
| Label3[0] | 汽包压力 | GETDRM(0) | MPa | 汽包压力 |
| Label3[1] | 汽包温度 | GETDRM(1) | °C | 汽包温度 |
| Label3[2] | 汽包水位 | GETDRM(2) | m | 汽包水位 |
| Label3[3] | 汽包蒸汽流量 | GETDRM(3) | kg/s | 汽包蒸汽流量 |
| Label3[4] | 汽包给水流量 | GETDRM(4) | kg/s | 汽包给水流量 |
| Label3[5] | 给水泵状态 | GETFED(0) | % | 给水泵运行状态 |
| Label3[6] | 给水泵流量 | GETFED(1) | kg/s | 给水泵流量 |
| Label3[7] | 给水泵流量 | GETFED(6) | kg/s | 给水泵流量 |
| Label3[8] | 给水泵状态 | GETFED(10) | % | 给水泵运行状态 |
| Label3[9] | 给水泵状态 | GETFED(14) | % | 给水泵运行状态 |

#### 显示更新函数

```csharp
public static void DISP_FEEDSYS_0()
{
    Label label = MyProject.Forms.MainForm.CBStatic.feedsys_0.Label3[0];
    short I = 0;
    float P = GETDRM(ref I);
    label.Text = UNITSMDI.PRESSOUT2(ref P);
    Label label2 = MyProject.Forms.MainForm.CBStatic.feedsys_0.Label3[1];
    I = 1;
    P = GETDRM(ref I);
    label2.Text = UNITSMDI.TEMPOUT(ref P);
    Label label3 = MyProject.Forms.MainForm.CBStatic.feedsys_0.Label3[2];
    I = 2;
    P = GETDRM(ref I);
    label3.Text = UNITSMDI.LEVLOUT1(ref P);
    Label label4 = MyProject.Forms.MainForm.CBStatic.feedsys_0.Label3[3];
    I = 3;
    P = GETDRM(ref I);
    label4.Text = UNITSMDI.FLOWOUT1(ref P);
    Label label5 = MyProject.Forms.MainForm.CBStatic.feedsys_0.Label3[4];
    I = 4;
    P = GETDRM(ref I);
    label5.Text = UNITSMDI.FLOWOUT1(ref P);
    Label label6 = MyProject.Forms.MainForm.CBStatic.feedsys_0.Label3[5];
    I = 0;
    label6.Text = Support.Format(GETFED(ref I), "##0.0%");
    Label label7 = MyProject.Forms.MainForm.CBStatic.feedsys_0.Label3[6];
    I = 1;
    P = GETFED(ref I);
    label7.Text = UNITSMDI.FLOWOUT1(ref P);
    Label label8 = MyProject.Forms.MainForm.CBStatic.feedsys_0.Label3[7];
    I = 6;
    P = GETFED(ref I);
    label8.Text = UNITSMDI.FLOWOUT1(ref P);
    Label label9 = MyProject.Forms.MainForm.CBStatic.feedsys_0.Label3[8];
    I = 10;
    label9.Text = Support.Format(GETFED(ref I), "##0.0%");
    Label label10 = MyProject.Forms.MainForm.CBStatic.feedsys_0.Label3[9];
    I = 14;
    label10.Text = Support.Format(GETFED(ref I), "##0.0%");
}
```

#### DLL函数说明

| 函数名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `GETDRM(ref short I)` | I=0-4 | float | 获取汽包参数（压力、温度、水位、流量） |
| `GETFED(ref short I)` | I=0,1,6,10,14 | float | 获取给水泵参数（状态、流量） |

---

### 13.3 汽轮机状态面板（turbine_0.cs）

#### 界面结构

汽轮机状态面板使用 `Label1` 作为包含26个Label的数组，用于显示汽轮机的各种参数。

```csharp
// Label1 是包含26个Label的数组，用于显示汽轮机参数
private LabelArray _Label1;
```

#### 显示参数

| 标签索引 | 参数名称 | DLL函数 | 单位 | 说明 |
|----------|----------|---------|------|------|
| Label1[0] | 主蒸汽压力 | GETTRB(13) | MPa | 主蒸汽压力 |
| Label1[1] | 主蒸汽温度 | GETTRB(14) | °C | 主蒸汽温度 |
| Label1[2] | 高压缸排汽温度 | GETTRB(17) | °C | 高压缸排汽温度 |
| Label1[3] | 中压缸排汽温度 | GETTRB(18) | °C | 中压缸排汽温度 |
| Label1[4] | 低压缸排汽温度 | GETTRB(19) | °C | 低压缸排汽温度 |
| Label1[5] | 汽轮机长度 | GETTRB(16) | m | 汽轮机长度 |
| Label1[6] | 给水流量 | GETTRB(10) | kg/s | 给水流量 |
| Label1[7] | 负荷百分比 | GETTRB(41) | % | 汽轮机负荷百分比 |
| Label1[8] | 蒸汽流量 | GETTRB(12) | kg/s | 蒸汽流量 |

#### 显示更新函数

```csharp
public static void disp_turb_0()
{
    short I = 10;
    float X = default(float);
    short tRB = GETTRB(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.turbine_0.Label1[6].Text = UNITSMDI.FLOWOUT1(ref X);
    I = 12;
    tRB = GETTRB(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.turbine_0.Label1[8].Text = UNITSMDI.FLOWOUT1(ref X);
    I = 13;
    tRB = GETTRB(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.turbine_0.Label1[0].Text = UNITSMDI.PRESSOUT2(ref X);
    I = 14;
    tRB = GETTRB(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.turbine_0.Label1[1].Text = UNITSMDI.TEMPOUT(ref X);
    I = 16;
    tRB = GETTRB(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.turbine_0.Label1[5].Text = UNITSMDI.LENTOUT2(ref X);
    I = 17;
    tRB = GETTRB(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.turbine_0.Label1[2].Text = UNITSMDI.TEMPOUT(ref X);
    I = 18;
    tRB = GETTRB(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.turbine_0.Label1[3].Text = UNITSMDI.TEMPOUT(ref X);
    I = 19;
    tRB = GETTRB(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.turbine_0.Label1[4].Text = UNITSMDI.TEMPOUT(ref X);
    I = 41;
    tRB = GETTRB(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.turbine_0.Label1[7].Text = Support.Format(X, "##0.0%");
}
```

#### DLL函数说明

| 函数名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `GETTRB(ref float X, ref short I)` | I=10,12,13,14,16,17,18,19,41 | float | 获取汽轮机参数（流量、压力、温度、长度、负荷） |

---

### 13.4 除氧器面板（DEAER_0.cs）

#### 界面结构

除氧器面板使用 `Label1` 作为包含10个Label的数组，用于显示除氧器的各种参数。

```csharp
// Label1 是包含10个Label的数组，用于显示除氧器参数
private LabelArray _Label1;
```

#### 显示参数

| 标签索引 | 参数名称 | DLL函数 | 单位 | 说明 |
|----------|----------|---------|------|------|
| Label1[0] | 凝结水流量 | GETDAR(9) | kg/s | 凝结水流量 |
| Label1[1] | 抽汽流量 | GETDAR(8) | kg/s | 抽汽流量 |
| Label1[2] | 除氧器压力 | GETDAR(5) | MPa | 除氧器压力 |
| Label1[3] | 除氧器水位 | GETDAR(3) | m | 除氧器水位 |
| Label1[4] | 除氧器温度 | GETDAR(4) | °C | 除氧器温度 |
| Label1[5] | 给水流量 | GETFED(1) | kg/s | 给水流量 |
| Label1[6] | 除氧器出口流量 | GETDAR(7) | kg/s | 除氧器出口流量 |
| Label1[8] | 补水流量 | GETDAR(17) | kg/s | 补水流量 |
| Label1[9] | 蒸汽流量 | GETDAR(18) | kg/s | 蒸汽流量 |

#### 显示更新函数

```csharp
public static void DISP_DEAER_0()
{
    short I = 17;
    float X = default(float);
    short dAR = GETDAR(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.DEAER_0.Label1[8].Text = UNITSMDI.FLOWOUT1(ref X);
    I = 9;
    dAR = GETDAR(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.DEAER_0.Label1[0].Text = UNITSMDI.FLOWOUT1(ref X);
    I = 8;
    dAR = GETDAR(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.DEAER_0.Label1[1].Text = UNITSMDI.FLOWOUT1(ref X);
    I = 18;
    dAR = GETDAR(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.DEAER_0.Label1[9].Text = UNITSMDI.FLOWOUT1(ref X);
    I = 5;
    dAR = GETDAR(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.DEAER_0.Label1[2].Text = UNITSMDI.PRESSOUT2(ref X);
    I = 3;
    dAR = GETDAR(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.DEAER_0.Label1[3].Text = UNITSMDI.LEVLOUT1(ref X);
    I = 4;
    dAR = GETDAR(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.DEAER_0.Label1[4].Text = UNITSMDI.TEMPOUT(ref X);
    Label label = MyProject.Forms.MainForm.CBStatic.DEAER_0.Label1[5];
    I = 1;
    float F = GETFED(ref I);
    label.Text = UNITSMDI.FLOWOUT1(ref F);
    I = 7;
    dAR = GETDAR(ref X, ref I);
    MyProject.Forms.MainForm.CBStatic.DEAER_0.Label1[6].Text = UNITSMDI.FLOWOUT1(ref X);
}
```

#### DLL函数说明

| 函数名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `GETDAR(ref float X, ref short I)` | I=3,4,5,7,8,9,17,18 | float | 获取除氧器参数（水位、温度、压力、流量） |
| `GETFED(ref short I)` | I=1 | float | 获取给水流量 |

---

### 13.5 凝汽器面板（CNDSR_0.cs）

#### 界面结构

凝汽器面板使用 `Label4` 和 `Label10` 作为Label数组，用于显示凝汽器的各种参数和状态。

```csharp
// Label4 是包含4个Label的数组，用于显示泵状态
private LabelArray _Label4;

// Label10 是包含4个Label的数组，用于显示凝汽器参数
private LabelArray _Label10;
```

#### 显示参数

| 标签索引 | 参数名称 | DLL函数 | 单位 | 说明 |
|----------|----------|---------|------|------|
| Label10[0] | 凝汽器压力 | GETCND(0) | kPa | 凝汽器压力 |
| Label10[1] | 凝汽器温度 | GETCND(1) | °C | 凝汽器温度 |
| Label10[2] | 循环水流量 | GETCND(23) | kg/s | 循环水流量 |
| Label10[3] | 凝汽器温度 | GETCND(4) | °C | 凝汽器温度 |
| Label10[4] | 凝汽器温度 | GETCND(5) | °C | 凝汽器温度 |
| Label4[0-3] | 循环水泵状态 | GETCND(6-9) | - | 循环水泵运行状态（颜色指示） |

#### 显示更新函数

```csharp
public static void DISP_CNDSR_0()
{
    short num = 0;
    checked
    {
        short num2;
        short num3;
        short I;
        do
        {
            I = (short)Math.Round(6.0 + (double)num / 2.0);
            if ((double)GETCND(ref I) > 0.5)
            {
                MyProject.Forms.MainForm.CBStatic.CNDSR_0.Label4[num].ForeColor = ColorTranslator.FromOle(Information.QBColor(12));
                MyProject.Forms.MainForm.CBStatic.CNDSR_0.Label4[(short)(num + 1)].ForeColor = ColorTranslator.FromOle(Information.QBColor(4));
            }
            else
            {
                MyProject.Forms.MainForm.CBStatic.CNDSR_0.Label4[num].ForeColor = ColorTranslator.FromOle(Information.QBColor(4));
                MyProject.Forms.MainForm.CBStatic.CNDSR_0.Label4[(short)(num + 1)].ForeColor = ColorTranslator.FromOle(Information.QBColor(12));
            }
            num = (short)unchecked(num + 2);
            num2 = num;
            num3 = 2;
        }
        while (num2 <= num3);
        Label label = MyProject.Forms.MainForm.CBStatic.CNDSR_0.Label3[0];
        I = 23;
        float F = GETCND(ref I);
        label.Text = UNITSMDI.FLOWOUT3(ref F);
        Label label2 = MyProject.Forms.MainForm.CBStatic.CNDSR_0.Label10[0];
        I = 0;
        F = GETCND(ref I);
        label2.Text = UNITSMDI.PRESSOUT3(ref F);
        Label label3 = MyProject.Forms.MainForm.CBStatic.CNDSR_0.Label10[1];
        I = 1;
        F = GETCND(ref I);
        label3.Text = UNITSMDI.TEMPOUT(ref F);
        Label label4 = MyProject.Forms.MainForm.CBStatic.CNDSR_0.Label10[2];
        I = 4;
        F = GETCND(ref I);
        label4.Text = UNITSMDI.TEMPOUT(ref F);
        Label label5 = MyProject.Forms.MainForm.CBStatic.CNDSR_0.Label10[3];
        I = 5;
        F = GETCND(ref I);
        label5.Text = UNITSMDI.TEMPOUT(ref F);
    }
}
```

#### DLL函数说明

| 函数名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `GETCND(ref short I)` | I=0,1,4,5,6,7,8,9,23 | float | 获取凝汽器参数（压力、温度、泵状态、流量） |

---

### 13.6 汽轮机辅助系统面板（turb_aux.cs）

#### 界面结构

汽轮机辅助系统面板使用 `Label1` 作为包含3个Label的数组，以及 `Image2`、`Image3`、`Image4`、`Image5` 作为PictureBox数组，用于显示辅助系统的参数和状态。

```csharp
// Label1 是包含3个Label的数组，用于显示辅助系统压力
private LabelArray _Label1;

// Image2-Image5 是包含2个PictureBox的数组，用于显示泵状态
private PictureBoxArray _Image2;
private PictureBoxArray _Image3;
private PictureBoxArray _Image4;
private PictureBoxArray _Image5;
```

#### 显示参数

| 标签索引 | 参数名称 | DLL函数 | 单位 | 说明 |
|----------|----------|---------|------|------|
| Label1[0] | 润滑油压力 | GETTRB(37) | MPa | 润滑油压力 |
| Label1[1] | 冷却水压力 | GETTRB(38) | MPa | 冷却水压力 |
| Label1[2] | 密封水压力 | GETTRB(39) | MPa | 密封水压力 |

#### 状态指示

| 图标数组 | 设备 | DLL函数 | 状态 |
|----------|------|---------|------|
| Image2 | 润滑油泵 | GETTRB(33) | 1=运行，0=停止 |
| Image3 | 冷却水泵 | GETTRB(34) | 1=运行，0=停止 |
| Image4 | 真空泵 | GETTRB(35) | 1=运行，0=停止 |
| Image5 | 密封水泵 | GETTRB(36) | 1=运行，0=停止 |

#### 显示更新函数

```csharp
public static void disp_turb_aux()
{
    short num = 0;
    checked
    {
        float X = default(float);
        short num2;
        short num3;
        short tRB;
        do
        {
            short I = (short)(37 + num);
            tRB = GETTRB(ref X, ref I);
            MyProject.Forms.MainForm.CBStatic.turb_aux.Label1[num].Text = UNITSMDI.PRESSOUT2(ref X);
            num = (short)unchecked(num + 1);
            num2 = num;
            num3 = 2;
        }
        while (num2 <= num3);
        short I2 = 33;
        float X2 = default(float);
        tRB = GETTRB(ref X2, ref I2);
        if (X2 == 1f)
        {
            if (!MyProject.Forms.MainForm.CBStatic.turb_aux.Image2[1].Image.Equals(MyProject.Forms.MainForm.CBStatic.turb_aux.Image1[1].Image))
            {
                MyProject.Forms.MainForm.CBStatic.turb_aux.Image2[0].Image = MyProject.Forms.MainForm.CBStatic.turb_aux.Image1[0].Image;
                MyProject.Forms.MainForm.CBStatic.turb_aux.Image2[1].Image = MyProject.Forms.MainForm.CBStatic.turb_aux.Image1[1].Image;
            }
        }
        else if (X2 == 0f && !MyProject.Forms.MainForm.CBStatic.turb_aux.Image2[0].Image.Equals(MyProject.Forms.MainForm.CBStatic.turb_aux.Image1[2].Image))
        {
            MyProject.Forms.MainForm.CBStatic.turb_aux.Image2[0].Image = MyProject.Forms.MainForm.CBStatic.turb_aux.Image1[2].Image;
            MyProject.Forms.MainForm.CBStatic.turb_aux.Image2[1].Image = MyProject.Forms.MainForm.CBStatic.turb_aux.Image1[0].Image;
        }
        // ... 其他泵的状态更新逻辑类似
    }
}
```

#### DLL函数说明

| 函数名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `GETTRB(ref float X, ref short I)` | I=33-39 | float | 获取汽轮机辅助系统参数（泵状态、压力） |

---

### 13.7 辅助面板显示机制总结

#### 显示机制特点

1. **统一的数据获取接口**：所有辅助面板都通过DLL函数获取实时数据
   - `GETDRM()` - 获取汽包参数
   - `GETCOR()` - 获取堆芯参数
   - `GETTRB()` - 获取汽轮机参数
   - `GETCND()` - 获取凝汽器参数
   - `GETDAR()` - 获取除氧器参数
   - `GETFED()` - 获取给水泵参数

2. **统一的显示更新函数**：每个面板都有对应的 `DISP_XXX()` 函数
   - `DISP_REACTR_0()` - 更新反应堆芯状态面板
   - `DISP_FEEDSYS_0()` - 更新给水系统面板
   - `disp_turb_0()` - 更新汽轮机状态面板
   - `DISP_DEAER_0()` - 更新除氧器面板
   - `DISP_CNDSR_0()` - 更新凝汽器面板
   - `disp_turb_aux()` - 更新汽轮机辅助系统面板

3. **统一的界面结构**：
   - 使用 `Panel` 作为主容器
   - 使用 `LabelArray` 显示数值参数
   - 使用 `PictureBoxArray` 显示状态图标
   - 背景图片用于显示系统流程图

4. **统一的单位转换**：通过 `UNITSMDI` 类的方法进行单位转换
   - `PRESSOUT2()` - 压力单位转换（MPa）
   - `TEMPOUT()` - 温度单位转换（°C）
   - `FLOWOUT1()` - 流量单位转换（kg/s）
   - `LEVLOUT1()` - 水位单位转换（m）
   - `LENTOUT2()` - 长度单位转换（m）

5. **统一的状态指示**：
   - 使用颜色区分状态（红色=运行/开启，绿色=停止/关闭）
   - 使用图标切换显示设备状态
   - 使用百分比显示相对参数

#### 数据更新流程

1. 定时器触发更新（通常每100-500ms）
2. 调用对应的 `DISP_XXX()` 函数
3. 通过DLL函数获取最新数据
4. 更新Label的Text属性显示数值
5. 更新PictureBox的Image属性显示状态图标
6. 更新Label的ForeColor属性显示状态颜色

#### 显示参数分类

| 参数类型 | 显示方式 | 示例 |
|----------|----------|------|
| 压力 | Label.Text + 单位转换 | 主蒸汽压力：15.5 MPa |
| 温度 | Label.Text + 单位转换 | 主蒸汽温度：280 °C |
| 流量 | Label.Text + 单位转换 | 给水流量：500 kg/s |
| 水位 | Label.Text + 单位转换 | 汽包水位：3.5 m |
| 百分比 | Label.Text + 格式化 | 控制棒位置：75.0% |
| 状态 | PictureBox.Image + 颜色 | 泵运行/停止图标 |

这种设计确保了所有辅助面板具有一致的显示风格和用户体验，同时通过DLL接口实现了与物理模型的实时数据交互。
