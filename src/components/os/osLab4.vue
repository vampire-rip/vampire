<script>

export default {
  name: 'os-lab4',
  data() {
    return {};
  },
};

</script>
<style scoped lang="vcss">

</style>

<template>
<div :id="$options.name" :class="$options.name" class="content">
  <h1 id="lab-4-preemptive-multitasking--抢占式多任务处理">Lab 4: Preemptive Multitasking / 抢占式多任务处理</h1>
  <h2 id="介绍">介绍</h2>
  <p>在本次实验中，你将会在同时运行的多个用户进程（environment，下同）中实现抢占式多任务处理。</p>
  <ul>
    <li>在第一部分，Part A，你将会为 JOS 系统添加多处理器支持，实现轮转调度（round-robin scheduling），并在系统调用中添加一些基础进程管理方法（例如，创建、销毁进程，以及分配和映射内存）；</li>
    <li>第二部分，Part B，你将会实现类 Unix 的 fork() 方法，以允许用户进程创造自身的拷贝；</li>
    <li>最终，在 Part C 你将为 JOS 提供进程间通信 (Inter-Process Communication)支持，允许不同的用户进程显式地彼此交流和同步。你也将会实现硬件时钟中断和抢占。</li>
  </ul>
  <h3 id="开始">开始</h3>
  <p>用 <code>git</code> 提交你 Lab 3 的源代码，<s>取得我们课程的最新版本</s>，接着，基于我们的 <code>lab4</code> 分支，<code>origin/lab4</code>，新建一个本地分支，<code>lab4</code>：</p>
  <pre class=" language-bash"><code class="prism  language-bash"><span class="token function">cd</span> ~/6.828/lab
