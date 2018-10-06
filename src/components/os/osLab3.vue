<script>

export default {
  name: 'os-lab3',
  data() {
    return {};
  },
};

</script>
<style scoped lang="scss">

</style>

<template>
<div :id="$options.name" :class="$options.name" class="content">
  <h1 id="lab-3-user-environment-用户进程">Lab 3: User Environment 用户进程</h1>
  <h2 id="introduction--介绍">Introduction / 介绍</h2>
  <p>在本次实验中，你将实现使受保护的用户模式进程(英文原文是 environment，下同)得以运行的基础内核功能。在你的努力下，JOS 内核将建立起用于追踪用户进程的数据结构，创建一个用户进程，读入程序映像并运行。你也会使 JOS 内核有能力响应用户进程的任何系统调用，并处理用户进程所造成的异常。</p>
  <p><strong>注意：</strong> 本次实验的 <em>environment</em> 和 <em>process</em> 是可以互换的，它们都指的是使一个程序得以运行的抽象概念。我们引入 <em>environment</em> 这个术语而不是使用更通用的术语 <em>process</em>，是为了强调，JOS的 <em>环境</em> 和 UNIX 的 <em>进程</em> 提供不同的接口，也有着不同的语义。（译注：为了统一，我们仍然使用通用术语“进程”，如需要区分，则单独注明）</p>
  <h3 id="getting-start--开始">Getting Start / 开始</h3>
  <p>使用 Git 来提交你在上交 Lab 2 之后的代码更改（如果有的话），<s>从课程容器中获得最新版本的代码</s>（我们不需要这么做），并基于我们的 lab3 分支 <strong>origin/lab3</strong> 创建一个新的本地分支 <strong>lab3</strong>：</p>
  <pre class=" language-bash"><code class="prism  language-bash"><span class="token function">cd</span> ~/6.828/lab
