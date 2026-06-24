# Quiz Question Bank — Draft v1

> 通用「游戏/应用设计 + 交互玩法」基础知识测试题库初稿
> English is the default (user-facing); 中文为 `?lang=zh` 可切备选。
> 每题：题干 / 选项 / 正确答案(✅) / 一句话解析。
> 规格：~40 题池子，每局随机抽 12–15 题，题目+选项乱序。单选除非标注 [multi]。
> 难度：B = 基础(Basic)，A = 进阶(Advanced)。
>
> 用法：你和同事直接在本文件增删改。定稿后我把它转成 app 的 questions.json。

---

## 1. 核心游戏设计 (Core Game Design)

### Q1.1 [B]
**EN:** What is a game's "core loop"?
**ZH:** 什么是游戏的「核心循环 (core loop)」？
- A) The opening cutscene that plays once / 只在开场播一次的过场动画
- ✅ B) The short repeating sequence of actions a player does most of the time / 玩家绝大部分时间反复执行的那段短动作序列
- C) The final boss fight / 最终 Boss 战
- D) The credits screen / 结算名单画面
> **解析:** Core loop = the do-it-again unit (aim→shoot→reward→repeat). Everything else wraps around it. / 核心循环就是"再来一次"的最小单元，其余系统都包在它外面。

### Q1.2 [B]
**EN:** A new player should ideally understand a scroll-feed mini-game within roughly…
**ZH:** 在信息流里刷到的小游戏，新玩家理想情况下应在大约多久内看懂？
- ✅ A) A couple of seconds, with no tutorial / 几秒内，且不需要教程
- B) 2–3 minutes after reading instructions / 读完说明后 2–3 分钟
- C) After completing a settings step / 做完设置步骤之后
- D) After a mandatory account signup / 强制注册账号之后
> **解析:** Zero-context, near-zero patience: self-explanatory UI beats explanatory text. / 零上下文、近乎零耐心，自解释的 UI 胜过解释性文案。

### Q1.3 [A]
**EN:** Which reward schedule tends to be the most engaging (and the most habit-forming)?
**ZH:** 哪种奖励节奏通常最能吸引人（也最易养成习惯）？
- A) Fixed reward every single action / 每个动作都给固定奖励
- ✅ B) Variable / intermittent reward / 可变（间歇）奖励
- C) No reward at all / 完全不给奖励
- D) One reward only at the very end / 只在最末尾给一次奖励
> **解析:** Variable ratio reinforcement is the strongest driver of repeat behavior. / 可变比率强化是重复行为最强的驱动力。

### Q1.4 [A]
**EN:** "Difficulty curve" problems most often show up as…
**ZH:** 「难度曲线」问题最常表现为……
- ✅ A) A sudden spike or a flat boring stretch / 突然的陡峰，或一段平坦无聊的区间
- B) Too many color choices / 颜色选项太多
- C) A long credits sequence / 过长的结算名单
- D) Small file size / 文件体积太小
> **解析:** Good pacing ramps challenge smoothly; spikes frustrate, flats bore. / 好的节奏让难度平滑爬升；陡峰让人挫败，平坦让人无聊。

### Q1.5 [B]
**EN:** "Game feel" / "juice" mainly refers to…
**ZH:** 「手感 / juice」主要指……
- ✅ A) The immediate sensory feedback that makes actions feel satisfying / 让动作"爽"的即时感官反馈
- B) The price of the game / 游戏售价
- C) The number of levels / 关卡数量
- D) The size of the dev team / 团队规模
> **解析:** Juice = the layer of feedback (shake, particles, sound) on top of mechanics. / juice 是叠在机制之上的反馈层（震屏、粒子、音效）。

### Q1.6 [A]
**EN:** "Flow state" is best sustained when challenge is…
**ZH:** 当难度处于什么状态时，最能维持「心流 (flow)」？
- ✅ A) Balanced just above the player's current skill / 略高于玩家当前技能、保持平衡
- B) Far above the player's skill / 远高于玩家技能
- C) Far below the player's skill / 远低于玩家技能
- D) Random and unpredictable / 完全随机不可预测
> **解析:** Too hard → anxiety, too easy → boredom; flow sits in between. / 太难→焦虑，太易→无聊，心流在两者之间。

