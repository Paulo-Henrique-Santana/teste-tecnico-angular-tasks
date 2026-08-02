# Task List (Angular 15)

Aplicação de lista de tarefas usada como desafio técnico. O enunciado original está em [DESAFIO.md](./DESAFIO.md).

## Requisitos

- Node.js 18+
- npm 9+

## Como rodar

```bash
npm install
npm run start:dev      # http://localhost:4200
npm run start:prod     # build de produção via ng serve
npm run build          # build em dist/
npm test               # testes unitários (Karma + Jasmine)
```

Rodar um arquivo de teste específico:

```bash
npx ng test --no-watch --browsers=ChromeHeadless --include='**/task.service.spec.ts'
```

## Estrutura

```
src/app/
├── core/                     # modelos e serviços singleton
│   ├── models/task.model.ts
│   └── services/
│       ├── task.service.ts
│       └── deferred-script-loader.service.ts
├── features/tasks/           # domínio de tarefas
│   ├── components/
│   │   ├── task-form/        # formulário de adição
│   │   ├── task-list/        # listagem
│   │   └── task-item/        # item individual
│   └── validators/task-title.validators.ts
└── shared/components/header/ # componentes reutilizáveis
```

## Funcionamento

### Estado das tasks

`TaskService` mantém a lista em memória e expõe `tasks$` (um `BehaviorSubject`), então qualquer
componente que se inscreva já recebe as 3 tasks pré-carregadas na inicialização.

Operações: `addTask`, `removeTask`, `toggleTaskCompletion` e `hasTask` (checagem de duplicidade).

`addTask` dispara duas chamadas simuladas de API. Elas rodam em paralelo com `forkJoin`, então o
tempo total é o da mais lenta (2s) em vez da soma delas — os delays em si não foram alterados.

### Validação do título

Validadores em `task-title.validators.ts`, aplicados no `FormControl` do `TaskFormComponent`:

| Validador | Regra |
| --- | --- |
| `required` | título obrigatório |
| `onlyLetters` | apenas letras e espaços (`\p{L}`, aceita acentos) |
| `minTitleLength` | mínimo de 20 caracteres |
| `uniqueTitle` | não permite título já existente |

A API só é chamada no submit, quando o formulário está válido — nunca a cada digitação.
A comparação de duplicidade ignora o sufixo `_INFO_API` adicionado pelas chamadas simuladas.

### Carregamento do script legado

`legacy-heavy-script.js` é pesado e não é necessário no boot. `DeferredScriptLoaderService` espera
o app ficar estável (`ApplicationRef.isStable`), aguarda um `requestIdleCallback` fora da zona do
Angular e então executa o script em um `Web Worker` — com fallback para `<script async>` quando
`Worker` não está disponível. Assim a thread principal não trava durante a inicialização.

## Testes

Cada serviço, validador e componente tem seu `.spec.ts` ao lado do arquivo de origem.