<span class="token function">git</span> commit -am <span class="token string">'changes to lab2 after handin'</span>
<span class="token comment"># git pull</span>
<span class="token function">git</span> checkout -b lab3 origin/lab3
<span class="token function">git</span> merge lab2
</code></pre>
  <p>Lab 3 包含一些新的源代码文件，你应该浏览一下：</p>

  <table>
    <thead>
    <tr>
      <th>目录</th>
      <th>文件</th>
      <th>说明</th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td>inc/</td>
      <td>env.h</td>
      <td>用户模式进程的公用定义</td>
    </tr>
    <tr>
      <td></td>
      <td>trap.h</td>
      <td>陷阱处理的公用定义</td>
    </tr>
    <tr>
      <td></td>
      <td>syscall.h</td>
      <td>用户进程向内核发起系统调用的公用定义</td>
    </tr>
    <tr>
      <td></td>
      <td>lib.h</td>
      <td>用户模式支持库的公用定义</td>
    </tr>
    <tr>
      <td>kern/</td>
      <td>env.h</td>
      <td>用户模式进程的内核私有定义</td>
    </tr>
    <tr>
      <td></td>
      <td>env.c</td>
      <td>用户模式进程的内核代码实现</td>
    </tr>
    <tr>
      <td></td>
      <td>trap.h</td>
      <td>陷阱处理的内核私有定义</td>
    </tr>
    <tr>
      <td></td>
      <td>trap.c</td>
      <td>与陷阱处理有关的代码</td>
    </tr>
    <tr>
      <td></td>
      <td>trapentry.S</td>
      <td>汇编语言的陷阱处理函数入口点</td>
    </tr>
    <tr>
      <td></td>
      <td>syscall.h</td>
      <td>系统调用处理的内核私有定义</td>
    </tr>
    <tr>
      <td></td>
      <td>syscall.c</td>
      <td>与系统调用实现有关的代码</td>
    </tr>
    <tr>
      <td>lib/</td>
      <td>Makefrag</td>
      <td>构建用户模式调用库的 Makefile fragment, obj/lib/libuser.a</td>
    </tr>
    <tr>
      <td></td>
      <td>entry.S</td>
      <td>汇编语言的用户进程入口点</td>
    </tr>
    <tr>
      <td></td>
      <td>libmain.c</td>
      <td>从 entry.S 进入用户模式的库调用</td>
    </tr>
    <tr>
      <td></td>
      <td>syscall.c</td>
      <td>用户模式下的系统调用桩(占位)函数</td>
    </tr>
    <tr>
      <td></td>
      <td>console.c</td>
      <td>用户模式下 putchar() 和 getchar() 的实现，提供控制台输入输出</td>
    </tr>
    <tr>
      <td></td>
      <td>exit.c</td>
      <td>用户模式下 exit() 的实现</td>
    </tr>
    <tr>
      <td></td>
      <td>panic.c</td>
      <td>用户模式下 panic() 的实现</td>
    </tr>
    <tr>
      <td>user/</td>
      <td>*</td>
      <td>检查 Lab 3 内核代码的各种测试程序</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    </tbody>
  </table><p>除此之外，我们在 lab2 提交过的一些源码文件在 lab3 中有所修改，可以通过 <code>git diff lab2</code> 来检查这些改动。</p>
  <p>你也许会想要再看看这个 <a href="http://oslab.mobisys.cc/pdos.csail.mit.edu/6.828/2014/labguide.html">实验用工具指南</a>，因为其中包含的调试用户代码相关的信息在本次实验中可能有用。</p>
  <h3 id="lab-requirements--实验要求">Lab Requirements / 实验要求</h3>
  <p>本次实验包含两部分，A 和 B。A 在作业布置后的下一周截止，即使你的代码到那时还没能通过全部的打分脚本，你也应该在 Part A 截止日期之前提交你的修改（如果全部通过了，棒！）你只要在 Part B 截止之前，也就是第二个周末，通过全部的打分脚本就好了。</p>
  <p>与 Lab 2 一样，你需要完成本次实验中的所有常规练习和 <em>至少一个</em> 挑战练习（整个实验完成一个就好了）。你也要为本次实验中的问题写个简要回答，并用一两段文字来描述你是如何完成你选择的挑战练习的，并将答案放在实验目录顶层的 <strong>answers-lab3.txt</strong> 中（如果你完成了不只一个挑战练习，你只需要在文件中介绍其中一个就好了）。不要忘了用 <code>git add answers-lab3.txt</code> 在你的提交中包含这个答案文件。</p>
  <h3 id="inline-assembly--内联汇编">Inline Assembly / 内联汇编</h3>
  <p>在本次实验中，你也许会发现 GCC 的内联汇编语言功能非常有用，虽然完全不用它就完成本次实验也是有可能的。不管怎样，你至少需要能够理解我们提供给你的源码中的内联汇编（<strong>asm</strong> 语句）。在这个<a href="http://oslab.mobisys.cc/pdos.csail.mit.edu/6.828/2014/reference.html">参考资料</a>中可以找到一些有关 GCC 内联汇编的信息。</p>
  <h2 id="part-a-user-environments-and-exception-handling--用户进程和错误处理">Part A: User Environments and Exception Handling / 用户进程和错误处理</h2>
  <p>新的源码文件 <code>inc/env.h</code> 中包含一些 JOS 中用户进程的基础定义，现在就读读它。内核使用 <strong>Env</strong> 这个数据结构来追踪每一个用户进程。作为开始，本次实验你只需要创建一个进程就可以了，但是你需要通过设计，让 JOS 内核能够支持多个进程。 Lab 4 会利用到这个功能，使得用户进程可以通过 <code>fork</code> 来创建其他用户进程。</p>
  <p>正如你在 <code>kern/env.c</code> 所见，内核维护三个与进程有关的主全局变量：</p>

  <table>
    <thead>
    <tr>
      <th></th>
      <th></th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td>struct Env *envs = NULL;</td>
      <td>// 所有进程</td>
    </tr>
    <tr>
      <td>struct Env *curenv = NULL;</td>
      <td>// 当前正在运行的进程</td>
    </tr>
    <tr>
      <td>static struct Env *env_free_list;</td>
      <td>// 空闲进程链表</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
    </tr>
    </tbody>
  </table><p>当 JOS 启动并开始运行，<code>envs</code> 指针指向一个表示系统中所有进程的 <code>Env</code> 结构体的数组。在我们的设计中， JOS 内核会支持同时运行最多 <code>NENV</code> 个活动进程，虽然通常来说，任何时候运行的进程都会远比这个少（ <code>NENV</code> 是在 <code>inc/env.h</code> 中通过 <code>#define</code> 定义的常量）。<code>envs</code> 数组在初始化后，就包含为 NENV 个进程实例分配的 Env 结构体的空间。</p>
  <p>JOS 内核将所有不活动的 <code>Env</code> 结构体放在 <code>env_free_list</code> 中，这种设计使得分配和销毁进程变得容易，因为只需要将结构体从 <code>env_free_list</code> 添上或者删掉就可以了。</p>
  <p>内核用 <code>curenv</code> 符号来追踪某个给定时间点 <em>正在运行</em> 的进程。在启动过程中，第一个进程启动之前，<code>curenv</code> 被初始化成 <code>NULL</code>。</p>
  <h3 id="environment-state--进程状态">Environment State / 进程状态</h3>
  <p><code>inc/env</code> 中定义了 <code>Env</code> 结构体，在后续的实验中，我们还要在其中添加更多字段。</p>

  <table>
    <thead>
    <tr>
      <th></th>
      <th></th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td>struct Env</td>
      <td>{</td>
    </tr>
    <tr>
      <td>struct Trapframe env_tf;</td>
      <td>// 保存的寄存器</td>
    </tr>
    <tr>
      <td>struct Env *env_link;</td>
      <td>// 下一个空闲 Env</td>
    </tr>
    <tr>
      <td>envid_t env_id;</td>
      <td>// 唯一进程标识符</td>
    </tr>
    <tr>
      <td>envid_t env_parent_id;</td>
      <td>// 父进程的 env_id</td>
    </tr>
    <tr>
      <td>enum EnvType env_type;</td>
      <td>// 标识特殊的系统进程</td>
    </tr>
    <tr>
      <td>unsigned env_status;</td>
      <td>// 进程状态</td>
    </tr>
    <tr>
      <td>uint32_t env_runs;</td>
      <td>// 进程的运行次数计数</td>
    </tr>
    <tr>
      <td>// 地址空间</td>
      <td></td>
    </tr>
    <tr>
      <td>pde_t *env_pgdir;</td>
      <td>// 页目录的虚拟内存地址</td>
    </tr>
    <tr>
      <td>};</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td></td>
    </tr>
    </tbody>
  </table><p><code>Env</code> 中各个字段的用处：</p>
  <ul>
    <li>
      <p><strong>env_tf:</strong></p>
      <p>在 <code>inc/trap.h</code> 中定义的这个结构体，存储当进程 <em>没有</em> 在运行时被保存下来的寄存器的值。具体来说，当内核或者另一个不同的进程在运行的时候。内核在从用户模式切换到内核模式时将上一个进程的寄存器的值保存下来，从而进程可以从它被暂停的时间点恢复过来。</p>
    </li>
    <li>
      <p><strong>env_link:</strong></p>
      <p>指向下一个位于 <code>env_free_list</code> 中的 <code>Env</code> 结构体的指针。<code>env_free_list</code> 指向链表中第一个空闲进程。</p>
    </li>
    <li>
      <p><strong>env_id:</strong></p>
      <p>内核将可以唯一确定是哪个进程正在使用这个 <code>Env</code> 数组的标识符存储在这里（或者说，是哪个进程在占用 <code>envs</code> 数组中这个特定的位置）。当一个用户进程终止时，内核也许会将同一个 <code>Env</code> 结构分配给另一个进程，但即使新进程重复使用 <code>envs</code> 数组的同一个位置，它页将会拥有一个与旧进程不同的 <code>env_id</code>。</p>
    </li>
    <li>
      <p><strong>env_parent_id:</strong></p>
      <p>内核在这里存储创建这个进程的进程的 <code>env_id</code>。通过这种方式，进程可以形成一个 <code>进程树</code> (family tree)，这样在做一些安全决定来确定某个进程能对哪些进程做什么时非常有用。</p>
    </li>
    <li>
      <p><strong>env_type:</strong></p>
      <p>这一字段用来区别一些特殊的进程。对于大多数进程，它会是 <code>ENV_TYPE_USER</code>。在接下来的实验中我们将会引入一些其他类型，来表示特殊的系统服务进程。</p>
    </li>
    <li>
      <p><strong>env_status:</strong></p>
      <p>这个变量的值可能是下面这些中的一个：</p>
      <ul>
        <li><code>ENV_FREE</code>: 这个 <code>Env</code> 结构未被利用，因此在 <code>env_free_list</code> 中。</li>
        <li><code>ENV_RUNNABLE</code>: 表示一个正在等待进入处理器运行的进程。</li>
        <li><code>ENV_RUNNING</code>: 表示目前正在运行的进程。</li>
        <li><code>ENV_NOT_RUNNABLE</code>: 表示目前已经激活的进程，但是它还没有准备好运行，例如，它可能在等其他进程的进程间通信(interprocess communication, IPC)。</li>
        <li><code>ENV_DYING</code>: 表示一个僵尸进程。僵尸进程将在下一次陷入内核的时候被释放。在 Lab 4 之前，我们不会用到这个标记。</li>
      </ul>
    </li>
    <li>
      <p><strong>env_pgdir:</strong></p>
      <p>这个变量储存这个进程的页目录的内核 <em>虚拟地址</em></p>
    </li>
  </ul>
  <p>Like a Unix process, a JOS environment couples the concepts of “thread” and “address space”. The thread is defined primarily by the saved registers (the env_tf field), and the address space is defined by the page directory and page tables pointed to by env_pgdir. To run an environment, the kernel must set up the CPU with both the saved registers and the appropriate address space. / 与 Unix 进程类似，JOS 进程的 “线程” 和 “地址空间” 概念也是成对的。线程是指保存的寄存器，也就是 <code>env_tf</code> 这个字段。而地址空间是指 <code>env_pgdir</code> 所指向的页目录和页表。要想运行一个进程，内核必须把保存的寄存器和正确的地址空间都送入 CPU。</p>
  <p>我们的 <code>struct Env</code> 在某种意义上与 xv6 中的 <code>struct proc</code> 是相似的，它们都将进程的用户模式寄存器状态保存进一个叫 <code>Trapframe</code> 的结构。在 JOS 中，不同进程没有它们自己的内核栈，而在 xv6 中进程是有的。这是因为同一时刻 <em>只有一个</em> JOS 进程能够在内核中运行，所以 JOS 只需要一个内核栈。</p>
  <h3 id="allocating-the-environments-array--为进程数组分配空间">Allocating the Environments Array / 为进程数组分配空间</h3>
  <p>在 Lab 2 中，你通过 <code>mem_init()</code> 为 pages[] 数组分配了内存空间，内核通过这一数组追踪哪些页是空闲的，哪些页被占用了。现在，类似地，你需要进一步修改 <code>mem_init()</code> 来为 <code>Env</code> 结构体的数组， <code>envs</code>，分配内存。</p>
  <section type="exercise">
  <p><strong>练习 1.</strong><br>
    修改 <code>kern/pmap.c</code> 中的 <code>mem_init()</code> 函数来分配并映射 <code>envs</code> 数组。这个数组包含恰好 <code>NENV</code> 个 <code>Env</code> 结构体实例，这与你分配 <code>pages</code> 数组的方式非常相似。另一个相似之处是，支持 <code>envs</code> 的内存储应该在页表中被只读映射在 <code>UENVS</code> 位置（于 <code>inc/memlayout.h</code> 中定义），所以，用户进程可以从这个数组中读取数据。</p>
    <p>修改好后，<code>check_kern_pgdir()</code> 应该能够成功执行。</p>
  </section>
  <h3 id="creating-and-runnning-environments--创建并运行进程">Creating and Runnning Environments / 创建并运行进程</h3>
  <p>现在，你需要在 <code>kern/env.c</code> 中完成运行用户进程所必须的代码。因为我们还没有文件系统，我们需要让内核去加载 <em>嵌入内核自身</em> 的静态二进制映像。JOS 将这个二进制文件作为 ELF 可执行映像嵌在内核中。</p>
  <p>Lab 3 的 <code>GNUmakefile</code> 在 <code>obj/user/</code> 目录生成了一些二进制映像。如果你看了 <code>kern/Makefrag</code> ，你会注意到某种魔法将这些二进制文件直接"链接"到了内核可执行文件中，就像是 <code>.o</code> 文件一样。链接器指令中的 <code>-b binary</code> 选项使得这些文件被链接成未经解释的二进制文件，而不是被链接成那种通常是编译器产生的 <code>.o</code> 文件（就链接器而言，这些文件并不必须是 ELF 映像，它们可以是任何东西，甚至是文本或者图片）。如果在内核构建完毕后看看 <code>obj/kern/kernel.sym</code> ，你会注意到链接器魔法地生成了一些非常有趣的，拥有诸如 <code>_binary_obj_user_hello_start</code>，<code>_binary_obj_user_hello_end</code> 和 <code>_binary_obj_user_hello_size</code> 这样有着模糊名字的符号。链接器通过对二进制文件的文件名进行<a href="https://en.wikipedia.org/wiki/Name_mangling">命名修饰</a>生成这些符号；这些符号为内核代码提供了一种引用这些嵌入的二进制文件的方式。</p>
  <p>在 <code>kern/init.c</code> 的 <code>i386_init()</code> 方法中，你会看到运行其中一个二进制映像的的代码。然而，用于配置用户进程的关键函数还没有完成，你需要将其补全。</p>
  <section type="exercise">
  <p><strong>练习 2.</strong><br>
    在 <code>env.c</code> 中，完成接下来的这些函数：</p>
  <ul>
    <li>
      <p><strong><code>env_init()</code></strong> 初始化全部 <code>envs</code> 数组中的 <code>Env</code> 结构体，并将它们加入到 <code>env_free_list</code> 中。还要调用 <code>env_init_percpu</code> ，这个函数会将段硬件的分隔不同段用于特权等级 0 (内核) 和特权等级 3（用户）。</p>
    </li>
    <li>
      <p><strong><code>env_setup_vm()</code></strong> 为新的进程分配一个页目录，并初始化新进程的地址空间对应的内核部分。</p>
    </li>
    <li>
      <p><strong><code>region_alloc()</code></strong> 为进程分配和映射物理内存。</p>
    </li>
    <li>
      <p><strong><code>load_icode()</code></strong> 你需要处理 ELF 二进制映像，这个很像是启动引导器(boot loader)已经做好的那样。并将映像内容读入新进程的用户地址空间。</p>
    </li>
    <li>
      <p><strong><code>env_create()</code></strong> 通过调用 <code>env_alloc</code> 分配一个新进程，并调用 <code>load_icode</code> 读入 ELF 二进制映像。</p>
    </li>
    <li>
      <p><strong><code>env_run()</code></strong> 启动给定的在用户模式运行的进程。</p>
    </li>
  </ul>
  <p>当你在完成这些函数时，你也许会发现 cprintf 的新的 <code>%e</code> 很好用，它会打印出与错误代码相对应的描述，例如： <code>r = -E_NO_MEM; panic("env_alloc: %e", r);</code> 会 panic 并打印出 <code>env_alloc: out of memory</code>。</p>
  </section>
  <p>下面是直到用户代码被运行前的调用层次图，确定你明白了每一步的目的：</p>
  <ul>
    <li>start (kern/entry.S)</li>
    <li>i386_init (kern/init.c)
      <ul>
        <li>cons_init</li>
        <li>mem_init</li>
        <li>env_init</li>
        <li>trap_init (这时候还不完整)</li>
        <li>env_create</li>
        <li>env_run
          <ul>
            <li>env_pop_tf</li>
          </ul>
        </li>
      </ul>
    </li>
  </ul>
  <p>当你完成这些，你应该编译你的内核并在 QEMU 下运行。如果一切顺利，系统应该会进入用户空间并执行 <code>hello</code> 这个二进制文件，直到它尝试通过 <code>int</code> 指令进行系统调用。这时就会有麻烦了：因为 JOS 还没有设置好硬件来允许任何从用户空间到内核空间的切换。当 CPU 发现能够处理系统调用中断的方法还没有被配置，它会生成一个 general protection exception (一般保护异常)。然后它会发现这个异常也不能处理，将生成一个 double fault exception (双错异常)。然后它发现还是不能处理，最终生成一个 “triple fault” 并放弃。通常，你将会见到 CPU 重置，系统会重启。虽然对于传统应用程序来说这很重要（<a href="http://blogs.msdn.com/larryosterman/archive/2005/02/08/369243.aspx">为什么？</a>），但在开发内核的过程中自动重启非常令人头痛。所以在这次的实验用的修改版内核中你会看到寄存器转储和一个 “Triple fault” 的信息。</p>
  <p>我们接下来就会解决这个问题，不过现在，我们可以用调试器来检查我们确实进入了用户模式。使用 <code>make qemu-gdb</code> 并在 <code>env_pop_tf</code> 处设置一个 GDB 断点，这应当是真正进入用户模式前所执行的最后一个内核函数。用 <code>si</code> 指令在这个函数中步进。处理器应该在一个 <code>iret</code> 指令后进入用户模式。<br>
    接下来，你应该能够看见用户进程的可执行代码的第一个指令：在 <code>lib/entry.S</code> 中 <code>start</code> 标签的 <code>cmpl</code> 指令。这时候，用 <code>b +0x...</code> 来在 <strong>int $0x30</strong> 处设置一个断点，这是 <code>hello</code> 中 <code>sys_cputs()</code> 这条指令（你需要看看 <code>obj/user/hello.asm</code> 来知道用户空间的地址）。 这个 <code>int</code> 是在控制台中显示一个字符的系统调用。如果不能执行到 <code>int</code>，说明你的地址空间配置或者读人用户程序的代码可能有问题，在继续之前回顾并修复好。</p>
  <h3 id="handling-interrupts-and-exceptions--处理中断和异常">Handling Interrupts and Exceptions / 处理中断和异常</h3>
  <p>此时，我们在用户空间的第一个 <code>int $0x30</code> 系统调用指令时走到了死胡同：一旦处理器进入用户模式，就再也没办法回到内核态了。现在，你需要实现基本的异常和系统调用处理，使得内核有可能从用户模式代码中取回处理器的控制权。你应该做的第一件事是彻底熟悉 x86 的中断和异常机制。</p>
  <section type="exercise">
  <p><strong>练习 3.</strong><br>
    如果你还没有读过的话，读一读 <a href="http://oslab.mobisys.cc/pdos.csail.mit.edu/6.828/2014/readings/i386/toc.htm">80386 Programmer’s Manual</a> 中的 <a href="http://oslab.mobisys.cc/pdos.csail.mit.edu/6.828/2014/readings/i386/c09.htm">Chapter 9, Exceptions and Interrupts</a> （或者 <a href="http://oslab.mobisys.cc/pdos.csail.mit.edu/6.828/2014/readings/ia32/IA32-3A.pdf">IA-32 Developer’s Manual</a> 的第五章）</p>
  </section>
  <p>在本次实验中，我们大体上是遵照 Intel 所采用的关于中断、异常或者别的什么的术语。然而，像是 exception, trap, interrupt, fault 和 abort 这样的词，在不同架构体系或者操作系统中也没有什么标准含义。即使在某个特定的架构，比如 x86，用起它们来也通常不管它们间到底有什么细微的差别。当你在本次实验之外见到它们的时候，它们的含义也许会有些许不同。</p>
  <h3 id="basics-of-protected-control-transfer--保护控制转移基础">Basics of Protected Control Transfer / 保护控制转移基础</h3>
  <p>异常和中断都是"保护控制转移”，这些导致处理器从用户态转移到内核模式 (<a href="https://en.wikipedia.org/wiki/Protection_ring#Privilege_level">CPL</a> = 0)，用户模式代码在这一过程中没有任何机会来干预内核或者其他进程的行为。在 Intel 的术语中，<strong>中断</strong> 是一个由异步事件造成的保护控制转移，这一事件通常是在处理器外部发生的，例如外接设备的 I/O 活动通知。相反，<strong>异常</strong> 是一个由当前正在运行的代码造成的同步保护控制转移，例如除零或者不合法的内存访问。</p>
  <p>为了确保这些保护控制转移确实是受 <strong>保护</strong> 的，处理器的中断/异常处理机制被设计成当发生中断或异常时当前运行的代码 <em>没有机会任意选择从何处陷入内核或如何陷入内核</em>，而是由处理器确保仅在小心控制的情况下才能进入内核。在 x86 架构中，两种机制协同工作来提供这一保护：</p>
  <ul>
    <li>
      <p><strong>The Interrupt Descriptor table / 中断描述符表</strong><br>
        处理器确保中断和异常只能导致内核进入一些确定的、设计优良的、 <em>由内核自身决定的</em> 入口点，而不是在发生中断或异常时由正在运行的代码决定。<br>
        x86 允许最多 256 个不同的进入内核的中断或者异常入口点，每个有不同的 <strong>中断向量</strong>。向量是指从 0 到 255 的数字。一个中断的向量是由中断源决定的：不同的设备，不同的错误情况，或者应用向内核的不同请求会生成带有不同向量的中断。CPU 将向量作为进入处理器 <strong>中断描述符表</strong> 的索引，而这个中断描述符表是由内核在内核私有内存区域建立的，就像 GDT 一样。从这个表中对应的入口，处理器会读取：</p>
      <ul>
        <li>一个读入指令寄存器(EIP)的值，它指向用于处理这一类型异常的内核代码。</li>
        <li>一个读入代码段寄存器(CS)的值，其中包含一些 0-1 位来表示异常处理代码应该运行在哪一个特权等级（在 JOS 中，所有的异常都在内核模式处理，特权等级为0）。</li>
      </ul>
    </li>
    <li>
      <p><strong>The Task State Segment / 任务状态段</strong><br>
        处理器需要一处在中断或异常发生前保存旧的处理器状态的位置，比如，在处理器调用异常处理函数前的 <strong>EIP</strong> 和 <strong>CS</strong> 的值，使得随后异常处理函数可以恢复旧的状态并从中断的地方继续。但用于保存旧处理器状态的区域必须避免被非特权的用户模式代码访问到，否则有错误的或恶意的用户模式代码可能危及内核安全。<br>
        因此，当 x86 处理器遇到使得特权等级从用户模式切换到内核模式的中断或陷阱时，它也会将栈切换到内核的内存中的栈。一个被称作 <strong>任务状态段, TSS</strong> 的结构体来描述这个栈所处的<a href="https://en.wikipedia.org/wiki/X86_memory_segmentation">段选择子</a>和地址。处理器将 <strong>SS</strong>, <strong>ESP</strong>, <strong>EFLAGS</strong>, <strong>CS</strong>, <strong>EIP</strong> 和一个可能存在的错误代码压入新栈，接着它从中断向量表中读取 <strong>CS</strong> 和 <strong>EIP</strong>，并使 <strong>ESP</strong> 和 <strong>SS</strong> 指向新栈。<br>
        即使 TSS 很大，可以服务于多种不同目的，JOS只将它用于定义处理器从用户模式切换到内核模式时的内核栈。因为 JOS 的 “内核模式” 在 x86 中是特权等级 0，当进入内核模式时，处理器用 TSS 结构体的 <strong>ESP0</strong> 和 <strong>SS0</strong> 字段来定义内核栈。JOS 不使用 TSS 中的其他任何字段。</p>
    </li>
  </ul>
  <h3 id="异常和中断的类型">异常和中断的类型</h3>
  <p>x86 处理器可产生的全部同步异常内部使用 0 ~ 31 作为中断向量，因此被映射为中断描述符表入口的 0 ~ 31。例如，一个缺页(page fault, 下同)总会通过向量 14 造成异常。大于 31 的中断向量只被用于 <em>软件中断</em>，这些中断可以用 int 指令生成，或者被用于 <em>异步硬件中断</em>，当外部设备需要提请注意时由其生成。</p>
  <p>在这一节，我们将拓展 JOS 使其能够处理 x86 内部生成的 0 ~ 31 号异常。在下一节，我们将使得 JOS 能够处理软件中断向量 48 (0x30)，这是 JOS 任意选择的用于系统调用的中断向量。在 Lab 4 中我们还会继续拓展 JOS 使其能够处理外部生成的硬件中断，例如时钟中断。</p>
  <h3 id="一个例子">一个例子</h3>
  <p>让我们将这些串起来，看一个例子。假定处理器正在某个用户进程执行代码，遇到了一个除法指令试图除零。</p>
  <ul>
    <li>处理器切换到 TSS 中由 <strong>SS0</strong> 和 <strong>ESP0</strong> 所定义的栈，JOS 会分别用来储存 <strong>GD_KD</strong> 和 <strong>KSTACKTOP</strong> 的值。</li>
    <li>处理器从 <code>KSTACKTOP</code> 开始，逐个将异常参数压入内核栈：<img src="./lab3_1.png" alt="图1"></li>
    <li>因为我们正在处理除零错误，它在 x86 中的中断向量是 0， 因此处理器读取 IDT 入口 0，并将 <strong>CS:EIP</strong> 置为这一入口对应的处理函数。</li>
    <li>处理函数接管 CPU 并处理异常，例如，终止用户进程。</li>
  </ul>
  <p>对于一些特定类型的 x86 异常，除了上面 “标准” 的 5 个字(word, 在 x86 中是 4 字节)以外，处理器还会在栈中压入另一个字，这个字是一个 <em>错误码</em> (error code)。一个重要的例子是 14 号中断，缺页(page fault)。你可以在 80386 手册中查到发生哪些中断时处理器会压入一个错误码，在这种情况下错误码的具体含义是什么。如果处理器压入错误码，在从用户模式切换，在执行异常处理函数前，栈看起来就会变成下面这个样子：<img src="./lab3_2.png" alt="图2"></p>
  <h3 id="嵌套异常和中断">嵌套异常和中断</h3>
  <p>处理器在内核和用户模式都可能发生异常和中断，但是，只有在从用户模式进入内核模式时，x86 处理器才会在将旧寄存器状态压栈、通过IDT找到合适的异常处理函数并在调用前自动切换栈。如果中断或异常发生时处理器 <em>已经</em> 处于内核模式（ <strong>CS</strong> 寄存器的低 2 位已经是 00 了），CPU 就只会在同一个内核栈再压入更多的值。通过这种方式，内核可以优雅地处理由内核自己造成的 <em>嵌套异常</em>。这种能力是实现保护的重要工具，一会儿我们还会在系统调用这一节看到同样的机制。</p>
  <p>如果处理器已经处于内核模式并发生了嵌套异常，因为它不需要切换栈，因此它也不需要保存旧的 <strong>SS</strong> 或者 <strong>ESP</strong> 寄存器。对于那些不会压入错误码的异常，内核栈在即将调用异常处理函数时是看起来这个样子：</p>
  <p><img src="./lab3_3.png" alt="图3"></p>
  <p>对于那些会压入错误码的异常，处理器会在旧 <code>EIP</code> 之后立即压入错误码，和以前一样。</p>
  <p>处理器处理嵌套异常的能力有一个重要限制：如果处理器发生异常时已经处于内核模式，而且因为某种理由 <em>不能将旧的状态压入内核栈</em>， 比如，栈已经没有足够空间了，那么处理器就没有任何可以搞定这个问题的办法了，所以它只会重置自己。不用多说，内核需要精巧的设计来保证这种情况不会发生。</p>
  <h3 id="设置中断描述符表idt">设置中断描述符表(IDT)</h3>
  <p>现在，你应该对如何在 JOS 中设置 IDT 和处理异常有一些基本的了解了。从现在起，你需要设置 IDT 来处理 0 ~ 31 号中断向量(处理器异常)。我们将在本次实验接下来的部分处理系统调用中断，并在下一个实验中处理 32 ~ 47 号中断(设备 IRQ)。</p>
  <p>头文件 <code>inc/trap.h</code> 和 <code>kern/trap.h</code> 包含一些与中断和异常处理有关的重要定义，你需要熟悉它们。<code>kern/trap.h</code> 包含一些严格内核私有的定义，而 <code>inc/trap.h</code> 包含一些在用户模式的程序和库也能利用到的定义。</p>
  <p>注意：0 ~ 31 号中断向量中有一些是被 Intel 所预留的，因为它们从来不会被处理器生成，所以怎么处理它们也不太重要，你来做你认为最合适的就好。</p>
  <p>你应该实现的整个流程就像下面这样：<img src="./lab3_4.png" alt="图4"></p>
  <p>每一个异常或者中断在 <code>trapentry.S</code> 中都应该有自己的处理函数， <code>trap_init()</code> 应该为这些处理函数初始化 IDT。每一个中断处理函数都应该在栈中建一个 <code>struct Trapframe</code> （见 <code>inc/trap.h</code> ），并且调用带一个指向 Trapframe (陷阱帧) 地址的参数的 <code>trap()</code> （在 <code>trap.c</code>）。接下来 <code>trap()</code> 就会处理这些异常，或者将其分发给特定的处理函数。</p>
  <section type="exercise">
  <p><strong>练习 4.</strong><br>
    编辑 <code>trapentry.S</code> 和 <code>trap.c</code>，以实现上面描述的功能。 <code>trapentry.S</code> 中的宏定义 <code>TRAPHANDLER</code> 和 <code>TRAPHANDLER_NOEC</code>，还有在 <code>inc/trap.h</code> 中的那些 <code>T_</code> 开头的宏定义应该能帮到你。你需要在 <code>trapentry.S</code> 中用那些宏定义为每一个 <code>inc/trap.h</code> 中的 trap (陷阱) 添加一个新的入口点，你也要提供 <code>TRAPHANDLER</code> 宏所指向的 <code>_alltraps</code> 的代码。你还要修改 <code>trap_init()</code> 来初始化 <code>IDT</code>，使其指向每一个定义在 <code>trapentry.S</code> 中的入口点。<code>SETGATE</code> 宏定义在这里会很有帮助。<br>
    你的 <code>_alltraps</code> 应该</p>
  <ul>
    <li>将一些值压栈，使栈帧看起来像是一个 <code>struct Trapframe</code></li>
    <li>将 <code>GD_KD</code> 读入 <code>%ds</code> 和 <code>%es</code></li>
    <li><code>push %esp</code> 来传递一个指向这个 <code>Trapframe</code> 的指针，作为传给 <code>trap()</code> 的参数</li>
    <li><code>call trap</code> （思考：<code>trap</code> 这个函数会返回吗？）</li>
  </ul>
  <p>考虑使用 <code>pushal</code> 这条指令。它在形成 <code>struct Trapframe</code> 的层次结构时非常合适。</p>
  <p>用一些 <code>user</code> 目录下会造成异常的程序测试一下你的陷阱处理代码，比如 <code>user/divzero</code>。现在，你应该能在 <code>make grade</code> 中通过 <code>divzero</code>, <code>softint</code> 和 <code>badsegment</code> 了。</p>
  </section>
  <section type="challenge">
  <p><strong>挑战！</strong><br>
    现在，无论是在 <code>trapentry.S</code> 中的 <code>TRAPHANDLER</code>，或者是配置它们的 <code>trap.c</code>中，你也许写了太多非常相似的代码了。试着整理一下。调整一下 <code>trapentry.S</code> 中的宏定义，让它自动生成一个给 <code>trap.c</code> 使用的表。注意，你可以在汇编中通过 <code>.text</code> 和 <code>.data</code> <a href="https://en.wikipedia.org/wiki/Directive_(programming)">(这是什么？)</a> 来随时在代码段和数据段切换。</p>
  </section>
  <section type="question">
  <p><strong>问题</strong><br>
    在 <code>answers-lab3.txt</code> 中回答下面这些问题：</p>
  <ul>
    <li>对每一个中断/异常都分别给出中断处理函数的目的是什么？换句话说，如果所有的中断都交给同一个中断处理函数处理，现在我们实现的哪些功能就没办法实现了？</li>
    <li>你有没有额外做什么事情让 <code>user/softint</code> 这个程序按预期运行？打分脚本希望它产生一个一般保护错(陷阱 13)，可是 <code>softint</code> 的代码却发送的是 <code>int $14</code>。<em>为什么</em> 这个产生了中断向量 13 ？如果内核允许 <code>softint</code> 的 <code>int $14</code> 指令去调用内核中断向量 14 所对应的的缺页处理函数，会发生什么？</li>
  </ul>
  </section>
  <p>到这里，本次实验的 Part A 就结束了。不要忘了将 <code>answers-lab3</code> 添加进 git，并提交你的修改，<s>并在截止日期前运行 make handin</s>（如果你已经在这时完成了 Part B，就不用再提交一次啦）。</p>
  <h2 id="part-b-page-faults-breakpoints-exceptions-and-system-calls--缺页，断点与系统调用">Part B: Page Faults, Breakpoints Exceptions, and System Calls / 缺页，断点与系统调用</h2>
  <p>现在，你的内核已经有一些处理基本异常的能力了。我们将会继续完善它，为其提供一些基于异常处理的重要的操作系统基本能力。</p>
  <h3 id="handling-page-faults--缺页处理">Handling Page Faults / 缺页处理</h3>
  <p>中断向量 14, <code>T_PGFLT</code>. 对应的缺页异常，是在这次和下次实验中我们都会用到很多次的非常重要的一个异常。当处理器发生缺页时，它将造成缺页的线性(或者说，虚拟)地址存储在一个特别的处理器控制寄存器 <code>CR2</code> 中。在 <code>trap.c</code>，我们已经提供了一个特别的函数 <code>page_fault_handler()</code> 的开始，来处理缺页异常。</p>
  <section type="exercise">
  <p><strong>练习 5.</strong><br>
    修改 <code>trap_dispatch()</code>，将缺页异常分发给 <code>page_fault_handler()</code>。你现在应该能够让 <code>make grade</code> 通过 <code>faultread</code>，<code>faultreadkernel</code>，<code>faultwrite</code> 和 <code>faultwritekernel</code> 这些测试了。如果这些中的某一个不能正常工作，你应该找找为什么，并且解决它。记住，你可以用 <code>make run-x</code> 或者 <code>make run-x-nox</code> 来直接使 JOS 启动某个特定的用户程序。</p>
  </section>
  <p>接下来你将实现系统调用，这样就能让内核更有能力处理缺页了。</p>
  <h3 id="the-breakpoint-exception--断点">The Breakpoint Exception / 断点</h3>
  <p>中断向量 3, <code>T_BKPT</code>, 所对应的断点异常通常用于调试器。调试器将程序代码中的指令临时替换为一个特别的 1 字节 <code>int3</code> 软件中断指令来插入断点，在 JOS 中，我们有一点点滥用这个功能，让它变为任何用户进程都可以唤起 JOS 内核监视器的伪系统调用。不过，如果我们把 JOS 内核监视器当成是最原始的调试器的话，这样做也许还蛮正确的。例如，在 <code>lib/panic.c</code> 中定义的用户模式下的 <code>panic()</code> 方法，就是打印出 panic message 之后调用一个 <code>int3</code>。</p>
  <section type="exercise">
  <p><strong>练习 6.</strong><br>
    修改 <code>trap_dispatch()</code> 使断点异常唤起内核监视器。现在，你应该能够让 <code>make grade</code> 在 <code>breakpoint</code> 测试中成功了。</p>
  </section>
  <section type="challenge">
  <p><strong>挑战！</strong><br>
    修改你的 JOS 内核，让你能够在断点之后从当前位置恢复运行，或者在断点之后继续单步运行。你需要理解 <code>EFLAGS</code> 中的某个特定的位来实现单步运行。</p>
  </section>
  <section type="challenge">
  <p><strong>可选：</strong><br>
    如果你非常热爱挑战，试着找一些 x86 反汇编代码，比如，从 QEMU 中拿到它，或者从 GNU binutils 中找找，或者自己写一些。拓展 JOS 内核监视器，使其能够反汇编并显示你正在单步执行的指令。结合我们在 lab 2 中实现的符号表，这些事情就是真正的内核调试器所做的了。</p>
  </section>
  <section type="question">
  <p><strong>问题</strong></p>
  <ul>
    <li>断点那个测试样例可能会生成一个断点异常，或者生成一个一般保护错，这取决你是怎样在 IDT 中初始化它的入口的（换句话说，你是怎样在 <code>trap_init</code> 中调用 <code>SETGATE</code> 方法的）。为什么？你应该做什么才能让断点异常像上面所说的那样工作？怎样的错误配置会导致一般保护错？</li>
    <li>你认为这样的机制意义是什么？尤其要想想测试程序 <code>user/softint</code> 的所作所为 / 尤其要考虑一下 <code>user/softint</code> 测试程序的行为。</li>
  </ul>
  </section>
  <h3 id="系统调用">系统调用</h3>
  <p>用户程序通过系统调用来请求内核为其做些事情。当用户进程进行系统调用时，处理器进入内核模式，处理器和内核协作来保存用户进程的状态，内核执行对应的代码来处理系统调用，并恢复用户进程。用户进程如何吸引内核注意并提出它的需求的具体方法根据系统的不同而不同。</p>
  <p>在 JOS 内核中，我们使用会造成处理器中断的 <code>int</code> 指令。特别地，我们选用 <code>int $0x30</code> 作为系统调用中断。我们已经定义了一个常量，<code>T_SYSCALL</code> 为 48 (0x30)。你需要设立对应中断描述符来允许用户进程产生这个中断。注意，硬件不会产生中断 0x30，所以允许用户代码生成它也不会有什么歧义。</p>
  <p>应用会将系统调用号和系统调用参数放入寄存器。这样的话，内核也不用去用户进程的栈或者指令流中到处找了。系统调用号会存在 <code>%eax</code> 中，最多 5 个参数会相应地存在 <code>%edx</code>, <code>%ecx</code>, <code>%ebx</code>, <code>%edi</code> 和 <code>%esi</code> 中。内核将返回值放在 <code>%eax</code> 中。发起系统调用的汇编代码已经为你写好了，在 <code>lib/syscall.c</code> 的 <code>syscall()</code> 。你应该读一读，确保你清楚到底发生了什么。</p>
  <section type="exercise">
  <p><strong>练习 7.</strong><br>
    在内核中断描述符表中为中断向量 <code>T_SYSCALL</code> 添加一个处理函数。你需要编辑 <code>kern/trapentry.S</code> 和 <code>kern/trap.c</code> 的 <code>trap_init()</code> 方法。你也需要修改 <code>trap_dispath()</code> 来将系统调用中断分发给在 <code>kern/syscall.c</code> 中定义的 <code>syscall()</code>。确保如果系统调用号不合法，<code>syscall()</code> 返回 <code>-E_INVAL</code>。你应该读一读并且理解 <code>lib/syscall.c</code>（尤其是内联汇编例程）来确定你已经理解了系统调用接口。通过调用相应的内核函数，处理在 <code>inc/syscall.h</code> 中定义的所有系统调用。</p>
  <p>通过 <code>make run-hello</code> 运行你的内核下的 <code>user/hello</code> 用户程序，它现在应该能在控制台中打印出 <strong>hello, world</strong> 了，接下来会在用户模式造成一个缺页。如果这些没有发生，也许意味着你的系统调用处理函数不太对。现在应该也能在 <code>make grade</code> 中通过 <code>testbss</code> 这个测试了。</p>
  </section>
  <section type="challenge">
  <p><strong>挑战！</strong><br>
    通过使用 <code>sysenter</code> 和 <code>sysexit</code> 指令实现系统调用，而不是 <code>int 0x30</code> 和 <code>iret</code>。</p>
  <p>这两个指令是 Intel 设计的，比 <code>int/iret</code> 要快很多的系统调用方式。他们用寄存器而不是栈，并且靠着推测段寄存器被如何使用来实现这一点。这些指令的细节实现可以在英特尔的参考手册的 Volume 2B 找到。</p>
  <p>在 JOS 中支持这一方式最简单的办法是在 <code>kern/trapentry.S</code> 中添加一个 <code>sysenter_handler</code> 方法来保存回到用户环境所需要的足够的信息，设置内核环境，将 <code>syscall()</code> 所用到的参数入栈并直接调用 <code>syscall()</code>。一旦 <code>syscall()</code>返回，把一切准备就绪并执行 <code>sysexit</code> 指令。你同样也需要在 <code>kern/init.c</code> 中加入一些代码来提供必要的 model specific registers (MSRs)，Section 6.1.2 in Volume 2 of the AMD Architecture Programmer’s Manual and the reference on SYSENTER in Volume 2B of the Intel reference manuals give good descriptions of the relevant MSRs. You can find an implementation of wrmsr to add to inc/x86.h for writing to these MSRs <a href="http://www.garloff.de/kurt/linux/k6mod.c">here</a>.</p>
  <p>最后，需要修改 <code>lib/syscall.c</code> 以支持通过 <code>sysenter</code> 来进行系统调用。这是一个可能的 <code>sysenter</code> 指令的寄存器结构：</p>
  <p><img src="./lab3_5.png" alt="图5"></p>
  <p>GCC 的内联汇编器会自动保存那些你告诉它直接读入值的寄存器。不要忘了要么保存（入栈）和恢复（出栈）你所<a href="https://en.wikipedia.org/wiki/Clobbering">覆写</a>的寄存器，要么告诉内联汇编器你准备覆写它们。内联汇编器不支持自动保存 <code>%ebp</code>，所以你需要加一些代码来自己保存和恢复它。可以通过使用像是 <code>leal after_sysenter_label, %%esi</code> 这样的指令将返回地址放入 <code>%esi</code> 中。</p>
  <p>注意这样做只能支持 4 个参数，所以你需要把旧的系统调用方式保留下来来支持那些有 5 个参数的系统调用。而且，因为这个快速路径不会更新当前进程的陷阱帧，所以它也不适合我们接下来要加入的一些系统调用。<br>
    一旦我们在下个实验中启用异步中断，你也许需要再回顾一下你的代码。具体来说，你应该需要在返回用户进程时启用中断，<code>sysexit</code> 不会帮你这么做。</p>
  </section>
  <h3 id="启动用户模式">启动用户模式</h3>
  <p>用户程序在 <code>lib/entry.S</code> 之上开始运行。在一些初始化后，代码会调用在 <code>lib/libmain.c</code> 中的 <code>libmain()</code>。你应该修改 <code>libmain()</code> 来初始化全局指针 <code>thisenv</code> 来指向当前进程在 <code>envs</code> 数组对应的 <code>struct Env</code> (Note that lib/entry.S has already defined envs to point at the UENVS mapping you set up in Part A. / 注意在 Part A 中 <code>lib/entry.S</code> 已经定义了 <code>envs</code> 并指向了 <code>UENVS</code> 映射)。 提示：看一下 <code>inc/env.h</code> 并用上 <code>sys_getenvid</code>。</p>
  <p><code>libmain()</code> 接下来调用 <code>umain</code>，以 hello 这个程序为例，是 <code>user/hello.c</code>。注意，它在打出 <code>hello, world</code> 后，试图访问 <code>thisenv-&gt;env_id</code>。这是它之前出错的原因。现在，因为你已经初始化好了 <code>thisenv</code>，应该不会再出错了。如果它还是有问题，你也许没有正确的将 <code>UENVS</code> 映射为用户可读的（回到在 Part A 的 <code>pmap.c</code>，这是我们第一次使用 <code>UENVS</code> 这片内存区域的地方。）</p>
  <section type="exercise">
  <p><strong>练习 8.</strong><br>
    在用户库文件中补全所需要的代码，并启动你的内核。你应该能看到 <code>user/hello</code> 打出了 <code>hello, world</code> 和 <code>i am environment 00001000</code>。接下来，<code>user/hello</code> 尝试通过调用 <code>sys_env_destory()</code> 方法退出（在 <code>lib/libmain.c</code> 和 <code>lib/exit.c</code>）。因为内核目前只支持单用户进程，它应该会报告它已经销毁了这个唯一的进程并进入内核监视器。在这时，你应该能够在 <code>make grade</code> 中通过 <code>hello</code> 这个测试了。</p>
  </section>
  <h3 id="page-faults-and-memory-protection--缺页和内存保护">Page faults and memory protection / 缺页和内存保护</h3>
  <p>内存保护是操作系统一个至关重要的功能，用以保证一个程序的错误不会导致其他程序崩溃或者操作系统自身崩溃。</p>
  <p>操作系统通常依赖硬件支持来实现内存保护。OS 保持与硬件同步哪些虚拟地址是有效的哪些是无效的。当一个程序试图访问无效的地址或者它无权访问的地址时，处理器可以在出错的指令处停止这个程序，并带着它要进行的操作等信息陷入内核。如果错误可以修正，内核可以修复它并让程序继续运行。如果错误不可修正，程序不能继续运行，因为它永远也不能通过这个造成异常的指令。</p>
  <p>举个可以修复的错误的例子：自动拓展的堆栈。在许多系统中，内核最初只为用户程序分配 1 个栈页，如果程序试图访问栈更下面的页，内核会自动为这些页分配内存并让程序继续。这样做的话，内核只需要按用户程序所需分配内存，而程序也可以工作在自己拥有任意大栈的幻想中 / 运行在不用考虑栈到底有多大的环境中。</p>
  <p>系统调用提出了一个与内存保护有关的非常有趣的问题，多数系统调用接口允许用户程序向内核传递指针。这些指针指向提供给内核读取或写入的用户缓冲区。内核在执行系统调用时要对这些指针解引用，这样做存在两个问题：</p>
  <ul>
    <li>内核发生缺页可能要比在用户程序中缺页有更严重的潜在问题。如果内核在操作自身数据结构的时候发生缺页（内核错误），缺页处理函数应该让内核恐慌（也就是整个系统都会崩溃）。因此当内核对用户提供的指针解引用时，它需要一种办法记住发生的任何缺页事实上都是用户程序造成的。</li>
    <li>内核通常比用户程序拥有更多的内存权限。用户程序也许会为系统调用传递一个内核可以读写，那个用户程序却无权读写的的内存指针。内核必须小心不要被欺骗并解引用这样的指针，因为这样可能会泄露私有信息或者破坏内核的完整性。</li>
  </ul>
  <p>因为这两个原因，内核在处理用户程序提供的指针时必须格外小心。</p>
  <p>现在，你需要通过一种策略来仔细审视所有从用户空间传到内核的所有指针来解决这两个问题。当一个程序向内核传递指针时，内核需要检查指向的地址是否是用户空间的地址，也要检查页表是否允许对应的内存操作。</p>
  <p>因此，内核从来不会因为对用户提供的指针解引用而发生缺页。如果内核真的发生缺页了，那么它就应该恐慌并终止。</p>
  <section type="exercise">
  <p><strong>练习 9.</strong><br>
    修改 <code>kern/trap.c</code>，如果缺页发生在内核模式，应该恐慌。</p>
  <p>提示：要判断缺页是发生在用户模式还是内核模式下，只需检查 <code>tf_cs</code> 的低位。</p>
  <p>读一读 <code>kern/pmap.c</code> 中的 <code>user_mem_assert</code> 并实现同一文件下的 <code>user_mem_check</code>。</p>
  <p>调整 <code>kern/syscall.c</code> 来验证系统调用的参数。</p>
  <p>启动你的内核，运行 <code>user/buggyhello</code> (<code>make run-buggyhello</code>)。这个进程应该会被销毁，内核 <em>不应该</em> 恐慌，你应该能够看见类似</p>
  <pre><code>[00001000] user_mem_check assertion failure for va 00000001