### Q1.7 [B]
**EN:** The best way to teach a game's first mechanic is usually…
**ZH:** 教会玩家游戏第一个机制，通常最好的方式是……
- ✅ A) Let them do it once in a safe, guided moment (learning by doing) / 在安全、被引导的瞬间让他们先做一次（做中学）
- B) Show a long text tutorial first / 先看一大段文字教程
- C) Make them watch a 2-minute video / 让他们看 2 分钟视频
- D) Hide it and hope they discover it / 藏起来，指望他们自己发现
> **解析:** Learning by doing beats reading; a guided first success teaches fastest. / 做中学胜过阅读，一次被引导的成功最快教会人。

### Q1.8 [B]
**EN:** Win and lose states in a game should be…
**ZH:** 游戏的胜利/失败状态应当……
- ✅ A) Immediately clear and unambiguous to the player / 对玩家即时、清晰、无歧义
- B) Subtle and easy to miss / 微妙、容易被忽略
- C) Only shown in a menu / 只在菜单里显示
- D) Decided by the developer afterwards / 由开发者事后判定
> **解析:** Players must always know if they're winning or losing — feedback drives action. / 玩家必须随时知道自己是赢是输——反馈驱动行动。

---

## 2. 交互设计基础 (Interaction Design)

### Q2.1 [B]
**EN:** An "affordance" in UI design is…
**ZH:** UI 设计中的「可供性 (affordance)」是指……
- ✅ A) A property that suggests how an element can be used / 暗示元素该如何被使用的属性
- B) The cost of a feature / 某功能的成本
- C) A loading animation / 加载动画
- D) A type of font / 一种字体
> **解析:** A button that looks pressable affords pressing. Signifiers make affordances visible. / 看起来能按的按钮就"可供"按压；signifier 让可供性可见。

### Q2.2 [A]
**EN:** Fitts's Law implies that a tap target should be…
**ZH:** Fitts 定律意味着点击目标应当……
- ✅ A) Bigger and/or closer to be faster to hit / 更大、更近，从而更快命中
- B) Always in the exact center / 永远放在正中心
- C) The same color as the background / 跟背景同色
- D) Hidden until hovered / 悬停前隐藏
> **解析:** Time to target ∝ distance / size. Big, near targets are fast. / 命中时间正比于距离/尺寸，大而近的目标更快。

### Q2.3 [A]
**EN:** Hick's Law suggests that adding more options to a menu…
**ZH:** Hick 定律表明，给菜单增加更多选项会……
- ✅ A) Increases the time to decide / 增加做决定的时间
- B) Has no effect on decision time / 对决策时间没有影响
- C) Always improves usability / 总能提升可用性
- D) Reduces the time to decide / 缩短做决定的时间
> **解析:** Decision time grows with the number of choices — fewer, clearer options win. / 决策时间随选项数量增长——更少更清晰的选项更优。

### Q2.4 [B]
**EN:** On touch screens, a comfortable minimum tap-target size is roughly…
**ZH:** 触屏上，舒适的最小点击目标尺寸大约是……
- A) 8 px / 8 像素
- B) 16 px / 16 像素
- ✅ C) 44 px (~iOS HIG) / 44 像素（约 iOS 规范）
- D) 200 px / 200 像素
> **解析:** ~44pt/48dp is the common floor so fingers don't mis-tap. / 约 44pt/48dp 是常见下限，避免手指误触。

### Q2.5 [A]
**EN:** Roughly how long can UI feedback be delayed before it feels "instant" to a user?
**ZH:** UI 反馈延迟大约在多少以内，用户仍感觉是「即时」的？
- ✅ A) ~100 ms / 约 100 毫秒
- B) ~1 second / 约 1 秒
- C) ~3 seconds / 约 3 秒
- D) ~10 seconds / 约 10 秒
> **解析:** ~0.1s feels instant; ~1s keeps flow; >10s loses attention. / 约 0.1 秒感觉即时，约 1 秒维持心流，超 10 秒注意力流失。

