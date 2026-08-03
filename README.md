# Task List (Angular 21)

Aplicação de lista de tarefas usada como desafio técnico. O enunciado original está em [DESAFIO.md](./DESAFIO.md).

Stack: Angular 21 (standalone + zoneless + SSG), TypeScript 5.9, signals, Vitest.

## Requisitos

- Node.js 20.19+ (ou 22.12+)
- npm 10+

## Como rodar

```bash
npm install
npm run start:dev      # http://localhost:4200
npm run start:prod     # ng serve com a configuração de produção
npm run build          # build SSG estático em dist/angular-project/browser
npm test               # testes unitários (Vitest + jsdom)
```

Rodar um arquivo de teste específico ou com cobertura:

```bash
npx ng test --no-watch --include='**/task-service.spec.ts'
npx ng test --no-watch --coverage
```

## Estrutura

```
public/                       # arquivos estáticos servidos na raiz
└── assets/scripts/legacy-heavy-script.js
src/
├── main.ts                       # bootstrap no browser
├── main.server.ts                # bootstrap usado no prerender (SSG)
└── app/
    ├── app.ts / app.html         # componente raiz (standalone)
    ├── app.config.ts             # providers do browser (+ hidratação)
    ├── app.config.server.ts      # providers do servidor/prerender
    ├── app.routes.ts             # rota mínima para o SSG
    ├── app.routes.server.ts      # RenderMode.Prerender
    ├── core/                     # modelos e serviços singleton
    │   ├── models/task.ts
    │   └── services/
    │       ├── task-service.ts
    │       └── deferred-script-loader.ts
    ├── features/tasks/
    │   ├── components/
    │   │   ├── task-form/
    │   │   ├── task-list/
    │   │   └── task-item/
    │   └── validators/task-title-validators.ts
    └── shared/components/header/
```

Os nomes de arquivo seguem o style guide atual do Angular (sem os sufixos `.component`/`.service`),
com o arquivo nomeado a partir da classe e a intenção no nome (`task-service` guarda estado).

## Decisões de arquitetura

- **Zoneless**: o app não usa `zone.js`. A detecção de mudanças é dirigida por signals, todos os
  componentes são `OnPush` e o bundle inicial fica menor (~45 kB transferidos).
- **Standalone**: não há `NgModule`. O bootstrap é `bootstrapApplication(App, appConfig)`.
- **Signals no lugar de `BehaviorSubject`**: o template lê o estado direto do service, sem `subscribe`
  manual nem risco de vazamento de inscrição.
- **SSG (prerender)**: `outputMode: "static"` + `RenderMode.Prerender` em
  `app.routes.server.ts`. O HTML da tela (header, formulário e as 3 tasks iniciais) é gerado no
  build e pode ser servido por CDN — melhor FCP em conexão ruim/mobile, sem Node em runtime.
  Alternativas descartadas: CSR (pior FCP) e SSR por requisição (custo de servidor sem ganho, já
  que não há dinamismo nem dados por usuário). Hidratação com `withEventReplay()` reaproveita o
  DOM e não perde cliques feitos antes do JS carregar. O router existe só para o prerender
  descobrir `/`; não há `<router-outlet>`.
- **Build de produção**: a configuração `production` voltou aos padrões do Angular (otimização,
  hashing e budgets ativos) — antes estava com `optimization: false`.

## Funcionamento

### Estado das tasks

`TaskService` mantém a lista em memória em um `signal` e expõe `tasks` e `adding` como signals
somente leitura. As 3 tasks pré-carregadas já fazem parte do estado inicial, então aparecem na
inicialização sem depender de nenhuma interação.

Operações: `addTask`, `removeTask`, `toggleTaskCompletion` e `hasTask` (checagem de duplicidade).
Todas as atualizações são imutáveis (`signal.update`).

`addTask` dispara duas chamadas simuladas de API. Elas rodam em paralelo com `forkJoin`, então o
tempo total é o da mais lenta (2s) em vez da soma delas — os delays em si não foram alterados.

### Loading na adição

O signal `adding` fica `true` no início do `addTask` e volta a `false` no `finalize`. O `TaskForm`
usa esse estado para desabilitar o botão, trocar o texto para "Adicionando...", exibir o spinner e
ignorar submits durante a chamada — esse guard é o que garante uma adição por vez.

### Validação do título

Validadores em `task-title-validators.ts`, aplicados no `FormControl` tipado do `TaskForm`:

| Validador | Regra |
| --- | --- |
| `required` | título obrigatório |
| `onlyLetters` | apenas letras e espaços (`\p{L}`, aceita acentos) |
| `minTitleLength` | mínimo de 20 caracteres |
| `uniqueTitle` | não permite título já existente |

A API só é chamada no submit, quando o formulário está válido — nunca a cada digitação.
A comparação de duplicidade ignora o sufixo `_INFO_API` adicionado pelas chamadas simuladas.

A mensagem de erro é um `computed` alimentado por `toSignal(control.events)`: é o que mantém o
formulário reativo mesmo com `OnPush` e sem zone.js.

### Carregamento do script legado

`legacy-heavy-script.js` é pesado e não é necessário no boot. `DeferredScriptLoader` só roda no
browser (`isPlatformBrowser`), espera o app ficar estável (`ApplicationRef.whenStable()`), aguarda
um `requestIdleCallback` e então executa o script em um `Web Worker` — com fallback para
`<script async>` quando `Worker` não está disponível. Assim o prerender SSG não tenta carregar o
script no Node e a thread principal não trava na inicialização.

## Testes

Cada serviço, validador e componente tem seu `.spec.ts` ao lado do arquivo de origem, rodando em
Vitest com jsdom. `fakeAsync`/`tick` não existem nesse runner: os testes de tempo usam
`vi.useFakeTimers()` com `vi.advanceTimersByTimeAsync()`, e a renderização é aguardada com
`await fixture.whenStable()`.