<span class="token function">git</span> commit -am <span class="token string">'changes to lab3 after handin'</span>
<span class="token comment"># git pull</span>
<span class="token function">git</span> checkout -b lab4 origin/lab4
<span class="token function">git</span> merge lab3
</code></pre>
  <p>Lab4 包含一些新的代码文件，你应当在开始之前先浏览它们：</p>

  <table>
    <thead>
    <tr>
      <th></th>
      <th></th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td>kern/cpu.h</td>
      <td>内核私有的关于多处理器支持的定义</td>
    </tr>
    <tr>
      <td>kern/mpconfig.c</td>
      <td>用于读取多处理器配置的代码</td>
    </tr>
    <tr>
      <td>kern/lapic.c</td>
      <td>驱动每个处理器 Local APIC(LAPIC) 单元的内核代码</td>
    </tr>
    <tr>
      <td>kern/mpentry.S</td>
      <td>非启动 CPU 的汇编入口</td>
    </tr>
    <tr>
      <td>kern/spinlock.h</td>
      <td>内核私有的自旋锁的定义，包括全局内核锁 (big kernel lock)</td>
    </tr>
    <tr>
      <td>kern/spinlock.c</td>
      <td>实现自旋锁的内核代码</td>
    </tr>
    <tr>
      <td>kern/sched.c</td>
      <td>将由你实现的调度方法的代码框架</td>
    </tr>
    </tbody>
  </table><h3 id="实验要求">实验要求</h3>
  <p>本实验分为 3 部分，A，B 和 C。我们为每一个部分分配了一周的时间。像以前一样，你需要完成实验描述中提到的所有练习，以及 至少一个 挑战练习（你不需要在每一部分都完成一个挑战练习，整个实验完成一个就可以了）。另外，你将需要为你所实现的挑战练习写一个简短的说明。如果你完成了更多的挑战练习，你只需要为其中一个写说明就好了，当然，也很欢迎你能完成更多。在提交作业之前，请将这个说明放在实验根目录的 <code>answers-lab4.txt</code> 中。</p>
  <h2 id="part-a-multiprocessor-support-and-cooperative-multitasking--多处理器支持和协作式多任务">Part A: Multiprocessor Support and Cooperative Multitasking / 多处理器支持和协作式多任务</h2>
  <p>在本次实验的第一部分，你将首先拓展 JOS，使其支持在具有多个处理器的系统上运行，接下来，实现一些新的 JOS 内核系统调用以允许用户进程创建额外的新进程。你还需要实现 <em>协作式轮转调度</em> (Cooperative round-robin scheduling)，允许内核在当前用户进程自愿放弃CPU或退出时切换到另一个进程。在之后的 Part C 你将实现 抢占式调度，以允许内核在一定时间后从一个用户进程中抢占CPU的控制权，即使用户进程不愿合作。</p>
  <h3 id="多处理器支持">多处理器支持</h3>
  <p>我们将使 JOS 支持 <code>symmetric multiprocessing</code> (SMP)，这是一种所有 CPU 均同等地享有系统资源（例如内存和I/O总线）的多处理器模型。虽然所有的 CPU 在 SMP 模型中功能均相同，在启动过程中它们被分为两种类型：<code>bootstrap processor</code> (BSP) 和 <code>application processors</code> (APs)。前者负责初始化系统和引导操作系统，后者只有在操作系统正常运行后才被前者激活。哪一个处理器会成为 BSP 是由硬件和 BIOS 决定的。直到目前为止，你的所有 JOS 代码均运行在 BSP 上。</p>
  <p>在 SMP 系统中，每一个 CPU 均有一个伴随的 <code>局部APIC(LAPIC)单元</code>（APIC，Advanced Programmable Interrupt Controller，高级可编程中断控制器）。LAPIC单元 负责在整个系统中分发中断。同时，每个 LAPIC 也为它连接的 CPU 提供一个唯一的身份标识。在本次实验中，我们会利用以下 LAPIC 单元的基本功能（在 <code>kern/lapic.c</code> 中）：</p>
  <ul>
    <li>读取 LAIPC身份标识 (APIC ID) 以分辨我们的代码在哪个 CPU 上运行  (<code>cpunum()</code>)</li>
    <li>从 BSP 向 APs 发送 STARTUP处理器间中断 (Interprocesser Interrupt, IPI) 以激活其他 CPU (<code>lapic_startap()</code>)</li>
    <li>在 Part C，我们为 LAPIC 内置的计时器编程，以触发时钟中断来实现抢占式多任务处理。</li>
  </ul>
  <p>处理器通过 内存映射输入输出 (memory-mapped I/O, MMIO) 来访问它的 LAPIC。在 MMIO 模式中，物理内存的一部分被硬连线于一些 I/O 设备的寄存器上（译注：I/O 设备的寄存器和内存被映射在物理内存的一些区域）， 所以通常用于访问内存的存取指令也可以同样用于访问设备寄存器。在之前的实验中，你已经在物理内存地址 0xA0000 的位置遇到过一个 IO hole（我们通过它写入 VGA 的显示缓冲区）。LAPIC 被连接在物理地址 0xFE000000 (距 4GB 还有 32MB 的位置) 的 I/O hole 上，这个地址对我们当前在 KERNBASE 上直接映射来说太高了， 不过 JOS 虚拟内存映射表 在 MMIOBASE 位置留了 4MB 的空隙，所以我们可以将这样的设备映射到这里。 之后的实验将引入更多的 MMIO 区域，因此，你将需要编写一个简单的函数，为这一区域分配内存，并将设备内存映射在上面。</p>
  <section type="exercise">
  <p><strong>练习 1.</strong><br>
    实现在 <code>kern/pmap.c</code> 中的 <code>mmio_map_region</code> 方法。你可以看看 <code>kern/lapic.c</code> 中 <code>lapic_init</code> 的开头部分，了解一下它是如何被调用的。你还需要完成接下来的练习，你的 <code>mmio_map_region</code> 才能够正常运行。</p>
  </section>
  <h3 id="应用处理器（ap）引导程序">应用处理器（AP）引导程序</h3>
  <p>在启动 AP 之前，BSP 应当首先收集多处理器系统的信息，例如，CPU总数，他们的 APIC ID，和 LAPIC单元 的 MMIO 地址。在 <code>kern/mpconfig.c</code> 中的 <code>mp_init()</code> 函数通过读取 BIOS 存储区域的 多处理器配置表(MP coniguration table) 来获得相关信息。</p>
  <p>在 <code>kern/init.c</code> 的 <code>boot_aps()</code> 函数驱动 AP 的引导过程。 AP 从实模式开始启动，就像 在 <code>boot/boot.S</code> 中的 <strong>bootloader</strong> 一样。所以 <code>boot_aps()</code> 将 AP 的入口代码 ( <code>kern.mpentry.S</code> ) 拷贝到一个实模式中能够访问到的内存地址。与 bootloader 不同的是，我们可以控制 AP 从哪里开始执行代码。在这里我们把入口代码拷贝到了 <em>0x7000</em> (<code>MPENTRY_PADDR</code>)，不过其实 640KB 以下任何一个没有使用的、按页对齐的物理内存均可使用。</p>
  <p>而后，<code>boot_aps()</code> 通过发送 <em>STARTUP IPI</em> （interprocesser interrupt, 处理器间中断） 并提供一个初始 CS:IP （AP 入口代码的位置，我们这里是 <code>MPENRTY_PADDR</code> ） 给对应 AP 的 LAPIC 单元 ，依次激活每个 AP。 <code>kern/mpentry.S</code> 中的入口代码和 <code>boot/boot.S</code> 中的十分相似。在一些简单的处理后，它将 AP 置于保护模式，并启用页表， 接着调用 C 语言的设置例程 <code>mp_main()</code> （也在 <code>kern/init.c</code> 中）。<code>boot_aps()</code> 会等待 AP 在 它的 <code>struct CpuInfo</code> 中设置 <code>cpu_status</code> 字段为 <code>CPU_STARTED</code> 后才开始唤醒下一个 AP。</p>
  <section type="exercise">
  <p><strong>练习 2.</strong><br>
    阅读 <code>kern/init.c</code> 中的 <code>boot_aps()</code> 和 <code>mp_main()</code> 方法，和 <code>kern/mpentry.S</code> 中的汇编代码。确保你已经明白了引导 AP 启动的控制流执行过程。接着，修改你在 <code>kern/pmap.c</code> 中实现过的 <code>page_init()</code> 以避免将 <code>MPENTRY_PADDR</code> 加入到 free list 中，以使得我们可以安全地将 AP 的引导代码拷贝于这个物理地址并运行。你的代码应当通过我们更新过的 <code>check_page_free_list()</code> 测试，不过可能仍会在我们更新过的 <code>check_kern_pgdir()</code> 测试中失败，我们接下来将解决这个问题。</p>
  </section>
  <section type="question">
  <p><strong>问题 1.</strong></p>
  <ul>
    <li>逐行比较 <code>kern/mpentry.S</code> 和 <code>boot/boot.S</code>。牢记 <code>kern/mpentry.S</code> 和其他内核代码一样也是被编译和链接在 <code>KERNBASE</code> 之上运行的。那么，<code>MPBOOTPHYS</code> 这个宏定义的目的是什么呢？为什么它在 <code>kern/mpentry.S</code> 中是必要的，但在 <code>boot/boot.S</code> 却不用？换句话说，如果我们忽略掉 <code>kern/mpentry.S</code> 哪里会出现问题呢？<br>
      提示：回忆一下我们在 Lab 1 讨论的链接地址和装载地址的不同之处。</li>
  </ul>
  </section>
  <h4 id="cpu-私有状态和初始化">CPU 私有状态和初始化</h4>
  <p>在编写一个支持多处理器的系统时，将 每个 CPU 各自私有的状态 和 与整个系统共享的公共状态 区别开来是很重要的。<code>kern/cpu.h</code> 定义了大多数 CPU 私有的状态，包括 <code>struct CpuInfo</code>，它存储着 CPU 私有的变量。<code>cpunum()</code> 总是返回调用它的 CPU 的ID, 可以用它来作为数组索引访问诸如 cpus 这样的数组。另外，宏定义 <code>thiscpu</code> 是访问当前 CPU 的 <code>struct CpuInfo</code> 结构的简写。</p>
  <p>下面是你应当知道的每个 CPU 私有的状态：</p>
  <ul>
    <li>
      <p>每个CPU的内核堆栈(kernel stack)<br>
        因为多个CPU可以同时陷入内核，我们需要为每个 CPU 分别提供内核堆栈以防止它们互相干扰彼此的运行。 <code>percpu_kstacks[NCPU][KSTKSiZE]</code> 数组为 NCPU 的内核堆栈预留了空间。<br>
        在 Lab 2 中，你把 bootstack 指向的内存映射到了紧邻 <code>KSTACKTOP</code> 的下面。相似地，在本次实验中，你会把每个 CPU 的内核堆栈映射到这里，同时，在每个内核堆栈之间会留有一段 守护页 作为它们之间的缓冲区。CPU 0 的堆栈仍然会从 <code>KSTACKTOP</code> 向下生长， CPU 1 的堆栈会在 CPU0 栈底的 <code>KSTKGAP</code> 以下开始向下生长，以此类推。 <code>inc/memlayout.h</code> 展示了内存应当如何映射。</p>
    </li>
    <li>
      <p>每个CPU的任务状态段(task state segment, TSS)和任务段描述符(TSS descriptor)<br>
        每个 CPU 也需要各自的 TSS 以指定 CPU 的内核堆栈在何处。 CPU i 的 TSS 存储在 <code>cpus[i].cpu_ts</code> 中，相应的 TSS descriptor 在 GDT 入口 <code>gdt[(GD_TSS0 &gt;&gt; 3) + i]</code> 中被定义。在 <code>kern/trap.c</code> 中定义的全局变量 ts 此时将不再有用。</p>
    </li>
    <li>
      <p>每个CPU的当前进程指针<br>
        因为每一个 CPU 可以同时运行不同的用户进程，我们重新定义了宏 <code>curenv</code> 来指代 <code>cpus[cpunum()].cpu_env</code> (或者 <code>thiscpu-&gt;cpuenv</code>)，指向 当前 运行在当前 CPU 的进程。</p>
    </li>
    <li>
      <p>每个CPU的系统寄存器<br>
        所有寄存器，包括系统寄存器，都是CPU私有的，因此，初始化这些寄存器的指令，例如，<code>lcr3()</code>，<code>ltr()</code>，<code>lgdt()</code>，<code>lidt()</code> 等，都应当在每个 CPU 中执行一次。 函数 <code>env_init_percpu()</code> 和 <code>trap_init_percpu()</code> 就是为了这一目的而定义的。</p>
    </li>
  </ul>
  <section type="exercise">
  <p><strong>练习 3.</strong></p>
  <p>修改位于 kern/pmap.c 中的 <code>mem_init_mp()</code>，将每个CPU堆栈映射在 <code>KSTACKTOP</code> 开始的区域，就像 <code>inc/memlayout.h</code> 中描述的那样。每个堆栈的大小都是 <code>KSTKSIZE</code> 字节，加上 <code>KSTKGAP</code> 字节没有被映射的 守护页 。现在，你的代码应当能够通过我们新的 <code>check_kern_pgdir()</code> 测试了。</p>
  </section>
  <section type="exercise">
  <p><strong>练习 4</strong><br>
    位于 <code>kern/trap.c</code> 中的 <code>trap_init_percpu()</code> 为 BSP 初始化了 TSS 和 TSS描述符，它在 Lab 3 中可以工作，但是在其他 CPU 上运行时，它是不正确的。修改这段代码使得它能够在所有 CPU 上正确执行。（注意：你的代码不应该再使用全局变量 ts。）</p>
  </section>
  <p>当你完成了上面的练习，在 QEMU 中使用 4 个 CPU 运行 JOS，<code>make qemu CPUS=4</code> 或者 <code>make qemu-nox CPUS=4</code>， 你应当能看到以下输出：</p>
  <pre><code>Physical memory: 66556K available, base = 640K, extended = 65532K