### Q2.6 [A]
**EN:** Jakob's Law states that users…
**ZH:** Jakob 定律指出，用户……
- ✅ A) Expect your product to work like the other products they already know / 期望你的产品像他们已熟悉的其他产品一样运作
- B) Always prefer brand-new interaction patterns / 总是偏好全新的交互模式
- C) Never read any text / 从不读任何文字
- D) Want maximum customization / 想要最大程度的自定义
> **解析:** Lean on familiar conventions; novelty for its own sake costs usability. / 借力熟悉的约定，为新而新会牺牲可用性。

### Q2.7 [B]
**EN:** A good error message should mainly…
**ZH:** 一条好的错误提示主要应当……
- ✅ A) Explain what happened and how to recover / 说明发生了什么以及如何恢复
- B) Blame the user / 责怪用户
- C) Show a raw error code only / 只显示一串原始错误码
- D) Disappear instantly / 瞬间消失
> **解析:** Errors should be clear, blameless, and recoverable. / 错误提示应清晰、不指责、可恢复。

---

## 3. 手感与表现 (Game Feel & Animation)

### Q3.1 [B]
**EN:** "Easing" in animation refers to…
**ZH:** 动画里的「缓动 (easing)」是指……
- ✅ A) Varying speed over time instead of moving linearly / 速度随时间变化，而非匀速直线运动
- B) Lowering the resolution / 降低分辨率
- C) Muting the sound / 静音
- D) Reducing the frame rate / 降低帧率
> **解析:** Ease-in/out makes motion feel natural; linear feels robotic. / 缓入缓出让运动自然，匀速显得机械。

### Q3.2 [B]
**EN:** "Screenshake" is mainly used to…
**ZH:** 「震屏 (screenshake)」主要用来……
- ✅ A) Amplify the sense of impact / 放大打击/冲击感
- B) Save battery / 省电
- C) Reduce file size / 减小文件体积
- D) Translate text / 翻译文本
> **解析:** A few frames of shake on impact sells weight and force. / 命中瞬间几帧抖动能传达重量与力量。

### Q3.3 [A]
**EN:** Anticipation and follow-through (from the 12 animation principles) help by…
**ZH:** 预备动作与跟随动作（动画 12 原则）的作用是……
- ✅ A) Making motion read clearly and feel weighty / 让运动易读、有重量感
- B) Increasing the polygon count / 增加多边形数量
- C) Encrypting the assets / 加密资源
- D) Adding more menus / 增加菜单
> **解析:** A small wind-up + overshoot makes actions legible and alive. / 小幅蓄力+回弹让动作清晰且有生命力。

### Q3.4 [A]
**EN:** When should you give immediate audio/visual feedback for a tap?
**ZH:** 点击操作的音/画反馈应在何时给出？
- ✅ A) On the press, before the result resolves / 在按下那一刻，先于结果产生
- B) Only after a network round-trip / 等网络往返之后
- C) Only at the end of the session / 只在整局结束时
- D) Never, to keep it clean / 永远不给，保持干净
> **解析:** Instant feedback on press confirms the input even if the result lags. / 按下即反馈，即使结果有延迟也先确认了输入。

### Q3.5 [A]
**EN:** "Hit-stop" (a brief freeze on impact) is used to…
**ZH:** 「顿帧 (hit-stop)」（命中瞬间短暂定格）用来……
- ✅ A) Emphasize the weight and impact of a hit / 强调一次命中的重量与冲击
- B) Save memory / 节省内存
- C) Hide a bug / 掩盖 bug
- D) Skip a frame to run faster / 跳帧以提速
> **解析:** A few frames of freeze on impact makes hits feel powerful. / 命中时定格几帧，让打击感更有力量。

