// Go Lab curriculum: the lesson data is also the grading contract.
const test = (name, expression, expected) => ({ name, expression, expected });
const source = (body) => {
  const imports = [];
  if (/\b(fmt\.|Sprintf\b|Sprint\b)/.test(body)) imports.push('"fmt"');
  if (/\b(errors\.|errors\.New)/.test(body)) imports.push('"errors"');
  if (/\b(os\.|os\.Open)/.test(body)) imports.push('"os"');
  if (/\b(bytes\.|bytes\.Buffer)/.test(body)) imports.push('"bytes"');
  if (/\b(io\.|io\.ReadAll)/.test(body)) imports.push('"io"');
  if (/\b(context\.|context\.Context)/.test(body)) imports.push('"context"');
  if (/\b(json\.|json\.Marshal)/.test(body)) imports.push('"encoding/json"');
  if (/\b(strings\.|strings\.NewReader)/.test(body)) imports.push('"strings"');
  if (/\b(http\.|http\.ResponseWriter)/.test(body)) imports.push('"net/http"');
  if (/\b(httptest\.|httptest\.NewRequest)/.test(body)) imports.push('"net/http/httptest"');
  if (/\bsync\./.test(body)) imports.push('"sync"');
  return `package main\n${imports.length ? `\nimport (${imports.join('\n')})\n` : ''}\n${body}`;
};
const testImportsFor = (tests) => {
  const text = tests.map((item) => item.expression).join('\n');
  const imports = [];
  if (/\bcontext\./.test(text)) imports.push('context');
  if (/\berrors\./.test(text)) imports.push('errors');
  if (/\bfmt\./.test(text)) imports.push('fmt');
  if (/\bstrings\./.test(text)) imports.push('strings');
  if (/\bhttptest\./.test(text)) imports.push('net/http/httptest');
  return imports;
};
const lesson = (id, title, concept, example, task, starter, solution, tests, hints = []) => ({
  id, title, concept, example, task,
  starter: source(starter), solution: source(solution), tests,
  types: '', negative: [], hints: hints.length ? hints : [concept, example],
  requirements: tests.map((t) => t.name), testImports: testImportsFor(tests),
});
const t = (n, e, x) => test(n, e, x);