check_page_alloc() succeeded!
check_page() succeeded!
check_kern_pgdir() succeeded!
check_page_installed_pgdir() succeeded!
SMP: CPU 0 found 4 CPU(s)
enabled interrupts: 1 2
SMP: CPU 1 starting
SMP: CPU 2 starting
SMP: CPU 3 starting
</code></pre>
  <h4 id="加锁">加锁</h4>
  <p>目前我们的代码在 <code>mp_main()</code> 初始化完 AP 就不再继续执行了。在允许 AP 继续运行之前，我们需要首先提到当多个 CPU 同时运行内核代码时造成的 <em>竞争状态</em> (race condition) ，为了解决它，最简单的办法是使用一个 <em>全局内核锁</em> (big kernel lock)。这个 big kernel lock 是唯一的一个全局锁，每当有进程进入内核模式的时候，应当首先获得它，当进程回到用户模式的时候，释放它。在这一模式中，用户模式的进程可以并发地运行在任何可用的 CPU 中，但是最多只有一个进程可以运行在内核模式下。其他试图进入内核模式的进程必须等待。</p>
  <p><code>kern/spinlock.h</code> 的 <code>kernel lock</code> 声明了这个全局内核锁，并提供了 <code>lock_kernel()</code> 和 <code>unlock_kernel()</code> 两个方法来方便获得和释放锁。你应当在以下 4 个位置使用全局内核锁：</p>
  <ul>
    <li><code>i386_init()</code> 中，在 BSP 唤醒其他 CPU 之前获得内核锁</li>
    <li><code>mp_main()</code> 中，在初始化完 AP 后获得内核锁，接着调用 <code>sched_yield()</code> 来开始在这个 AP 上运行进程。</li>
    <li><code>trap()</code> 中，从用户模式陷入(trap into)内核模式之前获得锁。你可以通过检查 <code>tf_cs</code> 的低位判断这一 trap 发生在用户模式还是内核模式（译注：Lab 3 中曾经使用过这一检查）</li>
    <li>env_run() 中，恰好在 <strong>回到用户进程之前</strong> 释放内核锁。不要太早或太晚做这件事，否则可能会出现竞争或死锁。</li>
  </ul>
  <section type="exercise">
  <p><strong>练习 5.</strong><br>
    在上述提到的位置使用内核锁，加锁时使用 <code>lock_kernel()</code>， 释放锁时使用 <code>unlock_kernel()</code>。</p>
  </section>
  <p>如何测试你的代码是正确的呢？现在还不行。你将能够在做完下一个练习，实现调度器后测试你的代码。</p>
  <section type="question">
  <p><strong>问题 2.</strong><br>
    看起来使用全局内核锁能够保证同一时段内只有一个 CPU 能够运行内核代码。既然这样，我们为什么还需要为每个 CPU 分配不同的内核堆栈呢？请描述一个即使我们使用了全局内核锁，共享内核堆栈仍会导致错误的情形。</p>
  </section>
  <section type="challenge">
  <p><strong>挑战！</strong><br>
    全局内核锁很简单，而且用起来很容易。然而，它阻止了内核模式的所有可能的并发。现代操作系统使用不同的锁来保护它们共享部分中的不同部分。有一种方法叫做 fine-grained locking，这种方法可以显著地提高运行效率，但是却更难实现，而且容易出错。如果你很勇敢，抛弃全局内核锁去拥抱 JOS 中的并发吧！ 有哪些数据需要加锁保护由你来决定，作为提示，在JOS内核中你可能需要考虑在以下共享部分加自旋锁来确保排他访问：</p>
  <ul>
    <li>页面分配器(page allocator)</li>
    <li>控制台驱动器(console driver)</li>
    <li>调度器(scheduler) （译者注：下一个练习实现）</li>
    <li>进程间通信状态(inter-process communication state)，你将在 part C 实现它。</li>
  </ul>
  </section>
  <h3 id="轮转调度算法">轮转调度算法</h3>
  <p>你的下一个任务是修改 JOS 内核以使其能够以 轮转 的方式在多个进程中切换。JOS 的轮转调度算法像这样工作：</p>
  <ul>
    <li><code>kern/sched.c</code> 中的 <code>sched_yied()</code> 函数负责挑选一个进程运行。它从刚刚在运行的进程开始，按顺序循环搜索 <code>envs[]</code> 数组（如果从来没有运行过进程，那么就从数组起点开始搜索），选择它遇到的第一个处于 <code>ENV_RUNNABLE</code>（参考 <code>inc/env.h</code>）状态的进程，并调用 <code>env_run()</code> 来运行它。</li>
    <li><code>sched_yield()</code> 绝不应当在两个CPU上同时运行同一进程。它可以分辨出一个进程正在其他CPU（或者就在当前CPU）上运行，因为这样的进程处于 <code>ENV_RUNNING</code> 状态。</li>
    <li>我们已经为你实现了新的系统调用 <code>sys_yield()</code>，用户进程可以调用它来触发内核的 <code>sched_yield()</code> 方法，自愿放弃 CPU，给其他进程运行。</li>
  </ul>
  <section type="exercise">
  <p><strong>练习 6.</strong><br>
    按照以上描述，实现 <code>sched_yield()</code> 轮转算法。不要忘记修改你的 <code>syscall()</code> 将相应的系统调用分发至 <code>sys_yield()</code>（译注：以后还要添加新的系统调用，同样不要忘记修改 <code>sys_yield()</code>）。</p>
  <p>确保你在 <code>mp_main</code> 中调用了 <code>sched_yield()</code>。</p>
  <p>修改你的 <code>kern/init.c</code> 创建三个或更多进程，运行 <code>user/yield.c</code>。<br>
    运行 <code>make qemu</code>。 你应当看到进程在退出之前会在彼此之间来回切换 5 次，就像下面这样：</p>
  <pre><code>...