### Q3.6 [B]
**EN:** Particle effects in games primarily serve to…
**ZH:** 游戏里的粒子特效主要用来……
- ✅ A) Reinforce feedback and make events feel alive / 强化反馈、让事件更有生命力
- B) Increase the download size on purpose / 故意增大下载体积
- C) Replace the core mechanic / 取代核心机制
- D) Slow the game down intentionally / 故意拖慢游戏
> **解析:** Particles are feedback garnish — they amplify, they aren't the dish. / 粒子是反馈的点缀——用来放大，而非主菜。

---

## 4. 移动 / 信息流体验 (Mobile & Feed UX)

### Q4.1 [B]
**EN:** Designing for a vertical scroll-feed, you should assume the user…
**ZH:** 为竖向信息流设计时，应假设用户……
- ✅ A) Arrives with zero context and almost no patience / 带着零上下文、近乎零耐心进来
- B) Has read a manual first / 已经先读过说明书
- C) Will replay daily without prompting / 会每天主动回访
- D) Wants to configure settings before playing / 想先配置设置再玩
> **解析:** No rules to learn, no choices before play, instant feedback. / 没有要学的规则，玩前不做选择，即点即有反馈。

### Q4.2 [B]
**EN:** A "self-explanatory UI" means…
**ZH:** 「自解释的 UI」意味着……
- ✅ A) The interface teaches itself through visuals, not text walls / 界面靠视觉自我教学，而非大段文案
- B) It comes with a long PDF manual / 配一份长 PDF 手册
- C) It requires a video tutorial / 需要看视频教程
- D) It only works for returning users / 只对回访用户有效
> **解析:** Show, don't tell — affordances over instructions. / 用展示代替讲解，可供性优于说明文字。

### Q4.3 [A]
**EN:** For a feed mini-game, designing for "one-shot" play rather than retention means…
**ZH:** 为信息流小游戏做「一次性」而非「留存」设计，意味着……
- ✅ A) The first encounter must be complete and satisfying on its own / 第一次相遇本身就要完整且满足
- B) Locking content behind daily streaks / 用每日连击锁住内容
- C) Requiring an account to start / 开始前要求注册
- D) Front-loading a long tutorial / 前置一段长教程
> **解析:** Assume no return visit; make the single session pay off. / 别假设回访，让单局本身就值回票价。

### Q4.4 [A]
**EN:** A common cause of "scrolling jumps back to top" inside a nested feed is…
**ZH:** 嵌套信息流里「滑动突然跳回顶端」的常见原因是……
- ✅ A) Scroll-chaining / list cleared on refresh / collapsed image heights / 滚动链 / 刷新清空列表 / 图片塌高
- B) Too many colors / 颜色太多
- C) A large font size / 字号过大
- D) Using English copy / 用了英文文案
> **解析:** `overscroll-behavior: contain` + preserved scrollTop + image aspect-ratio fix it. / 用滚动链切断 + 记忆 scrollTop + 给图固定宽高比来解。

### Q4.5 [B]
**EN:** On a large phone held one-handed, the easiest area for the thumb to reach is…
**ZH:** 单手握持大屏手机时，拇指最易触达的区域是……
- ✅ A) The lower-center of the screen / 屏幕的下方中部
- B) The top corners / 顶部两角
- C) The very top edge / 最顶边
- D) Off-screen / 屏幕之外
> **解析:** Put primary actions in the thumb zone (bottom), not the top corners. / 把主要操作放在拇指区（底部），别放顶角。

### Q4.6 [A] [multi]
**EN:** Which of these make a feed mini-game graspable in seconds? (Select all that apply)
**ZH:** 以下哪些能让信息流小游戏在几秒内被看懂？（多选）
- ✅ A) No rules to learn before playing / 玩之前没有规则要学
- ✅ B) Self-explanatory, visual UI / 自解释的视觉化 UI
- ✅ C) Instant feedback on the first tap / 第一次点击就有即时反馈
- D) A mandatory settings step first / 先来一个强制设置步骤
- E) A required signup / 强制注册
> **解析:** A, B, C reduce time-to-understand; D and E add friction before the fun. / A、B、C 缩短理解时间，D、E 在乐趣前增加摩擦。