const chapterData = [
  ['基本語法', '從零值到流程控制，建立 Go 的執行模型。',
   'C++：var 與明確型別接近自動型別推導，但 Go 沒有隱式數值轉型。|C#：:= 像 var 區域推導，所有型別仍在編譯期固定。|Python：Go 變數有靜態型別與零值，宣告後不能改放另一種型別。', [
    ['變數與零值','未初始化變數會得到該型別的零值；int 是 0、string 是 ""、bool 是 false。:= 只能在函式內使用。','var count int\nname := "Go"','完成 defaults，回傳整數、字串與布林零值。',`func defaults() []interface{} {\n\treturn nil\n}`,`func defaults() []interface{} {\n\tvar n int\n\tvar s string\n\tvar ok bool\n\treturn []interface{}{n, s, ok}\n}`,[t('整數零值','defaults()[0]',0),t('字串零值','defaults()[1]', ''),t('布林零值','defaults()[2]',false)]],
    ['明確轉型','不同數值型別不會自動互轉；使用 T(value)，並注意浮點轉整數會截斷小數。','var x int = int(float64(3.9))','完成 toInt，將 float64 截成 int。',`func toInt(v float64) int { return 0 }`,`func toInt(v float64) int { return int(v) }`,[t('正數截斷','toInt(3.9)',3),t('負數截斷','toInt(-3.9)',-3)]],
    ['條件與迴圈','if 不需括號；for 是唯一的迴圈關鍵字，也能用 init、condition、post 三段式。','for i := 0; i < 3; i++ { sum += i }','完成 sumEven，累加 0 到 n 之間的偶數。',`func sumEven(n int) int { return 0 }`,`func sumEven(n int) int {\n\tsum := 0\n\tfor i := 0; i <= n; i++ {\n\t\tif i%2 == 0 { sum += i }\n\t}\n\treturn sum\n}`,[t('含零與偶數','sumEven(6)',12),t('負數沒有範圍','sumEven(-1)',0),t('奇數上限','sumEven(5)',6)]],
    ['switch 分支','switch 自動 break；可用多個 case，共用分支條件，default 處理其他值。','switch day { case 6, 7: return "weekend" }','完成 dayKind，1 到 5 回傳 weekday、6 到 7 回傳 weekend，其餘 invalid。',`func dayKind(day int) string { return "" }`,`func dayKind(day int) string {\n\tswitch day {\n\tcase 1,2,3,4,5: return "weekday"\n\tcase 6,7: return "weekend"\n\tdefault: return "invalid"\n\t}\n}`,[t('平日','dayKind(3)','weekday'),t('週末','dayKind(7)','weekend'),t('越界','dayKind(0)','invalid')]],
  ]],
  ['函式', '用多回傳值、閉包與變數參數表達清楚的資料流。',
   'C++：Go 多回傳值比 pair/tuple 直接，錯誤通常也是回傳值。|C#：多回傳值類似 ValueTuple，但具名回傳與 defer 是 Go 慣用法。|Python：解包很相似，但 Go 的回傳型別與參數數量在編譯期固定。', [
    ['多回傳值','函式可以同時回傳多個值，呼叫端用 a, b := f() 接收；常用於結果加錯誤。','q, r := divide(7, 3)','完成 divide，回傳商與餘數。',`func divide(a, b int) (int, int) { return 0, 0 }`,`func divide(a, b int) (int, int) { return a / b, a % b }`,[t('商','func() int { q,_:=divide(7,3); return q }()',2),t('餘數','func() int { _,r:=divide(7,3); return r }()',1)]],
    ['具名回傳與 defer','具名回傳讓 return 不帶運算式；defer 在函式離開時後進先出執行，適合清理。','func f() (n int) { defer func(){ n++ }(); return 1 }','完成 adjusted，回傳輸入加一，並用 defer 再調整一。',`func adjusted(n int) int { return n }`,`func adjusted(n int) (result int) {\n\tresult = n\n\tdefer func() { result++ }()\n\treturn result + 1\n}`,[t('延後調整','adjusted(3)',5),t('負數','adjusted(-2)',0)]],
    ['variadic 參數','...T 讓呼叫端傳入零個或多個值；函式內得到 []T，也可用 slice... 展開。','func sum(ns ...int) int { total := 0; for _, n := range ns { total += n }; return total }','完成 product，計算所有參數乘積；零參數回傳 1。',`func product(ns ...int) int { return 0 }`,`func product(ns ...int) int {\n\tp := 1\n\tfor _, n := range ns { p *= n }\n\treturn p\n}`,[t('零參數','product()',1),t('多參數','product(2,3,4)',24),t('含零','product(5,0,2)',0)]],
    ['closure 閉包','函式值可以捕捉外部變數；每次呼叫同一閉包會看到被更新的狀態。','next := func() int { n++; return n }','完成 counter，建立從 start 開始、每次加一的閉包。',`func counter(start int) func() int { return func() int { return 0 } }`,`func counter(start int) func() int {\n\tn := start\n\treturn func() int { n++; return n }\n}`,[t('第一次','func() int { c:=counter(4); return c() }()',5),t('保留狀態','func() []int { c:=counter(0); return []int{c(),c(),c()} }()',[1,2,3])]],
  ]],
  ['集合', '掌握 array、slice、map 與 range 的值語意。',
   'C++：array 長度是型別一部分，slice 更像帶長度的 vector 視圖。|C#：slice/append 類似 List，但 append 可能重配底層陣列。|Python：map 的 comma-ok 類似明確處理 KeyError，range 迭代的值是複本。', [
    ['array 與 slice','array 長度固定且是型別；slice 是指向底層陣列的描述子，len 與 cap 可能不同。','a := [3]int{1,2,3}; s := a[:2]','完成 firstLast，回傳 slice 首尾；空 slice 回傳 [0,0]。',`func firstLast(values []int) []int { return []int{0,0} }`,`func firstLast(values []int) []int {\n\tif len(values)==0 { return []int{0,0} }\n\treturn []int{values[0], values[len(values)-1]}\n}`,[t('一般 slice','firstLast([]int{2,4,6})',[2,6]),t('空 slice','firstLast([]int{})',[0,0])]],
    ['append 與底層陣列','append 可能使用原有容量，也可能配置新陣列；不要依賴指標是否相同，使用回傳的新 slice。','s = append(s, 4, 5)','完成 addAll，逐一 append values 並回傳新 slice。',`func addAll(base []int, values ...int) []int { return base }`,`func addAll(base []int, values ...int) []int {\n\tfor _, v := range values { base = append(base, v) }\n\treturn base\n}`,[t('追加多值','addAll([]int{1},2,3)',[1,2,3]),t('無追加','addAll([]int{1})',[1])]],
    ['map 與 comma-ok','讀取不存在的 map key 會得到 value 型別零值；v, ok := m[key] 才能區分不存在與零值。','v, ok := scores["Ada"]','完成 lookupScore，找不到回傳 -1，找到 0 也要回傳 0。',`func lookupScore(scores map[string]int, name string) int { return 0 }`,`func lookupScore(scores map[string]int, name string) int {\n\tv, ok := scores[name]\n\tif !ok { return -1 }\n\treturn v\n}`,[t('找到非零','lookupScore(map[string]int{"Ada":9},"Ada")',9),t('找到零','lookupScore(map[string]int{"Ada":0},"Ada")',0),t('不存在','lookupScore(map[string]int{},"Ada")',-1)]],
    ['range 與複製','range 取得元素的複本；修改 value 不會改 slice，若要修改應用索引。','for i := range values { values[i] *= 2 }','完成 doubleInPlace，原地將每個元素乘二。',`func doubleInPlace(values []int) []int { return values }`,`func doubleInPlace(values []int) []int {\n\tfor i := range values { values[i] *= 2 }\n\treturn values\n}`,[t('原地修改','doubleInPlace([]int{1,2,3})',[2,4,6]),t('空 slice','doubleInPlace([]int{})',[])]],
  ]],
  ['字串', '理解 UTF-8 的 byte/rune 差異，安全處理文字與解析。',
   'C++：Go string 是 UTF-8 byte 序列，不能用索引直接取得 Unicode 字元。|C#：rune 類似 Rune，range 會解碼 UTF-8。|Python：len(str) 以 Unicode code point 計數，Go 需明確選 len 或 rune。', [
    ['byte 與 rune','len(string) 計 byte；[]rune(string) 計 Unicode code point。索引 byte 可能落在多位元字元中。','len([]rune("你好"))','完成 runeCount，回傳文字中的 rune 數。',`func runeCount(s string) int { return len(s) }`,`func runeCount(s string) int { return len([]rune(s)) }`,[t('ASCII','runeCount("Go")',2),t('中文','runeCount("你好")',2),t('混合','runeCount("Go你好")',4)]],
    ['UTF-8 遍歷','range string 會依 UTF-8 解碼，索引是 byte offset，值是 rune。','for _, r := range s { if r == \'你\' { count++ } }','完成 countRune，計算指定 rune 出現次數。',`func countRune(s string, target rune) int { return 0 }`,`func countRune(s string, target rune) int {\n\tcount := 0\n\tfor _, r := range s { if r == target { count++ } }\n\treturn count\n}`,[t('中文字','countRune("你我你",\'你\')',2),t('找不到','countRune("Go",\'你\')',0)]],
    ['字串組裝','字串不可變；strings.Builder 適合大量組裝，但簡單情況可用 +。本題用 rune 遍歷避免切壞 UTF-8。','result := ""; for _, r := range s { result += string(r) }','完成 reverseRunes，反轉 rune 順序。',`func reverseRunes(s string) string { return s }`,`func reverseRunes(s string) string {\n\tr := []rune(s)\n\tfor i,j := 0,len(r)-1; i<j; i,j = i+1,j-1 { r[i],r[j] = r[j],r[i] }\n\treturn string(r)\n}`,[t('ASCII反轉','reverseRunes("abc")','cba'),t('中文反轉','reverseRunes("你我")','我你'),t('空字串','reverseRunes("")','')]],
    ['解析與驗證','strconv.Atoi 會回傳數值與 error；輸入資料必須檢查錯誤，不要忽略第二個回傳值。','n, err := strconv.Atoi(text)','完成 parsePositive，成功且大於零回傳數值，否則回傳 0。',`func parsePositive(text string) int { return 0 }`,`func parsePositive(text string) int {\n\tn := 0\n\tfor _, c := range text { if c < '0' || c > '9' { return 0 }; n = n*10 + int(c-'0') }\n\tif n <= 0 { return 0 }; return n\n}`,[t('正整數','parsePositive("42")',42),t('零不通過','parsePositive("0")',0),t('非數字','parsePositive("4x")',0),t('空字串','parsePositive("")',0)]],
  ]],
  ['資料模型', '用 struct 與 receiver 建立清楚的資料與行為邊界。',
   'C++：struct 欄位與 method 相近，Go 沒有 class 繼承。|C#：struct 是 value type；Go struct 也可複製，但 pointer receiver 決定是否修改原值。|Python：struct 欄位沒有動態屬性，編譯器會檢查名稱與型別。', [
    ['struct','struct 將相關欄位聚合成型別；欄位名稱首字大寫才可被其他 package 使用。','type Point struct { X, Y int }','定義 User struct，完成 userLabel 回傳 name 與 age。',`type User struct { Name string; Age int }\nfunc userLabel(u User) string { return "" }`,`type User struct { Name string; Age int }\nfunc userLabel(u User) string { return u.Name + ":" + fmt.Sprint(u.Age) }`,[t('格式化','userLabel(User{Name:"Ada",Age:3})','Ada:3')]],
    ['pointer','& 取得位址，* 解參照；nil pointer 不能解參照，函式可用 pointer 表示可選或可修改。','p := &value; *p = 4','完成 increment，若 pointer 不為 nil 就加一並回傳 true。',`func increment(value *int) bool { return false }`,`func increment(value *int) bool {\n\tif value == nil { return false }; *value++; return true\n}`,[t('修改值','func() int { n:=2; increment(&n); return n }()',3),t('nil安全','increment(nil)',false)]],
    ['value receiver','value receiver 收到 struct 複本，適合不需修改狀態的方法。','func (p Point) Sum() int { return p.X+p.Y }','定義 Rectangle 與 Area value receiver，回傳寬乘高。',`type Rectangle struct { Width, Height int }\nfunc (r Rectangle) Area() int { return 0 }`,`type Rectangle struct { Width, Height int }\nfunc (r Rectangle) Area() int { return r.Width * r.Height }`,[t('面積','Rectangle{3,4}.Area()',12),t('零尺寸','Rectangle{0,4}.Area()',0)]],
    ['pointer receiver','pointer receiver 可修改原 struct；呼叫時 Go 會對可定址值自動取址。','func (c *Counter) Add(n int) { c.Value += n }','完成 Counter.Add，讓計數器可累加；nil receiver 要安全忽略。',`type Counter struct { Value int }\nfunc (c *Counter) Add(n int) { }`,`type Counter struct { Value int }\nfunc (c *Counter) Add(n int) { if c != nil { c.Value += n } }`,[t('修改狀態','func() int { c:=Counter{}; c.Add(3); c.Add(2); return c.Value }()',5),t('nil不慌','func() bool { var c *Counter; c.Add(1); return true }()',true)]],
  ]],
  ['Interface', '用隱式實作與小介面組合解耦使用者與實作者。',
   'C++：interface 的方法集合類似抽象基底類別，但 Go 不需宣告 implements。|C#：介面也有方法契約，Go 以結構型相容在使用處滿足介面。|Python：Go interface 把 duck typing 的方法要求固定成可檢查契約。', [
    ['隱式實作','型別只要擁有介面所列的全部方法，就自動實作該介面。','type Stringer interface { String() string }','定義 Name 與 Labeler，完成 label 使用介面回傳文字。',`type Labeler interface { Label() string }\ntype Name string\nfunc (n Name) Label() string { return "" }\nfunc label(l Labeler) string { return l.Label() }`,`type Labeler interface { Label() string }\ntype Name string\nfunc (n Name) Label() string { return string(n) }\nfunc label(l Labeler) string { return l.Label() }`,[t('介面呼叫','label(Name("Ada"))','Ada')]],
    ['小介面組合','介面應只描述使用者需要的方法；較大的介面可由多個小介面嵌入組成。','type ReadWriter interface { Reader; Writer }','定義 Source 與 Reader，完成 readAll 用介面取得內容。',`type Reader interface { Read() string }\ntype Source string\nfunc (s Source) Read() string { return "" }\nfunc readAll(r Reader) string { return "" }`,`type Reader interface { Read() string }\ntype Source string\nfunc (s Source) Read() string { return string(s) }\nfunc readAll(r Reader) string { return r.Read() }`,[t('小介面','readAll(Source("hello"))','hello')]],
    ['type assertion/switch','interface 可用 v, ok := x.(T) 安全斷言；type switch 可依動態型別分支。','if n, ok := value.(int); ok { return n }','完成 describeValue，辨識 int、string，其餘回傳 "other"。',`func describeValue(value interface{}) string { return "other" }`,`func describeValue(value interface{}) string {\n\tswitch value.(type) { case int: return "int"; case string: return "string"; default: return "other" }\n}`,[t('整數','describeValue(3)','int'),t('字串','describeValue("x")','string'),t('布林','describeValue(true)','other')]],
    ['typed nil','interface 只有在動態型別與值都為 nil 時才等於 nil；把 nil pointer 放入 interface 後，interface 本身不為 nil。','var p *bytes.Buffer; var r io.Reader = p','完成 isNilInterface，直接傳 nil 回 true；typed nil pointer 回 false。',`func isNilInterface(v interface{}) bool { return false }`,`func isNilInterface(v interface{}) bool { return v == nil }`,[t('真正nil','isNilInterface(nil)',true),t('數值不是nil','isNilInterface(0)',false)]],
  ]],
  ['錯誤與資源', '把可預期失敗當成資料，並在邊界管理清理與 panic。',
   'C++：error 回傳取代例外作為一般流程；defer 類似 RAII 的清理意圖。|C#：error 值像 Try pattern，errors.Is/As 提供可包裝的分類。|Python：一般失敗仍可用 exception，但 Go 鼓勵明確回傳 error。', [
    ['error 回傳','error 是介面；成功回傳 nil，失敗回傳描述原因的 error。呼叫端應立即檢查。','if n < 0 { return 0, errors.New("negative") }','完成 safeDivide，除數為零回傳 0 與錯誤，否則回傳商。',`func safeDivide(a, b int) (int, error) { return 0, nil }`,`func safeDivide(a, b int) (int, error) {\n\tif b == 0 { return 0, fmt.Errorf("division by zero") }; return a/b, nil\n}`,[t('成功結果','func() int { n,e:=safeDivide(8,2); if e!=nil{return -1}; return n }()',4),t('失敗結果','func() bool { _,e:=safeDivide(1,0); return e!=nil }()',true)]],
    ['wrapping 與 errors.Is','fmt.Errorf("context: %w", err) 保留原錯誤鏈；errors.Is 可辨認包裝前的 sentinel。','return fmt.Errorf("read config: %w", ErrMissing)','完成 classify，使用自訂 sentinel ErrNotFound 判斷錯誤是否同源。',`var ErrNotFound = errors.New("not found")\nfunc classify(err error) bool { return false }`,`var ErrNotFound = errors.New("not found")\nfunc classify(err error) bool { return errors.Is(err, ErrNotFound) }`,[t('原錯誤','classify(ErrNotFound)',true),t('包裝錯誤','classify(fmt.Errorf("wrapped: %w", ErrNotFound))',true),t('其他錯誤','classify(errors.New("other"))',false)]],
    ['defer 清理','defer 適合在取得資源後立刻登記 Close；即使中途 return 也會執行。','f, err := os.Open(path); if err != nil { return err }; defer f.Close()','完成 deferredOrder，回傳 defer 以後進先出追加的順序。',`func deferredOrder() []int { return []int{} }`,`func deferredOrder() (out []int) {\n\tdefer func(){ out = append(out, 1) }()\n\tdefer func(){ out = append(out, 2) }()\n\treturn out\n}`,[t('後進先出','deferredOrder()',[2,1])]],
    ['panic/recover 邊界','panic 適合不可恢復的程式錯誤；recover 只能在 deferred function 中取得 panic 值。','defer func(){ if r := recover(); r != nil { ok = true } }()','完成 catchesPanic，在函式邊界捕捉 panic 並回傳 true。',`func catchesPanic() (ok bool) { return false }`,`func catchesPanic() (ok bool) {\n\tdefer func(){ if recover()!=nil { ok=true } }()\n\tpanic("boom")\n}`,[t('捕捉 panic','catchesPanic()',true)]],
  ]],
  ['泛型', '用型別參數重用演算法，同時保留編譯期型別安全。',
   'C++：Go 泛型類似 template，但 constraints 以 interface 表達。|C#：型別參數與 where constraint 相近，Go 沒有方法 overload。|Python：泛型註記不會像 Go 一樣直接產生編譯期操作契約。', [
    ['型別參數','泛型函式在 []T 與 T 間重用同一段邏輯；[T any] 表示任意型別。','func first[T any](xs []T) T { return xs[0] }','完成 last，回傳 slice 最後一項；空 slice 回傳零值。',`func last[T any](xs []T) (zero T) { return zero }`,`func last[T any](xs []T) (zero T) { if len(xs)==0{return zero}; return xs[len(xs)-1] }`,[t('整數','last([]int{1,2,3})',3),t('空 slice','last([]int{})',0),t('字串','last([]string{"a","b"})','b')]],
    ['constraints','constraint interface 限定可用的型別與操作；~T 可包含底層型別相同的自訂型別。','type Number interface { ~int | ~float64 }','完成 maxNumber，回傳兩個 Number 中較大者。',`type Number interface { ~int | ~float64 }\nfunc maxNumber[T Number](a,b T) T { return a }`,`type Number interface { ~int | ~float64 }\nfunc maxNumber[T Number](a,b T) T { if b>a{return b}; return a }`,[t('int','maxNumber(2,5)',5),t('float','maxNumber(2.5,1.2)',2.5)]],
    ['泛型 slice 函式','泛型函式可對任意元素型別做相同的索引與長度操作，但不能假設 T 可比較或相加。','func reverse[T any](xs []T) []T { ... }','完成 clone，回傳獨立的 slice 複本，避免修改結果影響輸入。',`func clone[T any](xs []T) []T { return nil }`,`func clone[T any](xs []T) []T { out:=make([]T,len(xs)); copy(out,xs); return out }`,[t('內容相同','clone([]int{1,2,3})',[1,2,3]),t('空 slice','clone([]int{})',[])]],
    ['comparable 與集合','comparable constraint 才能用 == 與作 map key；泛型 map 可把 key 與 value 型別分開。','func has[T comparable](xs []T, x T) bool { ... }','完成 contains，判斷 slice 是否含有值。',`func contains[T comparable](xs []T, target T) bool { return false }`,`func contains[T comparable](xs []T, target T) bool {\n\tfor _, x := range xs { if x==target{return true} }; return false\n}`,[t('找到','contains([]int{1,2,3},2)',true),t('找不到','contains([]int{1,2,3},4)',false),t('字串','contains([]string{"go"},"go")',true)]],
  ]],
  ['並行', '以 goroutine、WaitGroup、channel、select 與 context 協調工作。',
   'C++：goroutine 比 thread 輕量，channel 提供同步傳值。|C#：goroutine/channel 可對照 Task/Channel，但 Go 的共享狀態仍需同步。|Python：goroutine 不等同 asyncio coroutine；channel 是明確的工作通道。', [
    ['goroutine 與 WaitGroup','WaitGroup 用 Add、Done、Wait 管理一組 goroutine；共享 slice 仍須避免競態。','wg.Add(1); go func(){ defer wg.Done(); ... }(); wg.Wait()','完成 parallelSum，啟動工作計算總和並等待結果。',`func parallelSum(xs []int) int { return 0 }`,`func parallelSum(xs []int) int {\n\tch:=make(chan int,1); var wg sync.WaitGroup; wg.Add(1)\n\tgo func(){ defer wg.Done(); s:=0; for _,x:=range xs{s+=x}; ch<-s }()\n\twg.Wait(); return <-ch\n}`,[t('總和','parallelSum([]int{1,2,3,4})',10),t('空集合','parallelSum([]int{})',0)]],
    ['channel','無緩衝 channel 的送出與接收會同步；關閉後仍可讀完緩衝值，ok 會是 false。','ch := make(chan int); go func(){ ch <- 7 }(); n := <-ch','完成 collect，接收 count 個值並回傳順序。',`func collect(values []int) []int { return nil }`,`func collect(values []int) []int {\n\tch:=make(chan int,len(values)); for _,v:=range values{ch<-v}; close(ch)\n\tout:=[]int{}; for v:=range ch{out=append(out,v)}; return out\n}`,[t('保留順序','collect([]int{3,1,2})',[3,1,2]),t('空 channel','collect([]int{})',[])]],
    ['select','select 讓 goroutine 等待多個 channel 操作；default 可避免永久阻塞，但會改變等待語意。','select { case v := <-ch: return v; case <-done: return 0 }','完成 firstAvailable，非阻塞讀取 channel；沒有值回傳 -1。',`func firstAvailable(ch <-chan int) int { return -1 }`,`func firstAvailable(ch <-chan int) int {\n\tselect { case v:=<-ch: return v; default: return -1 }\n}`,[t('有值','func() int { ch:=make(chan int,1); ch<-8; return firstAvailable(ch) }()',8),t('無值','firstAvailable(make(chan int))',-1)]],
    ['context 取消','context.Context 以 Done channel 傳播取消；長工作應在迴圈中檢查 ctx.Done()。','select { case <-ctx.Done(): return ctx.Err(); default: }','完成 cancelled，ctx 已取消回傳 true，否則 false。',`func cancelled(ctx context.Context) bool { return false }`,`func cancelled(ctx context.Context) bool { select { case <-ctx.Done(): return true; default: return false } }`,[t('已取消','func() bool { ctx,cancel:=context.WithCancel(context.Background()); cancel(); return cancelled(ctx) }()',true),t('未取消','cancelled(context.Background())',false)]],
  ]],
  ['標準庫實戰', '把 JSON、io.Reader、測試資料表與 httptest 組合成可驗證的服務程式。',
   'C++：encoding/json 與 iostream/序列化函式庫相近，但 Go struct tag 是標準做法。|C#：json.Marshal/Unmarshal 類似 System.Text.Json；io.Reader 是小而通用的串流介面。|Python：json.loads/dumps 直接處理 dict，Go 需用 struct 或 map 明確描述資料。', [
    ['JSON','json.Marshal 將值編成 JSON；json.Unmarshal 需傳入指標才能填寫 struct。struct tag 可指定欄位名稱。','type Item struct { Name string `json:"name"` }','完成 encodeItem，將 name 與 count 編成 JSON 字串。',`type Item struct { Name string \`json:"name"\`; Count int \`json:"count"\` }\nfunc encodeItem(name string, count int) string { return "" }`,`type Item struct { Name string \`json:"name"\`; Count int \`json:"count"\` }\nfunc encodeItem(name string, count int) string { b,_:=json.Marshal(Item{Name:name,Count:count}); return string(b) }`,[t('欄位與 tag','encodeItem("pen",2)','{"name":"pen","count":2}'),t('跳脫字元','encodeItem("a\\\"b",1)','{"name":"a\\\"b","count":1}')]],
    ['io.Reader','io.Reader 以 Read(p []byte) (n int, err error) 抽象資料來源；io.ReadAll 可一次讀完小資料。','data, err := io.ReadAll(reader)','完成 readText，讀取 Reader 全部內容，失敗回傳空字串。',`func readText(r io.Reader) string { return "" }`,`func readText(r io.Reader) string { b,err:=io.ReadAll(r); if err!=nil{return ""}; return string(b) }`,[t('讀取文字','readText(strings.NewReader("hello"))','hello'),t('空來源','readText(strings.NewReader(""))','')]],
    ['table-driven tests','table-driven test 用一組 case 描述輸入與期望，讓邊界案例容易增補；實際測試通常搭配 testing.T。','cases := []struct{ input, want string }{{" Go ", "go"}}','完成 normalize，去除首尾空白並轉成小寫；再完成 normalizeCases，逐筆套用相同規則。',`func normalize(s string) string { return s }\nfunc normalizeCases(cases []string) []string { return nil }`,`func normalize(s string) string { return strings.ToLower(strings.TrimSpace(s)) }\nfunc normalizeCases(cases []string) []string {\n\tout := make([]string, 0, len(cases))\n\tfor _, input := range cases { out = append(out, normalize(input)) }\n\treturn out\n}`,[t('空白與大小寫','normalize("  Go Lab  ")','go lab'),t('已正常化','normalize("go")','go'),t('全空白','normalize("  ")',''),t('批次案例','normalizeCases([]string{" A ","B","  "})',['a','b',''])]],
    ['httptest','httptest.NewRequest 與 NewRecorder 可在不開網路 port 的情況測 HTTP handler；先檢查 method 與輸入，再寫狀態。','rr := httptest.NewRecorder(); req := httptest.NewRequest("GET", "/", nil)','完成 statusText，GET 回 200 與 "ok"，其他 method 回 405。',`func statusText(w http.ResponseWriter, r *http.Request) { }`,`func statusText(w http.ResponseWriter, r *http.Request) {\n\tif r.Method!="GET" { w.WriteHeader(http.StatusMethodNotAllowed); return }; w.WriteHeader(http.StatusOK); _,_=w.Write([]byte("ok"))\n}`,[t('GET狀態','func() int { r:=httptest.NewRequest("GET","/",nil); w:=httptest.NewRecorder(); statusText(w,r); return w.Code }()',200),t('GET內容','func() string { r:=httptest.NewRequest("GET","/",nil); w:=httptest.NewRecorder(); statusText(w,r); return w.Body.String() }()','ok'),t('POST拒絕','func() int { r:=httptest.NewRequest("POST","/",nil); w:=httptest.NewRecorder(); statusText(w,r); return w.Code }()',405)]],
  ]],
];

const comparisons = (text) => Object.fromEntries(text.split('|').map((part) => {
  const i = part.indexOf('：'); return [part.slice(0, i), part.slice(i + 1)];
}));

export const chapters = chapterData.map(([title, subtitle, compare, rows]) => ({
  title, subtitle, comparisons: comparisons(compare),
  lessons: rows.map(([title2, concept, example, task, starter, solution, tests, hints]) =>
    lesson(`${String(chapterData.indexOf(chapterData.find((x) => x[0] === title)) + 1).padStart(2, '0')}-${String(rows.indexOf(rows.find((x) => x[0] === title2)) + 1).padStart(2, '0')}`, title2, concept, example, task, starter, solution, tests, hints)),
}));

export const lessons = chapters.flatMap((chapter, chapterIndex) =>
  chapter.lessons.map((item, index) => ({ ...item, chapterIndex, index })));
export const modules = {};