Hello, I am environment 00001000.
Hello, I am environment 00001001.
Hello, I am environment 00001002.
Back in environment 00001000, iteration 0.
Back in environment 00001001, iteration 0.
Back in environment 00001002, iteration 0.
Back in environment 00001000, iteration 1.
Back in environment 00001001, iteration 1.
Back in environment 00001002, iteration 1.
...
</code></pre>
  <p>在 <code>yield</code> 测试程序退出后，系统中没有其他运行的进程了，调度器应当调用 JOS 的 内核监视器(kernel monitor)。如果这些没有发生，你应当在继续之前检查你的代码。</p>
  <p>你也应当用 <code>make qemu CPUS=2</code> 测试一下。</p>
  <p>如果你此时使用 <code>CPUS=1</code>，所有的用户进程应当成功运行并退出。使用超过 1 个 CPU 在没有更多的用户进程可以运行时，可能会导致发生 General Protection 或者 Kernel Page Fault，因为我们没有处理时钟中断。我们将会在下面修复这个问题。</p>
  </section>
  <section type="question">
  <p><strong>问题 3.</strong><br>
    在你实现的 <code>env_run()</code> 中你应当调用了 <code>lcr3()</code>。在调用 <code>lcr3()</code> 之前和之后，你的代码应当都在引用 变量 <code>e</code>，就是 <code>env_run()</code> 所需要的参数。 在装载 <code>%cr3</code> 寄存器之后， MMU 使用的地址上下文立刻发生改变，但是处在之前地址上下文的虚拟地址（比如说 <code>e</code> ）却还能够正常工作，为什么 <code>e</code> 在地址切换前后都可以被正确地解引用呢？</p>
  </section>
  <section type="question">
  <p><strong>问题 4.</strong><br>
    无论何时，内核在从一个进程切换到另一个进程时，它应当确保旧的寄存器被保存，以使得以后能够恢复。为什么？在哪里实现的呢？</p>
  </section>
  <section type="challenge">
  <p><strong>挑战！</strong><br>
    Add a less trivial scheduling policy to the kernel, such as a fixed-priority scheduler that allows each environment to be assigned a priority and ensures that higher-priority environments are always chosen in preference to lower-priority environments. If you’re feeling really adventurous, try implementing a Unix-style adjustable-priority scheduler or even a lottery or stride scheduler. (Look up “lottery scheduling” and “stride scheduling” in Google.) Write a test program or two that verifies that your scheduling algorithm is working correctly (i.e., the right environments get run in the right order). It may be easier to write these test programs once you have implemented fork() and IPC in parts B and C of this lab.</p>
  </section>
  <section type="challenge">
  <p><strong>挑战！</strong><br>
    The JOS kernel currently does not allow applications to use the x86 processor’s x87 floating-point unit (FPU), MMX instructions, or Streaming SIMD Extensions (SSE). Extend the Env structure to provide a save area for the processor’s floating point state, and extend the context switching code to save and restore this state properly when switching from one environment to another. The FXSAVE and FXRSTOR instructions may be useful, but note that these are not in the old i386 user’s manual because they were introduced in more recent processors. Write a user-level test program that does something cool with floating-point.</p>
  </section>
  <h2 id="用于创建进程的系统调用">用于创建进程的系统调用</h2>
  <p>尽管你的内核目前能够运行多个用户进程并在其中切换，但仍受限于只能运行由内核创建的进程。现在，你将实现必要的系统调用，使得用户进程也可以创建和启动其他新的用户进程。</p>
  <p>UNIX 提供了 <code>fork()</code> 系统调用作为创建进程的原型，UNIX 的 <code>fork()</code> 拷贝整个调用进程（父进程）的地址空间来创建新的进程（子进程），在用户空间唯一可观察到的区别是它们的 进程ID(process ID) 和 父进程ID(parent process ID)（分别是调用 <code>getpid</code> 和 <code>getppid</code> 返回的）。在父进程中, <code>fork()</code> 返回子进程 ID，但在子进程中，<code>fork()</code> 返回 0。默认情况下，每个进程的地址空间是私有的，内存修改对另一方不可见。</p>
  <p>你将提供一系列不同的、更原始的系统调用来创建新的用户进程。通过这些系统调用，你将能够完全在用户空间实现类似 Unix 的 <code>fork()</code> 作为其他创建进程方式的补充。你将会为 JOS 实现的新的系统调用包括：</p>
  <ul>
    <li>
      <p><code>sys_exofork</code>:</p>
      <p>该系统调用创建一个几乎完全空白的新进程：它的用户地址空间没有内存映射，也不可以运行。这个新的进程拥有和创建它的父进程（调用这一方法的进程）一样的寄存器状态。在父进程中，<code>sys_exofork</code> 会返回刚刚创建的新进程的 <code>envid_t</code>（或者一个负的错误代码，如果进程分配失败）。在子进程中，它应当返回0。（因为子进程开始时被标记为不可运行，<code>sys_exofork</code> 并不会真的返回到子进程，除非父进程显式地将其标记为可以运行以允许子进程运行。</p>
    </li>
    <li>
      <p><code>sys_env_set_status</code>:</p>
      <p>将一个进程的状态设置为 <code>ENV_RUNNABLE</code> 或 <code>ENV_NOT_RUNNABLE</code>。这个系统调用通常用来在新创建的进程的地址空间和寄存器状态已经初始化完毕后将它标记为就绪状态。</p>
    </li>
    <li>
      <p><code>sys_page_alloc</code>:</p>
      <p>分配一个物理内存页面，并将它映射在给定进程虚拟地址空间的给定虚拟地址上。</p>
    </li>
    <li>
      <p><code>sys_page_map</code>:</p>
      <p>从一个进程的地址空间拷贝一个页的映射 (<strong>不是</strong>页的内容) 到另一个进程的地址空间，新进程和旧进程的映射应当指向同一个物理内存区域，使两个进程得以共享内存。</p>
    </li>
    <li>
      <p><code>sys_page_unmap</code>:</p>
      <p>取消给定进程在给定虚拟地址的页映射。</p>
    </li>
  </ul>
  <p>对于所有以上提到的接受 Environment ID 作为参数的系统调用，JOS 内核支持用 0 指代当前进程的惯例。这一惯例在 <code>kern/env.c</code> 的 <code>envid2env()</code> 函数中被实现。</p>
  <p>我们在测试程序 <code>user/dumbfork.c</code> 中提供了一种非常原始的 Unix 样式的 <code>fork()</code>。它使用上述系统调用来创建并运行一个子进程，子进程的地址空间就是父进程的拷贝。接着，这两个进程将会通过上一个练习中实现的系统调用 <code>sys_yield</code> 来回切换。 父进程在切换 10 次后退出，子进程切换 20 次。</p>
  <section type="exercise">
  <p><strong>练习 7.</strong><br>
    在 <code>kern/syscall.c</code> 中实现上面描述的系统调用。你将需要用到在 <code>kern/pmap.c</code> 和 <code>kern/env.c</code> 中定义的多个函数，尤其是 <code>envid2env()</code>。此时，无论何时你调用 <code>envid2env()</code>，都应该传递 1 给 <code>checkperm</code> 参数。确定你检查了每个系统调用参数均合法，否则返回 <code>-E_INVAL</code>。 用 <code>user/dumbfork</code> 来测试你的 JOS 内核，在继续前确定它正常的工作。（<code>make run-dumbfork</code>）</p>
  </section>
  <section type="challenge">
  <p><strong>挑战！</strong><br>
    Add the additional system calls necessary to read all of the vital state of an existing environment as well as set it up. Then implement a user mode program that forks off a child environment, runs it for a while (e.g., a few iterations of sys_yield()), then takes a complete snapshot or checkpoint of the child environment, runs the child for a while longer, and finally restores the child environment to the state it was in at the checkpoint and continues it from there. Thus, you are effectively “replaying” the execution of the child environment from an intermediate state. Make the child environment perform some interaction with the user using sys_cgetc() or readline() so that the user can view and mutate its internal state, and verify that with your checkpoint/restart you can give the child environment a case of selective amnesia, making it “forget” everything that happened beyond a certain point.</p>
  </section>
  <p>到这里，你完成了本次实验的 Part A，用 <code>make grade</code> 来检查它， <s>并像通常一样用 <code>make handin</code> 提交</s>。 如果你想知道为什么没能通过一个特定的测试，运行 <code>./grade-lab4 -v</code>，这样你能够看到内核的编译输出和 QEMU 对每个测试的输出，直到一个测试没能通过，脚本会在此停止，这时你可以打开 <code>jos.out</code> 并看到内核输出了什么（译注：即使不这么做，评测脚本也会自动保存每次评测失败时的 JOS 输出）。</p>
  <h2 id="part-b-copy-on-write-fork--写时复制的派生">Part B: Copy-on-Write Fork / 写时复制的派生</h2>
  <p>如之前所述，Unix提供 <code>fork()</code> 系统调用作为它主要的进程创建的基础操作。<code>fork()</code> 系统调用拷贝父进程的地址空间，来创建一个新进程（子进程）。</p>
  <p>xv6 Unix 的 <code>fork()</code> 实现方式是从父进程的页面中将全部数据拷贝给子进程。这个基本上与我们的 <code>dumbfork()</code> 方式相同。将父进程的地址空间拷贝给子进程是这种 <code>fork()</code> 操作最昂贵的部分。</p>
  <p>然而，多数情况下，调用 <code>fork()</code> 后紧接着就会在子进程中调用 <code>exec()</code>，这一方法会将子进程的内存完全替换成一个新的进程。比如， shell 通常就这么做。在这种情况下，拷贝父进程的地址空间所花费的大部分时间都被浪费了，因为子进程在调用 <code>exec()</code> 之前只需要一点点它的内存。</p>
  <p>因此，随后版本的 Unix 利用虚拟内存硬件的优势，允许父进程和子进程 <strong>分享</strong> 它们映射在各自地址空间的内存，直到某个进程 <strong>修改</strong> 它为止。这种技术被称为 <strong>写时复制</strong>(copy-on-write)。为了实现这一点，调用 <code>fork()</code> 时内核只需从父进程拷贝地址空间的 映射 到子进程，而不是整个映射的页面的内容，与此同时，将复制的页映射标记为只读。当其中之一试图修改这些被分享的页面时，进程产生一个缺页（page fault），此时，Unix 内核意识到这个页面实际上是 <em>虚拟</em> 的拷贝，或者说是 <em>写时复制</em> 的拷贝，所以它为这个缺页的进程创建一个新的、私有的、可写的页面拷贝。通过这种方式，每一个页面的内容直到它们确实被修改时才真正被拷贝。这种优化使得在子进程中调用 <code>fork()</code> 后紧接着调用 <code>exec()</code> 的代价变得小得多：子进程在调用 <code>exec()</code> 之前也许只需要拷贝一个页面（当前进程的栈）。</p>
  <p>在本次实验接下来的部分，你将会实现 <em>真正的</em> ，采取写时复制方式的类 Unix 的 <code>fork()</code> 作为用户空间的调用库例程(user space library routine)。在用户空间实现 <code>fork()</code> 和写时复制支持的好处是，内核仍旧很简单，因此更容易保持正确。它也使得每个用户进程能够定义它们自己的 <code>fork()</code> 策略(semantic)。如果一个进程想要使用一些不同的实现方式（比如，我们在 <code>dumpfork()</code> 中引入的 总是拷贝 版本， 或者使 <code>fork()</code> 之后父进程和子进程完全共享空间），它们可轻易地自行实现。</p>
  <h3 id="用户模式下的缺页处理">用户模式下的缺页处理</h3>
  <p>用户模式写时复制版本的 <code>fork()</code> 需要知道那些由在写保护的页面上进行写操作引起的缺页，所以这是你将在这部分首先实现的内容。写时复制只是众多可能的用户缺页处理应用中的一种。</p>
  <p>It’s common to set up an address space so that page faults indicate when some action needs to take place. / 通常在我们建立好地址空间后，发生缺页都意味着需要执行一些操作。比如，大多数 Unix 内核一开始只在新的进程的 <em>堆栈</em> 区域映射一个页面，之后，随着进程栈的增长，在尚未映射的内核地址造成缺页时，为其分配并映射更多的栈页面。一个通常的 Unix 内核必须追踪进程在不同内存区域缺页时应当进行什么操作，例如，当缺页发生在栈区域时通常需要分配并映射新的物理页，当发生在程序的 BSS （Block Started by Symbol，用于存储全局静态变量，应当由操作系统初始化为 0）区域时通常需要分配一个新的物理页、用 0 填充并映射它。在 demand-paging （译注：在需要时才在硬盘中读取相应的代码）的系统中，在 text（代码段） 区域发生的缺页会从硬盘中读取相应的页面并映射它。</p>
  <p>对于内核来说，需要追踪的信息太多了。此处我们不使用传统的 Unix 处理方式，你将在用户空间决定应当如何处理缺页，这样可以使 Bug 的破坏性变得小一些。这种处理方式也使得应用程序在定义其内存区域时拥有更大的灵活性。在随后的实验中你将需要用到用户模式的缺页处理机制，映射并访问以磁盘为基础的文件系统上的文件。</p>
  <h4 id="设置缺页处理函数">设置缺页处理函数</h4>
  <p>为了处理自己的缺页，用户进程需要向 JOS 内核注册一个 <em>page fault handler entry point</em> 缺页处理函数入口点。 用户进程通过我们新引入的 <code>sys_env_set_pgfault_upcall</code> 系统调用注册它的缺页处理入口。我们也在 Env 结构体中添加了一个新的成员，<code>env_pgfault_upcall</code>，来记录这一信息。</p>
  <section type="exercise">
  <p><strong>练习 8.</strong><br>
    实现 <code>sys_env_set_pgfault_upcall</code> 系统调用。因为这是一个 “危险” 的系统调用，不要忘记在获得目标进程信息时启用权限检查。</p>
  </section>
  <h4 id="用户进程的通常堆栈和异常堆栈">用户进程的通常堆栈和异常堆栈</h4>
  <p>在正常执行时，JOS上的用户进程会在 <em>通常</em> 用户堆栈中运行：它的 ESP 寄存器指向 <code>USTACKTOP</code> 的起点，压入堆栈的数据存储在 [USTACKTOP-PGSIZE, USTACKTOP-1] 这一页面中。然而，当缺页发生在用户模式时，内核会在一个不同的堆栈重新启动用户进程所指定的用户模式缺页处理函数，换句话说，这个堆栈就是 user exception stack / 用户异常栈。大体上讲，我们会让 JOS 内核代表进程实现堆栈的自动切换，这看起来很像是当用户模式向内核模式转换时，x86 处理器实现的堆栈切换那样。</p>
  <p>JOS 用户异常堆栈大小也是一个页面，栈顶被定义在虚拟地址 <code>UXSTACKTOP</code> 位置，所以用户异常堆栈可用的字节是 [UXSTACKTOP-PGSIZE, UXSTACKTOP-1]。当运行在这一异常堆栈上时，用户模式的缺页处理函数可以调用 JOS 的常规系统调用来映射新的页面，或者调整映射以修复最初造成缺页的问题。接着用户模式下的缺页处理函数返回，通过一个汇编语言代码段(stub)，返回原始栈上的造成缺页的代码。</p>
  <p>每个想要支持用户模式缺页处理的进程需要通过调用 Part A 引入的 <code>sys_page_alloc()</code> 为自己的异常堆栈分配内存。</p>
  <h4 id="调用用户缺页处理函数">调用用户缺页处理函数</h4>
  <p>你现在需要修改在 <code>kern/trap.c</code> 中的缺页处理代码，像下面这样处理用户模式的缺页。我们将此时缺页的用户进程的状态称为陷入时状态(<em>trap-time</em> state)。</p>
  <p>如果没有缺页处理函数被注册，JOS 内核像以前一样，销毁用户进程并打印消息（译注：实际情况要比此处提及的稍复杂一些，请参考对应注释）。否则，内核在用户进程的异常堆栈中构造一个与 <code>inc/trap.h</code> 中的 UTrapframe 一样的 trap frame：</p>
  <pre><code>```
                &lt;-- UXSTACKTOP
trap-time esp
trap-time eflags
trap-time eip
trap-time eax  start of struct PushRegs
trap-time ecx
trap-time edx
trap-time ebx
trap-time esp
trap-time ebp
trap-time esi
trap-time edi  end of struct PushRegs
tf_err (error code)
fault_va       &lt;-- %esp when handler is run

```
（译注：这个结构比在代码注释中提到的结构更靠谱一点）
</code></pre>
  <p>内核接下来安排用户进程，使其在异常堆栈上运行它的缺页处理函数，异常处理函数带有一个栈帧(stack frame)作为参数；你应当清楚怎样内核是怎样做到这一点的。 <code>fault_va</code> 是造成缺页的虚拟地址。</p>
  <p>如果用户进程在缺页发生时已经运行在异常堆栈上了，那么缺页处理函数处理自己的缺页异常。在这种情况下，你应当就在当前的 <code>tf-&gt;tf_esp</code> 上构造一个新的 栈帧 (stack frame) 而不是从 <code>UXSTACKTOP</code> 开始构造。你应当首先压入一个空的32位长的值，然后再压入 <code>struct UTrapframe</code>。</p>
  <section type="exercise">
  <p><strong>练习 9.</strong><br>
    实现在 <code>kern/trap.c</code> 中的 <code>page_fault_handler</code> 方法，使其能够将缺页分发给用户模式缺页处理函数。确认你在写入异常堆栈时已经采取足够的预防措施了。（如果用户进程的异常堆栈已经没有空间了会发生什么？）</p>
  </section>
  <h4 id="用户模式缺页入口点">用户模式缺页入口点</h4>
  <p>接下来，你需要实现汇编例程(routine)，来调用 C 语言的缺页处理函数，并从异常状态返回到一开始造成缺页中断的指令继续执行。<strong>这个汇编例程</strong> 将会成为通过系统调用 <code>sys_env_set_pgfault_upcall()</code> 向内核注册的处理函数。</p>
  <section type="exercise">
  <p><strong>练习 10.</strong><br>
    实现在 <code>lib/pfentry.S</code> 中的 <code>_pgfault_upcall</code> 例程。返回到一开始运行造成缺页的用户代码这一部分很有趣。你在这里将会直接返回，而不是通过内核。最难的部分是同时调整堆栈并重新装载 EIP。</p>
  </section>
  <p>最终，你需要实现 C 用户调用库这边的用户模式缺页处理机制。</p>
  <section type="exercise">
  <p><strong>练习 11.</strong><br>
    完成在 <code>lib/pgfault.c</code> 中的 <code>set_pgfault_handler()</code> 。</p>
  </section>
  <h4 id="测试">测试</h4>
  <p>运行 <code>user/faultread</code> (<code>make run-faultread</code>)，你将会看到：</p>
  <pre><code>...