---

## 5. 应用工程常识 (App Engineering Basics)

### Q5.1 [B]
**EN:** A "skeleton screen" during loading is better than a spinner because it…
**ZH:** 加载时用「骨架屏」优于转圈，因为它……
- ✅ A) Communicates layout and feels faster / 传达布局结构、感觉更快
- B) Uses more bandwidth / 占用更多带宽
- C) Always finishes loading sooner / 真的加载更快
- D) Hides all content / 隐藏所有内容
> **解析:** Perceived performance: showing structure reduces the felt wait. / 感知性能：先展示结构能降低等待的体感时长。

### Q5.2 [B]
**EN:** "Responsive design" primarily ensures that…
**ZH:** 「响应式设计」主要保证……
- ✅ A) The layout adapts across screen sizes and input methods / 布局适配不同屏幕尺寸与输入方式
- B) The app responds to voice only / 应用只响应语音
- C) The server replies quickly / 服务器回复更快
- D) Animations are disabled / 禁用所有动画
> **解析:** Adapt to viewport + touch/pointer, not a single fixed canvas. / 适配视口与触控/指针，而非单一固定画布。

### Q5.3 [A]
**EN:** The minimum WCAG contrast ratio for normal body text is about…
**ZH:** 正文文本的 WCAG 最低对比度约为……
- A) 1.5 : 1
- B) 2 : 1
- ✅ C) 4.5 : 1
- D) 21 : 1 (always required) / 21:1（强制要求）
> **解析:** 4.5:1 for normal text, 3:1 for large text (AA). / 正文 4.5:1，大字号 3:1（AA 级）。

### Q5.4 [A]
**EN:** For a web mini-game meant to be embedded/ported, asset paths should be…
**ZH:** 为可嵌入/可移植的网页小游戏，资源路径应当……
- ✅ A) Relative (`./…`) with a relative base / 相对路径（`./…`）且 base 为相对
- B) Absolute from the domain root (`/assets/…`) / 从域名根开始的绝对路径
- C) Hardcoded to localhost / 写死成 localhost
- D) Loaded from a random CDN each time / 每次从随机 CDN 加载
> **解析:** Relative `./` + `base:'./'` survives being served from any sub-path. / 相对 `./` + `base:'./'` 能在任意子路径下正常运行。

### Q5.5 [A]
**EN:** To render smoothly at 60 fps, each frame's work must fit within about…
**ZH:** 要流畅跑到 60 fps，每帧的工作量必须控制在大约……
- A) ~100 ms / 约 100 毫秒
- ✅ B) ~16 ms / 约 16 毫秒
- C) ~1 ms / 约 1 毫秒
- D) ~500 ms / 约 500 毫秒
> **解析:** 1000ms / 60 ≈ 16.7ms per frame; overshoot it and you drop frames. / 1000ms÷60≈16.7ms 每帧，超了就掉帧。

### Q5.6 [B]
**EN:** Setting an explicit width/height or aspect-ratio on images mainly prevents…
**ZH:** 给图片设定明确的宽高或宽高比，主要能避免……
- ✅ A) Layout shift as images load (CLS) / 图片加载时的布局抖动（CLS）
- B) The image from loading at all / 图片完全无法加载
- C) The need for any CSS / 一切 CSS 的需要
- D) Network requests / 网络请求
> **解析:** Reserving space stops content jumping when the image arrives. / 预留空间能防止图片到达时内容跳动。

---

## 6. 社交与增长机制 (Social & Growth)