[00001000] free env 00001000
Destroyed the only environment - nothing more to do!
</code></pre>
  <p>这样的消息。</p>
  <p>最后，修改在 <code>kern/kdebug.c</code> 的 <code>debuginfo_eip</code>，对 <code>usd</code>, <code>stabs</code>, <code>stabstr</code> 都要调用 <code>user_mem_check</code>。修改之后，如果你运行 <code>user/breakpoint</code> ，你应该能在内核监视器下输入 <code>backtrace</code> 并且看到调用堆栈遍历到 <code>lib/libmain.c</code>，接下来内核会缺页并恐慌。是什么造成的内核缺页？你不需要解决这个问题，但是你应该知道为什么会发生缺页。（注：如果在看到 <code>lib/libmain.c</code> 前就发生了缺页，说明 <code>user_mem_assert</code> 或之前某次实验的代码可能存在问题。如果整个过程都没发生缺页，说明上面的实现可能有问题。）</p>
  </section>
  <p>你刚刚实现的机制对于恶意的用户程序应该也有效，试试 <code>user/evilhello</code>。</p>
  <section type="exercise">
  <p><strong>练习 10.</strong><br>
    启动你的内核，运行 <code>user/evilhello</code>。进程应该被销毁，内核不应该恐慌，你应该能看到类似下面的输出：</p>
  <pre><code>[00000000] new env 00001000
[00001000] user_mem_check assertion failure for va f010000c
[00001000] free env 00001000
</code></pre>
  </section>
  <p>这次实验到这里就完成了。检查一下你是否通过了 <code>make grade</code> 的全部测试。不要忘了完成所有问题并将 1 个挑战练习的解答写在 <code>answer-lab3.txt</code> 中。提交你的更改 <s>并执行make handin来提交作业</s></p>
  <p>在提交作业之前，用 <code>git status</code> 和 <code>git diff</code> 来检查一下你的修改，不要忘了 <code>git add answers-lab3.txt</code>。当你完成时，用 <code>git commit -am 'my solutions to lab 3'</code>来提交你的修改，<s>并执行make handin</s>。</p>
  <hr>
  <p>译： Sun Yi-Ran (sunrisefox@vampire.rip)</p>
  <p>校： Sun Yi-Ran (sunrisefox@vampire.rip)</p>
  <p>如有翻译错误，请务必联系喵 ，以便及时更正</p>
  <p><a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></p>
</div>
</template>