[00000000] new env 00001000
[00001000] user fault va 00000000 ip 0080003a
TRAP frame ...
[00001000] free env 00001000
</code></pre>
  <p>运行 <code>user/faultdie</code>，你将会看到：</p>
  <pre><code>...
[00000000] new env 00001000
fault deadbeef
this string was faulted in at deadbeef
fault cafebffe
fault cafec000
this string was faulted in at cafebffe
[00001000] exiting gracefully
[00001000] free env 00001000
</code></pre>
  <p>如果你只看到了第一个 this string … 这一行，说明你没有正确递归处理缺页。</p>
  <p>运行 <code>user/faultallocbad</code> 你将会看到：</p>
  <pre><code>...
[00000000] new env 00001000
[00001000] user_mem_check assertion failure for va deadbeef
[00001000] free env 00001000
</code></pre>
  <p>确保你清楚为什么 <code>user/faultalloc</code> 和 <code>user/faultallocbad</code> 的表现不同。</p>
  <section type="challenge">
  <p><strong>挑战！</strong><br>
    Extend your kernel so that not only page faults, but all types of processor exceptions that code running in user space can generate, can be redirected to a usermode exception handler. Write user-mode test programs to test user-mode handling of various exceptions such as divide-by-zero, general protection fault, and illegal opcode.</p>
  </section>
  <h3 id="实现写时复制的-fork">实现写时复制的 Fork</h3>
  <p>至此，你已经让内核为 能够在用户空间实现写时复制的 <code>fork()</code> 提供了足够的基本方法。</p>
  <p>我们为你在 <code>lib/fork.c</code> 提供了 <code>fork()</code> 方法的骨架。与 <code>dumbfork()</code> 相似，<code>fork()</code> 也应当创建一个新的进程，接下来，扫描整个父进程的地址空间，并在子进程中建立相应的页面映射。最关键的不同之处在于，<code>dumbfork()</code> 拷贝物理页，<code>fork()</code> 最初只拷贝 映射 。 <code>fork()</code> 只有在其中一个进程试图修改页面时才复制它。</p>
  <p><code>fork()</code> 最基本的控制流如下：</p>
  <ol>
    <li>父进程安装 <code>pgfault()</code> 作为 C 语言的缺页处理函数。这一步需要使用你在上面实现的 <code>set_pgfault_handler()</code>。</li>
    <li>父进程调用 <code>sys_exofork()</code> 创建一个子进程。</li>
    <li>对于其地址空间 <code>UTOP</code> 以下每一个可写的或者写时复制的页面，父进程调用一次 <code>duppage</code>，这个函数应当将这些页面在子进程的地址空间映射为写时复制的，同时还要在它自己的地址空间中重新映射为写时复制的。<code>duppage</code> 修改两个进程的 <code>PTE</code> 使得这个页面不再可写，并在 <code>avail</code> 段（译注：PTE的后12位中的某些位）包含 <code>PTE_COW</code> 以将写时复制的页面与真正的只读页面区分开来。</li>
  </ol>
  <p>然而，异常堆栈并不能像这样被重新映射。与此不同，你需要重新在子进程中分配一个新的页面作为其异常堆栈。因为缺页处理函数执行这个复制工作，而缺页处理函数运行在异常堆栈上。如果它被标记成了写时复制，那谁来复制它呢？（译注：这是个反问）</p>
  <p>fork()也需要处理那些存在，却不可写或者不是写时拷贝的页面。</p>
  <ol start="4">
    <li>父进程设置子进程的缺页处理入口，就像设置自己的一样。</li>
    <li>现在子进程已经准备好运行了，所以父进程将其标记为可以运行。</li>
  </ol>
  <p>每次进程写入写时复制的页面时，会造成一次缺页。这时缺页中断控制流：</p>
  <ol>
    <li>内核将缺页分发给 <code>_pgfault_upcall</code>，它会调用 <code>fork()</code> 的 <code>pgfault()</code>。</li>
    <li><code>pgfault()</code> 检查 ①这个缺页是不是写操作（在 error code 中检查 <code>FRC_WR</code>），②PTE 是否被标记为了 <code>PTE_COW</code>。如果不是，<code>panic</code>（译注：在这里 <code>panic</code> 说明你的代码在其他地方存在问题，也有可能是缺页处理函数本身的其他地方）。</li>
    <li><code>pgfault()</code> 在临时位置分配一个新的页面，并将造成缺页的页面内容拷贝给这个新的页面。接下来，将新的页面在恰当的地址映射为可读/写，替换原有的只读映射。</li>
  </ol>
  <p>用户模式的 <code>lib/fork.c</code> 代码必须查询进程的页表来执行上面提到的一些操作（例如，得知一个页面的 PTE 是不是被标记为了 <code>PTE_COW</code> ）。内核将进程的页表映射在了 UVPT 就是为了这一目的。它使用了一种 <a href="http://oslab.mobisys.cc/pdos.csail.mit.edu/6.828/2014/labs/lab4/uvpt.html">聪明的映射技巧</a> 使得用户代码查询 PTE 变得更简单。 <code>lib/entry.S</code> 设置了 <code>uvpt</code> 和 <code>uvpd</code> 所以你可以很容易地在 <code>lib/fork.c</code> 中找到页表的信息。</p>
  <section type="exercise">
  <p><strong>练习 12.</strong><br>
    实现在 <code>lib/fork.c</code> 中的 <code>fork</code>，<code>duppage</code> 和 <code>pgfault</code>。 用 <code>forktree</code> 程序来测试你的代码(<code>make run-forktree</code>)。它应当产生下面的输出，其中夹杂着 <strong>new env</strong>, <strong>free env</strong> 和 <strong>exiting gracefully</strong> 这样的消息。下面的这些输出可能不是按照顺序的，进程ID也可能有所不同：</p>
  <pre><code>1000: I am ''