### Q6.1 [B]
**EN:** In a UGC social game, "a feed needs a verb" means…
**ZH:** UGC 社交游戏里「feed needs a verb（信息流需要一个动词）」是指……
- ✅ A) Viewers need an action to take on content, which notifies the author / 观众需要一个能对内容施加的动作，且会通知作者
- B) Every post must contain a verb in its title / 每条内容标题里必须含动词
- C) The feed should scroll automatically / 信息流应自动滚动
- D) Authors should post more often / 作者应更频繁地发帖
> **解析:** A passive feed dies; a verb (kept/popped/remixed) creates a loop back to the author. / 纯被动的 feed 会死，一个动词会把价值回流给作者，形成循环。

### Q6.2 [A]
**EN:** A healthy social notification (e.g. "X reacted to your work") should…
**ZH:** 一条健康的社交通知（如「X 对你的作品有反应」）应当……
- ✅ A) Be triggered by another real user acting on your content, with self-guard & dedupe / 由其他真实用户对你的内容操作触发，并做自我屏蔽与去重
- B) Be sent to yourself for your own actions / 因你自己的操作而发给自己
- C) Repeat every minute regardless of activity / 不论是否有活动每分钟重复
- D) Come from fabricated fake users / 来自编造的假用户
> **解析:** Notify on others' actions; never self-notify; never fake users. / 因他人操作而通知，不自我通知，不用假用户。

### Q6.3 [A]
**EN:** For a social game's cold-start (no real users yet), the best fallback is…
**ZH:** 社交游戏冷启动（还没有真实用户）时，最佳兜底是……
- ✅ A) A real subject that needs no fake identity (e.g. "you vs. your AI self") / 不需要假身份的真实主体（如「你 vs 你的 AI 分身」）
- B) Auto-generated fake user profiles / 自动生成的假用户资料
- C) An empty screen / 一个空白屏
- D) Copying another app's user list / 抄另一个 app 的用户列表
> **解析:** Fake users are dead-ends that expose the fake; use a real, unclickable-safe subject. / 假用户是会暴露的死路，用真实、点不出问题的主体兜底。

### Q6.4 [B]
**EN:** "Virality" in a product loop usually comes from…
**ZH:** 产品循环里的「病毒性」通常来自……
- ✅ A) Each user's action naturally surfacing the product to new users / 每个用户的行为自然把产品带到新用户面前
- B) Buying more ads / 买更多广告
- C) A bigger app icon / 更大的应用图标
- D) Longer loading screens / 更长的加载页
> **解析:** Built-in sharing/invitation as a side effect of normal use beats paid acquisition. / 把分享/邀请内建为正常使用的副产品，胜过付费获取。

### Q6.5 [B]
**EN:** A "leaderboard rivalry" notification (e.g. "X just beat your score") works because it…
**ZH:** 「排行榜对手」通知（如「X 刚超过了你的分数」）有效，是因为它……
- ✅ A) Gives the beaten player a reason to come back and reclaim their spot / 给被超过的玩家一个回来夺回名次的理由
- B) Spams everyone equally / 平等地骚扰所有人
- C) Hides the score / 隐藏分数
- D) Deletes the leaderboard / 删除排行榜
> **解析:** Competition + a personal stake pulls the rival back into the loop. / 竞争+切身利害把对手重新拉回循环。

### Q6.6 [A]
**EN:** Retention and virality differ in that…
**ZH:** 留存与病毒性的区别在于……
- ✅ A) Retention brings the same users back; virality brings new users in / 留存让同一批用户回来，病毒性带来新用户
- B) They mean exactly the same thing / 二者意思完全相同
- C) Virality only matters for paid ads / 病毒性只对付费广告有意义
- D) Retention only matters on launch day / 留存只在上线当天有意义
> **解析:** Different loops: retention = come-back, virality = bring-a-friend. / 两套循环：留存=回来，病毒性=带朋友来。

---

## 待办 / 你们可调整的点
- [ ] 总题数（当前 ~25，可补到 ~40；告诉我每类要几题）
- [ ] 难度配比（当前 B/A 混合，可调）
- [ ] 是否加「看图选最佳交互」情景题（更有趣，但要配图）
- [ ] 是否保留第 4 类里平台特定的题（scroll-feed/notify），还是纯通用
- [ ] 中文译文措辞终审