1001: I am '0'
2000: I am '00'
2001: I am '000'
1002: I am '1'
3000: I am '11'
3001: I am '10'
4000: I am '100'
1003: I am '01'
5000: I am '010'
4001: I am '011'
2002: I am '110'
1004: I am '001'
1005: I am '111'
1006: I am '101'
</code></pre>
  </section>
  <section type="challenge">
  <p><strong>挑战!</strong><br>
    Implement a shared-memory fork() called sfork(). This version should have the parent and child share all their memory pages (so writes in one environment appear in the other) except for pages in the stack area, which should be treated in the usual copy-on-write manner. Modify user/forktree.c to use sfork() instead of regular fork(). Also, once you have finished implementing IPC in part C, use your sfork() to run user/pingpongs. You will have to find a new way to provide the functionality of the global thisenv pointer.</p>
  </section>
  <section type="challenge">
  <p><strong>挑战!</strong><br>
    Your implementation of fork makes a huge number of system calls. On the x86, switching into the kernel using interrupts has non-trivial cost. Augment the system call interface so that it is possible to send a batch of system calls at once. Then change fork to use this interface. How much faster is your new fork? You can answer this (roughly) by using analytical arguments to estimate how much of an improvement batching system calls will make to the performance of your fork: How expensive is an int 0x30 instruction? How many times do you execute int 0x30 in your fork? Is accessing the TSS stack switch also expensive? And so on… Alternatively, you can boot your kernel on real hardware and really benchmark your code. See the RDTSC (read time-stamp counter) instruction, defined in the IA32 manual, which counts the number of clock cycles that have elapsed since the last processor reset. QEMU doesn’t emulate this instruction faithfully (it can either count the number of virtual instructions executed or use the host TSC, neither of which reflects the number of cycles a real CPU would require).</p>
  </section>
  <p>Part B 到此结束，你可以用 <code>make grade</code> 检查你的代码。</p>
  <h2 id="part-c-preemptive-multitasking-and-inter-process-communication--抢占式多任务与进程间通信ipc">Part C: Preemptive Multitasking and Inter-Process communication / 抢占式多任务与进程间通信(IPC)</h2>
  <p>在实验的最后一部分你将修改内核来抢占不合作进程，并允许进程间显式地进行通信。</p>
  <h3 id="时钟中断和抢占">时钟中断和抢占</h3>
  <p>运行测试程序 <code>user/spin</code> 。这个测试程序创建一个子进程，一旦子进程占据 CPU ，它将永远循环下去。无论是父进程还是内核都无法再重新占据 CPU 。对于保护系统不受 Bug 或者用户模式的恶意进程影响来说，这显然不是一个理想的情况，因为任何一个用户进程，只要无限循环，不再让出 CPU，就会让整个系统宕机。为了允许内核能够抢占 (preemption)一个运行中的进程，强制从其上取得 CPU 的控制权，我们必须拓展我们的 JOS 内核以支持时钟硬件发出的外部硬件中断。</p>
  <h4 id="中断原理">中断原理</h4>
  <p>外部中断（或者说，设备中断）被称为 <strong>IRQ</strong>（interrupt request） ，有 16 个可能的 IRQ，编号是从 0 到 15。 将 IRQ 映射到 IDT 入口的方法不是固定的。<code>picirq.c</code> 中的 <code>pic_init</code> 方法将 0-15 号 IRQ 映射到了 IDT 入口的 <code>IRQ_OFFSET</code> 到 <code>IRQ_OFFSET + 15</code> 的位置。</p>
  <p>在 <code>inc/trap.h</code>，<code>IRQ_OFFSET</code> 被定义为 32， 因此 IDT 入口的 32-47 就相应的对应 IRQ 的 0-15。例如，时钟中断是 IRQ 0，所以内核中的 <code>IDT[IRQ_OFFSET + 0]</code>（即，IDT[32] )包含时钟中断的中断处理函数的地址（译注：这是你在接下来的练习中应当实现的内容）。选择这个 <code>IRQ_OFFSET</code> 的原因，是因为设备中断不会与处理器中断有所重叠，否则显然会造成困扰。（事实上，在早些日子，个人计算机运行 MS-DOS 时，<code>IRQ_OFFSET</code> 取值就是 0，这当然为处理设备中断和处理器中断造成了大量困扰。）</p>
  <p>在 JOS 中，我们和 xv6 Unix 相比做了关键的简化。在内核运行时，外部设备的中断总是被禁止（和 xv6 一样，在用户空间时启用。）外部中断被处在 <code>%eflags</code> 的 <code>FL_IF</code> 标志位控制（参考 <code>inc/mmu.h</code>）。当这一位被置位时，外部中断被打开。这个标志位可以有多种方式被修改，但为了简化，我们仅仅需要在保存和恢复 <code>%eflags</code> 的时候，即，进入或退出用户模式时，修改。</p>
  <p>你需要确保 <code>FL_IF</code> 标志位在用户进程运行时总是被设置的，以使得每当中断到达的时候，它会被传入处理器并被你的中断处理代码处理。否则，我们说中断被屏蔽(mask)了，或者说，被忽略了，直到中断被重新打开。我们已经在 bootloader 的一开始屏蔽了中断，到目前为止我们还从未重新打开它。</p>
  <section type="exercise">
  <p><strong>练习 13</strong><br>
    修改 <code>kern/trapenrty.S</code> 和 <code>kern/trap.c</code> 来初始化一个合适的 IDT 入口，并为 IRQ 0-15 提供处理函数。接着，修改 <code>kern/env.c</code> 中的<code>env_alloc()</code> 以确保用户进程总是在中断被打开的情况下运行。</p>
  <p>当调用用户中断处理函数时，处理器从来不会将 error code 压栈，也不会检查IDT 入口的描述符特权等级 (Descriptor Privilege Level, DPL) 。此时你可能需要重新阅读一下 <a href="http://oslab.mobisys.cc/pdos.csail.mit.edu/6.828/2014/readings/i386/toc.htm">80386 手册</a> 中 9.2 这一部分，或者 <a href="http://oslab.mobisys.cc/pdos.csail.mit.edu/6.828/2014/readings/ia32/IA32-3A.pdf">IA-32 Intel Architecture Software Developer’s Manual</a>, Volume 3 的 5.8 章节。</p>
  <p>完成这个练习后，当你运行任何一个运行时间较长的测试程序时（比如 <code>make run-spin</code>），你应当看见内核打印硬件中断的 trap frame。因为到目前为止，虽然处理器的硬件中断已经被打开了，但 JOS 还没有处理它，所以你应该注意到，它以为这个中断发生在正在运行的用户进程，并将其销毁。最终当没有进程可以销毁的时候，JOS 会陷入内核监视器。</p>
  </section>
  <h4 id="处理时钟中断">处理时钟中断</h4>
  <p>在测试程序 <code>user/spin</code> 中，子进程一旦运行，它就会不断地循环，内核则不再能重新取得控制权。我们需要为硬件编程，使其定期产生时钟中断，当收到中断时内核将会夺回控制权，从而我们可以切换到不同的用户进程。</p>
  <p>我们为你写好的 <code>lapic_init</code> 和 <code>pic_init</code> （位于 <code>init.c</code> 的 <code>i386_init</code>） 函数中设置了时钟和中断控制器来产生中断。你现在需要完成处理这些中断的代码。</p>
  <section type="exercise">
  <p><strong>练习14.</strong><br>
    修改内核的 <code>trap_dispatch()</code> 函数，使得其每当收到时钟中断的时候，它会调用 <code>sched_yield()</code> 寻找另一个进程并运行。</p>
  <p>你现在应当能让 <code>user/spin</code> 测试程序正常工作了（译注：这里有一个文档中没有提到的细节。如果你发现时钟中断只发生一次就再也不会发生了，你应当再去看看 <code>kern/lapic.c</code>）：父进程会创建子进程，<code>sys_yield()</code> 会切换到子进程几次，但在时间片过后父进程会重新占据 CPU，并最终杀死子进程并正常退出。</p>
  </section>
  <p>现在，是时候做一些回溯检查 (regression testing)了。确保你启用中断后没有让曾经能够正常运行的部分（比如, <code>forktree</code>）被破坏掉。也应当试试多个 CPU，<code>make CPUS=2 target</code>（译注：使用多个 CPU 有概率导致 <code>user/spin</code> 无法通过测试 可以想一下为什么？）。现在你应该能够通过 <code>stresssched</code> 这个测试程序了。试试运行 make grade 看看是不是这样。你应该能够获得这个实验的 65/75 分了（译注：应该是 65/80）。</p>
  <h3 id="进程间通信-ipc">进程间通信 (IPC)</h3>
  <p>（技术上来讲在 JOS 中应该是 “环境间通信” 或者说 “IEC”，但是既然所有其他系统都叫它 IPC，我们也会用标准术语。）（译注：为了翻译方便，上文中的进程实际上均为 environment，我猜，也许你已经在 Lab 3 中习惯了把 环境 翻译成 进程了 &gt;.&lt; ）</p>
  <p>我们一直着眼于操作系统的独立层面，即认为每一个进程都独立地享有机器的所有资源。但操作系统另一个重要服务是允许程序在它们想要通信的时候互相通信。允许程序与其他程序互动可以非常强大。Unix 的管道模型就是非常古典的例子。</p>
  <p>有许多进程间通信的模型，即使直到今天对于哪种模型最好这一问题的仍有很多争议。我们不会与他们争执，而是实现一种简单的 IPC 策略并尝试它。</p>
  <h4 id="jos-的进程间通信">JOS 的进程间通信</h4>
  <p>你现在需要实现一些额外的 JOS 系统调用，它们共同提供了一种简单的进程间通信方式。你将会实现两个系统调用 <code>sys_ipc_recv</code> 和 <code>sys_ipc_try_send</code>。接下来你会实现两个库封装 (library wrapper) 函数 <code>ipc_recv</code> 和 <code>ipc_send</code>。</p>
  <p>使用 JOS 的进程间通信策略，用户进程可以互相发送的消息有两种；一个 32 位整数，一个可选的页面映射。允许用户进程在通信时传递页面映射与传递一个 32 位整数相比是一个非常有效的方式，同时也允许了用户进程能够很容易地安排共享内存区域。</p>
  <h4 id="发送和接受消息">发送和接受消息</h4>
  <p>进程调用 <code>sys_ipc_recv</code> 来接受一个消息。系统调用将其移出运行队列，直到收到消息前都不再运行。当一个进程在等待接受消息状态时，任何一个进程都可以向它发送消息，而不是只有特定的进程可以，也不仅限于它的父进程/子进程。换句话说，在 Part A 中你使用过的权限检查在 IPC 过程中就不再有用了，因为 IPC 系统调用经过仔细的设计以保证它是安全的：一个用户进程不会因为发送消息而导致另一个进程错误运行，除非另一个进程也同样存在 Bug。</p>
  <p>进程调用 <code>sys_ipc_try_send</code> 来发送一个值。这个函数带有两个参数 接收者的进程ID 和 想要发送的值。如果目标进程正处于接收消息的状态（即，已经调用了 <code>sys_ipc_call</code> 但还没有收到一个消息），这个函数将发送消息并返回0。否则函数返回 <code>-E_IPC_NOT_RECV</code> 来指示目标进程并不希望收到一个值。</p>
  <p>用户空间的库函数 <code>ipc_recv</code> 会处理对 <code>sys_ipc_recv</code>的调用，并在当前进程的 <code>struct Env</code> 中查找有关收到的消息的一些信息。</p>
  <p>与之相似，库函数 <code>ipc_send</code> 会处理对 <code>sys_ipc_try_send</code> 的重复调用直到信息发送成功。</p>
  <h4 id="传递页面">传递页面</h4>
  <p>进程调用 <code>sys_ipc_recv</code> 时如果带有一个有效的 <code>dstva</code> 参数（在 <code>UTOP</code> 之下），它即表明自己希望收到一个页映射。如果发送者发送了一个页面，这个页应当被映射在接收者地址空间的 <code>dstva</code> 位置。如果接收者在 <code>dstva</code> 位置已经映射了一个页面，之前的页面将被取消映射。</p>
  <p>进程调用 <code>sys_ipc_try_send</code> 时如果带有一个有效的 <code>srcva</code> 参数（在 <code>UTOP</code> 之下），这意味着发送者希望发送一个目前映射在 <code>srcva</code> 的页面给接收者，权限是 <code>perm</code>。进程间通信成功后，发送者地址空间在 <code>srcva</code> 的原有页面保持不变，接收者在 <code>dstva</code> 获得一份同一个物理页的拷贝。这样做的结果是，这个物理页在发送者和接收者之间得以共享。</p>
  <p>如果发送者或接收者之一没有提到应当传递页面，那么页面就不会传递。在任何一个进程间通信发生后，内核应当将接收者的 <code>struct Env</code> 中新的字段 <code>env_ipc_perm</code> 设置为接收到的页面权限，如果没有收到页面，应当设置为 0。</p>
  <h4 id="实现进程间通信">实现进程间通信</h4>
  <section type="exercise">
  <p><strong>练习 15.</strong><br>
    实现 <code>kern/syscall.c</code> 中的 <code>sys_ipc_recv</code> 和 <code>sys_ipc_try_send</code>。在实现它们前，你应当读读两边的注释，因为它们需要协同工作。当你在这些例程中调用 <code>envid2env</code> 时，你应当将 <code>checkperm</code> 设置为 0，这意味着进程可以与任何其他进程通信，内核除了确保目标进程 ID 有效之外，不会做其他任何检查。</p>
  <p>接下来在 <code>lib/ipc.c</code> 中实现 <code>ipc_recv</code> 和 <code>ipc_send</code>。</p>
  <p>用 <code>user/pingpong</code> 和 <code>user/primes</code> 来测试你的 IPC 机制。 <code>user/primes</code> 会为每一个素数生成一个新的进程，直到 JOS 已经没有新的进程页可以分配了。</p>
  <p><code>user/primes.c</code> 用来创建子进程和通信的代码读起来可能很有趣。（译注：可能因为 <code>user/primes</code> 的输出过多，有时无法从 QEMU 输出串口读取全部的输出，测试脚本可能判定程序运行错误。多运行几次试试看？）</p>
  </section>
  <section type="challenge">
  <p><strong>挑战!</strong><br>
    Why does ipc_send have to loop? Change the system call interface so it doesn’t have to. Make sure you can handle multiple environments trying to send to one environment at the same time.</p>
  </section>
  <section type="challenge">
  <p><strong>挑战!</strong><br>
    The prime sieve is only one neat use of message passing between a large number of concurrent programs. Read C. A. R. Hoare, ``Communicating Sequential Processes,’’ Communications of the ACM 21(8) (August 1978), 666-667, and implement the matrix multiplication example.</p>
  </section>
  <section type="challenge">
  <p><strong>挑战!</strong><br>
    One of the most impressive examples of the power of message passing is Doug McIlroy’s power series calculator, described in <a href="http://plan9.bell-labs.com/who/rsc/thread/squint.pdf">M. Douglas McIlroy,``Squinting at Power Series,’’ Software–Practice and Experience, 20(7) (July 1990)</a>, 661-683. Implement his power series calculator and compute the power series for sin (x+x^3).</p>
  </section>
  <section type="challenge">
  <p><strong>挑战!</strong><br>
    Make JOS’s IPC mechanism more efficient by applying some of the techniques from Liedtke’s paper, <a href="http://dl.acm.org/citation.cfm?id=168633">Improving IPC by Kernel Design</a>, or any other tricks you may think of. Feel free to modify the kernel’s system call API for this purpose, as long as your code is backwards compatible with what our grading scripts expect.</p>
  </section>
  <p>Part C 到这里就结束了。确保你已经通过了所有 <code>make grade</code> 测试，不要忘记把每个问题的答案和你解决的一个挑战的说明写在 <code>answers-lab4.txt</code> 中。</p>
  <p>在提交之前，使用 <code>git status</code> 和 <code>git diff</code> 来检查你的更改。不要忘记 <code>git add answers-lab4.txt</code>。当你准备好后，通过 <code>git commit -am 'my solutions to lab4</code> 提交你的更改，并提交到 gitlab 中。</p>
  <hr>
  <p>译： Sun Yi-Ran (sunrisefox@vampire.rip)</p>
  <p>校： Sun Yi-Ran (sunrisefox@vampire.rip)</p>
  <p>如有翻译错误，请务必联系喵 ，以便及时更正</p>
  <p><a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></p>
</div>
</template>
